/* FIX: ServicesOverview con immagini decorative da Immagine_sito_web e layout migliorato */
import Image from 'next/image';

const services = [
  {
    title: 'Manutenzione programmata',
    text: 'Pianificazione controlli periodici per estintori, porte REI, allarmi e impianti.',
    image: '/images/559gflW0X6jAubA7ZJfrrCoyDQcLOpdhqbJcN2g6wyCqeJ7ZeafPnvH_Msu9yN_qBOdSawpcZJvLlllp4HiDcdfimzxV1_i-dUj-afcPvyXyT4viZphAUxVjrqpFBGIHCgowgZ4IyfeJFr72edgqq.jpg',
    alt: 'Tecnico controlla estintori con clipboard',
  },
  {
    title: 'Pronto intervento',
    text: 'Richieste urgenti tracciate in Supabase e consultabili dalla dashboard cliente.',
    image: '/images/RHIOseasOs8yxXVwnLXLGT5jWMvtn4FwgRP2Kcc9eZNZJvCRs-uIJqCMP4F4rj_8jBRGmNGGBQ6_b319WcsRfJmfF2qYbt7elurSAKMcVWIXdCgNoeBuybIjlWKZCDBEZX_vu3eI-mSYd0A9p4sqK.jpg',
    alt: 'Tecnico Crotti nel furgone attrezzato',
  },
  {
    title: 'Impianti antincendio',
    text: 'Installazione, manutenzione e verifica impianti sprinkler, idranti e rilevazione.',
    image: '/images/FvpC4pvvi1C4LgDIl0PgdxeQqQY4uMNZlUxR3VOqmJFRDpJQ47DvjkVu7DFaxXWeHtlUIQocq33FoJXdB_ZsNDuth6vRqi8Os_iAadYsKvaEi6p2uI-8Y35VpZzByphn3-Ayc0rV3Hdj2wZFDPHultNBfmj7HRONKW.jpg',
    alt: 'Impianto sprinkler industriale rosso',
  },
  {
    title: 'Documenti compliance',
    text: 'Archivio centralizzato per verbali, certificazioni, manuali e scadenze normative.',
    image: '/images/NOXuMucSbnLjqsvP9QwDKAhoMWHgwsPKMDHwgnulEJDyW5SSmGwbr7sAh1KEXbtKyVhIwmqk_K1qrMqEI9nS8NTm4khjxGCaXmYa5lVp0taoACGHPOdLc03fqyzzoYicvmkE7iy5nsWkHw6Uoqj2V.jpg',
    alt: 'Estintore in corridoio commerciale',
  },
];

export default function ServicesOverview() {
  return (
    <main className="main-content">
      <header className="dashboard-header">
        <div className="welcome-text">
          <h1>I nostri servizi</h1>
          <p>Sicurezza antincendio a 360°: dalla manutenzione programmata alla gestione documentale.</p>
        </div>
      </header>

      <section className="cards-container">
        {services.map((service) => (
          <article className="data-card glass-card service-image-card" key={service.title}>
            {/* FIX: immagini decorative con lazy loading */}
            <Image
              className="card-image"
              src={service.image}
              alt={service.alt}
              width={400}
              height={180}
              loading="lazy"
              style={{ objectFit: 'cover', width: '100%', height: '180px' }}
            />
            <div className="card-content">
              <h2>{service.title}</h2>
              <p className="card-desc">{service.text}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
