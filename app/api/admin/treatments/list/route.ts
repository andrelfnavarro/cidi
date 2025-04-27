import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { patientId } = await request.json()

    if (!patientId) {
      return NextResponse.json({ error: "ID do paciente é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Buscar tratamentos do paciente
    const { data, error } = await supabase
      .from("treatments")
      .select(`
        *,
        treatment_payment(*)
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar tratamentos:", error)
      return NextResponse.json({ error: "Erro ao buscar tratamentos" }, { status: 500 })
    }

    return NextResponse.json({ treatments: data || [] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
