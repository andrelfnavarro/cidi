import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do paciente é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

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

    return NextResponse.json({
      patient: data,
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
