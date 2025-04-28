import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID do dentista é obrigatório" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Delete dentist profile
    const { error: dentistError } = await supabase.from("dentists").delete().eq("id", id)

    if (dentistError) {
      console.error("Erro ao excluir dentista:", dentistError)
      return NextResponse.json({ error: "Erro ao excluir dentista" }, { status: 500 })
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id)

    if (authError) {
      console.error("Erro ao excluir usuário:", authError)
      return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
