import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

export type StripeCustomerData = {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
};

export type StripeSubscriptionData = {
  id: string;
  customer: string;
  status: Stripe.Subscription.Status;
  current_period_start: number;
  current_period_end: number;
  trial_end?: number;
  metadata?: Record<string, string>;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number | null;
      };
      quantity: number;
    }>;
  };
};

export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<StripeCustomerData> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        created_via: 'subscription_flow',
      },
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata,
    };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  quantity: number = 1,
  metadata?: Record<string, string>
): Promise<StripeSubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
          quantity,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        ...metadata,
        created_via: 'subscription_flow',
      },
    });

    return {
      id: subscription.id,
      customer: subscription.customer as string,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      trial_end: subscription.trial_end || undefined,
      metadata: subscription.metadata,
      items: subscription.items,
    };
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

export async function getStripeCustomer(
  customerId: string
): Promise<StripeCustomerData | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      return null;
    }

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      metadata: customer.metadata,
    };
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    return null;
  }
}

export async function syncStripeDataToDatabase(
  subscription: StripeSubscriptionData,
  customer: StripeCustomerData
) {
  // This function will be called from webhooks and after successful checkout
  // to sync Stripe data to your database
  console.log('Syncing Stripe data:', { subscription, customer });

  // TODO: Implement database sync logic
  // 1. Update subscription status in database
  // 2. Update customer information
  // 3. Handle trial periods, billing cycles, etc.
}
