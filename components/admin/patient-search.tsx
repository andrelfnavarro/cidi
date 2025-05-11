'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { searchPatientByCPF } from '@/lib/api';

// CPF search schema
const searchSchema = z.object({
  cpf: z
    .string()
    .min(11, { message: 'CPF deve ter 11 dígitos' })
    .max(14, { message: 'CPF deve ter no máximo 14 caracteres' })
    .refine(
      value =>
        /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(
          value
            .replace(/[^\d]/g, '')
            .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        ),
      {
        message: 'CPF inválido',
      }
    ),
});

export default function PatientSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Search form
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      cpf: '',
    },
  });

  // Format CPF as user types
  const formatCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      form.setValue('cpf', value);
    }
  };

  // Handle search submission
  const onSubmit = async (data: z.infer<typeof searchSchema>) => {
    try {
      setIsLoading(true);

      // Format CPF to standard format
      const formattedCPF = data.cpf
        .replace(/[^\d]/g, '')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

      // Search for patient by CPF
      const patient = await searchPatientByCPF(formattedCPF);

      if (!patient) {
        toast({
          title: 'Paciente não encontrado',
          description: 'Não foi encontrado nenhum paciente com este CPF.',
          variant: 'destructive',
        });

        return;
      }

      router.push(`/admin/pacientes/${patient.id}`);
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao buscar paciente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Paciente</CardTitle>
        <CardDescription>
          Digite o CPF do paciente para acessar suas informações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF do Paciente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        formatCPF(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Buscar Paciente'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
