'use client';

export default function ReadOnlyBanner() {
  return (
    <div className="read-only-banner">
      <span style={{ marginRight: '8px' }}>👁️</span>
      Stai visualizzando questo documento in modalità sola lettura. Le modifiche sono disabilitate.
    </div>
  );
}
