import { stripe } from './stripe';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

// Function to update subscription quantity
export async function updateSubscriptionQuantity(
  subscriptionId: string,
  newQuantity: number
): Promise<boolean> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update the subscription with the new quantity
    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          quantity: newQuantity,
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error('Error updating subscription quantity:', error);
    return false;
  }
}

// Function to get subscription details with invoices
export async function getSubscriptionWithInvoices(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'default_payment_method', 'latest_invoice'],
    });
    
    // Retrieve invoices for the subscription
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 10, // Adjust as needed
    });
    
    return {
      subscription,
      invoices: invoices.data,
    };
  } catch (error) {
    console.error('Error retrieving subscription details:', error);
    throw new Error('Failed to retrieve subscription details');
  }
}

// Function to sync subscription data to the database
export async function syncSubscriptionToDatabase(subscriptionId: string) {
  try {
    // Create admin client to update database
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
    
    // Get fresh data from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update in database
    const { error } = await adminSupabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing subscription to database:', error);
    return false;
  }
}

// Create a checkout session for adding payment method
export async function createSetupSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customerId,
      payment_method_types: ['card'],
      success_url: `${returnUrl}?setup=success`,
      cancel_url: `${returnUrl}?setup=canceled`,
    });
    
    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating setup session:', error);
    throw new Error('Failed to create setup session');
  }
}

// Update customer details in Stripe
export async function updateCustomer(
  customerId: string, 
  data: {
    email?: string;
    name?: string;
    phone?: string;
    address?: Stripe.AddressParam;
    metadata?: Record<string, string>;
  }
) {
  try {
    const customer = await stripe.customers.update(customerId, data);
    return customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
}

// Retrieve payment methods for a customer
export async function getCustomerPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      { type: 'card' }
    );
    
    return paymentMethods.data;
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    throw new Error('Failed to retrieve payment methods');
  }
}

// Set default payment method for a customer
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    return customer;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw new Error('Failed to set default payment method');
  }
}

// Generate prices with taxes included
export async function calculateTaxInclusivePrice(priceId: string, customerId: string) {
  try {
    // Create a tax calculation
    const calculation = await stripe.tax.calculations.create({
      currency: 'brl',
      customer: customerId,
      line_items: [
        {
          amount: 1000, // Use a sample amount, we'll adjust it later
          reference: priceId,
          tax_behavior: 'inclusive',
        },
      ],
    });
    
    // Get the price details
    const price = await stripe.prices.retrieve(priceId);
    
    // Calculate the actual tax rate
    const taxRate = Number((calculation.tax_breakdown?.[0]?.tax_rate_details?.percentage_decimal || 0)) / 100;
    
    // Calculate the tax-inclusive amount
    const amount = price.unit_amount || 0;
    const taxAmount = Math.round(amount * taxRate);
    const totalAmount = amount + taxAmount;
    
    return {
      priceId,
      unitAmount: amount,
      taxAmount,
      totalAmount,
      taxRate: taxRate * 100, // convert to percentage
    };
  } catch (error) {
    console.error('Error calculating tax-inclusive price:', error);
    throw new Error('Failed to calculate tax-inclusive price');
  }
}
