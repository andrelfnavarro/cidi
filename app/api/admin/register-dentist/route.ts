import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Register dentist request data:", data)

    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // First, create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Erro ao criar usuário:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    console.log("Auth user created:", authData.user.id)

    // Then, create the dentist record
    const { data: dentistData, error: dentistError } = await supabase
      .from("dentists")
      .insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        specialty: data.specialty || null,
        registration_number: data.registration_number || null,
        is_admin: data.is_admin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (dentistError) {
      console.error("Erro ao criar dentista:", dentistError)

      // If there's an error creating the dentist record, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json({ error: "Erro ao criar dentista: " + dentistError.message }, { status: 500 })
    }

    console.log("Dentist record created successfully")
    return NextResponse.json({ success: true, dentist: dentistData[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}
