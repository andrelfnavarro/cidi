"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { saveAnamnesis } from "@/lib/api"
import TrackingInfo from "@/components/admin/tracking-info"

// Definição das seções de anamnese
const healthSections = {
  generalHealth: [
    {
      id: "medicalTreatment",
      question: "Está em tratamento médico?",
      detailField: "medicalTreatmentDesc",
      detailLabel: "Qual tratamento médico?",
    },
    {
      id: "medication",
      question: "Está tomando algum tipo de medicamento?",
      detailField: "medicationDesc",
      detailLabel: "Quais medicamentos?",
    },
    {
      id: "allergy",
      question: "Tem alergia a algum medicamento?",
      detailField: "allergyDesc",
      detailLabel: "Quais alergias?",
    },
    {
      id: "pregnant",
      question: "Está grávida?",
      onlyForFemale: true,
    },
    {
      id: "breastfeeding",
      question: "Está amamentando?",
      onlyForFemale: true,
    },
    {
      id: "smoker",
      question: "É fumante?",
    },
    {
      id: "alcohol",
      question: "Consome bebidas alcoólicas com frequência?",
    },
    {
      id: "diabetes",
      question: "Tem diabetes?",
    },
    {
      id: "hypertension",
      question: "Tem hipertensão (pressão alta)?",
    },
    {
      id: "surgery",
      question: "Já passou por alguma cirurgia?",
      detailField: "surgeryDesc",
      detailLabel: "Quais cirurgias?",
    },
    {
      id: "bleedingHealingIssues",
      question: "Tem problemas de cicatrização ou sangramento excessivo?",
    },
    {
      id: "bloodTransfusion",
      question: "Já recebeu transfusão de sangue?",
      detailField: "bloodTransfusionReason",
      detailLabel: "Por qual motivo?",
    },
    {
      id: "asthma",
      question: "Tem asma ou problemas respiratórios?",
    },
    {
      id: "psychologicalIssues",
      question: "Tem algum problema psicológico ou psiquiátrico?",
      detailField: "psychologicalIssuesDesc",
      detailLabel: "Quais problemas?",
    },
    {
      id: "pacemaker",
      question: "Usa marca-passo?",
    },
    {
      id: "osteoporosis",
      question: "Tem osteoporose?",
    },
    {
      id: "infectiousDisease",
      question: "Tem alguma doença infecciosa?",
      detailField: "infectiousDiseaseDesc",
      detailLabel: "Quais doenças?",
    },
    {
      id: "otherHealthIssues",
      question: "Tem algum outro problema de saúde não mencionado?",
      detailField: "otherHealthIssuesDesc",
      detailLabel: "Quais problemas?",
    },
  ],
  oralHealth: [
    {
      id: "lastDentalVisit",
      question: "Quando foi ao Cirurgião-Dentista pela última vez?",
      inputType: "text",
    },
    {
      id: "lastTreatment",
      question: "Qual foi o último tratamento realizado?",
      inputType: "text",
    },
    {
      id: "anesthesia",
      question: "Já tomou anestesia odontológica?",
    },
    {
      id: "anesthesiaReaction",
      question: "Teve alguma reação adversa à anestesia?",
    },
    {
      id: "bleedingAfterExtraction",
      question: "Já teve sangramento excessivo após extração dentária?",
    },
    {
      id: "brushingFrequency",
      question: "Quantas vezes escova os dentes por dia?",
      inputType: "text",
    },
    {
      id: "mouthwash",
      question: "Usa enxaguante bucal?",
    },
    {
      id: "teethGrinding",
      question: "Range os dentes ou aperta a mandíbula?",
    },
    {
      id: "coffeeTea",
      question: "Consome café ou chá com frequência?",
    },
    {
      id: "bleedingGums",
      question: "Suas gengivas sangram ao escovar os dentes?",
    },
    {
      id: "jawPain",
      question: "Sente dor na articulação da mandíbula?",
    },
    {
      id: "mouthBreathing",
      question: "Respira pela boca?",
    },
    {
      id: "dentalFloss",
      question: "Usa fio dental diariamente?",
    },
    {
      id: "tongueCleaning",
      question: "Faz limpeza da língua?",
    },
    {
      id: "sweets",
      question: "Consome doces com frequência?",
    },
  ],
}

// Create a dynamic schema based on the health sections
const createAnamnesisSchema = () => {
  const schema: Record<string, any> = {
    // Optional text fields
    additionalHealthInfo: z.string().optional(),
    additionalDentalInfo: z.string().optional(),
  }

  // Add all general health fields as required booleans
  healthSections.generalHealth.forEach((item) => {
    schema[item.id] = z.boolean({
      required_error: `Por favor, responda se ${item.question.toLowerCase()}`,
    })

    // Add optional detail fields
    if (item.detailField) {
      schema[item.detailField] = z.string().optional()
    }
  })

  // Add all oral health fields
  healthSections.oralHealth.forEach((item) => {
    if (item.inputType === "text") {
      schema[item.id] = z.string().optional()
    } else {
      schema[item.id] = z.boolean({
        required_error: `Por favor, responda se ${item.question.toLowerCase()}`,
      })
    }
  })

  return z.object(schema)
}

