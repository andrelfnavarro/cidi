import { NextRequest, NextResponse } from 'next/server';
import { calculateTaxInclusivePrice } from '@/lib/stripe-utils';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerId } = await request.json();
    
    if (!priceId || !customerId) {
      return NextResponse.json(
        { error: 'Price ID and customer ID are required' },
        { status: 400 }
      );
    }
    
    // Calculate tax-inclusive price
    const priceWithTax = await calculateTaxInclusivePrice(priceId, customerId);
    
    return NextResponse.json(priceWithTax);
  } catch (error) {
    console.error('Error calculating tax-inclusive price:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax-inclusive price' },
      { status: 500 }
    );
  }
}
