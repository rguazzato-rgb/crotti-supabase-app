'use client';

import { useState } from 'react';

export default function ShareModal({ isOpen, onClose }) {
  const [expireHours, setExpireHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState('');

  if (!isOpen) return null;

  const handleGenerate = (e) => {
    e.preventDefault();
    const randomHash = Math.random().toString(36).substring(2, 15);
    setGeneratedLink(`https://crottisafety.it/shared/${randomHash}?exp=${expireHours}`);
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copiato negli appunti!');
    }
  };

  return (
    <div className="modal-overlay" aria-modal="true" role="dialog" aria-labelledby="share-modal-title">
      <div className="modal-container glass-card">
        <div className="modal-header">
          <h2 id="share-modal-title">Condividi Accesso</h2>
          <button className="close-modal" onClick={onClose} aria-label="Chiudi modale">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Genera un link sicuro per permettere a collaboratori o ispettori di visualizzare questi dati in sola lettura, senza necessità di login.
          </p>
          <form onSubmit={handleGenerate}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
              <label htmlFor="expire-hours" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Scadenza Link</label>
              <select 
                id="expire-hours"
                value={expireHours} 
                onChange={(e) => setExpireHours(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
              >
                <option value="24">24 Ore</option>
                <option value="168">7 Giorni</option>
                <option value="0">Nessuna Scadenza</option>
              </select>
            </div>
            
            {generatedLink && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: 'var(--success-color, #10b981)' }}>
                  Link generato!
                </label>
                <div className="share-link-box" style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" readOnly value={generatedLink} aria-label="Link generato" />
                  <button type="button" className="btn-secondary" onClick={handleCopy}>
                    Copia
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                  Chiunque abbia questo link potrà accedere ai dati in modalità sola lettura.
                </p>
              </div>
            )}
            
            <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Annulla</button>
              <button type="submit" className="btn-primary-small">Genera Link Sicuro</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
