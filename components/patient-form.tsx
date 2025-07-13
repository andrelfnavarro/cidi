'use client';

import type React from 'react';

import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { checkCPF, registerPatient } from '@/lib/api';

// CPF validation schema
const cpfSchema = z.object({
  cpf: z
    .string()
    .min(11, { message: 'CPF deve ter 11 dígitos' })
    .max(14, { message: 'CPF deve ter no máximo 14 caracteres' })
    .refine(
      value => {
        // Remove non-digits for validation
        const digits = value.replace(/\D/g, '');
        return digits.length === 11;
      },
      {
        message: 'CPF inválido',
      }
    ),
});

// Full patient registration schema
const patientSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  cpf: z.string(),
  street: z
    .string()
    .min(3, { message: 'Endereço deve ter pelo menos 3 caracteres' }),
  zipCode: z.string().min(8, { message: 'CEP inválido' }),
  city: z
    .string()
    .min(2, { message: 'Cidade deve ter pelo menos 2 caracteres' }),
  state: z
    .string()
    .min(2, { message: 'Estado deve ter pelo menos 2 caracteres' }),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Por favor selecione um gênero',
  }),
  birthDay: z.string({
    required_error: 'Dia é obrigatório',
  }),
  birthMonth: z.string({
    required_error: 'Mês é obrigatório',
  }),
  birthYear: z.string({
    required_error: 'Ano é obrigatório',
  }),
  hasInsurance: z.enum(['true', 'false'], {
    required_error: 'Por favor indique se possui convênio',
  }),
  insuranceName: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

interface PatientFormProps {
  companySlug?: string;
  companyName?: string;
}

