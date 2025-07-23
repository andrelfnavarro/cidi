export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price_per_dentist: number;
  currency: string;
  features: string[];
  stripe_price_id?: string;
};

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';

export type Subscription = {
  id: string;
  company_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionFlowData = {
  selectedPlan?: SubscriptionPlan;
  dentistCount?: number;
  accountData?: {
    email: string;
    password: string;
    name: string;
  };
  companyData?: {
    name: string;
    slug: string;
    display_name?: string;
    subtitle?: string;
  };
};