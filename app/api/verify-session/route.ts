import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-04-10',
});

const api_key = process.env.LAKE_API_KEY;

export async function POST(req: NextRequest) {
    const { sessionId } = await req.json();

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }
        console.log("SESSION:", session);
        // Update subscription in database
        console.log('Updating subscription in database', `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-subscription?api_key=${api_key}`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-subscription?api_key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription_id: session.subscription,
                customer_id: session.customer,
                client_reference_id: session.metadata?.client_reference_id,
                level: session.metadata?.level,
                email: session.customer_details?.email,
                name: session.customer_details?.name,
                payment_status: session.payment_status,
                status: 'active',
                plan_id: session.metadata?.plan_id,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                cancel_at_period_end: false,
            }),
        });
        console.log("STATUS:", response.status);
        if (!response.ok) {
            throw new Error('Failed to update subscription');
        }

        const subscriptionData = await response.json();

        return NextResponse.json({ success: true, subscription: subscriptionData });
    } catch (error) {
        console.error('Error verifying session:', error);
        return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
    }
}