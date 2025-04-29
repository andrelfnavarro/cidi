import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const patientData = await request.json()

    // Validação básica
    if (!patientData.cpf || !patientData.name || !patientData.email) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Converter string "true"/"false" para boolean
    const hasInsurance = patientData.hasInsurance === "true"

    // Normalize CPF and phone by removing all non-digit characters
    const normalizedCpf = patientData.cpf.replace(/\D/g, "")
    const normalizedPhone = patientData.phone ? patientData.phone.replace(/\D/g, "") : null

    // Preparar dados para inserção
    const patientRecord = {
      cpf: normalizedCpf,
      name: patientData.name,
      email: patientData.email,
      phone: normalizedPhone,
      street: patientData.street,
      zip_code: patientData.zipCode,
      city: patientData.city,
      state: patientData.state,
      gender: patientData.gender,
      birth_date: patientData.birthDate, // This should now be a string in ISO format: YYYY-MM-DD
      has_insurance: hasInsurance,
      insurance_name: hasInsurance ? patientData.insuranceName : null,
      insurance_number: hasInsurance ? patientData.insuranceNumber : null,
    }

    // Inserir paciente no banco de dados
    const { data, error } = await supabase.from("patients").insert(patientRecord).select()

    if (error) {
      console.error("Erro ao cadastrar paciente:", error)

      // Verificar se é erro de CPF duplicado
      if (error.code === "23505") {
        return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 })
      }

      return NextResponse.json({ error: "Erro ao cadastrar paciente" }, { status: 500 })
    }

    return NextResponse.json({ success: true, patient: data[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
