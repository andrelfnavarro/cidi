import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const { treatmentId, paymentMethod, installments, paymentDate } = await request.json()

    if (!treatmentId || !paymentMethod) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient()

    // Get authenticated user with getUser() for improved security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const dentistId = user.id

    // Verificar se já existe um registro de pagamento
    const { data: existingPayment, error: checkError } = await supabase
      .from("treatment_payment")
      .select("*")
      .eq("treatment_id", treatmentId)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Erro ao verificar pagamento existente:", checkError)
      return NextResponse.json({ error: "Erro ao verificar pagamento existente" }, { status: 500 })
    }

    if (!existingPayment) {
      return NextResponse.json({ error: "Não foi encontrado orçamento para este tratamento" }, { status: 404 })
    }

    // Preparar dados para atualização
    const paymentData: any = {
      payment_method: paymentMethod,
      installments: installments || 1,
      payment_date: paymentDate ? new Date(paymentDate).toISOString() : null,
      updated_at: new Date().toISOString(),
      updated_by: dentistId,
    }

    // Atualizar registro de pagamento
    const { data, error } = await supabase
      .from("treatment_payment")
      .update(paymentData)
      .eq("id", existingPayment.id)
      .select()

    if (error) {
      console.error("Erro ao atualizar pagamento:", error)
      return NextResponse.json({ error: "Erro ao atualizar pagamento" }, { status: 500 })
    }

    // Update the treatment's updated_by field
    await supabase
      .from("treatments")
      .update({
        updated_at: new Date().toISOString(),
        updated_by: dentistId,
      })
      .eq("id", treatmentId)

    return NextResponse.json({ success: true, payment: data[0] })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
