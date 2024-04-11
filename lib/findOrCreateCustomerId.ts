import { clerkClient } from "@clerk/nextjs/server";
//@ts-ignore
import { stripeApiClient } from "use-stripe-subscription";

export const findOrCreateCustomerId = async ({
  clerkUserId,
}: {
  clerkUserId: string;
}) => {
  let user = await clerkClient.users.getUser(clerkUserId);
  try {
    if (user.publicMetadata.stripeCustomerId) {
      return user.publicMetadata.stripeCustomerId as string;
    }
  }
  catch (e) {
    console.log("findOrCreateCustomerId: error", e);
  }
  console.log("stripeApiClient.customers.create")
  const customerCreate = await stripeApiClient.customers.create(
    {
      name: user.firstName + " " + user.lastName,
      email: user.emailAddresses.find(
        (x) => x.id === user.primaryEmailAddressId
      )?.emailAddress,
      metadata: {
        clerkUserId: user.id,
      },
    },
    {
      idempotencyKey: user.id,
    }
  );
  user = await clerkClient.users.updateUser(user.id, {
    publicMetadata: {
      stripeCustomerId: customerCreate.id,
    },
  });
  return user.publicMetadata.stripeCustomerId as string;
};