import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Update dentist request data:", data)

    if (!data.id || !data.name) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = await createClient()

    // If password is provided, update auth user password
    if (data.password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(data.id, {
        password: data.password,
      })

      if (authError) {
        console.error("Erro ao atualizar senha:", authError)
        return NextResponse.json({ error: authError.message }, { status: 500 })
      }
    }

    // Update dentist profile
    const { data: dentistData, error: dentistError } = await supabase
      .from("dentists")
      .update({
        name: data.name,
        specialty: data.specialty,
        registration_number: data.registration_number,
        is_admin: data.is_admin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()

    if (dentistError) {
      console.error("Erro ao atualizar dentista:", dentistError)
      return NextResponse.json({ error: "Erro ao atualizar dentista: " + dentistError.message }, { status: 500 })
    }

    console.log("Dentist updated successfully")
    return NextResponse.json({ success: true, dentist: dentistData[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
