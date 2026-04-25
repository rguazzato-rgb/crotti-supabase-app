# Next.js + Supabase Auth Starter

Un progetto Next.js 13+ (App Router) con autenticazione Supabase pronta all'uso.

## 🚀 Setup Locale

1. **Clona o scarica il progetto.**
2. **Installa le dipendenze:**
   ```bash
   npm install
   ```
3. **Configura le variabili d'ambiente:**
   Crea un file `.env.local` nella root del progetto (usa `.env.local` come base) e aggiungi le tue chiavi Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=la_tua_url_di_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=la_tua_anon_key
   ```
4. **Configura il Database su Supabase:**
   Copia e incolla il contenuto di `supabase_setup.sql` nell'Editor SQL di Supabase per creare la tabella `users` e i trigger di sincronizzazione.
5. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment su Vercel

### Passo 1: Prepara il Repository
Assicurati che il codice sia su GitHub, GitLab o Bitbucket.

### Passo 2: Crea un nuovo progetto su Vercel
1. Vai su [Vercel Dashboard](https://vercel.com/dashboard) e clicca su **"Add New > Project"**.
2. Importa il tuo repository.

### Passo 3: Configura le Variabili d'Ambiente
Durante il setup (o in `Settings > Environment Variables`), aggiungi:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 4: Deploy
Clicca su **"Deploy"**. Vercel rileverà automaticamente Next.js e configurerà la build.

## 🛠 Struttura del Progetto

- `app/`: Pagine e Layout (App Router).
- `components/`: Componenti UI (AuthForm, ProtectedRoute).
- `lib/`: Configurazioni (supabaseClient.js).
- `supabase_setup.sql`: Script SQL per inizializzare il database.

## 🔒 Sicurezza
- **Row Level Security (RLS)**: Abilitato sulla tabella `users` per proteggere i dati.
- **Protected Routes**: Componente client-side per gestire l'accesso alle pagine riservate.
- **Client-side Auth**: Utilizzo di `@supabase/supabase-js` per una gestione fluida delle sessioni.
