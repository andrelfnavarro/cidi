import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface ContextParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: ContextParams) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente não fornecido' }, { status: 400 });
    }

    // Get the URL parameters
    const url = new URL(request.url);
    const includeAnamnesis = url.searchParams.get('includeAnamnesis') === 'true';
    const includeTreatments = url.searchParams.get('includeTreatments') === 'true';

    // Create the Supabase client using the new SSR integration
    const supabase = await createClient();

    // Get the patient information
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar paciente:', error);
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    // If we need to include treatments
    let treatments = null;
    if (includeTreatments) {
      const { data: treatmentData, error: treatmentError } = await supabase
        .from('treatments')
        .select(`
          *,
          dentist:dentist_id(name)
        `)
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (treatmentError) {
        console.error('Erro ao buscar tratamentos:', treatmentError);
      } else {
        treatments = treatmentData;
      }
    }

    // If we need to include anamnesis
    let anamnesis = null;
    if (includeAnamnesis && treatments && treatments.length > 0) {
      // Get the latest treatment that has anamnesis data
      const latestWithAnamnesis = treatments.find((t: any) => t.anamnesis && Object.keys(t.anamnesis).length > 0);
      if (latestWithAnamnesis) {
        anamnesis = latestWithAnamnesis.anamnesis;
      }
    }

    return NextResponse.json({
      patient,
      treatments: includeTreatments ? treatments : undefined,
      anamnesis: includeAnamnesis ? anamnesis : undefined,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
