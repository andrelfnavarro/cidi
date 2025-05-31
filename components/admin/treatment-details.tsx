'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getTreatmentById, finalizeTreatment } from '@/lib/api';
import AnamnesisForm from '@/components/admin/anamnesis-form';
import PlanningForm from '@/components/admin/planning-form';
import PaymentForm from '@/components/admin/payment-form';
import TreatmentFiles from '@/components/admin/treatment-files';
import TrackingInfo from '@/components/admin/tracking-info';
import { useDentist } from '@/contexts/dentist-context';

export default function TreatmentDetails({
  treatmentId,
}: {
  treatmentId: string;
}) {
  const [treatment, setTreatment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const dentist = useDentist();

  const fetchTreatment = async () => {
    try {
      setIsLoading(true);
      const data = await getTreatmentById(treatmentId);

      setTreatment(data.treatment);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do tratamento.',
        variant: 'destructive',
      });
      router.push('/admin/pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatment();
  }, [treatmentId, router, toast]);

  // Handle finalize treatment
  const handleFinalizeTreatment = async () => {
    if (!dentist) {
      toast({
        title: 'Erro',
        description:
          'Dados do dentista não encontrados. Por favor, faça login novamente.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsFinalizing(true);
      await finalizeTreatment(treatmentId);
      toast({
        title: 'Tratamento finalizado',
        description: 'O tratamento foi finalizado com sucesso.',
      });
      fetchTreatment();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o tratamento.',
        variant: 'destructive',
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Tratamento não encontrado</h2>
            <p className="mt-2 text-gray-600">
              O tratamento solicitado não foi encontrado no sistema.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push('/admin/pacientes')}
            >
              Voltar para busca
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const createdAt = new Date(treatment.created_at);
  const formattedDate = format(createdAt, 'dd/MM/yyyy', { locale: ptBR });
  const patientName = treatment.patients?.name || 'Paciente';
  const isTreatmentFinalized = treatment.status === 'finalized';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/admin/pacientes/${treatment.patient_id}`)
            }
          >
            ← Voltar para o paciente
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {isTreatmentFinalized && (
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-mode"
                checked={editMode}
                onCheckedChange={setEditMode}
              />
              <label htmlFor="edit-mode" className="text-sm font-medium">
                Modo de edição
              </label>
            </div>
          )}
          {!isTreatmentFinalized && (
            <Button
              variant="default"
              onClick={handleFinalizeTreatment}
              disabled={isFinalizing}
            >
              {isFinalizing ? 'Finalizando...' : 'Finalizar Tratamento'}
            </Button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-blue-800 md:text-3xl">
          Tratamento de {formattedDate}
        </h1>
        <p className="text-gray-600">Paciente: {patientName}</p>
        {isTreatmentFinalized && !editMode && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Finalizado
            </span>
          </div>
        )}
        {isTreatmentFinalized && editMode && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Modo de edição ativado
            </span>
          </div>
        )}

        <TrackingInfo
          createdAt={treatment.created_at}
          updatedAt={treatment.updated_at}
          createdBy={treatment.created_by_dentist}
          updatedBy={treatment.updated_by_dentist}
          className="mt-2"
        />
      </div>

      <Tabs defaultValue="anamnesis">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
          <TabsTrigger value="planning">Planejamento</TabsTrigger>
          <TabsTrigger value="payment">Orçamento</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="anamnesis" className="mt-6">
          <AnamnesisForm
            treatmentId={treatmentId}
            initialData={treatment.anamnesis?.[0]}
            isReadOnly={isTreatmentFinalized && !editMode}
            onSaved={fetchTreatment}
            trackingInfo={
              treatment.anamnesis?.[0]
                ? {
                    createdAt: treatment.anamnesis[0].created_at,
                    updatedAt: treatment.anamnesis[0].updated_at,
                    createdBy: treatment.anamnesis[0].created_by_dentist,
                    updatedBy: treatment.anamnesis[0].updated_by_dentist,
                  }
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="planning" className="mt-6">
          <PlanningForm
            treatmentId={treatmentId}
            initialItems={treatment.treatment_items}
            isReadOnly={isTreatmentFinalized && !editMode}
            onSaved={fetchTreatment}
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <PaymentForm
            treatmentId={treatmentId}
            initialData={treatment.treatment_payment}
            treatmentItems={treatment.treatment_items}
            isReadOnly={isTreatmentFinalized && !editMode}
            onSaved={fetchTreatment}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <TreatmentFiles
            treatmentId={treatmentId}
            isReadOnly={isTreatmentFinalized && !editMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
