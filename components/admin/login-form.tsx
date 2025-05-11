// components/admin/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { supabaseClient } from '@/utils/supabase/client';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setLoginError(null);

    const { data: res, error } = await supabaseClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      const msg = error.message.includes('não encontrado como dentista')
        ? 'Conta não vinculada a um dentista. Contate o admin.'
        : error.message.includes('Invalid login credentials')
        ? 'Email ou senha incorretos.'
        : 'Erro ao fazer login. Tente novamente.';
      setLoginError(msg);
      setIsLoading(false);
      return;
    }

    // success!
    toast({
      title: 'Login realizado com sucesso!',
      description: 'Bem-vindo ao portal do dentista.',
    });

    // push to pacientes
    router.push('/admin/pacientes');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Acesse o portal do dentista</CardDescription>
      </CardHeader>
      <CardContent>
        {loginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              Erro de autenticação
            </AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
