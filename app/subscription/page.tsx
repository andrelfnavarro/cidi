'use client';

import { useRouter } from 'next/navigation';
import { SubscriptionFlowData } from '@/utils/types/Subscription';
import SubscriptionWizard from '@/components/subscription-flow/subscription-wizard';

export default function SubscriptionPage() {
  const router = useRouter();

  const handleSubscriptionComplete = async (data: SubscriptionFlowData) => {
    try {
      console.log('Subscription data:', data);
      
      // TODO: Implement actual subscription creation with:
      // 1. Create Supabase user account
      // 2. Create company record
      // 3. Create subscription record
      // 4. Process payment with Stripe
      // 5. Create initial dentist record
      // 6. Send welcome email
      
      // For now, redirect to admin login
      router.push('/admin?subscription=success');
    } catch (error) {
      console.error('Error completing subscription:', error);
      // TODO: Handle subscription errors
    }
  };

  return (
    <div>
      <SubscriptionWizard onComplete={handleSubscriptionComplete} />
    </div>
  );
}