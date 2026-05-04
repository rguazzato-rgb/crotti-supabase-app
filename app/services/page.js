import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServicesOverview from '@/components/ServicesOverview';

export const metadata = {
  title: 'Servizi | Crotti Safety',
  description: 'Servizi antincendio e compliance integrati nel portale Crotti Safety.',
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <ServicesOverview />
      <Footer />
    </>
  );
}
