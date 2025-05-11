'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserCog, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDentist } from '@/contexts/dentist-context';

export default function AdminNavBar() {
  const pathname = usePathname();
  const dentist = useDentist();

  if (!dentist) return null;

  const navItems = [
    {
      title: 'Pacientes',
      href: '/admin/pacientes',
      icon: Users,
      key: 'patients',
    },
    {
      title: 'Meu Perfil',
      href: '/admin/perfil',
      icon: UserIcon,
      key: 'profile',
    },
    {
      title: 'Gerenciar Dentistas',
      href: '/admin/dentistas',
      icon: UserCog,
      key: 'manage-dentists',
      requiresAdmin: true,
    },
  ];

  return (
    <div className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-4 overflow-x-auto">
          {navItems.map(item => {
            if (item.requiresAdmin && !dentist.is_admin) return null;

            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex h-12 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-blue-700 text-blue-700'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                )}
              >
                <item.icon size={16} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
