import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { 
      customerEmail, 
      customerName, 
      priceId, 
      dentistCount,
      companyId,
      companyName 
    } = await request.json();
    
    console.log('Creating Stripe checkout session:', {
      customerEmail,
      customerName,
      priceId,
      dentistCount,
      companyName
    });

    // Validate required fields
    if (!customerEmail || !customerName || !priceId || !dentistCount) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Create checkout session with customer email (no need to pre-create customer)
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: dentistCount,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/subscription?canceled=true`,
      subscription_data: {
        metadata: {
          company_id: companyId || 'pending',
          company_name: companyName,
          dentist_count: dentistCount.toString(),
        },
      },
      metadata: {
        company_id: companyId || 'pending',
        company_name: companyName,
        dentist_count: dentistCount.toString(),
        customer_email: customerEmail,
        customer_name: customerName,
      },
      // Following t3 recommendations for fraud prevention
      allow_promotion_codes: false,
      payment_method_types: ['card'],
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}