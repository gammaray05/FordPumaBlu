# Ford Puma Blu

Applicazione per il tracciamento di attività, sviluppata con Vite, React, e TailwindCSS, con un backend basato su Supabase.

## Stack Tecnologico

- **Frontend**: Vite, React
- **Styling**: TailwindCSS
- **Backend & Database**: Supabase (DB, Auth, Edge Functions)
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

### 3. Variabili d'Ambiente

La configurazione avviene tramite variabili d'ambiente, sia per il frontend che per il backend.

#### Frontend (da impostare su Cloudflare Pages)

Vai su **Settings > Environment variables** nel tuo progetto Cloudflare Pages e imposta le seguenti variabili di produzione:

-   `VITE_SUPABASE_URL`: L'URL del tuo progetto Supabase.
-   `VITE_SUPABASE_ANON_KEY`: La chiave pubblica (anon key) del tuo progetto Supabase.
-   `VITE_VAPID_PUBLIC_KEY`: La chiave VAPID pubblica per le notifiche push (vedi sezione Notifiche Push).

#### Backend (da impostare su Supabase)

Vai su **Settings > Edge Functions** nel tuo progetto Supabase e aggiungi i seguenti secrets:

-   `VAPID_KEYS_JWK`: Le chiavi VAPID (pubblica e privata) in formato JSON su una singola linea.
-   `CRON_SECRET`: Una password a tua scelta per autorizzare l'invio di notifiche tramite script.

---

## Configurazione Notifiche Push

Il sistema si basa su VAPID e un Service Worker per inviare e ricevere notifiche.

### 1. Genera le Chiavi VAPID

Nel terminale, esegui questo comando:

```bash
npx web-push generate-vapid-keys
```

Conserva la **chiave pubblica** e la **chiave privata**.

### 2. Imposta le Variabili d'Ambiente

1.  **Cloudflare**: Usa la **chiave pubblica** generata per il valore della variabile `VITE_VAPID_PUBLIC_KEY`.
2.  **Supabase**: Crea una stringa JSON con entrambe le chiavi e usala per il secret `VAPID_KEYS_JWK`. Il formato deve essere:
    ```json
    {"publicKey":"LA_TUA_CHIAVE_PUBBLICA","privateKey":"LA_TUA_CHIAVE_PRIVATA"}
    ```
    *Assicurati che sia tutto su una riga prima di salvarlo come secret.*

### 3. Prepara le Icone

Il sistema richiede due icone specifiche nella cartella `public/img/`:

-   `icon.png`: L'icona principale dell'app, a colori.
-   `notification.png`: L'icona per la barra di stato di Android. **Deve essere bianca su sfondo trasparente** (es. 48x48px).

### 4. Controlla l'URL del Sito

Assicurati che l'URL del tuo sito sia corretto nel file `supabase/functions/send-notifications/index.ts`.

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

## Test delle Notifiche

È presente uno script `test-notifications.bat` per inviare una notifica di prova.

1.  Apri il file `test-notifications.bat`.
2.  Assicurati che il valore di `CRON_SECRET` all'interno dello script corrisponda a quello che hai impostato nei secrets di Supabase.
3.  Esegui lo script per inviare una notifica a tutti i dispositivi iscritti.