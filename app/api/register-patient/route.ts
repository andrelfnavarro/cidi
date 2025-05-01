import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const patient = await request.json()

    if (!patient.name || !patient.cpf || !patient.email || !patient.phone || !patient.birth_date) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient()

    // Check if patient already exists with the same email or CPF
    const { data: existingPatient, error: lookupError } = await supabase
      .from("patients")
      .select("id, email, cpf")
      .or(`email.eq.${patient.email},cpf.eq.${patient.cpf}`)
      .maybeSingle()

    if (lookupError) {
      console.error("Erro ao verificar paciente existente:", lookupError)
      return NextResponse.json({ error: "Erro ao verificar paciente existente" }, { status: 500 })
    }

    if (existingPatient) {
      if (existingPatient.email === patient.email) {
        return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 })
      } else if (existingPatient.cpf === patient.cpf) {
        return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 })
      }
    }

    // Format patient data
    const patientData = {
      name: patient.name,
      email: patient.email,
      cpf: patient.cpf.replace(/\D/g, ""),
      phone: patient.phone.replace(/\D/g, ""),
      birth_date: patient.birth_date,
      address_street: patient.address_street || null,
      address_number: patient.address_number || null,
      address_complement: patient.address_complement || null,
      address_neighborhood: patient.address_neighborhood || null,
      address_city: patient.address_city || null,
      address_state: patient.address_state || null,
      address_zip: patient.address_zip ? patient.address_zip.replace(/\D/g, "") : null,
    }

    // Insert patient into database
    const { data, error } = await supabase
      .from("patients")
      .insert(patientData)
      .select("id")
      .single()

    if (error) {
      console.error("Erro ao salvar paciente:", error)
      return NextResponse.json({ error: "Erro ao salvar paciente" }, { status: 500 })
    }

    return NextResponse.json({ success: true, patient: { ...patientData, id: data.id } })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
