'use client';

import { useDentist } from '@/contexts/dentist-context';
import SubscriptionDetails from '@/components/admin/subscription-details';

export default function BillingPage() {
  const dentist = useDentist();
  
  if (!dentist.is_admin) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-medium text-red-800 mb-2">Acesso restrito</h2>
          <p className="text-red-700">
            Apenas administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Faturamento</h1>
        <p className="text-gray-500">
          Gerencie assinatura, métodos de pagamento e faturas da sua empresa
        </p>
      </div>
      
      <SubscriptionDetails companyId={dentist.company_id} />
    </div>
  );
}
