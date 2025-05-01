import { NextResponse } from 'next/server';
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Best practice in Next.js is to await the params object before using it
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do tratamento é obrigatório' },
        { status: 400 }
      );
    }

    // Use the new createClient from SSR integration
    const supabase = await createClient();
    
    // Get authenticated user with getUser() for improved security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

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
