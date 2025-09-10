import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key) ? createClient(url, key, {
  auth: { persistSession: false },
}) : null

export function isSupabaseReady() {
  return !!supabase
}

// ---- Profiles ----
export async function fetchProfiles() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, baseline, pack, mode, target_today')
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    baseline: r.baseline,
    pack: r.pack,
    mode: r.mode,
    targetToday: r.target_today,
  }))
}

export async function upsertProfile(p) {
  if (!supabase) return { data: null }
  // upsert by id if provided, else by name (unique)
  const payload = {
    id: p.id || undefined,
    name: p.name,
    baseline: p.baseline,
    pack: p.pack,
    mode: p.mode,
    target_today: p.targetToday,
  }
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'name' })
    .select()
    .single()
  if (error) throw error
  return { data }
}

// ---- Daily stats ----
export async function fetchDailyStats(profileId, fromISO) {
  if (!supabase || !profileId) return []
  const q = supabase
    .from('daily_stats')
    .select('date, smoked, target, points')
    .eq('profile_id', profileId)
  const { data, error } = fromISO
    ? await q.gte('date', fromISO).order('date', { ascending: false })
    : await q.order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function upsertDailyStat({ profile_id, date, smoked, target, points }) {
  if (!supabase) return { data: null }
  const { data, error } = await supabase
    .from('daily_stats')
    .upsert({ profile_id, date, smoked, target, points })
  if (error) throw error
  return { data }
}

// ---- Activities ----
export async function fetchActivities(limit = 30) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('activities')
    .select('id, created_at, icon, text, profile_id')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function addActivity({ icon, text, profile_id }) {
  if (!supabase) return { data: null }
  const payload = { icon, text, profile_id }
  const { data, error } = await supabase
    .from('activities')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return { data }
}

export async function deleteActivity(id) {
  if (!supabase || !id) return { data: null }
  const { data, error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
  return { data }
}

export function subscribeActivities({ onInsert, onDelete } = {}) {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('realtime:activities')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
      onInsert && onInsert(payload.new)
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'activities' }, (payload) => {
      onDelete && onDelete(payload.old)
    })
    .subscribe()
  return () => {
    try { supabase.removeChannel(channel) } catch {}
  }
}

