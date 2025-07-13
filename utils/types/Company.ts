export type Company = {
  id: string;
  name: string;
  slug: string;
  display_name?: string; // Custom display name for branding (defaults to name)
  subtitle?: string; // Tagline/subtitle for the company
  logo_url?: string; // URL to company logo
  primary_color?: string; // Primary brand color (hex)
  created_at?: string;
  updated_at?: string;
};

export type DentistEntity = {
  id: string;
  name: string;
  email: string;
  specialty?: string | null;
  registration_number?: string | null;
  is_admin: boolean;
  company_id: string;
  created_at?: string;
  updated_at?: string;
};