import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { treatmentId } = await request.json()

    if (!treatmentId) {
      return NextResponse.json({ error: "ID do tratamento é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Atualizar status do tratamento para finalizado
    const { data, error } = await supabase
      .from("treatments")
      .update({
        status: "finalizado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", treatmentId)
      .select()

    if (error) {
      console.error("Erro ao finalizar tratamento:", error)
      return NextResponse.json({ error: "Erro ao finalizar tratamento" }, { status: 500 })
    }

    return NextResponse.json({ success: true, treatment: data[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
