import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { getSubscriptionWithInvoices } from '@/lib/stripe-utils';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the companyId from query params
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Create admin client
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

    // Get company subscription data
    const { data: subscriptionData, error: subscriptionError } = await adminSupabase
      .from('subscriptions')
      .select('id, plan_id, status, current_period_start, current_period_end')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (subscriptionError || !subscriptionData) {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'No subscription found for this company' },
        { status: 404 }
      );
    }
    
    // Get plan details
    const { data: planData, error: planError } = await adminSupabase
      .from('subscription_plans')
      .select('id, name, description, price_per_dentist')
      .eq('id', subscriptionData.plan_id)
      .single();
    
    if (planError || !planData) {
      console.error('Error fetching plan details:', planError);
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }
    
    // Get detailed information from Stripe
    const { subscription: stripeSubscription, invoices } = await getSubscriptionWithInvoices(subscriptionData.id);
    
    // Get dentist count from metadata or items quantity
    const dentistCount = Number(stripeSubscription.metadata?.dentist_count) || 
                        stripeSubscription.items.data[0].quantity || 1;
    
    // Format response
    const response = {
      id: subscriptionData.id,
      status: subscriptionData.status,
      planName: planData.name,
      currentPeriodStart: subscriptionData.current_period_start,
      currentPeriodEnd: subscriptionData.current_period_end,
      dentistCount: dentistCount,
      pricePerDentist: planData.price_per_dentist / 100, // Convert from cents to real
      nextInvoiceDate: subscriptionData.current_period_end, // Same as current period end
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}
