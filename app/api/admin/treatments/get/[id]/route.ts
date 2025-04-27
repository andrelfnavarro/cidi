import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "ID do tratamento é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Buscar tratamento pelo ID
    const { data: treatment, error: treatmentError } = await supabase
      .from("treatments")
      .select(`
        *,
        patients!treatments_patient_id_fkey(id, name, cpf),
        anamnesis(*),
        treatment_items(*),
        treatment_payment(*)
      `)
      .eq("id", id)
      .single()

    if (treatmentError) {
      console.error("Erro ao buscar tratamento:", treatmentError)
      return NextResponse.json({ error: "Erro ao buscar tratamento" }, { status: 500 })
    }

    return NextResponse.json({ treatment })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
