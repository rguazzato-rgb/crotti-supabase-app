'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleResetRequest = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        // FIX: URL assoluto e configurabile per redirect Supabase su Vercel.
        redirectTo: `${siteUrl}/reset-password`,
      });

      if (error) throw error;

      setMessageType('success');
      setMessage('Se l email e registrata, riceverai un link sicuro per reimpostare la password.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Non e stato possibile inviare la richiesta di recupero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      {/* UI FIX: stessa immagine auth ottimizzata anche sul recupero password. */}
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
          <span className="auth-kicker">Recupero password</span>
          <h1>Ricevi il link di reset.</h1>
          <p>Inserisci la email del tuo account: Supabase inviera un link temporaneo per impostare una nuova password.</p>
        </div>

        <form onSubmit={handleResetRequest} className="auth-form password-form">
          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="cliente@azienda.it"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary-small full-width">
            <span aria-hidden="true">-&gt;</span>
            {loading ? 'Invio in corso...' : 'Invia email di recupero'}
          </button>
        </form>

        {message && (
          <p className={`form-message ${messageType}`} role="status" aria-live="polite">
            {message}
          </p>
        )}

        <div className="auth-links">
          <Link href="/login">Torna al login</Link>
        </div>
      </motion.section>
    </main>
  );
}
