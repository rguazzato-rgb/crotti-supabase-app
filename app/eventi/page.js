import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const EventsCalendar = dynamic(() => import('@/components/Calendar'), {
  loading: () => (
    <div className="calendar-loading glass-card" aria-live="polite">
      Caricamento calendario...
    </div>
  ),
});

export const metadata = {
  title: 'Eventi | Crotti Safety',
  description: 'Calendario manutenzioni Crotti Safety con viste giorno, settimana e mese.',
};

export default function EventsPage() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content eventi-page">
        <header className="dashboard-header eventi-hero">
          <div className="welcome-text">
            <span className="eyebrow eventi-eyebrow">Calendario operativo</span>
            <h1>Eventi e manutenzioni programmate</h1>
            <p>Consulta interventi, ispezioni e controlli antincendio pianificati da Crotti Safety.</p>
          </div>
          <div className="status-badge glass-card eventi-summary">
            <div className="status-icon">IT</div>
            <div className="status-info">
              <strong>Vista localizzata</strong>
              <span>Giorno, settimana e mese in italiano.</span>
            </div>
          </div>
        </header>

        <EventsCalendar />
      </main>
      <Footer />
    </div>
  );
}
