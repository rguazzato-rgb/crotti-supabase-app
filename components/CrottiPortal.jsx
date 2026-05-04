'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  computeKpi,
  createAdminIntervention,
  createServiceRequest,
  getDocuments,
  getFireExtinguishers,
  getJobs,
  getUsers,
} from '@/lib/crottiData';
import EventsCalendar from '@/components/Calendar';
import StatusBadge from '@/components/StatusBadge';

const ADMIN_EMAIL = 'r.guazzato@studenti.unibg.it';

const statusLabel = {
  pending: 'In attesa',
  in_progress: 'In corso',
  completed: 'Completato',
  cancelled: 'Annullato',
};

function formatDate(value) {
  if (!value) return 'Da pianificare';
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
}

function statusClass(status) {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'critical';
  if (status === 'in_progress') return 'working';
  return 'pending';
}

export default function CrottiPortal({ user }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState('Caricamento dati personali da Supabase...');
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    priority: 'Normale',
  });
  const [submitting, setSubmitting] = useState(false);
  /* FIX: chiave per forzare il refresh del calendario dopo creazione intervento admin */
  const [calendarKey, setCalendarKey] = useState(0);

  const kpi = useMemo(() => computeKpi(jobs), [jobs]);
  const currentProfile = users.find((item) => item.id === user?.id || item.email === user?.email);
  const isAdmin = currentProfile?.role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL;
  const portalTabs = [
    ['dashboard', 'Dashboard'],
    ['eventi', 'Eventi'],
    ['interventi', isAdmin ? 'Gestione attivita' : 'Interventi'],
    ['documenti', 'Documenti'],
    ['presidi', 'Presidi'],
    ['utenti', 'Utenti'],
  ];

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const [jobsResult, docsResult, extinguishersResult, usersResult] = await Promise.all([
        getJobs(),
        getDocuments(),
        getFireExtinguishers(),
        getUsers(),
      ]);

      if (!mounted) return;

      const messages = [];

      if (!jobsResult.error) setJobs(jobsResult.data || []);
      else if (jobsResult.error) messages.push('jobs');

      if (!docsResult.error) setDocuments(docsResult.data || []);
      else if (docsResult.error) messages.push('documents');

      if (!extinguishersResult.error) setExtinguishers(extinguishersResult.data || []);
      else if (extinguishersResult.error) messages.push('fire_extinguishers');

      if (!usersResult.error && usersResult.data) setUsers(usersResult.data);
      else if (usersResult.error) messages.push('users');

      setNotice(
        messages.length
          ? `Alcune tabelle Supabase non sono ancora disponibili o la RLS limita la lettura: ${messages.join(', ')}.`
          : 'Dati personali caricati da Supabase.'
      );
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const latestDocument = documents[0];
  const nextJob = jobs.find((job) => job.status !== 'completed') || jobs[0];

  const submitRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      title: requestForm.title,
      description: requestForm.description,
      priority: requestForm.priority,
      status: 'pending',
      requested_by: user?.id || null,
    };

    const { data, error } = await createServiceRequest(payload);

    if (error) {
      setNotice(`Richiesta non salvata: ${error.message}`);
    } else {
      setJobs((current) => [{ ...data, scheduled_date: null }, ...current]);
      setNotice('Richiesta registrata in Supabase.');
      setRequestForm({ title: '', description: '', priority: 'Normale' });
    }

    setSubmitting(false);
  };

  return (
    <main className="main-content">
      <div className="notice-bar">{notice}</div>

      <div className="portal-tabs" role="tablist" aria-label="Sezioni dashboard">
        {portalTabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            className={activeView === id ? 'active' : ''}
            aria-selected={activeView === id}
            onClick={() => setActiveView(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === 'dashboard' && (
        <section className="view-section active">
          <header className="dashboard-header">
            <div className="welcome-text">
              <h1>Ciao, {user?.email || 'Logistica Nord Spa'}</h1>
              <p>Partner per la continuita della sicurezza e la compliance operativa.</p>
            </div>

            <StatusBadge status="OK" description="I presidi antincendio sono gestiti correttamente." />
          </header>

          <section className="kpi-grid" aria-label="Indicatori interventi">
            <KpiCard label="Totale interventi" value={kpi.total} />
            <KpiCard label="In attesa" value={kpi.pending} />
            <KpiCard label="In corso" value={kpi.inProgress} />
            <KpiCard label="Completati" value={kpi.completed} />
            <KpiCard label="Scaduti" value={kpi.overdue} />
          </section>

          <section className="cta-section">
            <form className="request-panel" onSubmit={submitRequest}>
              <div>
                <h2>Richiedi assistenza</h2>
                <p>Segnala un guasto o richiedi un intervento tecnico fuori programma.</p>
              </div>
              <div className="request-grid">
                <input
                  aria-label="Tipo di problema"
                  value={requestForm.title}
                  onChange={(event) => setRequestForm({ ...requestForm, title: event.target.value })}
                  placeholder="Tipo di problema"
                  required
                />
                <select
                  aria-label="Priorita richiesta"
                  value={requestForm.priority}
                  onChange={(event) => setRequestForm({ ...requestForm, priority: event.target.value })}
                >
                  <option>Normale</option>
                  <option>Alta</option>
                  <option>Critica</option>
                </select>
                <textarea
                  aria-label="Descrizione richiesta"
                  value={requestForm.description}
                  onChange={(event) => setRequestForm({ ...requestForm, description: event.target.value })}
                  placeholder="Descrizione e posizione esatta"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                <span aria-hidden="true">!</span>
                {submitting ? 'Invio in corso...' : 'Invia richiesta'}
              </button>
            </form>
          </section>

          <section className="cards-container">
            <InfoCard
              title="Prossimo controllo"
              value={nextJob ? formatDate(nextJob.scheduled_date) : 'Nessun controllo'}
              description={nextJob?.description || 'Non ci sono interventi associati al tuo account.'}
              footer={nextJob ? statusLabel[nextJob.status] || 'In programmazione' : 'Vuoto'}
            />
            <InfoCard
              title="Ultimo documento"
              value={latestDocument?.name || 'Nessun documento'}
              description={latestDocument?.description || 'Non ci sono documenti associati al tuo account.'}
              footer={latestDocument ? formatDate(latestDocument.created_at || latestDocument.date) : 'Vuoto'}
            />
          </section>

          <HistoryList jobs={jobs.slice(0, 3)} title="Cronologia recente" />
        </section>
      )}

      {activeView === 'eventi' && (
        <section className="view-section active">
          <SectionHeader
            title={isAdmin ? 'Tutti gli appuntamenti' : 'I tuoi appuntamenti'}
            text={
              isAdmin
                ? 'Vista completa degli appuntamenti assegnati agli utenti registrati.'
                : 'Calendario degli interventi e delle manutenzioni assegnati al tuo account.'
            }
          />
          {/* FIX: key cambiato dopo creazione intervento per forzare il refresh degli eventi */}
          <EventsCalendar key={calendarKey} />
        </section>
      )}

      {activeView === 'interventi' && (
        <>
          {isAdmin && (
            <AdminActivityManager
              users={users}
              onCreated={(createdJob) => {
                setJobs((current) => [createdJob, ...current]);
                /* FIX: incrementa la chiave calendario per forzare il refresh degli eventi utente */
                setCalendarKey((k) => k + 1);
                setNotice('Intervento creato e appuntamento inserito nel calendario utente.');
              }}
            />
          )}
          <HistoryList jobs={jobs} title={isAdmin ? 'Gestione attivita' : 'Storico interventi'} />
        </>
      )}

      {activeView === 'documenti' && (
        <section className="view-section active">
          <SectionHeader title="Documenti compliance" text="Verbali, certificati, manuali e documenti tecnici." />
          <div className="cards-container">
            {documents.map((doc) => (
              <InfoCard
                key={doc.id}
                title={doc.name || doc.titolo_documento || doc.file_name || 'Documento'}
                value={formatDate(doc.created_at || doc.date)}
                description={doc.description || 'Documento collegato alla compliance antincendio.'}
                footer="Disponibile"
              />
            ))}
            {!documents.length && (
              <EmptyState title="Nessun documento" text="I documenti caricati dall'azienda appariranno qui." />
            )}
          </div>
        </section>
      )}

      {activeView === 'presidi' && (
        <section className="view-section active">
          <SectionHeader title="Presidi antincendio" text="Inventario convertito dal model MVC fireExtinguisherModel." />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Posizione</th>
                  <th>Ultimo controllo</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {extinguishers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.type}</td>
                    <td>{item.location}</td>
                    <td>{formatDate(item.last_check)}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
                {!extinguishers.length && (
                  <tr>
                    <td colSpan="4">Nessun presidio associato al tuo account.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeView === 'utenti' && (
        <section className="view-section active">
          <SectionHeader title="Utenti Supabase" text="Esempio SELECT dalla tabella public.users con RLS attiva." />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>ID</th>
                  <th>Creato il</th>
                </tr>
              </thead>
              <tbody>
                {(users.length ? users : [{ id: user?.id, email: user?.email, created_at: null }]).map((item) => (
                  <tr key={item.id || item.email}>
                    <td>{item.email || 'Non disponibile'}</td>
                    <td className="mono">{item.id || 'RLS: dati non leggibili'}</td>
                    <td>{item.created_at ? formatDate(item.created_at) : 'Sessione corrente'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoCard({ title, value, description, footer }) {
  return (
    <article className="data-card glass-card">
      <div className="card-header">
        <span className="card-dot" aria-hidden="true" />
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        <p className="highlight-date">{value}</p>
        <p className="card-desc">{description}</p>
      </div>
      <div className="card-footer">
        <span className="status-tag">{footer}</span>
      </div>
    </article>
  );
}

function HistoryList({ jobs, title }) {
  return (
    <section className="view-section active">
      <h2 className="section-title">{title}</h2>
      <div className="history-list glass-card">
        {jobs.map((job) => (
          <div className="history-item" key={job.id}>
            <div className={`item-icon ${statusClass(job.status)}`}>{statusLabel[job.status]?.slice(0, 2) || 'IN'}</div>
            <div className="item-details">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <small>{formatDate(job.scheduled_date)}</small>
            </div>
            <div className="item-status">
              <span className={`status-badge-small ${statusClass(job.status)}`}>{statusLabel[job.status] || job.status || 'In attesa'}</span>
            </div>
          </div>
        ))}
        {!jobs.length && <EmptyState title="Nessun intervento" text="Gli interventi assegnati al tuo account appariranno qui." />}
      </div>
    </section>
  );
}

function AdminActivityManager({ users, onCreated }) {
  const registeredUsers = useMemo(
    () => users.filter((item) => item.id && item.email && item.role !== 'admin'),
    [users]
  );
  const [adminForm, setAdminForm] = useState({
    user_id: registeredUsers[0]?.id || '',
    title: '',
    description: '',
    location: '',
    priority: 'Normale',
    status: 'pending',
    start_at: '',
    end_at: '',
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedUserId = adminForm.user_id || registeredUsers[0]?.id || '';

  const submitAdminIntervention = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const start = new Date(adminForm.start_at);
    const end = adminForm.end_at ? new Date(adminForm.end_at) : new Date(start.getTime() + 60 * 60 * 1000);

    const { data, error } = await createAdminIntervention({
      ...adminForm,
      user_id: selectedUserId,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
    });

    if (error) {
      setMessage(`Intervento non creato: ${error.message}`);
    } else {
      onCreated(data.job);
      setMessage('Intervento inserito correttamente.');
      setAdminForm((current) => ({
        ...current,
        title: '',
        description: '',
        location: '',
        start_at: '',
        end_at: '',
      }));
    }

    setSaving(false);
  };

  return (
    <section className="admin-activity-panel glass-card">
      <div className="admin-activity-heading">
        <div>
          <span className="calendar-kicker">Admin</span>
          <h2>Inserisci intervento manuale</h2>
          <p>Assegna un intervento a un utente registrato e crea il relativo appuntamento in calendario.</p>
        </div>
      </div>

      <form className="admin-activity-form" onSubmit={submitAdminIntervention}>
        <label>
          Utente registrato
          <select
            value={selectedUserId}
            onChange={(event) => setAdminForm({ ...adminForm, user_id: event.target.value })}
            required
          >
            <option value="">Seleziona utente</option>
            {registeredUsers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          Titolo intervento
          <input
            value={adminForm.title}
            onChange={(event) => setAdminForm({ ...adminForm, title: event.target.value })}
            placeholder="Es. Manutenzione estintori"
            required
          />
        </label>

        <label>
          Luogo
          <input
            value={adminForm.location}
            onChange={(event) => setAdminForm({ ...adminForm, location: event.target.value })}
            placeholder="Es. Sede Bergamo"
          />
        </label>

        <label>
          Inizio
          <input
            type="datetime-local"
            value={adminForm.start_at}
            onChange={(event) => setAdminForm({ ...adminForm, start_at: event.target.value })}
            required
          />
        </label>

        <label>
          Fine
          <input
            type="datetime-local"
            value={adminForm.end_at}
            onChange={(event) => setAdminForm({ ...adminForm, end_at: event.target.value })}
          />
        </label>

        <label>
          Priorita
          <select
            value={adminForm.priority}
            onChange={(event) => setAdminForm({ ...adminForm, priority: event.target.value })}
          >
            <option>Normale</option>
            <option>Alta</option>
            <option>Critica</option>
          </select>
        </label>

        <label>
          Stato
          <select
            value={adminForm.status}
            onChange={(event) => setAdminForm({ ...adminForm, status: event.target.value })}
          >
            <option value="pending">In attesa</option>
            <option value="in_progress">In corso</option>
            <option value="completed">Completato</option>
            <option value="cancelled">Annullato</option>
          </select>
        </label>

        <label className="admin-activity-full">
          Descrizione
          <textarea
            value={adminForm.description}
            onChange={(event) => setAdminForm({ ...adminForm, description: event.target.value })}
            placeholder="Dettagli operativi e note per il cliente"
          />
        </label>

        <div className="admin-activity-actions">
          <button type="submit" className="btn-primary" disabled={saving || !selectedUserId}>
            {saving ? 'Inserimento...' : 'Inserisci intervento'}
          </button>
          {message && <span>{message}</span>}
          {!registeredUsers.length && <span>Nessun utente registrato disponibile.</span>}
        </div>
      </form>
    </section>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function SectionHeader({ title, text }) {
  return (
    <header className="dashboard-header">
      <div className="welcome-text">
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </header>
  );
}
