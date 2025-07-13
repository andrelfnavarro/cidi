import { createClient } from '@/utils/supabase/server';
import { Company } from '@/utils/types/Company';

export async function validateCompanySlug(slug: string): Promise<Company | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // Normalize slug
  const normalizedSlug = slug.toLowerCase().trim();
  
  if (normalizedSlug.length === 0) {
    return null;
  }

  try {
    const supabase = await createClient();
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', normalizedSlug)
      .single();

    if (error || !company) {
      return null;
    }

    return company as Company;
  } catch (error) {
    console.error('Error validating company slug:', error);
    return null;
  }
}

export function isValidSlug(slug: string): boolean {
  // Basic slug validation: alphanumeric and hyphens only
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}

export async function getCompanyByDentistId(dentistId: string): Promise<Company | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('dentists')
      .select(`
        company_id,
        companies (*)
      `)
      .eq('id', dentistId)
      .single();

    if (error || !data?.companies) {
      return null;
    }

    return data.companies as Company;
  } catch (error) {
    console.error('Error getting company by dentist ID:', error);
    return null;
  }
}