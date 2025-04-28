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

    // Get dentist data
    const { data: dentistData, error: dentistError } = await supabase
      .from("dentists")
      .select("company_id")
      .eq("id", session.user.id)
      .single()

    if (dentistError) {
      console.error("Erro ao buscar dentista:", dentistError)
      return NextResponse.json({ error: "Erro ao buscar dentista" }, { status: 500 })
    }

    // Get company data
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", dentistData.company_id)
      .single()

    if (companyError) {
      console.error("Erro ao buscar empresa:", companyError)
      return NextResponse.json({ error: "Erro ao buscar empresa" }, { status: 500 })
    }

    return NextResponse.json({ company: companyData })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
