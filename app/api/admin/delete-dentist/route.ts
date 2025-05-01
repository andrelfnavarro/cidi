import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the current session to verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is trying to delete themselves
    if (user.id === id) {
      return NextResponse.json({ error: "Você não pode excluir seu próprio usuário" }, { status: 403 })
    }

    // Check if the user is admin
    const { data: currentDentist, error: dentistError } = await supabase
      .from("dentists")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (dentistError || !currentDentist || !currentDentist.is_admin) {
      return NextResponse.json({ error: "Apenas administradores podem excluir dentistas" }, { status: 403 })
    }

    // Get the dentist email for logging
    const { data: dentistToDelete } = await supabase
      .from("dentists")
      .select("email")
      .eq("id", id)
      .single()
    
    if (dentistToDelete) {
      console.log(`Deleting dentist with email: ${dentistToDelete.email}`)
    }

    // Delete the dentist record first
    const { error: deleteDentistError } = await supabase.from("dentists").delete().eq("id", id)

    if (deleteDentistError) {
      console.error("Error deleting dentist record:", deleteDentistError)
      return NextResponse.json({ error: "Erro ao excluir registro de dentista" }, { status: 500 })
    }

    // Create admin client to delete auth user
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

    // Then delete the Auth user using the admin client
    const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(id)

    if (deleteAuthError) {
      console.error("Error deleting Auth user:", deleteAuthError)
      
      // Even though auth deletion failed, we've already deleted the dentist record
      // so we'll log the error but still return success
      console.log("Warning: Dentist record was deleted but auth user deletion failed")
      return NextResponse.json({ 
        success: true,
        warning: "Registro do dentista foi removido, mas houve um erro ao remover o usuário de autenticação." 
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete-dentist:", error)
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
