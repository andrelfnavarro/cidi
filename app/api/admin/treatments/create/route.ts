import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { patientId } = await request.json()

    if (!patientId) {
      return NextResponse.json({ error: "ID do paciente é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Criar novo tratamento
    const { data, error } = await supabase
      .from("treatments")
      .insert({
        patient_id: patientId,
        status: "aberto",
      })
      .select()

    if (error) {
      console.error("Erro ao criar tratamento:", error)
      return NextResponse.json({ error: "Erro ao criar tratamento" }, { status: 500 })
    }

    return NextResponse.json({ success: true, treatment: data[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
