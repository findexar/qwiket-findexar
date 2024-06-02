"use server";

import type { Stripe } from "stripe";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(
  level: number,
  ui_mode: Stripe.Checkout.SessionCreateParams.UiMode
): Promise<Stripe.Checkout.Session> {
  const origin: string = headers().get("origin") as string;
  let { userId } = auth() || { userId: "" };
  if (!userId) {
    userId = "";
  }
  let priceId: string;
  switch (level) {
    case 1:
      priceId = "price_1PMVQwDOGFJmkdXRZkUWhguB"; 
      break;
    case 2:
      priceId = "price_1PMVP6DOGFJmkdXRN3VpgdNZ";
      break;
    case 3:
      priceId = "price_1PMVQ0DOGFJmkdXRZ57p0hdD";
      break;
    case 4:
      priceId = "price_1PMVQwDOGFJmkdXRZkUWhguB";
      break;
    default:
      throw new Error("Invalid subscription level");
  }

  const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id:userId,
    metadata:{
      level:level,
      client_reference_id:userId,
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

  return checkoutSession;
}

