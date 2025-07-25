'use client';

import { useState } from 'react';
import { SubscriptionFlowData } from '@/utils/types/Subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import getStripe from '@/lib/stripe-client';

interface StripePaymentProps {
  subscriptionData: SubscriptionFlowData;
  onPaymentComplete: (sessionId: string) => void;
}

export default function StripePayment({ subscriptionData, onPaymentComplete }: StripePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const totalPrice = (subscriptionData.selectedPlan?.price_per_dentist || 0) * (subscriptionData.dentistCount || 1);

  const handlePayment = async () => {
    if (!subscriptionData.selectedPlan || !subscriptionData.accountData || !subscriptionData.companyData) {
      setError('Dados incompletos para processar pagamento');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session (following official Stripe Next.js docs)
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: subscriptionData.accountData.email,
          customerName: subscriptionData.accountData.name,
          companyName: subscriptionData.companyData.name,
          dentistCount: subscriptionData.dentistCount || 1,
          priceId: subscriptionData.selectedPlan.stripe_price_id!
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de pagamento');
      }

      const { id: sessionId, url } = await response.json();
      
      // Store subscription data for completion after payment
      sessionStorage.setItem('pendingSubscription', JSON.stringify({
        ...subscriptionData,
        sessionId,
      }));

      // Initialize Stripe and redirect to checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout (official pattern)
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        setError(error.message);
      }
      
    } catch (error) {
      console.error('Error creating checkout:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl">Pagamento</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Finalize sua assinatura
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 pt-0 sm:pt-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Resumo do pedido</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span>Plano:</span>
                <span>{subscriptionData.selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Dentistas:</span>
                <span>{subscriptionData.dentistCount || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Empresa:</span>
                <span>{subscriptionData.companyData?.name}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total mensal:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-sm sm:text-base">Conta administradora</h3>
            <div className="space-y-1 text-xs sm:text-sm">
              <div><strong>Nome:</strong> {subscriptionData.accountData?.name}</div>
              <div><strong>Email:</strong> {subscriptionData.accountData?.email}</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handlePayment}
              className="w-full py-3 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                `Pagar ${formatPrice(totalPrice)}/mês`
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center px-2">
              Ao prosseguir, você será redirecionado para o Stripe para finalizar o pagamento de forma segura.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}