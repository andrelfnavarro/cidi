"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { savePayment, getTreatmentById } from "@/lib/api"
import { cn } from "@/lib/utils"

// Payment schema
const paymentSchema = z.object({
  paymentMethod: z.enum(["credit_card", "debit_card", "boleto", "pix"], {
    required_error: "Método de pagamento é obrigatório",
  }),
  installments: z.string().default("1"),
  paymentDate: z.date().nullable().optional(),
})

export default function PaymentForm({
  treatmentId,
  initialData,
  isReadOnly = false,
  onSaved,
}: {
  treatmentId: string
  initialData?: any
  isReadOnly?: boolean
  onSaved?: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [treatmentItems, setTreatmentItems] = useState<any[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const { toast } = useToast()

  // Log initialData for debugging
  console.log("Initial payment data:", initialData)

  // Initialize form with default values
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      installments: "1",
      paymentDate: null,
    },
  })

  // Buscar dados atualizados do tratamento para garantir que temos os itens mais recentes
  useEffect(() => {
    const fetchTreatmentData = async () => {
      try {
        setIsLoading(true)
        const result = await getTreatmentById(treatmentId)

        if (result.treatment && result.treatment.treatment_items) {
          setTreatmentItems(result.treatment.treatment_items)

          // Calcular o valor total dos itens particulares
          const total = result.treatment.treatment_items
            .filter((item: any) => !item.insurance_coverage)
            .reduce((sum: number, item: any) => sum + Number.parseFloat(item.procedure_value || 0), 0)

          setTotalValue(total)
        }
      } catch (error) {
        console.error("Erro ao buscar dados do tratamento:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTreatmentData()
  }, [treatmentId])

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log("Resetting form with:", {
        paymentMethod: initialData.payment_method,
        installments: initialData.installments?.toString(),
        paymentDate: initialData.payment_date ? new Date(initialData.payment_date) : null,
      })

      form.reset({
        paymentMethod: initialData.payment_method,
        installments: initialData.installments?.toString(),
        paymentDate: initialData.payment_date ? new Date(initialData.payment_date) : null,
      })
    }
  }, [initialData, form])

  // Handle payment submission
  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    try {
      setIsSaving(true)
      console.log("Submitting payment data:", data)

      await savePayment(treatmentId, data.paymentMethod, Number.parseInt(data.installments), data.paymentDate)

      toast({
        title: "Pagamento salvo com sucesso!",
        description: "As informações de pagamento foram atualizadas.",
      })

      if (onSaved) {
        onSaved()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Log current form values for debugging
  const currentValues = form.watch()
  console.log("Current form values:", currentValues)

  // Renderizar formulário somente para leitura
  if (isReadOnly) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orçamento</CardTitle>
          <CardDescription>Informações de pagamento do tratamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {treatmentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum procedimento planejado para gerar orçamento.</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">Valor Total</p>
                <p className="text-xl font-bold">R$ {(initialData?.total_value || totalValue).toFixed(2)}</p>
              </div>

              {initialData ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Método de Pagamento</p>
                    <p>
                      {initialData.payment_method === "credit_card" && "Cartão de Crédito"}
                      {initialData.payment_method === "debit_card" && "Cartão de Débito"}
                      {initialData.payment_method === "boleto" && "Boleto"}
                      {initialData.payment_method === "pix" && "PIX"}
                    </p>
                  </div>

                  {(initialData.payment_method === "credit_card" || initialData.payment_method === "boleto") && (
                    <div>
                      <p className="font-medium">Parcelas</p>
                      <p>
                        {initialData.installments}x de R${" "}
                        {(Number.parseFloat(initialData.total_value) / initialData.installments).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium">Status do Pagamento</p>
                    {initialData.payment_date ? (
                      <p className="text-green-600 font-medium">
                        Pago em {format(new Date(initialData.payment_date), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    ) : (
                      <p className="text-red-600 font-medium">Pendente</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-amber-600">Informações de pagamento não configuradas.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento</CardTitle>
        <CardDescription>Configure as informações de pagamento do tratamento</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-800"></div>
          </div>
        ) : treatmentItems.length === 0 ? (
          <Alert>
            <AlertDescription className="text-center py-4">
              Primeiro adicione procedimentos no planejamento para gerar um orçamento.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium">Valor Total</p>
                <p className="text-xl font-bold">R$ {(initialData?.total_value || totalValue).toFixed(2)}</p>
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Método de Pagamento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="credit_card" />
                          </FormControl>
                          <FormLabel className="font-normal">Cartão de Crédito</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="debit_card" />
                          </FormControl>
                          <FormLabel className="font-normal">Cartão de Débito</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="boleto" />
                          </FormControl>
                          <FormLabel className="font-normal">Boleto</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="pix" />
                          </FormControl>
                          <FormLabel className="font-normal">PIX</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.watch("paymentMethod") === "credit_card" || form.watch("paymentMethod") === "boleto") && (
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o número de parcelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">
                            1x de R$ {(initialData?.total_value || totalValue).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="2">
                            2x de R$ {((initialData?.total_value || totalValue) / 2).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="3">
                            3x de R$ {((initialData?.total_value || totalValue) / 3).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="4">
                            4x de R$ {((initialData?.total_value || totalValue) / 4).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="5">
                            5x de R$ {((initialData?.total_value || totalValue) / 5).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="6">
                            6x de R$ {((initialData?.total_value || totalValue) / 6).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="10">
                            10x de R$ {((initialData?.total_value || totalValue) / 10).toFixed(2)}
                          </SelectItem>
                          <SelectItem value="12">
                            12x de R$ {((initialData?.total_value || totalValue) / 12).toFixed(2)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Pagamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Pagamento pendente</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Informações de Pagamento"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
