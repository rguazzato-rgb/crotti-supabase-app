'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminIntervention } from '@/lib/crottiData';
import { supabase } from '@/lib/supabaseClient';

const tabs = [
  { id: 'users', label: 'Utenti' },
  { id: 'events', label: 'Gestione attivita' },
  { id: 'documents', label: 'Documenti' },
];

const fields = {
  users: [
    { key: 'id', label: 'ID', draftOnly: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Ruolo', type: 'select', options: ['user', 'admin'] },
    { key: 'created_at', label: 'Creato il', readOnly: true },
  ],
  events: [
    { key: 'assigned_user_id', label: 'Utente', type: 'user-select', source: 'activities' },
    { key: 'created_by', label: 'Utente', type: 'user-select', source: 'events' },
    { key: 'client_id', label: 'Utente', type: 'user-select', source: 'jobs' },
    { key: 'title', label: 'Titolo' },
    { key: 'description', label: 'Descrizione', type: 'textarea' },
    { key: 'status', label: 'Stato' },
    { key: 'start_at', label: 'Inizio', type: 'datetime-local', source: 'activities' },
    { key: 'start_at', label: 'Inizio', type: 'datetime-local', source: 'events' },
    { key: 'end_at', label: 'Fine', type: 'datetime-local', source: 'activities' },
    { key: 'end_at', label: 'Fine', type: 'datetime-local', source: 'events' },
    { key: 'scheduled_date', label: 'Data', type: 'date', source: 'jobs' },
    { key: 'location', label: 'Luogo', source: 'activities' },
    { key: 'location', label: 'Luogo', source: 'events' },
    { key: 'priority', label: 'Priorita', source: 'activities' },
    { key: 'priority', label: 'Priorita', source: 'jobs' },
  ],
  documents: [
    { key: 'name', label: 'Nome' },
    { key: 'description', label: 'Descrizione', type: 'textarea' },
    { key: 'file_url', label: 'File URL' },
    { key: 'created_at', label: 'Creato il', readOnly: true },
  ],
};

const emptyRows = {
  users: { id: '', email: '', role: 'user' },
  events: {
    assigned_user_id: '',
    created_by: '',
    client_id: '',
    title: '',
    description: '',
    status: 'pending',
    start_at: '',
    end_at: '',
    location: '',
    priority: 'Normale',
  },
  documents: { name: '', description: '', file_url: '' },
};

const datasetConfig = {
  users: { primary: 'profiles', fallback: 'users', order: 'created_at' },
  events: { primary: 'activities', fallback: 'events', order: 'start_at', fallbackOrder: 'start_at' },
  documents: { primary: 'documents', order: 'created_at' },
};

function formatValue(value) {
  if (!value) return '';
  if (typeof value !== 'string') return value;
  return value.length > 19 ? value.slice(0, 19) : value;
}

function getEditablePayload(row, fieldList, source) {
  return fieldList.reduce((payload, field) => {
    if (field.readOnly || (field.draftOnly && !row.__draft) || (field.source && field.source !== source)) return payload;
    if (!(field.key in row)) return payload;
    payload[field.key] = row[field.key] === '' ? null : row[field.key];
    return payload;
  }, {});
}

async function fetchDataset(kind) {
  const config = datasetConfig[kind];
  let query = supabase.from(config.primary).select('*');
  if (config.order) query = query.order(config.order, { ascending: kind === 'events' });

  const primary = await query;
  if (!primary.error || !config.fallback) {
    return { table: config.primary, source: config.primary, data: primary.data || [], error: primary.error };
  }

  let fallbackQuery = supabase.from(config.fallback).select('*');
  if (config.fallbackOrder) fallbackQuery = fallbackQuery.order(config.fallbackOrder, { ascending: true });
  else if (config.order) fallbackQuery = fallbackQuery.order(config.order, { ascending: false });

  const fallback = await fallbackQuery;
  return { table: config.fallback, source: config.fallback, data: fallback.data || [], error: fallback.error };
}

export default function AdminDashboard({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [toast, setToast] = useState('');
  const [rows, setRows] = useState({ users: [], events: [], documents: [] });
  const [sources, setSources] = useState({ users: 'profiles', events: 'events', documents: 'documents' });
  const [errors, setErrors] = useState({});

  const activeFields = useMemo(
    () => fields[activeTab].filter((field) => !field.source || field.source === sources[activeTab]),
    [activeTab, sources]
  );
  const registeredUsers = useMemo(
    () => rows.users.filter((row) => row.id && row.email && row.role !== 'admin'),
    [rows.users]
  );

  const verifyAdmin = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/login');
      return false;
    }

    const response = await fetch('/api/admin/verify', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      sessionStorage.removeItem('role');
      router.replace('/dashboard');
      return false;
    }

    sessionStorage.setItem('role', 'admin');
    setVerified(true);
    return true;
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(tabs.map((tab) => fetchDataset(tab.id)));

    setRows({
      users: results[0].data,
      events: results[1].data,
      documents: results[2].data,
    });
    setSources({
      users: results[0].source,
      events: results[1].source,
      documents: results[2].source,
    });
    setErrors({
      users: results[0].error?.message,
      events: results[1].error?.message,
      documents: results[2].error?.message,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const ok = await verifyAdmin();
      if (ok && mounted) await loadData();
    }

    boot();

    return () => {
      mounted = false;
    };
  }, [loadData, verifyAdmin]);

  const updateRow = (kind, localId, key, value) => {
    setRows((current) => ({
      ...current,
      [kind]: current[kind].map((row) => ((row.__localId || row.id) === localId ? { ...row, [key]: value } : row)),
    }));
  };

  const addRow = (kind) => {
    const localId = crypto.randomUUID();
    setRows((current) => ({
      ...current,
      [kind]: [{ ...emptyRows[kind], __draft: true, __localId: localId }, ...current[kind]],
    }));
  };

  const saveRow = async (kind, row) => {
    const localId = row.__localId || row.id;
    setSaving(`${kind}-${localId}`);
    setToast('');

    const payload = getEditablePayload(row, fields[kind], sources[kind]);
    const userId = row.assigned_user_id || row.created_by || row.client_id;
    const draftIntervention = kind === 'events' && row.__draft && sources.events === 'activities';

    if (draftIntervention && !userId) {
      setToast('Errore: seleziona un utente registrato.');
      setSaving('');
      return;
    }

    const request = draftIntervention
      ? createAdminIntervention({
          user_id: userId,
          title: row.title,
          description: row.description,
          status: row.status || 'pending',
          priority: row.priority || 'Normale',
          start_at: row.start_at,
          end_at: row.end_at,
          location: row.location,
        })
      : row.__draft
        ? supabase.from(sources[kind]).insert([payload]).select().single()
        : supabase.from(sources[kind]).update(payload).eq('id', row.id).select().single();

    const { data: requestData, error } = await request;
    const data = draftIntervention ? requestData?.event : requestData;

    if (error) {
      setToast(`Errore: ${error.message}`);
    } else {
      setRows((current) => ({
        ...current,
        [kind]: current[kind].map((item) => ((item.__localId || item.id) === localId ? data : item)),
      }));
      setToast('Modifiche salvate.');
    }

    setSaving('');
  };

  const deleteRow = async (kind, row) => {
    const localId = row.__localId || row.id;
    if (row.__draft) {
      setRows((current) => ({ ...current, [kind]: current[kind].filter((item) => (item.__localId || item.id) !== localId) }));
      return;
    }

    if (!window.confirm('Eliminare questo elemento?')) return;

    setSaving(`${kind}-${localId}`);
    setToast('');
    const { error } = await supabase.from(sources[kind]).delete().eq('id', row.id);

    if (error) {
      setToast(`Errore: ${error.message}`);
    } else {
      setRows((current) => ({ ...current, [kind]: current[kind].filter((item) => item.id !== row.id) }));
      setToast('Elemento eliminato.');
    }

    setSaving('');
  };

  const uploadDocument = async (file) => {
    if (!file) return;

    setSaving('document-upload');
    setToast('');

    const storagePath = `cliente/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error } = await supabase.storage.from('docs').upload(storagePath, file);

    if (error) {
      setToast(`Upload non riuscito: ${error.message}`);
      setSaving('');
      return;
    }

    const { data: publicData } = supabase.storage.from('docs').getPublicUrl(storagePath);
    setRows((current) => ({
      ...current,
      documents: [
        {
          ...emptyRows.documents,
          name: file.name,
          file_url: publicData.publicUrl,
          __draft: true,
          __localId: crypto.randomUUID(),
        },
        ...current.documents,
      ],
    }));
    setToast('File caricato. Salva la riga documento.');
    setSaving('');
  };

  if (!verified || loading) {
    return (
      <main className="main-content admin-dashboard">
        <div className="loading-screen inline-loading">
          <div className="spinner" aria-label="Caricamento" />
        </div>
      </main>
    );
  }

  return (
    <main className="main-content admin-dashboard">
      <header className="dashboard-header">
        <div className="welcome-text">
          <span className="eyebrow admin-eyebrow">Gestione Aziendale</span>
          <h1>Dashboard Crotti</h1>
          <p>{user?.email}</p>
        </div>
        <div className="status-badge glass-card">
          <div className="status-icon">AD</div>
          <div className="status-info">
            <strong>Admin verificato</strong>
            <span>RLS Supabase attiva.</span>
          </div>
        </div>
      </header>

      {toast && <div className={`toast-message ${toast.startsWith('Errore') || toast.includes('non riuscito') ? 'error' : 'success'}`}>{toast}</div>}

      <div className="portal-tabs" role="tablist" aria-label="Sezioni admin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={activeTab === tab.id ? 'active' : ''}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="admin-panel glass-card">
        <div className="admin-panel-head">
          <div>
            <span className="admin-source">{sources[activeTab]}</span>
            <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
          </div>
          <div className="admin-actions">
            {activeTab === 'documents' && (
              <label className="btn-secondary file-button">
                Upload
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(event) => uploadDocument(event.target.files?.[0])}
                  disabled={saving === 'document-upload'}
                />
              </label>
            )}
            <button type="button" className="btn-primary-small" onClick={() => addRow(activeTab)}>
              Nuovo
            </button>
          </div>
        </div>

        {errors[activeTab] && <div className="notice-bar admin-error">{errors[activeTab]}</div>}

        <div className="table-wrap admin-table-wrap">
          <table>
            <thead>
              <tr>
                {activeFields.map((field) => (
                  <th key={field.key}>{field.label}</th>
                ))}
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rows[activeTab].map((row) => {
                const localId = row.__localId || row.id;
                const rowSaving = saving === `${activeTab}-${localId}`;

                return (
                  <tr key={localId}>
                    {activeFields.map((field) => (
                      <td key={field.key}>
                        <EditableField
                          field={field}
                          row={row}
                          value={row[field.key] ?? ''}
                          users={registeredUsers}
                          onChange={(value) => updateRow(activeTab, localId, field.key, value)}
                        />
                      </td>
                    ))}
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn-secondary" disabled={rowSaving} onClick={() => saveRow(activeTab, row)}>
                          {rowSaving ? 'Salvo...' : 'Salva'}
                        </button>
                        <button type="button" className="danger-button" disabled={rowSaving} onClick={() => deleteRow(activeTab, row)}>
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows[activeTab].length && (
                <tr>
                  <td colSpan={activeFields.length + 1}>Nessun record disponibile.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function EditableField({ field, row, users = [], value, onChange }) {
  if (field.readOnly || (field.draftOnly && !row.__draft)) {
    return <span className="mono">{formatValue(value) || '-'}</span>;
  }

  if (field.type === 'user-select') {
    return (
      <select className="admin-input" value={value || ''} onChange={(event) => onChange(event.target.value)}>
        <option value="">Seleziona utente</option>
        {users.map((item) => (
          <option key={item.id} value={item.id}>
            {item.email}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'select') {
    return (
      <select className="admin-input" value={value || 'user'} onChange={(event) => onChange(event.target.value)}>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'textarea') {
    return <textarea className="admin-input admin-textarea" value={value || ''} onChange={(event) => onChange(event.target.value)} />;
  }

  return (
    <input
      className="admin-input"
      type={field.type || 'text'}
      value={field.type === 'datetime-local' ? formatValue(value) : value || ''}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
