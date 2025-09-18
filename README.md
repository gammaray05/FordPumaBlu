# Ford Puma Blu

Applicazione per il tracciamento di attività, sviluppata con Vite, React, e TailwindCSS, con un backend basato su Supabase.

## Stack Tecnologico

- **Frontend**: Vite, React
- **Styling**: TailwindCSS
- **Backend & Database**: Supabase (DB, Auth, Edge Functions, pg_cron)
- **Hosting**: Cloudflare Pages

---

## Configurazione del Progetto

### 1. Setup Locale

1.  Clona il repository.
2.  Installa le dipendenze:
    ```bash
    npm install
    ```
3.  Avvia il server di sviluppo:
    ```bash
    npm run dev
    ```

### 2. Setup del Backend (Supabase)

1.  Crea un nuovo progetto su [Supabase](https://supabase.com/).
2.  Nell'editor SQL del tuo progetto, esegui il contenuto del file `supabase.sql` per creare le tabelle e le policy di sicurezza (RLS).
3.  Vai su **Database > Extensions** e assicurati che `pg_cron` e `pg_net` siano abilitate.

### 3. Variabili d'Ambiente

La configurazione avviene tramite variabili d'ambiente, sia per il frontend che per il backend.

#### Frontend (da impostare su Cloudflare Pages)

Vai su **Settings > Environment variables** nel tuo progetto Cloudflare Pages e imposta le seguenti variabili di produzione:

-   `VITE_SUPABASE_URL`: L'URL del tuo progetto Supabase.
-   `VITE_SUPABASE_ANON_KEY`: La chiave pubblica (anon key) del tuo progetto Supabase.
-   `VITE_VAPID_PUBLIC_KEY`: La chiave VAPID pubblica per le notifiche push.

#### Backend (da impostare su Supabase)

Vai su **Settings > Edge Functions** nel tuo progetto Supabase e aggiungi i seguenti secrets:

-   `VAPID_KEYS_JWK`: Le chiavi VAPID (pubblica e privata) in formato JSON su una singola linea.
-   `CRON_SECRET`: Una password a tua scelta per autorizzare l'invio di notifiche.

---

## Configurazione Notifiche Push

Il sistema si basa su VAPID per l'invio e un Service Worker (`public/sw.js`) per la ricezione.

### 1. Genera le Chiavi VAPID

Nel terminale, esegui questo comando:

```bash
npx web-push generate-vapid-keys
```

### 2. Imposta le Variabili d'Ambiente

1.  **Cloudflare**: Usa la **chiave pubblica** generata per il valore della variabile `VITE_VAPID_PUBLIC_KEY`.
2.  **Supabase**: Crea una stringa JSON con entrambe le chiavi e usala per il secret `VAPID_KEYS_JWK`. Il formato deve essere:
    ```json
    {"publicKey":"LA_TUA_CHIAVE_PUBBLICA","privateKey":"LA_TUA_CHIAVE_PRIVATA"}
    ```

### 3. Prepara le Icone

Il sistema richiede due icone specifiche nella cartella `public/img/`:

-   `icon.png`: L'icona principale dell'app, a colori.
-   `notification.png`: L'icona per la barra di stato di Android. **Deve essere bianca su sfondo trasparente** (es. 48x48px).

---

## Notifiche Schedulate (Cron Job)

Per inviare una notifica ogni giorno a un orario prestabilito, usiamo `pg_cron` per chiamare la nostra Edge Function.

1.  **Abilita le Estensioni**: Assicurati che `pg_cron` e `pg_net` siano abilitate nella dashboard di Supabase (**Database > Extensions**).
2.  **Schedula il Job**: Esegui questo comando nell'SQL Editor per creare il job. Questo esempio lo imposta per le 19:00 UTC.

    ```sql
    SELECT cron.schedule(
      'daily-push-reminder',
      '0 19 * * *', -- Ogni giorno alle 19:00 UTC
      $$
      SELECT net.http_post(
        url:='https://APP.supabase.co/functions/v1/send-notifications',
        headers:='{"Content-Type": "application/json", "X-Cron-Secret": "IL_TUO_CRON_SECRET"}',
        body:='{}'::jsonb
      )
      $$
    );
    ```
    **Importante**: Sostituisci `IL_TUO_CRON_SECRET` con il valore reale che hai impostato nei secrets di Supabase.

---

## Deploy

### Frontend

Il deploy avviene automaticamente su **Cloudflare Pages** ad ogni push sul branch principale.

### Backend (Edge Functions)

Per aggiornare la funzione delle notifiche, esegui il comando:

```bash
npx supabase functions deploy send-notifications --no-verify-jwt
```

---
