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
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md w-full">
        <LoginForm />
      </div>
    </div>
  );
}
