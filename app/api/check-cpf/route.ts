import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    // Normalize CPF by removing all non-digit characters
    const normalizedCpf = cpf.replace(/\D/g, "")

    const supabase = createServerSupabaseClient()

    // Verificar se o CPF já existe no banco de dados
    const { data, error } = await supabase.from("patients").select("id").eq("cpf", normalizedCpf).maybeSingle()

    if (error) {
      console.error("Erro ao verificar CPF:", error)
      return NextResponse.json({ error: "Erro ao verificar CPF" }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
