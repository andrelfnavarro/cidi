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

    // Verify if the current user is an admin and get their company
    const { data: currentDentist, error: dentistError } = await supabase
      .from("dentists")
      .select("is_admin, company_id")
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

    // Try to create the user with admin powers
    let createUserResponse = await adminSupabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    // Check if the error is due to the email already existing
    if (createUserResponse.error && createUserResponse.error.message.includes('email address has already been registered')) {
      console.log("Email already exists in Auth system. Checking if dentist record exists...")
      
      // Check if there's a dentist record with this email in the same company
      const { data: existingDentist } = await supabase
        .from("dentists")
        .select("id")
        .eq("email", data.email)
        .eq("company_id", currentDentist.company_id)
        .maybeSingle()
      
      if (!existingDentist) {
        console.log("Email exists in Auth but no dentist record found. Retrieving user and creating dentist record...")
        
        // Get the user by email
        const { data: userData } = await adminSupabase.auth.admin.listUsers({
          filters: {
            email: data.email
          }
        })
        
        if (userData && userData.users && userData.users.length > 0) {
          const existingUser = userData.users[0]
          
          // Use this user for the dentist record
          createUserResponse = { 
            data: { user: existingUser },
            error: null 
          }
          
          // Reset their password
          await adminSupabase.auth.admin.updateUserById(existingUser.id, {
            password: data.password
          })
          
          console.log("Found existing auth user, will use it for the new dentist record")
        }
      } else {
        // A dentist record already exists with this email, this is a real conflict
        return NextResponse.json(
          { error: "Já existe um dentista cadastrado com este email." }, 
          { status: 400 }
        )
      }
    }

    // Check for errors in user creation
    if (createUserResponse.error) {
      console.error("Erro ao criar usuário:", createUserResponse.error)
      return NextResponse.json({ error: createUserResponse.error.message }, { status: 500 })
    }

    const authData = createUserResponse.data
    
    console.log("Auth user ready:", authData.user.id)

    // Then, create the dentist record with the admin's company_id
    const { data: dentistData, error: dentistError2 } = await supabase
      .from("dentists")
      .insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        specialty: data.specialty || null,
        registration_number: data.registration_number || null,
        is_admin: data.is_admin || false,
        company_id: currentDentist.company_id,
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
