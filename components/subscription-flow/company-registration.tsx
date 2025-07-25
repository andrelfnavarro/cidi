'use client';

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
  FormDescription,
} from '@/components/ui/form';

const companySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' }),
  slug: z
    .string()
    .min(2, { message: 'URL personalizada deve ter pelo menos 2 caracteres' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'URL deve conter apenas letras minúsculas, números e hífens',
    })
    .transform(val => val.toLowerCase()),
  display_name: z.string().optional(),
  subtitle: z.string().optional(),
});

type CompanyData = z.infer<typeof companySchema>;

interface CompanyRegistrationProps {
  onCompanyCreate: (data: CompanyData) => void;
  initialData?: Partial<CompanyData>;
  isLoading?: boolean;
}

export default function CompanyRegistration({
  onCompanyCreate,
  initialData,
  isLoading,
}: CompanyRegistrationProps) {
  const form = useForm<CompanyData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      display_name: initialData?.display_name || '',
      subtitle: initialData?.subtitle || '',
    },
  });

  const watchedName = form.watch('name');
  const watchedSlug = form.watch('slug');

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (
      !form.getValues('slug') ||
      form.getValues('slug') === generateSlugFromName(form.getValues('name'))
    ) {
      form.setValue('slug', generateSlugFromName(name));
    }
  };

  const onSubmit = (data: CompanyData) => {
    onCompanyCreate(data);
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl">Informações da empresa</CardTitle>
          <CardDescription className="text-sm sm:text-base">Configure os dados da sua clínica</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 sm:pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da clínica</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Clínica Dental Exemplo"
                        {...field}
                        onChange={e => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL personalizada</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 sm:px-3 text-xs sm:text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md whitespace-nowrap">
                          zahn.work/
                        </span>
                        <Input
                          placeholder="clinica-exemplo"
                          className="rounded-l-none text-sm sm:text-base"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Esta será a URL onde seus pacientes acessarão o formulário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de exibição (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome personalizado para exibição"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Nome alternativo para exibir aos pacientes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slogan (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Cuidando do seu sorriso" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm">
                      Slogan ou tagline da sua clínica
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full py-3 text-sm sm:text-base mt-6" disabled={isLoading}>
                {isLoading ? 'Criando empresa...' : 'Continuar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
