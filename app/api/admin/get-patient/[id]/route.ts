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

    // Get the current session to verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get the current dentist's company_id
    const { data: currentDentist, error: dentistError } = await supabase
      .from('dentists')
      .select('company_id')
      .eq('id', session.user.id)
      .single();

    if (dentistError || !currentDentist) {
      return NextResponse.json({ error: 'Dentista não encontrado' }, { status: 404 });
    }

    // Buscar paciente pelo ID dentro da empresa do dentista
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('company_id', currentDentist.company_id)
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
