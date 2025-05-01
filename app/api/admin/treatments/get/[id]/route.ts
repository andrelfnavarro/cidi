import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do tratamento é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Buscar tratamento pelo ID com informações de dentistas
    const { data: treatment, error: treatmentError } = await supabase
      .from('treatments')
      .select(
        `
        *,
        patients!treatments_patient_id_fkey(id, name, cpf),
        anamnesis(
          *,
          created_by_dentist:created_by(id, name),
          updated_by_dentist:updated_by(id, name)
        ),
        treatment_items(
          *,
          created_by_dentist:created_by(id, name),
          updated_by_dentist:updated_by(id, name)
        ),
        treatment_payment(
          *,
          created_by_dentist:created_by(id, name),
          updated_by_dentist:updated_by(id, name)
        ),
        created_by_dentist:created_by(id, name),
        updated_by_dentist:updated_by(id, name)
      `
      )
      .eq('id', id)
      .single();

    if (treatmentError) {
      console.error('Erro ao buscar tratamento:', treatmentError);
      return NextResponse.json(
        { error: 'Erro ao buscar tratamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({ treatment });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
