@echo off
REM Script per inviare una notifica push di test.

echo Invio della notifica di test in corso...

REM --- MODIFICA ESATTAMENTE QUI ---
REM Sostituisci la scritta IL_TUO_CRON_SECRET_QUI con il tuo vero CRON_SECRET
set CRON_SECRET=H4ya89BACkeNrd7Q


REM Esecuzione della chiamata alla funzione Supabase
curl -X POST "https://kgllzazurmraxypklvbc.supabase.co/functions/v1/send-notifications" ^
-H "Content-Type: application/json" ^
-H "X-Cron-Secret: %CRON_SECRET%"

echo.
echo.
echo Fatto. Controlla se hai ricevuto la notifica sul tuo dispositivo.

REM Lascia la finestra aperta per leggere l'output
pause