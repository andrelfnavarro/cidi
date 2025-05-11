'use client';
import { createContext, useContext } from 'react';

export type Dentist = {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
  registration_number: string | null;
  is_admin: boolean;
};

const DentistContext = createContext<Dentist | null>(null);

export function DentistProvider({
  dentist,
  children,
}: {
  dentist: Dentist;
  children: React.ReactNode;
}) {
  return (
    <DentistContext.Provider value={dentist}>
      {children}
    </DentistContext.Provider>
  );
}

export function useDentist() {
  const ctx = useContext(DentistContext);
  if (ctx === null)
    throw new Error('useDentist must be inside DentistProvider');
  return ctx;
}
