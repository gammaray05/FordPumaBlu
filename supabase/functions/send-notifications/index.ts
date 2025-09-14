import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as webpush from 'jsr:@negrel/webpush'
import { corsHeaders } from '../_shared/cors.ts'

// Inizializzazione lazy (niente await top-level)
let appServerPromise: Promise<unknown> | null = null

async function initAppServer() {
  const jwkStr = Deno.env.get('VAPID_KEYS_JWK')
  if (!jwkStr) {
    throw new Error('Manca VAPID_KEYS_JWK nei secrets: genera le chiavi e impostale prima del deploy.')
  }

  const jwk = JSON.parse(jwkStr)
  const vapidKeys = await webpush.importVapidKeys(jwk)

  // ⚠️ usa una mail/URL reale del tuo progetto
  const appServer = await webpush.ApplicationServer.new({
    contactInformation: 'mailto:push@example.com',
    vapidKeys,
  })

  return appServer
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Autenticazione "cron"
  const authHeader = req.headers.get('X-Cron-Secret')
  if (authHeader !== Deno.env.get('CRON_SECRET')) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Inizializza (una volta sola tra le richieste)
  appServerPromise ??= initAppServer()
  const appServer = await appServerPromise as webpush.ApplicationServer

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: rows, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')

    if (error) throw error

    const payload = JSON.stringify({
      title: '🚬 Ford Puma Blu',
      body: 'Non fumare, ma se fumi almeno ricordati di tracciarle!',
      icon: 'https://fordpumablu.pages.dev/img/notification.png', // <-- Aggiungi questa linea
    })

    for (const { subscription } of rows ?? []) {
      const sub = appServer.subscribe(subscription)
      try {
        await sub.pushTextMessage(payload, { ttl: 86400, topic: 'daily-reminder' })
      } catch (err) {
        if (err instanceof webpush.PushMessageError && err.isGone()) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .match({ 'subscription->>endpoint': subscription.endpoint })
        } else {
          console.error('Errore invio notifica:', err)
        }
      }
    }

    return new Response(
      JSON.stringify({ message: `Notifiche inviate a ${rows?.length ?? 0} iscritti.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )

  } catch (err) {
    console.error('Errore generale:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
