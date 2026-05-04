'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProtectedRoute({ children, onUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !session) {
        onUser?.(null);
        // FIX: replace evita di lasciare una route protetta nella history del browser.
        router.replace('/login');
        return;
      }

      onUser?.(session.user);
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        onUser?.(null);
        router.replace('/login');
        return;
      }

      if (session) {
        onUser?.(session.user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [onUser, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" aria-label="Caricamento" />
      </div>
    );
  }

  return children;
}
