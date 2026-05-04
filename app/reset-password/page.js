'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      try {
        const code = new URLSearchParams(window.location.search).get('code');

        if (code) {
          // FIX: supporto PKCE Supabase quando il link di recupero torna con ?code=...
          await supabase.auth.exchangeCodeForSession(code);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setHasRecoverySession(Boolean(session));
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasRecoverySession(true);
      }
    });

    prepareRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      if (password.length < 8) {
        throw new Error('La nuova password deve contenere almeno 8 caratteri.');
      }

      if (password !== confirmPassword) {
        throw new Error('Le password inserite non coincidono.');
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessageType('success');
      setMessage('Password aggiornata correttamente. Puoi accedere con le nuove credenziali.');

      await supabase.auth.signOut();
      setTimeout(() => router.replace('/login'), 1400);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Non e stato possibile aggiornare la password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      {/* UI FIX: sfondo coerente con la login e ottimizzato da Next Image. */}
      <Image
        src="/images/login-bg.jpg"
        alt="Sfondo sicurezza Crotti Safety"
        fill
        priority
        className="login-background"
        sizes="100vw"
      />

      <motion.section
        className="auth-panel password-panel"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-heading">
          <span className="auth-kicker">Nuova password</span>
          <h1>Imposta una password sicura.</h1>
          <p>Completa il recupero usando il link ricevuto via email. La sessione temporanea viene chiusa dopo il salvataggio.</p>
        </div>

        {checkingSession ? (
          <p className="form-message">Verifica link di recupero in corso...</p>
        ) : !hasRecoverySession ? (
          <>
            <p className="form-message error" role="alert">
              Link non valido o scaduto. Richiedi una nuova email di recupero.
            </p>
            <div className="auth-links">
              <Link href="/forgot-password">Richiedi un nuovo link</Link>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordUpdate} className="auth-form password-form">
              <div className="form-group">
                <label htmlFor="reset-password">Nuova password</label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Almeno 8 caratteri"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reset-confirm-password">Conferma password</label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Ripeti la password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary-small full-width">
                <span aria-hidden="true">-&gt;</span>
                {loading ? 'Aggiornamento...' : 'Aggiorna password'}
              </button>
            </form>

            {message && (
              <p className={`form-message ${messageType}`} role="status" aria-live="polite">
                {message}
              </p>
            )}
          </>
        )}

        <div className="auth-links">
          <Link href="/login">Torna al login</Link>
        </div>
      </motion.section>
    </main>
  );
}
