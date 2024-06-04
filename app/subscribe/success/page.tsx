import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from "@clerk/nextjs/server";
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs/server';

const SuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const session_id = router.query.session_id;
      if (typeof session_id === 'string') { // Ensure session_id is a string
        try {
          const session = await stripe.checkout.sessions.retrieve(session_id);
          console.log('Stripe session retrieved:', session);
        const { client_reference_id, metadata } = session;
        const { userId } = auth();
        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;
        const updateSubscriptionUrl = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/update-user-subscription`;
        const updateSubscriptionData = {
          userId: userId,
          api_key: process.env.LAKE_API_KEY,
          subscriptionId: session.id,
          level: metadata ? metadata.level : 'default',
          email: email
        };

        try {
          const response = await fetch(updateSubscriptionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateSubscriptionData)
          });
          const responseData = await response.json();
          if (response.ok) {
            console.log('Subscription updated successfully:', responseData);
          } else {
            console.error('Failed to update subscription:', responseData);
          }
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
        console.log(`Client Reference ID: ${client_reference_id}`);
        console.log(`User ID from Clerk: ${userId}`);
        if (metadata) {
          console.log(`Subscription Level: ${metadata.level}`);
        } else {
          console.log('Metadata is null');
        }
        } catch (error) {
          console.error('Failed to retrieve Stripe session:', error);
        }
      }
      router.push('/');
    };

    handleRedirect();
  }, [router]);

  return <>SUBSCRIPTION SUCCESS</>;
};

export default SuccessPage;

