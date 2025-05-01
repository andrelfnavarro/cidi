import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Register dentist request data:", data)

    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Get the regular client to check user's session
    const supabase = await createClient()

    // First verify if the current user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verify if the current user is an admin
    const { data: currentDentist, error: dentistError } = await supabase
      .from("dentists")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (dentistError || !currentDentist || !currentDentist.is_admin) {
      return NextResponse.json({ error: "Permissão negada. Apenas administradores podem criar novos dentistas." }, { status: 403 })
    }

    // Create a special admin client using the service role key for admin operations
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          // Use dummy cookie handlers since this client doesn't need cookies
          getAll() { return [] },
          setAll() {}
        }
      }
    )

    // Now create the user with admin powers
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
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
    const { data: dentistData, error: dentistError2 } = await supabase
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

    if (dentistError2) {
      console.error("Erro ao criar dentista:", dentistError2)

      // If there's an error creating the dentist record, delete the auth user
      await adminSupabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json({ error: "Erro ao criar dentista: " + dentistError2.message }, { status: 500 })
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
