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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Criar novo tratamento
    const { data, error } = await supabase
      .from('treatments')
      .insert({
        patient_id: patientId,
        created_by: user?.id,
        updated_by: user?.id,
        status: 'open',
      })
      .select();

    if (error) {
      console.error('Erro ao criar tratamento:', error);
      return NextResponse.json(
        { error: 'Erro ao criar tratamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, treatment: data[0] });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
