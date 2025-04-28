import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    // Get dentist data to check if admin
    const { data: dentistData, error: dentistError } = await supabase
      .from("dentists")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (dentistError) {
      console.error("Erro ao buscar dentista:", dentistError)
      return NextResponse.json({ error: "Erro ao buscar dentista" }, { status: 500 })
    }

    // Check if dentist is admin
    if (!dentistData.is_admin) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 })
    }

    // List all dentists
    const { data, error } = await supabase.from("dentists").select("*").order("name")

    if (error) {
      console.error("Erro ao listar dentistas:", error)
      return NextResponse.json({ error: "Erro ao listar dentistas" }, { status: 500 })
    }

    return NextResponse.json({ dentists: data })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
