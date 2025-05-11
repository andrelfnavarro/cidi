'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Clock, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { listTreatments } from '@/lib/api';

export default function TreatmentsList({
  treatments: initialTreatments,
  patientId,
}: {
  treatments: any[];
  patientId: string;
}) {
  const [treatments, setTreatments] = useState<any[]>(initialTreatments);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Refresh treatments list
  const refreshTreatments = async () => {
    try {
      setIsRefreshing(true);
      const result = await listTreatments(patientId);
      setTreatments(result.treatments || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a lista de tratamentos.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to treatment details
  const goToTreatment = (treatmentId: string) => {
    router.push(`/admin/tratamentos/${treatmentId}`);
  };

  if (treatments.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Nenhum tratamento encontrado
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Este paciente ainda não possui tratamentos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshTreatments}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}
        </Button>
      </div>

      {treatments.map(treatment => {
        const createdAt = new Date(treatment.created_at);
        const formattedDate = format(createdAt, 'dd/MM/yyyy', { locale: ptBR });

        // Verificar se tem pagamento
        const hasPaid =
          treatment.treatment_payment &&
          treatment.treatment_payment.payment_date;

        return (
          <Card
            key={treatment.id}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => goToTreatment(treatment.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tratamento de {formattedDate}</p>
                  <p className="text-sm text-gray-500">ID: {treatment.id}</p>
                  {treatment.created_by_dentist && (
                    <p className="text-xs text-gray-500">
                      Criado por: {treatment.created_by_dentist.name}
                    </p>
                  )}
                  {treatment.updated_by_dentist &&
                    treatment.updated_at &&
                    treatment.created_at !== treatment.updated_at && (
                      <p className="text-xs text-gray-500">
                        Atualizado por: {treatment.updated_by_dentist.name}
                      </p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                  {hasPaid && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Pago
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      treatment.status === 'open'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }
                  >
                    {treatment.status === 'open' ? (
                      <>
                        <Clock className="mr-1 h-3 w-3" /> Em andamento
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" /> Finalizado
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
