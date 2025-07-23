import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { SubscriptionFlowData } from '@/utils/types/Subscription';

export async function POST(request: Request) {
  try {
    const data: SubscriptionFlowData & { sessionId: string } = await request.json();
    
    console.log('Completing subscription:', data);

    if (!data.sessionId || !data.accountData || !data.companyData || !data.selectedPlan) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Create admin Supabase client
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

    // 1. Create or retrieve the user account
    let createUserResponse = await adminSupabase.auth.admin.createUser({
      email: data.accountData.email,
      password: data.accountData.password,
      email_confirm: true,
    });

    // Check if the error is due to the email already existing
    if (createUserResponse.error && createUserResponse.error.message.includes('email address has already been registered')) {
      console.log("Email already exists in Auth system. Retrieving existing user...");
      
      // Get the user by email
      const { data: userData } = await adminSupabase.auth.admin.listUsers({
        filters: {
          email: data.accountData.email
        }
      });
      
      if (userData && userData.users && userData.users.length > 0) {
        const existingUser = userData.users[0];
        
        // Use this user for the subscription
        createUserResponse = { 
          data: { user: existingUser },
          error: null 
        };
        
        // Update their password to the new one
        await adminSupabase.auth.admin.updateUserById(existingUser.id, {
          password: data.accountData.password
        });
        
        console.log("Found existing auth user, will use it for the subscription:", existingUser.id);
      } else {
        return NextResponse.json({ error: 'User exists but could not be retrieved' }, { status: 500 });
      }
    }

    if (createUserResponse.error) {
      console.error('Error creating/retrieving user:', createUserResponse.error);
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }

    const user = createUserResponse.data.user;
    console.log('User ready:', user.id);

    // 2. Create the company record (check for existing slug first)
    const { data: existingCompany } = await adminSupabase
      .from('companies')
      .select('id, name, slug')
      .eq('slug', data.companyData.slug)
      .maybeSingle();

    let companyData;
    if (existingCompany) {
      console.log('Company with slug already exists:', existingCompany.slug);
      // Generate a unique slug by appending timestamp
      const uniqueSlug = `${data.companyData.slug}-${Date.now()}`;
      
      const { data: newCompanyData, error: companyError } = await adminSupabase
        .from('companies')
        .insert({
          name: data.companyData.name,
          slug: uniqueSlug,
          display_name: data.companyData.display_name || null,
          subtitle: data.companyData.subtitle || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company with unique slug:', companyError);
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
      }
      
      companyData = newCompanyData;
      console.log('Company created with unique slug:', companyData.slug);
    } else {
      const { data: newCompanyData, error: companyError } = await adminSupabase
        .from('companies')
        .insert({
          name: data.companyData.name,
          slug: data.companyData.slug,
          display_name: data.companyData.display_name || null,
          subtitle: data.companyData.subtitle || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
      }
      
      companyData = newCompanyData;
      console.log('Company created:', companyData.id);
    }

    // 3. Create or update the admin dentist record
    const { data: existingDentist } = await adminSupabase
      .from('dentists')
      .select('id, name, email, company_id')
      .eq('id', user.id)
      .maybeSingle();

    let dentistData;
    if (existingDentist) {
      console.log('Dentist record already exists, updating for new company:', existingDentist.id);
      
      // Update existing dentist to be admin of the new company
      const { data: updatedDentistData, error: dentistError } = await adminSupabase
        .from('dentists')
        .update({
          name: data.accountData.name,
          email: data.accountData.email,
          is_admin: true,
          company_id: companyData.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (dentistError) {
        console.error('Error updating dentist:', dentistError);
        return NextResponse.json({ error: 'Failed to update dentist record' }, { status: 500 });
      }
      
      dentistData = updatedDentistData;
      console.log('Dentist updated for new company:', dentistData.id);
    } else {
      // Create new dentist record
      const { data: newDentistData, error: dentistError } = await adminSupabase
        .from('dentists')
        .insert({
          id: user.id,
          name: data.accountData.name,
          email: data.accountData.email,
          is_admin: true,
          company_id: companyData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dentistError) {
        console.error('Error creating dentist:', dentistError);
        return NextResponse.json({ error: 'Failed to create dentist record' }, { status: 500 });
      }
      
      dentistData = newDentistData;
      console.log('Admin dentist created:', dentistData.id);
    }

    // 4. Create the subscription record (handle duplicates)
    const subscription = session.subscription as any;
    console.log('Subscription object:', JSON.stringify(subscription, null, 2));
    
    if (!subscription || !subscription.id) {
      console.error('No subscription found in session:', session.id);
      return NextResponse.json({ error: 'Subscription not found in session' }, { status: 400 });
    }
    
    const { data: existingSubscription } = await adminSupabase
      .from('subscriptions')
      .select('id')
      .eq('id', subscription.id)
      .maybeSingle();

    if (!existingSubscription) {
      // Get period dates from subscription items (more reliable)
      const subscriptionItem = subscription.items?.data?.[0];
      const currentPeriodStart = subscriptionItem?.current_period_start 
        ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
        : new Date(subscription.start_date * 1000).toISOString();
      
      const currentPeriodEnd = subscriptionItem?.current_period_end
        ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
        : new Date(subscription.start_date * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from start
      
      console.log('Creating subscription record with dates:', { currentPeriodStart, currentPeriodEnd });
      
      const { error: subscriptionError } = await adminSupabase
        .from('subscriptions')
        .insert({
          id: subscription.id,
          company_id: companyData.id,
          plan_id: data.selectedPlan.id,
          status: subscription.status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (subscriptionError) {
        console.error('Error creating subscription record:', JSON.stringify(subscriptionError, null, 2));
        console.error('Subscription data attempted:', {
          id: subscription.id,
          company_id: companyData.id,
          plan_id: data.selectedPlan.id,
          status: subscription.status,
        });
        // Don't cleanup everything if subscription record fails, as payment was successful
        // Just log the error and continue
      } else {
        console.log('Subscription record created successfully:', subscription.id);
      }
    } else {
      console.log('Subscription record already exists:', subscription.id);
    }

    // 5. Update Stripe customer and subscription metadata
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
    
    await stripe.customers.update(customerId, {
      metadata: {
        user_id: user.id,
        company_id: companyData.id,
        dentist_id: dentistData.id,
      },
    });

    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        user_id: user.id,
        company_id: companyData.id,
        dentist_id: dentistData.id,
        dentist_count: (data.dentistCount || 1).toString(),
      },
    });

    console.log('Subscription completed successfully');

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      company: { id: companyData.id, name: companyData.name, slug: companyData.slug },
      dentist: { id: dentistData.id, name: dentistData.name },
      subscription: { id: subscription.id, status: subscription.status },
    });

  } catch (error) {
    console.error('Error completing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to complete subscription' },
      { status: 500 }
    );
  }
}