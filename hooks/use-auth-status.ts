'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type AuthState = {
  isAuthed: boolean;
  loading: boolean;
};

export function useAuthStatus(): AuthState {
  const [state, setState] = useState<AuthState>(() => ({
    isAuthed: false,
    loading: Boolean(supabase),
  }));

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let active = true;

    const resolveSession = async () => {
      const { data, error } = await client.auth.getSession();

      if (!active) return;

      if (error) {
        console.error('Failed to load auth session', error);
      }

      setState({ isAuthed: Boolean(data.session), loading: false });
    };

    resolveSession();

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({ isAuthed: Boolean(session), loading: false });
    });

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return state;
}
