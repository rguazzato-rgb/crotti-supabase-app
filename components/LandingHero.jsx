'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingHero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" className="landing-header-logo">
          <Image
            src="/crotti-logo.png"
            alt="Crotti Safety"
            width={120}
            height={34}
            priority
            style={{
              borderRadius: '4px',
              background: scrolled ? 'transparent' : 'rgba(255,255,255,0.9)',
              padding: scrolled ? '0' : '4px',
              transition: 'all 350ms ease',
            }}
          />
          <span>Crotti Safety</span>
        </Link>
        <nav className="landing-header-nav">
          <a href="#servizi">Servizi</a>
          <a href="#gallery">Gallery</a>
          <a href="#contatti">Contatti</a>
          <Link href="/login" className="landing-header-login">Area Clienti</Link>
        </nav>
      </header>

      <section className="landing-hero" id="hero">
        <div className="landing-hero-overlay" />
        <Image
          src="/images/custom/hero.jpg"
          alt="Tecnico Crotti Safety esegue ispezione antincendio"
          className="landing-hero-bg"
          fill
          priority
          sizes="100vw"
        />
        <div className="landing-hero-content">
          <span className="landing-hero-eyebrow">Crotti Safety — Dal 1985</span>
          <h1 className="landing-hero-title">
            Benvenuto nel futuro della{' '}
            <span className="highlight">sicurezza antincendio</span>
          </h1>
          <p className="landing-hero-subtitle">
            Tecnologia, design e innovazione al servizio della compliance.
            Manutenzione programmata, pronto intervento e gestione documentale
            in un unico portale digitale.
          </p>
          <div className="landing-hero-actions">
            <a href="#servizi" className="landing-cta">
              Scopri di più <span aria-hidden="true">→</span>
            </a>
            <Link href="/login" className="landing-cta-secondary">
              Accedi al portale
            </Link>
          </div>
        </div>
        <div className="scroll-indicator" aria-hidden="true">
          <div className="scroll-indicator-dot" />
          <span>Scorri</span>
        </div>
      </section>
    </>
  );
}
