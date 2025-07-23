'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    const completeSubscription = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('ID da sessão não encontrado');
        }

        // Get pending subscription data from sessionStorage
        const pendingData = sessionStorage.getItem('pendingSubscription');
        if (!pendingData) {
          throw new Error('Dados da assinatura não encontrados');
        }

        const subscriptionFlowData = JSON.parse(pendingData);

        console.log('Completing subscription with session:', sessionId);

        // Complete the subscription
        const response = await fetch('/api/subscription/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...subscriptionFlowData,
            sessionId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao finalizar assinatura');
        }

        const result = await response.json();
        setSubscriptionData(result);

        // Clear pending data
        sessionStorage.removeItem('pendingSubscription');

        console.log('Subscription completed successfully:', result);
      } catch (error) {
        console.error('Error completing subscription:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setIsProcessing(false);
      }
    };

    completeSubscription();
  }, [searchParams]);

  const handleContinue = () => {
    // Redirect to admin login with success message
    router.push('/admin?subscription=success');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">
              Finalizando sua assinatura...
            </h2>
            <p className="text-gray-600">
              Estamos configurando sua conta. Isso pode levar alguns segundos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Erro na Assinatura</CardTitle>
            <CardDescription>
              Houve um problema ao finalizar sua assinatura
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/subscription')}
                className="w-full"
              >
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="w-full"
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Assinatura Ativada!
          </CardTitle>
          <CardDescription>Sua conta foi criada com sucesso</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {subscriptionData && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-medium">Detalhes da conta:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Email:</strong> {subscriptionData.user?.email}
                </div>
                <div>
                  <strong>Empresa:</strong> {subscriptionData.company?.name}
                </div>
                <div>
                  <strong>URL da clínica:</strong>{' '}
                  <span className="text-blue-600">
                    zahn.work/{subscriptionData.company?.slug}
                  </span>
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className="text-green-600 capitalize">
                    {subscriptionData.subscription?.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={handleContinue} className="w-full">
              Acessar Portal do Dentista
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Você será redirecionado para fazer login com suas credenciais
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
