import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { cpf } = await request.json()

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    // Remover formatação do CPF para garantir consistência
    const formattedCpf = cpf.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")

    const supabase = createServerSupabaseClient()

    // Buscar paciente pelo CPF
    const { data, error } = await supabase.from("patients").select("*").eq("cpf", formattedCpf).single()

    if (error) {
      if (error.code === "PGRST116") {
        // Código para "não encontrado" no Supabase
        return NextResponse.json({ patient: null })
      }

      console.error("Erro ao buscar paciente:", error)
      return NextResponse.json({ error: "Erro ao buscar paciente" }, { status: 500 })
    }

    return NextResponse.json({ patient: data })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
