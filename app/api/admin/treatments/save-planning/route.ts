import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const { treatmentId, items } = await request.json()

    if (!treatmentId || !items) {
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

    // Primeiro, excluir itens existentes para este tratamento
    const { error: deleteError } = await supabase.from("treatment_items").delete().eq("treatment_id", treatmentId)

    if (deleteError) {
      console.error("Erro ao excluir itens existentes:", deleteError)
      return NextResponse.json({ error: "Erro ao atualizar planejamento" }, { status: 500 })
    }

    // Se não há itens para inserir, retornar sucesso
    if (items.length === 0) {
      return NextResponse.json({ success: true, items: [] })
    }

    // Inserir novos itens
    const itemsToInsert = items.map((item: any) => ({
      treatment_id: treatmentId,
      tooth_number: item.toothNumber,
      procedure_description: item.procedureDescription,
      procedure_value: item.procedureValue,
      insurance_coverage: item.insuranceCoverage,
      conclusion_date: item.conclusionDate ? new Date(item.conclusionDate).toISOString() : null,
      created_by: dentistId,
      updated_by: dentistId,
    }))

    const { data, error } = await supabase.from("treatment_items").insert(itemsToInsert).select()

    if (error) {
      console.error("Erro ao inserir itens do planejamento:", error)
      return NextResponse.json({ error: "Erro ao salvar planejamento" }, { status: 500 })
    }

    // Calcular valor total dos itens particulares (não cobertos pelo convênio)
    const totalValue = items
      .filter((item: any) => !item.insuranceCoverage)
      .reduce((sum: number, item: any) => sum + Number.parseFloat(item.procedureValue || 0), 0)

    // Verificar se já existe um registro de pagamento
    const { data: existingPayment, error: paymentCheckError } = await supabase
      .from("treatment_payment")
      .select("id")
      .eq("treatment_id", treatmentId)
      .maybeSingle()

    if (paymentCheckError && paymentCheckError.code !== "PGRST116") {
      console.error("Erro ao verificar pagamento existente:", paymentCheckError)
    }

    // Atualizar ou criar registro de pagamento
    if (existingPayment) {
      await supabase
        .from("treatment_payment")
        .update({
          total_value: totalValue,
          updated_at: new Date().toISOString(),
          updated_by: dentistId,
        })
        .eq("id", existingPayment.id)
    } else {
      await supabase.from("treatment_payment").insert({
        treatment_id: treatmentId,
        total_value: totalValue,
        payment_method: "credit_card",
        installments: 1,
        payment_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: dentistId,
        updated_by: dentistId,
      })
    }

    // Update the treatment's updated_by field
    await supabase
      .from("treatments")
      .update({
        updated_at: new Date().toISOString(),
        updated_by: dentistId,
      })
      .eq("id", treatmentId)

    return NextResponse.json({ success: true, items: data })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
