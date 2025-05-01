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
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Buscar paciente pelo ID
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar paciente:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar paciente' },
        { status: 500 }
      );
    }

    // Buscar tratamentos do paciente
    const { data: treatmentsData, error: treatmentsError } = await supabase
      .from('treatments')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (treatmentsError) {
      console.error('Erro ao buscar tratamentos:', treatmentsError);
      return NextResponse.json(
        { error: 'Erro ao buscar tratamentos' },
        { status: 500 }
      );
    }

    let anamnesisData = null;

    // Se houver tratamentos, buscar a anamnese do tratamento mais recente
    if (treatmentsData && treatmentsData.length > 0) {
      const latestTreatment = treatmentsData[0];

      const { data: anamnesis, error: anamnesisError } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('treatment_id', latestTreatment.id)
        .single();

      if (anamnesisError && anamnesisError.code !== 'PGRST116') {
        console.error('Erro ao buscar anamnese:', anamnesisError);
      } else if (anamnesis) {
        anamnesisData = anamnesis;
      }
    }

    return NextResponse.json({
      patient: data,
      anamnesis: anamnesisData,
      treatments: treatmentsData || [],
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
