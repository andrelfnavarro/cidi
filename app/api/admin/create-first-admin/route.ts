import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if any dentist exists
    const { count, error: countError } = await supabase.from("dentists").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Erro ao verificar dentistas existentes:", countError)
      return NextResponse.json({ error: "Erro ao verificar dentistas existentes" }, { status: 500 })
    }

    // If dentists already exist, don't allow creating the first admin
    if (count && count > 0) {
      return NextResponse.json({ error: "Já existem dentistas cadastrados" }, { status: 400 })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Erro ao criar usuário:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Create dentist profile
    const { data: dentistData, error: dentistError } = await supabase
      .from("dentists")
      .insert({
        id: authData.user.id,
        name,
        email,
        is_admin: true,
      })
      .select()

    if (dentistError) {
      console.error("Erro ao criar dentista:", dentistError)

      // If there's an error creating the dentist record, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json({ error: "Erro ao criar dentista" }, { status: 500 })
    }

    return NextResponse.json({ success: true, dentist: dentistData[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
