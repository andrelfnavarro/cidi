export type PatientEntity = {
  id?: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  street: string;
  zip_code: string;
  city: string;
  state: string;
  gender: string;
  birth_date: string;
  has_insurance: boolean;
  insurance_name: string | null;
  insurance_number: string | null;
  company_id: string;
  created_at?: string;
  updated_at?: string;
};
