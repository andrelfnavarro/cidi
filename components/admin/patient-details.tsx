'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getPatientById, createTreatment, listTreatments } from '@/lib/api';
import { formatCPF, formatPhone } from '@/lib/format-utils';
import TreatmentsList from '@/components/admin/treatments-list';

export default function PatientDetails({ patientId }: { patientId: string }) {
  const [patient, setPatient] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTreatment, setIsCreatingTreatment] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch patient data and treatments
  useEffect(() => {
    async function fetchData() {
      try {
        const patientData = await getPatientById(patientId);
        setPatient(patientData.patient);

        const treatmentsData = await listTreatments(patientId);
        setTreatments(treatmentsData.treatments || []);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do paciente.',
          variant: 'destructive',
        });
        router.push('/admin/pacientes');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [patientId]);

  // Handle create new treatment
  const handleCreateTreatment = async () => {
    try {
      setIsCreatingTreatment(true);
      const result = await createTreatment(patientId);

      if (result.success) {
        toast({
          title: 'Tratamento criado',
          description: 'Novo tratamento criado com sucesso.',
        });

        // Redirecionar para a página do tratamento
        router.push(`/admin/tratamentos/${result.treatment.id}`);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar um novo tratamento.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTreatment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Paciente não encontrado</h2>
            <p className="mt-2 text-gray-600">
              O paciente solicitado não foi encontrado no sistema.
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

  // Formatar data de nascimento
  const birthDate = patient.birth_date ? new Date(patient.birth_date) : null;
  const formattedBirthDate = birthDate
    ? format(parseISO(patient.birth_date.split('T')[0]), 'dd/MM/yyyy', {
        locale: ptBR,
      })
    : 'Não informado';

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/pacientes')}
        >
          ← Voltar para busca
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-blue-800 md:text-3xl">
          {patient.name}
        </h1>
        <p className="text-gray-600">CPF: {formatCPF(patient.cpf)}</p>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Paciente</CardTitle>
              <CardDescription>
                Informações cadastrais do paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Informações Pessoais
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p>
                        <span className="font-medium">Nome:</span>{' '}
                        {patient.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {patient.email}
                      </p>
                      <p>
                        <span className="font-medium">Telefone:</span>{' '}
                        {formatPhone(patient.phone)}
                      </p>
                      <p>
                        <span className="font-medium">Data de Nascimento:</span>{' '}
                        {formattedBirthDate}
                      </p>
                      <p>
                        <span className="font-medium">Gênero:</span>{' '}
                        {patient.gender === 'masculino'
                          ? 'Masculino'
                          : patient.gender === 'feminino'
                          ? 'Feminino'
                          : 'Outro'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Endereço
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p>
                        <span className="font-medium">Rua:</span>{' '}
                        {patient.street}
                      </p>
                      <p>
                        <span className="font-medium">CEP:</span>{' '}
                        {patient.zip_code}
                      </p>
                      <p>
                        <span className="font-medium">Cidade:</span>{' '}
                        {patient.city}
                      </p>
                      <p>
                        <span className="font-medium">Estado:</span>{' '}
                        {patient.state}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Convênio
                    </h3>
                    <div className="mt-2 space-y-2">
                      <p>
                        <span className="font-medium">Possui Convênio:</span>{' '}
                        {patient.has_insurance ? 'Sim' : 'Não'}
                      </p>
                      {patient.has_insurance && (
                        <>
                          <p>
                            <span className="font-medium">Convênio:</span>{' '}
                            {patient.insurance_name || 'Não informado'}
                          </p>
                          <p>
                            <span className="font-medium">Número:</span>{' '}
                            {patient.insurance_number || 'Não informado'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tratamentos</CardTitle>
                <CardDescription>
                  Histórico de tratamentos do paciente
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateTreatment}
                disabled={isCreatingTreatment}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isCreatingTreatment ? 'Criando...' : 'Novo Tratamento'}
              </Button>
            </CardHeader>
            <CardContent>
              <TreatmentsList treatments={treatments} patientId={patientId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
