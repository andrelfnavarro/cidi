import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Buscar tratamentos do paciente
    const { data, error } = await supabase
      .from('treatments')
      .select(
        `
        *,
        treatment_payment(*),
        created_by_dentist:created_by(id, name),
        updated_by_dentist:updated_by(id, name)
      `
      )
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tratamentos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar tratamentos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ treatments: data || [] });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
