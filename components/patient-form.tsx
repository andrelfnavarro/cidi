"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { checkCPF } from "@/lib/api"

// CPF validation schema
const cpfSchema = z.object({
  cpf: z
    .string()
    .min(11, { message: "CPF deve ter 11 dígitos" })
    .max(14, { message: "CPF deve ter no máximo 14 caracteres" })
    .refine(
      (value) =>
        /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(
          value.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
        ),
      {
        message: "CPF inválido",
      },
    ),
})

// Full patient registration schema
const patientSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string(),
  street: z.string().min(3, { message: "Endereço deve ter pelo menos 3 caracteres" }),
  zipCode: z.string().min(8, { message: "CEP inválido" }),
  city: z.string().min(2, { message: "Cidade deve ter pelo menos 2 caracteres" }),
  state: z.string().min(2, { message: "Estado deve ter pelo menos 2 caracteres" }),
  gender: z.enum(["masculino", "feminino", "outro"], {
    required_error: "Por favor selecione um gênero",
  }),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  hasInsurance: z.enum(["true", "false"], {
    required_error: "Por favor indique se possui convênio",
  }),
  insuranceName: z.string().optional(),
  insuranceNumber: z.string().optional(),
})

export default function PatientForm() {
  const [step, setStep] = useState<"cpf" | "exists" | "register" | "success">("cpf")
  const { toast } = useToast()

  // CPF form
  const cpfForm = useForm<z.infer<typeof cpfSchema>>({
    resolver: zodResolver(cpfSchema),
    defaultValues: {
      cpf: "",
    },
  })

  // Full registration form
  const patientForm = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      street: "",
      zipCode: "",
      city: "",
      state: "",
      gender: undefined,
      birthDate: undefined,
      hasInsurance: undefined,
      insuranceName: "",
      insuranceNumber: "",
    },
  })

  // Handle CPF submission
  const onCPFSubmit = async (data: z.infer<typeof cpfSchema>) => {
    try {
      // Format CPF to standard format
      const formattedCPF = data.cpf.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")

      // Check if CPF exists in the system
      const exists = await checkCPF(formattedCPF)

      if (exists) {
        setStep("exists")
      } else {
        // Set CPF in the full registration form
        patientForm.setValue("cpf", formattedCPF)
        setStep("register")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar o CPF. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Handle full registration submission
  const onPatientSubmit = (data: z.infer<typeof patientSchema>) => {
    // Here you would typically send the data to your backend
    console.log("Patient data:", data)

    // Show success message
    setStep("success")

    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Seus dados foram salvos. Aguarde o contato do dentista.",
    })
  }

  // Format CPF as user types
  const formatCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      cpfForm.setValue("cpf", value)
    }
  }

  // Format phone number as user types
  const formatPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      } else {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
      }
      patientForm.setValue("phone", value)
    }
  }

  // Format CEP as user types
  const formatCEP = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d{3})/, "$1-$2")
      patientForm.setValue("zipCode", value)
    }
  }

  return (
    <>
      {step === "cpf" && (
        <Card>
          <CardHeader>
            <CardTitle>Verificação de Paciente</CardTitle>
            <CardDescription>Por favor, informe seu CPF para verificarmos seu cadastro</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...cpfForm}>
              <form onSubmit={cpfForm.handleSubmit(onCPFSubmit)} className="space-y-6">
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
                          onChange={(e) => {
                            field.onChange(e)
                            formatCPF(e)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Verificar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === "exists" && (
        <Card>
          <CardHeader>
            <CardTitle>Paciente Encontrado</CardTitle>
            <CardDescription>Seus dados já estão em nosso sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4 text-blue-800">
              <p>Obrigado por confirmar seu CPF. Seus dados já estão registrados em nosso sistema.</p>
              <p className="mt-2 font-medium">Por favor, aguarde o contato do dentista.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep("cpf")}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "register" && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Paciente</CardTitle>
            <CardDescription>Complete seu cadastro com as informações abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...patientForm}>
              <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-6">
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
                        <Input type="email" placeholder="seu@email.com" {...field} />
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
                          onChange={(e) => {
                            field.onChange(e)
                            formatPhone(e)
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
                          <Input placeholder="Rua/Avenida, número, complemento" {...field} />
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
                            onChange={(e) => {
                              field.onChange(e)
                              formatCEP(e)
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              <RadioGroupItem value="masculino" />
                            </FormControl>
                            <FormLabel className="font-normal">Masculino</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="feminino" />
                            </FormControl>
                            <FormLabel className="font-normal">Feminino</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="outro" />
                            </FormControl>
                            <FormLabel className="font-normal">Outro</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Nascimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            locale={ptBR}
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações do Convênio</h3>

                  <FormField
                    control={patientForm.control}
                    name="hasInsurance"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Possui convênio odontológico?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (value === "false") {
                                patientForm.setValue("insuranceName", "")
                                patientForm.setValue("insuranceNumber", "")
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

                  {patientForm.watch("hasInsurance") === "true" && (
                    <>
                      <FormField
                        control={patientForm.control}
                        name="insuranceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Convênio</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o convênio" />
                                </SelectTrigger>
                                <SelectContent>

                                  <SelectItem value="Odontoprev">Odontoprev</SelectItem>
                                  <SelectItem value="Bradesco">Bradesco</SelectItem>
                                  <SelectItem value="Sulamérica">Sulamérica</SelectItem>
                                  <SelectItem value="Amil">Amil</SelectItem>
                                  <SelectItem value="Hapvida">Hapvida</SelectItem>
                                  <SelectItem value="Porto Seguro">Porto Seguro</SelectItem>
                                  <SelectItem value="Careplus">Careplus</SelectItem>
                                  <SelectItem value="Dental Brasil">Dental Brasil</SelectItem>
                                  <SelectItem value="Crown Odonto">Crown Odonto</SelectItem>
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
                              <Input placeholder="Número do convênio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setStep("cpf")}>
                    Voltar
                  </Button>
                  <Button type="submit" className="w-full">
                    Cadastrar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === "success" && (
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Concluído</CardTitle>
            <CardDescription>Seus dados foram registrados com sucesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4 text-green-800">
              <p>Obrigado por completar seu cadastro.</p>
              <p className="mt-2 font-medium">Por favor, aguarde ser chamado pelo dentista.</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep("cpf")}>
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}
