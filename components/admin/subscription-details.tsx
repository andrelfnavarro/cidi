'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, FileText, Settings, ChevronRight } from 'lucide-react';
import { useDentist } from '@/contexts/dentist-context';

type SubscriptionDetailsProps = {
  companyId: string;
};

type SubscriptionData = {
  id: string;
  status: string;
  planName: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  dentistCount: number;
  pricePerDentist: number;
  nextInvoiceDate: string;
};

export default function SubscriptionDetails({ companyId }: SubscriptionDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const dentist = useDentist();

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/subscription/details?companyId=${companyId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription details');
        }
        
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription details:', err);
        setError('Não foi possível carregar os detalhes da assinatura');
      } finally {
        setLoading(false);
      }
    }
    
    if (companyId) {
      fetchSubscriptionDetails();
    }
  }, [companyId]);

  const handleManageBilling = async () => {
    if (!companyId) return;
    
    try {
      setLoadingPortal(true);
      
      const response = await fetch('/api/subscription/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
          companyId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Error creating customer portal session:', err);
      setError('Não foi possível acessar o portal de faturamento');
    } finally {
      setLoadingPortal(false);
    }
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Format currency to BRL
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'unpaid':
      case 'incomplete':
      case 'incomplete_expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get human-readable status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'trialing':
        return 'Em teste';
      case 'past_due':
        return 'Pagamento pendente';
      case 'canceled':
        return 'Cancelada';
      case 'unpaid':
        return 'Não paga';
      case 'incomplete':
        return 'Incompleta';
      case 'incomplete_expired':
        return 'Expirada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p>Nenhuma assinatura encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPrice = subscription.dentistCount * subscription.pricePerDentist;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Detalhes da Assinatura</CardTitle>
            <CardDescription>Gerencie sua assinatura e faturamento</CardDescription>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusText(subscription.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Plano</p>
              <p className="font-medium">{subscription.planName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Quantidade de dentistas</p>
              <p className="font-medium">{subscription.dentistCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Valor por dentista</p>
              <p className="font-medium">{formatCurrency(subscription.pricePerDentist)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Valor total</p>
              <p className="font-medium">{formatCurrency(totalPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Início do período atual</p>
              <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Fim do período atual</p>
              <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Próxima fatura</p>
              <p className="font-medium">{formatDate(subscription.nextInvoiceDate)}</p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <h3 className="text-lg font-medium">Gerenciar assinatura</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between" onClick={handleManageBilling}>
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-primary mr-2" />
                    <span>Gerenciar métodos de pagamento</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                        <span>Ver histórico de faturas</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Histórico de Faturas</DialogTitle>
                    <DialogDescription>
                      Acesse o portal de faturamento para ver o histórico completo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Esta funcionalidade estará disponível em breve.</p>
                    <p>Por enquanto, acesse o portal de faturamento para ver suas faturas.</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleManageBilling}>
                      Ir para Portal de Faturamento
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={() => window.open('https://stripe.com/br/legal', '_blank')}
        >
          Termos de Serviço
        </Button>
        <Button 
          onClick={handleManageBilling} 
          disabled={loadingPortal}
        >
          {loadingPortal ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            'Portal de Faturamento'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
