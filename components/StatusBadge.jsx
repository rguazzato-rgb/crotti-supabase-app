'use client';

export default function StatusBadge({ status = 'OK', description = 'I presidi antincendio sono gestiti correttamente.' }) {
  const isOk = status === 'OK';
  
  return (
    <div className="status-badge glass-card">
      <div className={`status-icon ${isOk ? 'success-pulse' : 'warning-pulse'}`} aria-hidden="true">
        {isOk ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )}
      </div>
      <div className="status-info">
        <strong>Stato conformità: {status}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}
