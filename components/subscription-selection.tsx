'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { SubscriptionPlan } from '@/utils/types/Subscription';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SubscriptionSelectionProps {
  onPlanSelect: (plan: SubscriptionPlan, dentistCount: number) => void;
  selectedPlan?: SubscriptionPlan;
  dentistCount?: number;
}

const SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: 'zahn-professional',
  name: 'Zahn Profissional',
  description: 'Tudo que sua clínica precisa',
  price_per_dentist: 97, // Will be flat rate, ignore dentist count
  currency: 'BRL',
  stripe_price_id: 'price_1Rmo9SQLzoOPtu2gNrvqQG5S', // TODO: Update for flat rate pricing
  features: [
    'Pacientes ilimitados',
    'Dentistas ilimitados',
    'Todas as funcionalidades incluídas',
    'Identidade visual personalizada',
    'Suporte prioritário',
    'Configuração rápida e fácil',
  ],
};

export default function SubscriptionSelection({
  onPlanSelect,
  selectedPlan,
  dentistCount = 1,
}: SubscriptionSelectionProps) {
  const [currentDentistCount, setCurrentDentistCount] = useState(dentistCount);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const totalPrice = 97; // Flat rate of R$ 97/month

  const handleDentistCountChange = (value: string) => {
    const count = Math.max(1, parseInt(value) || 1);
    setCurrentDentistCount(count);
  };

  const adjustDentistCount = (delta: number) => {
    const newCount = Math.max(1, currentDentistCount + delta);
    setCurrentDentistCount(newCount);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Configure sua assinatura</h1>
        <p className="text-gray-600 mb-6">
          Personalize o plano para sua clínica
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{SUBSCRIPTION_PLAN.name}</CardTitle>
          <CardDescription>{SUBSCRIPTION_PLAN.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3 mb-6">
            {SUBSCRIPTION_PLAN.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>


      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatPrice(totalPrice)}/mês
            </div>
            <div className="text-sm text-gray-600">
              Plano fixo - dentistas ilimitados
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => onPlanSelect(SUBSCRIPTION_PLAN, 1)} // Always 1 for flat rate
          >
            Continuar com este plano
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
