import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // Construct event with raw body (required for signature verification)
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      console.error('Body length:', body.length);
      console.error('Signature:', signature);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Processing Stripe webhook event:', event.type, event.id);

    // Process the event based on type
    await processEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function processEvent(event: Stripe.Event) {
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, adminSupabase);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, adminSupabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          event.data.previous_attributes,
          adminSupabase
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, adminSupabase);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, adminSupabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, adminSupabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${event.type} event:`, error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Checkout completed for session:', session.id);
  
  if (session.mode === 'subscription' && session.subscription) {
    // Sync subscription data after successful checkout
    await syncStripeDataToKV(session.subscription as string, supabase);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log('Subscription created:', subscription.id);
  await syncStripeDataToKV(subscription.id, supabase);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  previousAttributes: any,
  supabase: any
) {
  console.log('Subscription updated:', subscription.id);
  
  // Check if status changed
  if (previousAttributes?.status && previousAttributes.status !== subscription.status) {
    console.log(`Subscription ${subscription.id} status changed from ${previousAttributes.status} to ${subscription.status}`);
    
    // Handle specific status transitions
    if (subscription.status === 'past_due') {
      // Send notification email about past due payment
      // TODO: Implement email notification
      console.log('Subscription payment is past due, sending notification');
    } else if (subscription.status === 'canceled') {
      // Update company status in database
      const { error } = await supabase
        .from('companies')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.metadata?.company_id);
      
      if (error) {
        console.error('Error updating company status:', error);
      }
    } else if (subscription.status === 'active' && previousAttributes.status === 'past_due') {
      // Payment recovered, ensure company is active
      const { error } = await supabase
        .from('companies')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.metadata?.company_id);
      
      if (error) {
        console.error('Error updating company status:', error);
      }
    }
  }
  
  // Check if quantity changed
  const oldQuantity = previousAttributes?.items?.data?.[0]?.quantity;
  const newQuantity = subscription.items.data[0]?.quantity;
  
  if (oldQuantity && newQuantity && oldQuantity !== newQuantity) {
    console.log(`Subscription ${subscription.id} quantity changed from ${oldQuantity} to ${newQuantity}`);
    
    // Update metadata
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        ...subscription.metadata,
        dentist_count: newQuantity.toString(),
      },
    });
  }
  
  await syncStripeDataToKV(subscription.id, supabase);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log('Subscription deleted:', subscription.id);
  
  // Update subscription status to canceled
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  if (error) {
    console.error('Error updating subscription to canceled:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log('Payment succeeded for invoice:', invoice.id);
  
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    await syncStripeDataToKV(subscriptionId, supabase);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log('Payment failed for invoice:', invoice.id);
  
  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId && typeof subscriptionId === 'string') {
    // Update subscription status based on the current state
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncStripeDataToKV(subscription.id, supabase);
  }
}

// Centralized function to sync Stripe data to database (following t3 recommendations)
async function syncStripeDataToKV(subscriptionId: string, supabase: any) {
  try {
    console.log('Syncing Stripe data for subscription:', subscriptionId);
    
    // Fetch fresh subscription data from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'latest_invoice'],
    });

    // Update subscription in database
    const subscriptionData = subscription as any;
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscriptionData.status,
        current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
        trial_end: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionData.id);

    if (error) {
      console.error('Error syncing subscription data:', error);
      throw error;
    }

    console.log('Successfully synced subscription data:', subscription.id);
  } catch (error) {
    console.error('Error in syncStripeDataToKV:', error);
    throw error;
  }
}