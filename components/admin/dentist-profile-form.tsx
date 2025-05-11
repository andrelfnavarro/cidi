'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { supabaseClient } from '@/utils/supabase/client';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useDentist } from '@/contexts/dentist-context';

const profileSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
    specialty: z.string().optional(),
    registration_number: z.string().optional(),
    current_password: z.string().optional().or(z.literal('')),
    new_password: z
      .string()
      .min(6, { message: 'Nova senha deve ter pelo menos 6 caracteres' })
      .optional()
      .or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine(
    data => {
      const hasPassword =
        !!data.current_password ||
        !!data.new_password ||
        !!data.confirm_password;
      if (hasPassword) {
        return (
          !!data.current_password &&
          !!data.new_password &&
          !!data.confirm_password
        );
      }
      return true;
    },
    {
      message:
        'Todos os campos de senha devem ser preenchidos para alterar a senha',
      path: ['current_password'],
    }
  )
  .refine(
    data => {
      if (data.new_password && data.confirm_password) {
        return data.new_password === data.confirm_password;
      }
      return true;
    },
    {
      message: 'As senhas não conferem',
      path: ['confirm_password'],
    }
  );

export default function DentistProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const dentist = useDentist();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: dentist.name,
      specialty: dentist.specialty || '',
      registration_number: dentist.registration_number || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async data => {
    setIsSaving(true);
    setError(null);
    try {
      // handle password update
      const wantsPassword =
        data.current_password && data.new_password && data.confirm_password;
      if (wantsPassword) {
        const { error: authError } =
          await supabaseClient.auth.signInWithPassword({
            email: dentist.email,
            password: data.current_password,
          });
        if (authError) throw new Error('Senha atual incorreta');
        const { error: pwdError } = await supabaseClient.auth.updateUser({
          password: data.new_password,
        });
        if (pwdError) throw pwdError;
        toast({ title: 'Senha atualizada' });
      }

      const { error: updateError } = await supabaseClient
        .from('dentists')
        .update({
          name: data.name,
          specialty: data.specialty || null,
          registration_number: data.registration_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dentist.id);
      if (updateError) throw updateError;

      form.reset({
        ...data,
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      toast({ title: 'Perfil atualizado' });
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(msg);
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-800 md:text-3xl">
        Meu Perfil
      </h1>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Sua especialidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Registro (CRO)</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu CRO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-medium">Alterar Senha (Opcional)</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Deixe os campos abaixo em branco se não desejar alterar sua
                  senha.
                </p>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="current_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Sua senha atual"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Nova senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirme a nova senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
