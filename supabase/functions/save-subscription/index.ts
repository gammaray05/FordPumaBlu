import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("`save-subscription` function invoked.");

Deno.serve(async (req) => {
  // Gestione della richiesta pre-flight CORS del browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const subscription = await req.json();

    // Validazione di base
    if (!subscription || !subscription.endpoint) {
      throw new Error('Oggetto di sottoscrizione non valido.');
    }

    // Crea un client Supabase con privilegi di amministratore
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Inserisce la nuova sottoscrizione. 
    // Aggiungiamo un controllo per non salvare duplicati.
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .insert({ subscription: subscription })

    if (error && error.code !== '23505') { // 23505 è il codice per violazione di un vincolo unique
      throw error;
    }

    return new Response(JSON.stringify({ message: 'Sottoscrizione salvata con successo' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Errore nel salvataggio della sottoscrizione:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
