import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { cpf } = await request.json();

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 });
    }

    // Normalize CPF by removing all non-digit characters
    const normalizedCpf = cpf.replace(/\D/g, '');

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

    // Buscar paciente pelo CPF dentro da empresa do dentista
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', normalizedCpf)
      .eq('company_id', currentDentist.company_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Código para "não encontrado" no Supabase
        return NextResponse.json({ patient: null });
      }

      console.error('Erro ao buscar paciente:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar paciente' },
        { status: 500 }
      );
    }

    return NextResponse.json({ patient: data });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
