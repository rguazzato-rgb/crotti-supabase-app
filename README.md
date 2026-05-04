# Crotti Safety - Next.js + Supabase

Progetto basato su Next.js App Router e Supabase Auth, con UI Crotti Safety e dati operativi letti da tabelle Supabase protette da RLS.

## Setup locale

```bash
npm install
npm run dev
```

Crea `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Apri `http://localhost:3000/login`, registra o accedi con email/password o magic link tramite Supabase Auth, poi vai su `/dashboard`.

Se la porta `3000` e' occupata:

```bash
npm run dev -- -p 3001
```

## Supabase

1. Installa e autentica la CLI:
   ```bash
   supabase login
   supabase init
   supabase link --project-ref your-project-ref
   ```
2. Nel dashboard Supabase apri `SQL Editor`.
3. Esegui il contenuto di `supabase_setup.sql`.
4. In `Authentication > Providers` abilita Email.
5. In `Authentication > URL Configuration` aggiungi `http://localhost:3000/login`, `http://localhost:3000/dashboard`, `http://localhost:3000/reset-password` e gli URL Vercel equivalenti tra i redirect consentiti.

## Recupero Password

- Pagina: `/forgot-password` -> inserisci email.
- Supabase invia il link con redirect a `${NEXT_PUBLIC_SITE_URL}/reset-password`.
- Pagina: `/reset-password` -> imposta nuova password.
- Il reset usa `supabase.auth.resetPasswordForEmail()` e completa il cambio con `supabase.auth.updateUser({ password })` dopo la sessione temporanea del link email.
- In produzione configura `NEXT_PUBLIC_SITE_URL=https://tuo-dominio.vercel.app` nelle environment variables Vercel e aggiungi `https://tuo-dominio.vercel.app/reset-password` nei redirect consentiti di Supabase.

## Deploy su Vercel

1. Importa su Vercel il repository `crotti-supabase-app` o il repository consolidato.
2. In `Project Settings > Environment Variables` aggiungi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. In Supabase aggiungi l'URL Vercel e `/reset-password` in `Authentication > URL Configuration > Redirect URLs`.
4. Build command: `npm run build`.
5. Output directory: lascia il valore automatico di Next.js.
6. Deploy.

## UI e asset

- La login e le pagine password usano `next/image` con lo sfondo ottimizzato `public/images/login-bg.jpg`.
- Le animazioni auth usano `framer-motion`.
- Gli stili globali sono in `app/globals.css` e importano `styles/crotti.css`.
- Le animazioni sono leggere e rispettano `prefers-reduced-motion`.

## Sezione Eventi

La pagina `/eventi` mostra il calendario aziendale Crotti Safety per manutenzioni, ispezioni e controlli programmati.

- Naviga tra Giorno / Settimana / Mese.
- Calendario localizzato in italiano con `date-fns/locale/it`.
- Eventi demo caricati da `components/Calendar.js`, pronti per una futura integrazione con tabelle Supabase.
- `react-big-calendar` viene caricato lato client per mantenere il rendering App Router compatibile con Vercel.
- Nel portale `/dashboard`, gli utenti vedono il tab `Eventi` con gli appuntamenti assegnati al proprio account.
- Gli admin vedono tutti gli appuntamenti e usano `Gestione attivita` per inserire manualmente interventi per utenti registrati.
- La tabella Supabase primaria per questa sezione e' `activities`; se non esiste ancora, il codice mantiene un fallback sulle vecchie tabelle `events`/`jobs`.

## Dipendenze aggiuntive

```bash
npm install react-big-calendar date-fns
```

## Struttura finale

```text
app/
  page.js
  forgot-password/page.js
  login/page.js
  reset-password/page.js
  dashboard/page.js
  eventi/page.js
  services/page.js
components/
  AuthForm.js
  Calendar.js
  CrottiPortal.jsx
  Footer.jsx
  Header.jsx
  ProtectedRoute.js
  ServicesOverview.jsx
lib/
  crottiData.js
  supabaseClient.js
public/
  crotti-logo.png
styles/
  crotti.css
app/globals.css
package.json
README.md
supabase_setup.sql
```

## Migrazione da Repo A

- `views/index.html` e `views/app.js` sono stati convertiti in componenti React dentro `components/CrottiPortal.jsx`.
- `views/style.css` e il tema Crotti sono stati adattati in `styles/crotti.css`, importato da `app/globals.css`.
- `views/logo.png` e' stato copiato in `public/crotti-logo.png`.
- `controllers/mainController.js` e i model mock sono stati sostituiti da funzioni Supabase in `lib/crottiData.js`.
- Le route Express sono diventate pagine App Router: `/login`, `/dashboard`, `/services`.

## Snippet CRUD Supabase

```js
import { supabase } from '@/lib/supabaseClient';

const { data: users, error } = await supabase.from('users').select('*');

const { data: inserted, error: insertError } = await supabase
  .from('service_requests')
  .insert([{ title: 'Estintore scarico', description: 'Magazzino B', requested_by: user.id }])
  .select();

const { data: updated, error: updateError } = await supabase
  .from('jobs')
  .update({ status: 'completed' })
  .eq('id', jobId)
  .select();

const { error: deleteError } = await supabase
  .from('documents')
  .delete()
  .eq('id', documentId);
```

## Pagine incluse

- Login form pronto: `components/AuthForm.js`, usato in `/login` e `/`.
- Dashboard protetta lato client: `app/dashboard/page.js`, con `ProtectedRoute`.
- Lista dati da tabella `users`: tab `Utenti` dentro `components/CrottiPortal.jsx`.
- Eventi: `app/eventi/page.js`, con calendario giorno/settimana/mese in `components/Calendar.js`.
- Servizi: `app/services/page.js`.

## Note sicurezza

- Nessuna chiave Supabase reale deve essere committata: usa solo variabili in `.env.local` o nelle environment variables di Vercel.
- La tabella `users` ha RLS per mostrare solo il profilo dell'utente autenticato.
- Le tabelle operative sono leggibili solo da utenti autenticati; `jobs` e `documents` limitano i dati associati a un utente quando il relativo owner e' valorizzato.
- Le richieste assistenza possono essere inserite solo quando `requested_by` coincide con l'utente autenticato.
