"use server";

import Stripe from "stripe";
import { headers } from "next/headers";

import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/fetchers/user-subscription";
const api_key = process.env.LAKE_API_KEY;
export async function createCheckoutSession(
  level: string,
  ui_mode: Stripe.Checkout.SessionCreateParams.UiMode
): Promise<string> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-04-10",
    appInfo: {
      name: "qwiket",
      url: "https://www.qwiket.com",
    },
  });

  const origin: string = headers().get("origin") as string;
  let { userId } = auth() || { userId: "" };
  if (!userId) {
    userId = "";
  }
  let priceId: string;
  switch (level) {
    case 'basic':
      priceId = process.env.STRIPE_BASIC_PRICE as string;
      break;
    case 'creator':
      priceId = process.env.STRIPE_CREATOR_PRICE as string;
      break;
    case 'enterprise':
      priceId = process.env.STRIPE_ENTERPRISE_PRICE as string;
      break;
    case 'extra-credits':
      priceId = process.env.STRIPE_EXTRA_CREDITS_PRICE as string;
      break;
    default:
      throw new Error("Invalid subscription level");
  }
  if (level === 'extra-credits') {

    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: userId,
      metadata: {
        level: level,
        client_reference_id: userId,
      },
      line_items: [
        {
          quantity: 1,
          price: priceId,
        },
      ],
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/extra-credits/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/extra-credits/cancel`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/extra-credits/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

    return checkoutSession.id;
  } else {
    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: userId,
      metadata: {
        level: level,
        client_reference_id: userId,
      },
      line_items: [
        {
          quantity: 1,
          price: priceId,
        },
      ],
      ...(ui_mode === "hosted" && {
        success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscribe/cancel`,
      }),
      ...(ui_mode === "embedded" && {
        return_url: `${origin}/subscribe/result?session_id={CHECKOUT_SESSION_ID}`,
      }),
      ui_mode,
    });

    return checkoutSession.id;
  }
}

export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("+++++++++++++++++++++++ cancelSubscription")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-04-10",
      appInfo: {
        name: "qwiket",
        url: "https://www.qwiket.com",
      },
    });

    const { userId } = auth() || { userId: "" };
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress || "";
    const userInfo = JSON.parse(JSON.stringify(user));
    const subscription = await getUserSubscription(userId, email || "");

    console.log("+++++++++++++++++++++++ subscription", subscription)

    // Fetch the customer's subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: subscription.customerid,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    const subscriptionId = subscriptions.data[0].id;

    // Cancel the subscription
    console.log("+++++++++++++++++++++++ subscriptionId", subscriptionId)
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    if (canceledSubscription.status === 'canceled') {
      console.log("canceledSubscription", canceledSubscription)
      const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/delete-subscription?subscription_id=${subscriptionId}&api_key=${api_key}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      console.log("delete user subscription", url, data);
      if (data.success) {
        console.log("===>DELETE USER SUBSCRIPTION", data.subscription);
      }
      return { success: true };
    } else {
      throw new Error("Failed to cancel subscription");
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' };
  }
}