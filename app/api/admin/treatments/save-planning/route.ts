import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { treatmentId, items } = await req.json();
  if (!treatmentId || !Array.isArray(items)) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    );
  }
  const dentistId = user.id;

  // 1. Fetch existing items
  const { data: existingItems, error: fetchErr } = await supabase
    .from('treatment_items')
    .select('*')
    .eq('treatment_id', treatmentId);
  if (fetchErr) throw fetchErr;

  const existingIds = existingItems.map(i => i.id);
  const incomingIds = items.filter(i => i.id).map(i => i.id);

  // 2. Delete removed rows
  const toDelete = existingIds.filter(id => !incomingIds.includes(id));

  if (toDelete.length) {
    const { error: deleteErr } = await supabase
      .from('treatment_items')
      .delete()
      .in('id', toDelete);
    if (deleteErr) throw deleteErr;
  }

  // 3. Update existing rows
  const toUpdate = existingItems.filter(i => incomingIds.includes(i.id));

  for (const item of toUpdate) {
    const { error: updErr } = await supabase
      .from('treatment_items')
      .update({
        tooth_number: item.toothNumber,
        procedure_description: item.procedureDescription,
        procedure_value: item.procedureValue,
        insurance_coverage: item.insuranceCoverage,
        conclusion_date: item.conclusionDate
          ? new Date(item.conclusionDate).toISOString()
          : null,
        updated_by: dentistId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);
    if (updErr) throw updErr;
  }

  // 4. Insert new rows
  const toInsert = items
    .filter(i => !i.id)
    .map(i => ({
      treatment_id: treatmentId,
      tooth_number: i.toothNumber,
      procedure_description: i.procedureDescription,
      procedure_value: i.procedureValue,
      insurance_coverage: i.insuranceCoverage,
      conclusion_date: i.conclusionDate
        ? new Date(i.conclusionDate).toISOString()
        : null,
      created_by: dentistId,
      created_at: new Date().toISOString(),
      updated_by: dentistId,
      updated_at: new Date().toISOString(),
    }));

  if (toInsert.length) {
    const { error: insertErr } = await supabase
      .from('treatment_items')
      .insert(toInsert);
    if (insertErr) throw insertErr;
  }

  // Calcular valor total dos itens particulares (não cobertos pelo convênio)
  const totalValue = items
    .filter((item: any) => !item.insuranceCoverage)
    .reduce(
      (sum: number, item: any) =>
        sum + Number.parseFloat(item.procedureValue || 0),
      0
    );

  // Verificar se já existe um registro de pagamento
  const { data: existingPayment, error: paymentCheckError } = await supabase
    .from('treatment_payment')
    .select('id')
    .eq('treatment_id', treatmentId)
    .maybeSingle();

  if (paymentCheckError && paymentCheckError.code !== 'PGRST116') {
    console.error('Erro ao verificar pagamento existente:', paymentCheckError);
  }

  if (existingPayment) {
    // TODO: check if we need to reset the payment method, date and installments
    await supabase
      .from('treatment_payment')
      .update({
        total_value: totalValue,
        updated_by: dentistId,
      })
      .eq('id', existingPayment.id);
  } else {
    await supabase.from('treatment_payment').insert({
      treatment_id: treatmentId,
      total_value: totalValue,
      payment_method: 'credit_card',
      installments: 1,
      payment_date: null,
      created_by: dentistId,
      updated_by: dentistId,
    });
  }

  return NextResponse.json({ success: true });
}
