import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: You must be logged in' },
      { status: 401 }
    );
  }

  try {
    // Parse the request body
    const { treatmentId, dentistId, finalized_at } = await request.json();

    if (!treatmentId) {
      return NextResponse.json(
        { error: 'TreatmentId é obrigatório' },
        { status: 400 }
      );
    }

    if (!dentistId) {
      return NextResponse.json(
        { error: 'DentistId é obrigatório' },
        { status: 400 }
      );
    }

    // Update the treatment status to finalized
    const { data, error } = await supabase
      .from('treatments')
      .update({
        status: 'finalized',
        finalized_at: finalized_at,
        updated_at: new Date().toISOString(),
        updated_by: dentistId,
      })
      .eq('id', treatmentId)
      .select();

    if (error) {
      console.error('Error finalizing treatment:', error);
      return NextResponse.json(
        { error: 'Erro ao finalizar tratamento' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Tratamento finalizado com sucesso',
      treatment: data[0],
    });
  } catch (error) {
    console.error('Exception in finalize treatment API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