// Anamnesis schema
const anamnesisSchema = createAnamnesisSchema()

interface AnamnesisFormProps {
  treatmentId: string
  initialData?: any
  isReadOnly?: boolean
  onSaved?: () => void
  trackingInfo?: {
    createdAt?: string
    updatedAt?: string
    createdBy?: { id: string; name: string }
    updatedBy?: { id: string; name: string }
  }
}

export default function AnamnesisForm({
  treatmentId,
  initialData,
  isReadOnly = false,
  onSaved,
  trackingInfo,
}: AnamnesisFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Converter dados iniciais para o formato do formulário ou usar valores em branco
  const defaultValues = initialData
    ? {
        // Saúde Geral
        medicalTreatment: initialData.medical_treatment || false,
        medicalTreatmentDesc: initialData.medical_treatment_desc || "",
        medication: initialData.medication || false,
        medicationDesc: initialData.medication_desc || "",
        allergy: initialData.allergy || false,
        allergyDesc: initialData.allergy_desc || "",
        pregnant: initialData.pregnant || false,
        breastfeeding: initialData.breastfeeding || false,
        smoker: initialData.smoker || false,
        osteoporosis: initialData.osteoporosis || false,
        alcohol: initialData.alcohol || false,
        diabetes: initialData.diabetes || false,
        surgery: initialData.surgery || false,
        surgeryDesc: initialData.surgery_desc || "",
        bleedingHealingIssues: initialData.bleeding_healing_issues || false,
        bloodTransfusion: initialData.blood_transfusion || false,
        bloodTransfusionReason: initialData.blood_transfusion_reason || "",
        hypertension: initialData.hypertension || false,
        asthma: initialData.asthma || false,
        psychologicalIssues: initialData.psychological_issues || false,
        psychologicalIssuesDesc: initialData.psychological_issues_desc || "",
        pacemaker: initialData.pacemaker || false,
        infectiousDisease: initialData.infectious_disease || false,
        infectiousDiseaseDesc: initialData.infectious_disease_desc || "",
        otherHealthIssues: initialData.other_health_issues || false,
        otherHealthIssuesDesc: initialData.other_health_issues_desc || "",
        additionalHealthInfo: initialData.additional_health_info || "",

        // Saúde Bucal
        lastDentalVisit: initialData.last_dental_visit || "",
        lastTreatment: initialData.last_treatment || "",
        anesthesia: initialData.anesthesia || false,
        anesthesiaReaction: initialData.anesthesia_reaction || false,
        bleedingAfterExtraction: initialData.bleeding_after_extraction || false,
        brushingFrequency: initialData.brushing_frequency || "",
        mouthwash: initialData.mouthwash || false,
        teethGrinding: initialData.teeth_grinding || false,
        coffeeTea: initialData.coffee_tea || false,
        bleedingGums: initialData.bleeding_gums || false,
        jawPain: initialData.jaw_pain || false,
        mouthBreathing: initialData.mouth_breathing || false,
        dentalFloss: initialData.dental_floss || false,
        tongueCleaning: initialData.tongue_cleaning || false,
        sweets: initialData.sweets || false,
        additionalDentalInfo: initialData.additional_dental_info || "",
      }
    : {
        // Initialize with undefined for boolean fields to make them blank initially
        // Saúde Geral
        medicalTreatment: undefined,
        medicalTreatmentDesc: "",
        medication: undefined,
        medicationDesc: "",
        allergy: undefined,
        allergyDesc: "",
        pregnant: undefined,
        breastfeeding: undefined,
        smoker: undefined,
        osteoporosis: undefined,
        alcohol: undefined,
        diabetes: undefined,
        surgery: undefined,
        surgeryDesc: "",
        bleedingHealingIssues: undefined,
        bloodTransfusion: undefined,
        bloodTransfusionReason: "",
        hypertension: undefined,
        asthma: undefined,
        psychologicalIssues: undefined,
        psychologicalIssuesDesc: "",
        pacemaker: undefined,
        infectiousDisease: undefined,
        infectiousDiseaseDesc: "",
        otherHealthIssues: undefined,
        otherHealthIssuesDesc: "",
        additionalHealthInfo: "",

        // Saúde Bucal
        lastDentalVisit: "",
        lastTreatment: "",
        anesthesia: undefined,
        anesthesiaReaction: undefined,
        bleedingAfterExtraction: undefined,
        brushingFrequency: "",
        mouthwash: undefined,
        teethGrinding: undefined,
        coffeeTea: undefined,
        bleedingGums: undefined,
        jawPain: undefined,
        mouthBreathing: undefined,
        dentalFloss: undefined,
        tongueCleaning: undefined,
        sweets: undefined,
        additionalDentalInfo: "",
      }

  // Anamnesis form
  const form = useForm<z.infer<typeof anamnesisSchema>>({
    resolver: zodResolver(anamnesisSchema),
    defaultValues,
  })

  // Handle anamnesis submission
  const onSubmit = async (data: z.infer<typeof anamnesisSchema>) => {
    try {
      setIsSaving(true)

      await saveAnamnesis({
        treatmentId,
        ...data,
      })

      toast({
        title: "Anamnese salva com sucesso!",
        description: "Os dados da anamnese foram atualizados.",
      })

      if (onSaved) {
        onSaved()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar anamnese. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Renderizar formulário somente para leitura
  if (isReadOnly) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Anamnese</CardTitle>
              <CardDescription>Histórico médico e odontológico do paciente</CardDescription>
            </div>
            {trackingInfo && (
              <TrackingInfo
                createdAt={trackingInfo.createdAt}
                updatedAt={trackingInfo.updatedAt}
                createdBy={trackingInfo.createdBy}
                updatedBy={trackingInfo.updatedBy}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="general-health">
              <AccordionTrigger className="text-lg font-medium">SAÚDE GERAL</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  {healthSections.generalHealth.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <p className="font-medium">{item.question}</p>
                      <p>{defaultValues[item.id as keyof typeof defaultValues] ? "Sim" : "Não"}</p>
                      {item.detailField && defaultValues[item.id as keyof typeof defaultValues] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.detailLabel}:{" "}
                          {defaultValues[item.detailField as keyof typeof defaultValues] || "Não informado"}
                        </p>
                      )}
                    </div>
                  ))}

                  {defaultValues.additionalHealthInfo && (
                    <div className="border-b pb-2">
                      <p className="font-medium">Informações adicionais de saúde:</p>
                      <p className="text-sm text-gray-600 mt-1">{defaultValues.additionalHealthInfo}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="oral-health">
              <AccordionTrigger className="text-lg font-medium">SAÚDE BUCAL</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  {healthSections.oralHealth.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <p className="font-medium">{item.question}</p>
                      {item.inputType === "text" ? (
                        <p>{defaultValues[item.id as keyof typeof defaultValues] || "Não informado"}</p>
                      ) : (
                        <p>{defaultValues[item.id as keyof typeof defaultValues] ? "Sim" : "Não"}</p>
                      )}
                    </div>
                  ))}

                  {defaultValues.additionalDentalInfo && (
                    <div className="border-b pb-2">
                      <p className="font-medium">Informações adicionais de saúde bucal:</p>
                      <p className="text-sm text-gray-600 mt-1">{defaultValues.additionalDentalInfo}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    )
  }

  // Função para renderizar campos de formulário baseados na configuração
  const renderFormField = (section: string, item: any, index: number) => {
    const fieldId = item.id as keyof typeof defaultValues

    // Campo de texto simples
    if (item.inputType === "text") {
      return (
        <FormField
          key={`${section}-${index}`}
          control={form.control}
          name={fieldId}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{item.question}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )
    }

    // Campo de sim/não com possível campo de detalhes
    return (
      <div key={`${section}-${index}`} className="space-y-3">
        <FormField
          control={form.control}
          name={fieldId}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                {item.question} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  value={field.value === undefined ? "" : field.value ? "true" : "false"}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal">Sim</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
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

        {/* Campo de detalhes condicional */}
        {item.detailField && form.watch(fieldId) && (
          <FormField
            control={form.control}
            name={item.detailField as keyof typeof defaultValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.detailLabel}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Anamnese</CardTitle>
            <CardDescription>
              {isReadOnly
                ? "Histórico médico e odontológico do paciente"
                : "Preencha o histórico médico e odontológico do paciente"}
            </CardDescription>
          </div>
          {trackingInfo && (
            <TrackingInfo
              createdAt={trackingInfo.createdAt}
              updatedAt={trackingInfo.updatedAt}
              createdBy={trackingInfo.createdBy}
              updatedBy={trackingInfo.updatedBy}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="single" collapsible className="w-full" defaultValue="general-health">
              <AccordionItem value="general-health">
                <AccordionTrigger className="text-lg font-medium">SAÚDE GERAL</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 mt-4">
                    {healthSections.generalHealth.map((item, index) => renderFormField("general", item, index))}

                    <FormField
                      control={form.control}
                      name="additionalHealthInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informações adicionais de saúde</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informe aqui quaisquer outras condições de saúde relevantes"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="oral-health">
                <AccordionTrigger className="text-lg font-medium">SAÚDE BUCAL</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 mt-4">
                    {healthSections.oralHealth.map((item, index) => renderFormField("oral", item, index))}

                    <FormField
                      control={form.control}
                      name="additionalDentalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informações adicionais de saúde bucal</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informe aqui quaisquer outras condições bucais relevantes"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-sm text-gray-500 mb-4">
              <p>
                Campos marcados com <span className="text-red-500">*</span> são obrigatórios
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Anamnese"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
