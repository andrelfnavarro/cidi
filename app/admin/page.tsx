import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/login-form';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/admin/pacientes');

  return (
    <div className="mx-auto max-w-md">
      <LoginForm />
    </div>
  );
}
