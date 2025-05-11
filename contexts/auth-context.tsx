'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabaseClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });
    const { data: sub } = supabaseClient.auth.onAuthStateChange(
      (_e, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    supabaseClient.auth.signInWithPassword({ email, password });

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
