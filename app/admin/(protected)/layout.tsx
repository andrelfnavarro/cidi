import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

import AdminHeader from '@/components/admin/header';
import AdminNavBar from '@/components/admin/nav-bar';
import { Toaster } from '@/components/ui/toaster';
import { DentistProvider, type Dentist } from '@/contexts/dentist-context';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin');

  const { data: dentist, error } = await supabase
    .from('dentists')
    .select(`
      id, 
      name, 
      email, 
      specialty, 
      registration_number, 
      is_admin, 
      company_id,
      company:companies(
        id,
        name,
        display_name,
        logo_url,
        primary_color
      )
    `)
    .eq('id', user.id)
    .single();

  if (error || !dentist) {
    await supabase.auth.signOut();
    redirect('/admin');
  }

  return (
    <DentistProvider dentist={dentist as Dentist}>
      <AdminHeader />
      <AdminNavBar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Toaster />
    </DentistProvider>
  );
}