export default function PatientForm({ companySlug, companyName }: PatientFormProps = {}) {
  const [step, setStep] = useState<'cpf' | 'exists' | 'register' | 'success'>(
    'cpf'
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // CPF form
  const cpfForm = useForm<z.infer<typeof cpfSchema>>({
    resolver: zodResolver(cpfSchema),
    defaultValues: {
      cpf: '',
    },
  });

  // Full registration form
  const patientForm = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      street: '',
      zipCode: '',
      city: '',
      state: '',
      gender: undefined,
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      hasInsurance: undefined,
      insuranceName: '',
      insuranceNumber: '',
    },
  });

  // Handle CPF submission
  const onCPFSubmit = async (data: z.infer<typeof cpfSchema>) => {
    try {
      setIsLoading(true);
      // Normalize CPF by removing non-digits
      const normalizedCPF = data.cpf.replace(/\D/g, '');

      // Check if CPF exists in the system
      const exists = await checkCPF(normalizedCPF);

      if (exists) {
        setStep('exists');
      } else {
        // Set CPF in the full registration form
        patientForm.setValue('cpf', normalizedCPF);
        setStep('register');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao verificar o CPF. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle full registration submission
  const onPatientSubmit = async (data: z.infer<typeof patientSchema>) => {
    try {
      setIsLoading(true);

      // Convert separate date fields to a single date string in ISO format
      const birthDateString = `${data.birthYear}-${data.birthMonth.padStart(
        2,
        '0'
      )}-${data.birthDay.padStart(2, '0')}`;

      // Create a copy of the data with the birthDate field
      const patientData = {
        ...data,
        birthDate: birthDateString,
        // Normalize phone by removing non-digits
        phone: data.phone.replace(/\D/g, ''),
      };

      // Remove the separate date fields before sending to the API
      delete patientData.birthDay;
      delete patientData.birthMonth;
      delete patientData.birthYear;

      // Registrar paciente no banco de dados
      await registerPatient(patientData, companySlug);

      // Show success message
      setStep('success');

      toast({
        title: 'Cadastro realizado com sucesso!',
        description:
          'Seus dados foram salvos. Aguarde ser chamado pelo dentista.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error
            ? error.message
            : 'Erro ao cadastrar paciente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format CPF as user types (for display only)
  const formatCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      cpfForm.setValue('cpf', value);
    }
  };

  // Format phone number as user types (for display only)
  const formatPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      patientForm.setValue('phone', value);
    }
  };

  // Format CEP as user types
  const formatCEP = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
      patientForm.setValue('zipCode', value);
    }
  };

  return (
    <>
      {step === 'cpf' && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Paciente</CardTitle>
            <CardDescription>
              {companyName && (
                <span className="block text-sm font-medium text-blue-600 mb-1">
                  {companyName}
                </span>
              )}
              Por favor, informe seu CPF para verificarmos seu cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...cpfForm}>
              <form
                onSubmit={cpfForm.handleSubmit(onCPFSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={cpfForm.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
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
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 'exists' && (
        <Card>
          <CardHeader>
            <CardTitle>Paciente Encontrado</CardTitle>
            <CardDescription>
              Seus dados já estão em nosso sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
              <p>
                Obrigado por confirmar seu CPF. Seus dados já estão registrados
                em nosso sistema.
              </p>
              <p className="mt-2 font-medium">
                Por favor, aguarde o contato do dentista.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setStep('cpf')}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'register' && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Paciente</CardTitle>
            <CardDescription>
              Complete seu cadastro com as informações abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...patientForm}>
              <form
                onSubmit={patientForm.handleSubmit(onPatientSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={patientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(00) 00000-0000"
                          {...field}
                          onChange={e => {
                            field.onChange(e);
                            formatPhone(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Endereço</h3>

                  <FormField
                    control={patientForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua/Avenida</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rua/Avenida, número, complemento"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={patientForm.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            {...field}
                            onChange={e => {
                              field.onChange(e);
                              formatCEP(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={patientForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={patientForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="UF" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AC">AC</SelectItem>
                                <SelectItem value="AL">AL</SelectItem>
                                <SelectItem value="AP">AP</SelectItem>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="BA">BA</SelectItem>
                                <SelectItem value="CE">CE</SelectItem>
                                <SelectItem value="DF">DF</SelectItem>
                                <SelectItem value="ES">ES</SelectItem>
                                <SelectItem value="GO">GO</SelectItem>
                                <SelectItem value="MA">MA</SelectItem>
                                <SelectItem value="MT">MT</SelectItem>
                                <SelectItem value="MS">MS</SelectItem>
                                <SelectItem value="MG">MG</SelectItem>
                                <SelectItem value="PA">PA</SelectItem>
                                <SelectItem value="PB">PB</SelectItem>
                                <SelectItem value="PR">PR</SelectItem>
                                <SelectItem value="PE">PE</SelectItem>
                                <SelectItem value="PI">PI</SelectItem>
                                <SelectItem value="RJ">RJ</SelectItem>
                                <SelectItem value="RN">RN</SelectItem>
                                <SelectItem value="RS">RS</SelectItem>
                                <SelectItem value="RO">RO</SelectItem>
                                <SelectItem value="RR">RR</SelectItem>
                                <SelectItem value="SC">SC</SelectItem>
                                <SelectItem value="SP">SP</SelectItem>
                                <SelectItem value="SE">SE</SelectItem>
                                <SelectItem value="TO">TO</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={patientForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gênero</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Masculino
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Feminino
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal">Outro</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={patientForm.control}
                    name="birthDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Dia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              day => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={patientForm.control}
                    name="birthMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mês</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Janeiro</SelectItem>
                            <SelectItem value="2">Fevereiro</SelectItem>
                            <SelectItem value="3">Março</SelectItem>
                            <SelectItem value="4">Abril</SelectItem>
                            <SelectItem value="5">Maio</SelectItem>
                            <SelectItem value="6">Junho</SelectItem>
                            <SelectItem value="7">Julho</SelectItem>
                            <SelectItem value="8">Agosto</SelectItem>
                            <SelectItem value="9">Setembro</SelectItem>
                            <SelectItem value="10">Outubro</SelectItem>
                            <SelectItem value="11">Novembro</SelectItem>
                            <SelectItem value="12">Dezembro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={patientForm.control}
                    name="birthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {Array.from(
                              { length: 100 },
                              (_, i) => new Date().getFullYear() - i
                            ).map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Informações do Convênio
                  </h3>

                  <FormField
                    control={patientForm.control}
                    name="hasInsurance"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Possui convênio odontológico?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={value => {
                              field.onChange(value);
                              if (value === 'false') {
                                patientForm.setValue('insuranceName', '');
                                patientForm.setValue('insuranceNumber', '');
                              }
                            }}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="true" />
                              </FormControl>
                              <FormLabel className="font-normal">Sim</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="false" />
                              </FormControl>
                              <FormLabel className="font-normal">Não</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {patientForm.watch('hasInsurance') === 'true' && (
                    <>
                      <FormField
                        control={patientForm.control}
                        name="insuranceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Convênio</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o convênio" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sulamérica">
                                    Sulamérica
                                  </SelectItem>
                                  <SelectItem value="Amil">Amil</SelectItem>
                                  <SelectItem value="Hapvida">
                                    Hapvida
                                  </SelectItem>
                                  <SelectItem value="Porto Seguro">
                                    Porto Seguro
                                  </SelectItem>
                                  <SelectItem value="Careplus">
                                    Careplus
                                  </SelectItem>
                                  <SelectItem value="Dental Brasil">
                                    Dental Brasil
                                  </SelectItem>
                                  <SelectItem value="Crown Odonto">
                                    Crown Odonto
                                  </SelectItem>
                                  <SelectItem value="Odontoprev">
                                    Odontoprev
                                  </SelectItem>
                                  <SelectItem value="Bradesco">
                                    Bradesco
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={patientForm.control}
                        name="insuranceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Convênio</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Número do convênio"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setStep('cpf')}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Concluído</CardTitle>
            <CardDescription>
              Seus dados foram registrados com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4 text-green-800">
              <p>Obrigado por completar seu cadastro.</p>
              <p className="mt-2 font-medium">
                Por favor, aguarde ser chamado pelo dentista.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setStep('cpf')}
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
