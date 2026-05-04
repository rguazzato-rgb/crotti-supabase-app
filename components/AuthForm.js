'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getPostLoginPath, isAdminEmail } from '@/lib/adminConfig';
import { supabase } from '@/lib/supabaseClient';

export default function AuthForm({
  eyebrow = 'Portale cliente',
  title = 'Sicurezza antincendio, documenti e interventi in un unico spazio.',
  description = "Monitora presidi, richieste e compliance con un'esperienza veloce, protetta e pronta per Vercel.",
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function redirectAuthenticatedUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted && session) {
        if (isAdminEmail(session.user?.email)) {
          sessionStorage.setItem('role', 'admin');
        }
        router.replace(getPostLoginPath(session.user));
      }
    }

    redirectAuthenticatedUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const resetMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const getAuthRedirectUrl = (path) => `${window.location.origin}${path}`;

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    resetMessage();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            // FIX: redirect assoluto richiesto da Supabase Auth in produzione Vercel.
            emailRedirectTo: getAuthRedirectUrl('/login'),
          },
        });

        if (error) throw error;

        setMessageType('success');
        setMessage('Controlla la tua email per confermare la registrazione.');
      } else {
        const {
          data: { session },
          error,
        } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error || !session) {
          // FIX: notifica chiara quando Supabase non crea una sessione valida.
          throw new Error("Errore nell'accesso. Controlla email e password e riprova.");
        }

        if (isAdminEmail(session.user?.email)) {
          sessionStorage.setItem('role', 'admin');
        } else {
          sessionStorage.removeItem('role');
        }

        router.replace(getPostLoginPath(session.user));
        router.refresh();
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Autenticazione non riuscita.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setMagicLoading(true);
    resetMessage();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error('Inserisci la tua email per ricevere il magic link.');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          // FIX: magic link con redirect assoluto compatibile con URL consentiti Supabase/Vercel.
          emailRedirectTo: getAuthRedirectUrl(isAdminEmail(normalizedEmail) ? '/admin/dashboard' : '/dashboard'),
        },
      });

      if (error) throw error;

      setMessageType('success');
      setMessage('Magic link inviato. Controlla la tua email per accedere.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Invio magic link non riuscito.');
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* UI FIX: sfondo full-screen ottimizzato da Next Image per Vercel. */}
      <Image
        src="/images/login-bg.jpg"
        alt="Sfondo sicurezza Crotti Safety"
        fill
        priority
        className="login-background"
        sizes="100vw"
      />

      <motion.section
        className="login-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="login-hero-content">
          <Image src="/crotti-logo.png" alt="Crotti Safety" width={212} height={58} priority />
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </motion.section>

      <motion.div
        className="auth-panel"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.52, ease: 'easeOut', delay: 0.08 }}
      >
        <div className="auth-heading">
          <span className="auth-kicker">Supabase Auth</span>
          <h2>{isSignUp ? 'Crea account' : 'Accesso area cliente'}</h2>
          <p>
            {isSignUp
              ? 'Registra un nuovo profilo e conferma la tua email.'
              : 'Accedi con password o richiedi un magic link sicuro via email.'}
          </p>
        </div>

        <div className="auth-mode-toggle" aria-label="Modalita autenticazione">
          <button type="button" className={!isSignUp ? 'active' : ''} onClick={() => setIsSignUp(false)}>
            Accedi
          </button>
          <button type="button" className={isSignUp ? 'active' : ''} onClick={() => setIsSignUp(true)}>
            Registrati
          </button>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="cliente@azienda.it"
              autoComplete="email"
              disabled={loading || magicLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              placeholder="********"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              disabled={loading || magicLoading}
            />
          </div>

          <button type="submit" disabled={loading || magicLoading} className="btn-primary-small full-width">
            <span aria-hidden="true">-&gt;</span>
            {loading ? 'Operazione in corso...' : isSignUp ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        {!isSignUp && (
          <div className="auth-actions">
            <div className="auth-divider">
              <span>oppure</span>
            </div>
            <button type="button" disabled={loading || magicLoading} className="btn-secondary full-width" onClick={handleMagicLink}>
              {magicLoading ? 'Invio link...' : 'Accedi con magic link'}
            </button>
          </div>
        )}

        {message && (
          <p className={`form-message ${messageType}`} role="status" aria-live="polite">
            {message}
          </p>
        )}

        <div className="auth-links">
          {!isSignUp && <Link href="/forgot-password">Password dimenticata?</Link>}
          <button
            type="button"
            onClick={() => {
              setIsSignUp((current) => !current);
              resetMessage();
            }}
            className="text-button"
          >
            {isSignUp ? 'Hai gia un account? Accedi' : 'Non hai un account? Crea profilo'}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
