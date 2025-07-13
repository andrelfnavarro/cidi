import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PatientEntity } from '@/utils/types/PatientTable';
import { validateCompanySlug } from '@/lib/company-utils';

const validateRequiredFields = (patient: any) => {
  const requiredFields = [
    'name',
    'cpf',
    'email',
    'phone',
    'birthDate',
    'street',
    'zipCode',
    'city',
    'state',
  ];

  for (const field of requiredFields) {
    if (!patient[field]) {
      return false;
    }
  }

  if (
    (patient.insuranceName && !patient.insuranceNumber) ||
    (!patient.insuranceName && patient.insuranceNumber)
  ) {
    return false;
  }

  return true;
};

export async function POST(
  request: Request,
  { params }: { params: { companySlug: string } }
) {
  try {
    const { companySlug } = params;
    const patient = await request.json();

    // Validate company slug
    const company = await validateCompanySlug(companySlug);
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    if (!validateRequiredFields(patient)) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if patient already exists with the same email or CPF within this company
    const { data: existingPatient, error: lookupError } = await supabase
      .from('patients')
      .select('id, email, cpf')
      .eq('company_id', company.id)
      .or(`email.eq."${patient.email}",cpf.eq."${patient.cpf}"`)
      .maybeSingle();

    if (lookupError) {
      console.error('Erro ao verificar paciente existente:', lookupError);
      return NextResponse.json(
        { error: 'Erro ao verificar paciente existente' },
        { status: 500 }
      );
    }

    if (existingPatient) {
      if (existingPatient.email === patient.email) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado nesta empresa' },
          { status: 400 }
        );
      } else if (existingPatient.cpf === patient.cpf) {
        return NextResponse.json(
          { error: 'CPF já cadastrado nesta empresa' },
          { status: 400 }
        );
      }
    }

    // Format patient data with company_id
    const patientData: PatientEntity = {
      name: patient.name,
      email: patient.email,
      cpf: patient.cpf.replace(/\D/g, ''),
      gender: patient.gender,
      phone: patient.phone.replace(/\D/g, ''),
      birth_date: patient.birthDate,
      street: patient.street || null,
      city: patient.city || null,
      state: patient.state || null,
      zip_code: patient.zipCode ? patient.zipCode.replace(/\D/g, '') : null,
      insurance_name: patient.insuranceName || null,
      insurance_number:
        patient.insuranceNumber || null
          ? patient.insuranceNumber.replace(/\D/g, '')
          : null,
      has_insurance: !!patient.insuranceName,
      company_id: company.id,
    };

    // Insert patient into database
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao salvar paciente:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar paciente' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: { ...patientData, id: data.id },
      company: company.name,
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}