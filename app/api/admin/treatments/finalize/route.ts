import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { treatmentId } = await request.json()

    if (!treatmentId) {
      return NextResponse.json({ error: "ID do tratamento é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const dentistId = session.user.id

    // Atualizar status do tratamento para finalizado
    const { data, error } = await supabase
      .from("treatments")
      .update({
        status: "finalizado",
        updated_at: new Date().toISOString(),
        updated_by: dentistId,
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
