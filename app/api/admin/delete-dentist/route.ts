import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the current session to verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is trying to delete themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: "Você não pode excluir seu próprio usuário" }, { status: 403 })
    }

    // Check if the user is admin
    const { data: currentDentist, error: dentistError } = await supabase
      .from("dentists")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    if (dentistError || !currentDentist || !currentDentist.is_admin) {
      return NextResponse.json({ error: "Apenas administradores podem excluir dentistas" }, { status: 403 })
    }

    // Delete the dentist record first
    const { error: deleteDentistError } = await supabase.from("dentists").delete().eq("id", id)

    if (deleteDentistError) {
      console.error("Error deleting dentist record:", deleteDentistError)
      return NextResponse.json({ error: "Erro ao excluir registro de dentista" }, { status: 500 })
    }

    // Then delete the Auth user
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id)

    if (deleteAuthError) {
      console.error("Error deleting Auth user:", deleteAuthError)
      return NextResponse.json({ error: "Erro ao excluir usuário de autenticação" }, { status: 500 })
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
