'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { supabaseClient } from '@/utils/supabase/client';
import { useDentist } from '@/contexts/dentist-context';

export default function AdminHeader() {
  const router = useRouter();
  const dentist = useDentist();

  const handleSignOut = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return;
    }
    router.push('/admin');
  };

  const companyDisplayName = dentist.company?.display_name || dentist.company?.name || 'Portal do Dentista';
  const headerColor = dentist.company?.primary_color || '#1e40af';

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/admin/pacientes"
          className="flex items-center gap-3 text-xl font-bold"
          style={{ color: headerColor }}
        >
          {dentist.company?.logo_url && (
            <img 
              src={dentist.company.logo_url} 
              alt={`${companyDisplayName} logo`}
              className="h-8 w-auto object-contain"
            />
          )}
          <span>{companyDisplayName} - Portal do Dentista</span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserIcon size={16} />
                <span>{dentist.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/perfil')}>
                Perfil
              </DropdownMenuItem>
              {dentist.is_admin && (
                <DropdownMenuItem
                  onClick={() => router.push('/admin/dentistas')}
                >
                  Gerenciar Dentistas
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
