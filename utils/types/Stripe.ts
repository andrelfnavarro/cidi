export type StripeConfig = {
  publishableKey: string;
  priceId: string;
  webhookSecret: string;
};

export type StripeCheckoutSession = {
  id: string;
  url: string;
  customer: string;
  subscription: string;
  payment_status: 'paid' | 'unpaid';
  status: 'complete' | 'expired' | 'open';
};

export type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
};

export type SubscriptionCheckoutData = {
  customerEmail: string;
  customerName: string;
  companyId: string;
  companyName: string;
  dentistCount: number;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
};