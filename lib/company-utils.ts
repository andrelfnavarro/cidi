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

  // Validate slug format before querying database
  if (!isValidSlug(normalizedSlug)) {
    console.warn('Invalid slug format:', normalizedSlug);
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
  // Improved slug validation:
  // - Must start and end with alphanumeric characters
  // - Can contain hyphens between alphanumeric characters
  // - No consecutive hyphens
  // - Length between 2-50 characters
  const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  
  // Check basic pattern
  if (!slugRegex.test(slug)) {
    return false;
  }
  
  // Check length constraints
  if (slug.length < 2 || slug.length > 50) {
    return false;
  }
  
  // Check for consecutive hyphens
  if (slug.includes('--')) {
    return false;
  }
  
  return true;
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