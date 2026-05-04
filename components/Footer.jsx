/* FIX: Footer professionale con link, contatti e copyright */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <strong>Crotti Safety</strong>
        <span>Manutenzione antincendio, documenti e interventi in un unico portale.</span>
        <nav className="footer-links" aria-label="Link footer">
          <a href="mailto:assistenza@crottisafety.it">assistenza@crottisafety.it</a>
          <a href="tel:+390356304701">+39 035 630 4701</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Crotti Safety S.r.l. — Tutti i diritti riservati</span>
      </div>
    </footer>
  );
}
