'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { savePlanning } from '@/lib/api';
import { cn } from '@/lib/utils';
import TrackingInfo from '@/components/admin/tracking-info';
import { useDentist } from '@/contexts/dentist-context';

// Schema for a single treatment item
const treatmentItemSchema = z.object({
  id: z.string().optional(),
  toothNumber: z.string().min(1, { message: 'Número do dente é obrigatório' }),
  procedureDescription: z
    .string()
    .min(1, { message: 'Descrição do procedimento é obrigatória' }),
  procedureValue: z
    .string()
    .min(1, { message: 'Valor do procedimento é obrigatório' }),
  insuranceCoverage: z.boolean().default(false),
  conclusionDate: z.date().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by_dentist: z.object({
    id: z.string(),
    name: z.string(),
  }),
  updated_by_dentist: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

// Schema for the planning form
const planningSchema = z.object({
  items: z.array(treatmentItemSchema),
});

interface PlanningFormProps {
  treatmentId: string;
  initialItems?: any[];
  isReadOnly?: boolean;
  onSaved?: () => void;
}

export default function PlanningForm({
  treatmentId,
  initialItems = [],
  isReadOnly = false,
  onSaved,
}: PlanningFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const dentist = useDentist();

  // include id and original created_* fields
  const defaultItems = initialItems.map(item => ({
    id: item.id,
    toothNumber: item.tooth_number,
    procedureDescription: item.procedure_description,
    procedureValue: item.procedure_value?.toString() || '0',
    insuranceCoverage: item.insurance_coverage,
    conclusionDate: item.conclusion_date
      ? new Date(item.conclusion_date)
      : null,
    created_at: item.created_at,
    created_by_dentist: item.created_by_dentist,
    updated_at: item.updated_at,
    updated_by_dentist: item.updated_by_dentist,
  }));

  // Planning form
  const form = useForm<z.infer<typeof planningSchema>>({
    resolver: zodResolver(planningSchema),
    defaultValues: {
      items: defaultItems.length > 0 ? defaultItems : [],
    },
  });

  const addItem = () => {
    const currentItems = form.getValues('items') || [];
    form.setValue('items', [
      ...currentItems,
      {
        toothNumber: '',
        procedureDescription: '',
        procedureValue: '0',
        insuranceCoverage: false,
        conclusionDate: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_dentist: {
          id: dentist.id,
          name: dentist.name,
        },
        updated_by_dentist: {
          id: dentist.id,
          name: dentist.name,
        },
      },
    ]);
  };

  // Remove item from the planning
  const removeItem = (index: number) => {
    const currentItems = form.getValues('items') || [];
    form.setValue(
      'items',
      currentItems.filter((_, i) => i !== index)
    );
  };

  // Calculate total value
  const calculateTotal = () => {
    const items = form.getValues('items') || [];
    return items
      .filter(item => !item.insuranceCoverage)
      .reduce(
        (sum, item) => sum + (Number.parseFloat(item.procedureValue) || 0),
        0
      )
      .toFixed(2);
  };

  const onSubmit = async (data: z.infer<typeof planningSchema>) => {
    try {
      setIsSaving(true);

      await savePlanning(treatmentId, data.items);

      toast({
        title: 'Planejamento salvo com sucesso!',
        description: 'Os itens do planejamento foram atualizados.',
      });

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao salvar planejamento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Renderizar formulário somente para leitura
  if (isReadOnly) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Odontograma e Planejamento</CardTitle>
              <CardDescription>
                Procedimentos planejados para o tratamento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {defaultItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum procedimento planejado.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {defaultItems.map((item, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-medium">Dente</p>
                        <p>{item.toothNumber}</p>
                      </div>
                      <div>
                        <p className="font-medium">Procedimento</p>
                        <p>{item.procedureDescription}</p>
                      </div>
                      <div>
                        <p className="font-medium">Valor</p>
                        <p>
                          R$ {Number.parseFloat(item.procedureValue).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Cobertura do Convênio</p>
                        <p>{item.insuranceCoverage ? 'Sim' : 'Não'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <p>
                          {item.conclusionDate
                            ? `Concluído em ${format(
                                new Date(item.conclusionDate),
                                'dd/MM/yyyy',
                                { locale: ptBR }
                              )}`
                            : 'Pendente'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">Valor Total (Particular)</p>
                <p className="text-xl font-bold">
                  R${' '}
                  {defaultItems
                    .filter(item => !item.insuranceCoverage)
                    .reduce(
                      (sum, item) =>
                        sum + (Number.parseFloat(item.procedureValue) || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Odontograma e Planejamento</CardTitle>
            <CardDescription>
              {isReadOnly
                ? 'Procedimentos planejados para o tratamento'
                : 'Adicione os procedimentos planejados para o tratamento'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <img
            src="/dental-chart-diagram.png"
            alt="Odontograma"
            className="w-3/5 rounded-lg border shadow-sm mx-auto"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {form.watch('items').map((item, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Procedimento {index + 1}</h4>

                    <TrackingInfo
                      createdAt={item.created_at}
                      updatedAt={item.updated_at}
                      createdBy={item.created_by_dentist}
                      updatedBy={item.updated_by_dentist}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.toothNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dente</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 11, 42, etc" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.procedureDescription`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Procedimento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Descrição do procedimento"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.procedureValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.insuranceCoverage`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Cobertura do Convênio</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.conclusionDate`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Conclusão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'dd/MM/yyyy', {
                                      locale: ptBR,
                                    })
                                  ) : (
                                    <span>Procedimento pendente</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={date => field.onChange(date)}
                                disabled={date => date > new Date()}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addItem}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Procedimento
              </Button>
            </div>

            {form.watch('items').length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">Valor Total (Particular)</p>
                <p className="text-xl font-bold">R$ {calculateTotal()}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Planejamento'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
