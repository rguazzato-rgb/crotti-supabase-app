import LandingHero from '@/components/LandingHero';
import LandingServices from '@/components/LandingServices';

export const metadata = {
  title: 'Crotti Safety — Sicurezza Antincendio',
  description:
    'Portale digitale Crotti Safety: manutenzione programmata, pronto intervento e gestione documentale per la compliance antincendio.',
};

// Build timestamp: 2026-05-04 17:55
export default function Home() {
  return (
    <>
      <LandingHero />
      <LandingServices />
    </>
  );
}
