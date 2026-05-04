'use client';

import Image from 'next/image';

const services = [
  {
    title: 'Consulenza strategica',
    text: 'Analisi dei rischi, piani di sicurezza personalizzati e compliance normativa per la tua azienda.',
    icon: '/images/gemini/icon-strategy.png',
    alt: 'Icona strategia',
  },
  {
    title: 'Design innovativo',
    text: 'Progettazione moderna di impianti antincendio e sistemi di rilevazione con tecnologie all\'avanguardia.',
    icon: '/images/gemini/icon-design.png',
    alt: 'Icona design',
  },
  {
    title: 'Marketing digitale',
    text: 'Portale clienti digitale, reportistica in tempo reale e gestione documentale cloud-based.',
    icon: '/images/gemini/icon-growth.png',
    alt: 'Icona crescita',
  },
];

const galleryImages = [
  { src: '/images/custom/tecnico-clipboard.jpg', alt: 'Tecnico controlla estintori' },
  { src: '/images/custom/tecnico-furgone.jpg', alt: 'Tecnico nel furgone attrezzato' },
  { src: '/images/custom/impianto-sprinkler.jpg', alt: 'Impianto sprinkler industriale' },
  { src: '/images/custom/estintore-corridoio.jpg', alt: 'Estintore in corridoio' },
  { src: '/images/custom/safety-team.jpg', alt: 'Team sicurezza Crotti' },
  { src: '/images/custom/attrezzatura.jpg', alt: 'Attrezzatura antincendio' },
  { src: '/images/custom/controllo-estintore.jpg', alt: 'Controllo estintore' },
  { src: '/images/custom/ispezione.jpg', alt: 'Ispezione impianti' },
];

export default function LandingServices() {
  return (
    <>
      {/* ---- Services Section ---- */}
      <section className="landing-features" id="servizi">
        <div className="landing-features-inner">
          <p className="landing-section-eyebrow">I nostri servizi</p>
          <h2 className="landing-section-title">
            Sicurezza a 360° per la tua azienda
          </h2>
          <p className="landing-section-desc">
            Dalla manutenzione programmata alla gestione documentale,
            offriamo soluzioni integrate per la compliance antincendio.
          </p>

          <div className="landing-grid">
            {services.map((service) => (
              <article className="landing-card" key={service.title}>
                <div className="landing-card-icon">
                  <img src={service.icon} alt={service.alt} width={40} height={40} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Stats Bar ---- */}
      <section className="landing-stats">
        <div className="landing-stats-inner">
          <div className="stat-item">
            <div className="stat-value">35+</div>
            <div className="stat-label">Anni di esperienza</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Clienti attivi</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">12k+</div>
            <div className="stat-label">Interventi completati</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">99%</div>
            <div className="stat-label">Soddisfazione clienti</div>
          </div>
        </div>
      </section>

      {/* ---- Gallery Section ---- */}
      <section className="landing-gallery" id="gallery">
        <div className="landing-gallery-inner">
          <p className="landing-section-eyebrow">Il nostro lavoro</p>
          <h2 className="landing-section-title">
            Professionalità sul campo
          </h2>
          <p className="landing-section-desc">
            I nostri tecnici specializzati operano ogni giorno per garantire
            la sicurezza dei tuoi spazi.
          </p>

          <div className="gallery-grid">
            {galleryImages.map((img) => (
              <div className="gallery-item" key={img.src}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  loading="lazy"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Bottom CTA ---- */}
      <section className="landing-bottom-cta" id="contatti">
        <div className="landing-bottom-cta-inner">
          <p className="landing-section-eyebrow">Inizia subito</p>
          <h2 className="landing-section-title">
            Pronto a digitalizzare la tua sicurezza?
          </h2>
          <p className="landing-section-desc">
            Accedi al portale clienti per monitorare interventi, documenti e
            scadenze in tempo reale. Contattaci per una consulenza gratuita.
          </p>
          <div className="landing-hero-actions">
            <a href="mailto:assistenza@crottisafety.it" className="landing-cta">
              Contattaci <span aria-hidden="true">→</span>
            </a>
            <a href="tel:+390356304701" className="landing-cta-secondary" style={{ border: '1px solid #cbd5e1', color: '#222832' }}>
              +39 035 630 4701
            </a>
          </div>
        </div>
      </section>

      {/* ---- Landing Footer ---- */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <strong>Crotti Safety</strong>
            <span>Sicurezza antincendio dal 1985</span>
          </div>
          <div className="landing-footer-links">
            <a href="mailto:assistenza@crottisafety.it">assistenza@crottisafety.it</a>
            <a href="tel:+390356304701">+39 035 630 4701</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          © {new Date().getFullYear()} Crotti Safety S.r.l. — Tutti i diritti riservati
        </div>
      </footer>
    </>
  );
}
