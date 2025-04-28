import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.id || !data.name) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Update dentist profile
    const updateData = {
      name: data.name,
      specialty: data.specialty || null,
      registration_number: data.registration_number || null,
      is_admin: data.is_admin,
      updated_at: new Date().toISOString(),
    }

    const { data: dentistData, error: dentistError } = await supabase
      .from("dentists")
      .update(updateData)
      .eq("id", data.id)
      .select()

    if (dentistError) {
      console.error("Erro ao atualizar dentista:", dentistError)
      return NextResponse.json({ error: "Erro ao atualizar dentista" }, { status: 500 })
    }

    // Update password if provided and not empty
    if (data.password && data.password.trim() !== "") {
      const { error: authError } = await supabase.auth.admin.updateUserById(data.id, {
        password: data.password,
      })

      if (authError) {
        console.error("Erro ao atualizar senha:", authError)
        return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, dentist: dentistData[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
