import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const api_key = process.env.LAKE_API_KEY;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;
    console.log("==========  *** body webhook", body)
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("event1", JSON.stringify(event, null, 2))
    } catch (err: any) {
        console.log("err", err)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log("=> event", JSON.stringify(event, null, 2))

    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/stripe-event?api_key=${api_key}`;
    const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
    });

    switch (event.type) {
        case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session;
            console.log('Checkout completed for user:', checkoutSession.client_reference_id);

            // Add API POST for checkout.session.completed
            await fetch(`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-subscription?api_key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_id: checkoutSession.subscription,
                    customer_id: checkoutSession.customer,
                    status: 'active',
                    plan_id: checkoutSession.metadata?.plan_id,
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                    cancel_at_period_end: false,
                }),
            });
            break;
        case 'invoice.paid':
            const paidInvoice = event.data.object as Stripe.Invoice;
            console.log('Invoice paid for subscription:', paidInvoice.subscription);

            // Add API POST for invoice.paid
            await fetch(`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-invoice?api_key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    invoice_id: paidInvoice.id,
                    customer_id: paidInvoice.customer,
                    subscription_id: paidInvoice.subscription,
                    status: paidInvoice.status,
                    amount_due: paidInvoice.amount_due,
                    amount_paid: paidInvoice.amount_paid,
                    amount_remaining: paidInvoice.amount_remaining,
                    currency: paidInvoice.currency,
                    invoice_date: new Date(paidInvoice.created * 1000).toISOString(),
                    due_date: paidInvoice.due_date ? new Date(paidInvoice.due_date * 1000).toISOString() : null,
                    paid_at: paidInvoice.status === 'paid' ? new Date().toISOString() : null,
                }),
            });
            console.log("=> invoice.paid: success")
            break;
        case 'customer.subscription.deleted':
            const deletedSubscription = event.data.object as Stripe.Subscription;
            console.log('Subscription cancelled:', deletedSubscription.id);

            // Add API POST for customer.subscription.deleted
            await fetch(`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/delete-subscription?api_key=${api_key}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_id: deletedSubscription.id,
                }),
            });
            break;
        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object as Stripe.Subscription;
            console.log('Subscription updated:', updatedSubscription.id);

            // Add API POST for customer.subscription.updated using upsert-subscription
            await fetch(`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-subscription?api_key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_id: updatedSubscription.id,
                    customer_id: updatedSubscription.customer,
                    status: updatedSubscription.status,
                    current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: updatedSubscription.cancel_at_period_end,
                    default_payment_method: updatedSubscription.default_payment_method,
                }),
            });
            break;
        case 'customer.subscription.created':
            const createdSubscription = event.data.object as Stripe.Subscription;
            console.log('Subscription created:', createdSubscription.id);

            // Add API POST for customer.subscription.created using upsert-subscription
            await fetch(`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-subscription?api_key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription_id: createdSubscription.id,
                    customer_id: createdSubscription.customer,
                    status: createdSubscription.status,
                    current_period_start: new Date(createdSubscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(createdSubscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: createdSubscription.cancel_at_period_end,
                    default_payment_method: createdSubscription.default_payment_method,
                }),
            });
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    console.log("=> received: true")
    return NextResponse.json({ received: true });
}