// LocalStorage fallback for daily_stats

const keyFor = (profileId) => `fbl_stats_${profileId}`

function readMap(profileId){
  try {
    const raw = localStorage.getItem(keyFor(profileId))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function writeMap(profileId, obj){
  try { localStorage.setItem(keyFor(profileId), JSON.stringify(obj)) } catch {}
}

export function loadDailyStatsLocal(profileId, fromISO){
  const m = readMap(profileId)
  const rows = Object.entries(m).map(([date, v]) => ({ date, ...(v||{}) }))
  const flt = fromISO ? rows.filter(r => r.date >= fromISO) : rows
  return flt.sort((a,b)=> (a.date<b.date?1:-1))
}

export function upsertDailyStatLocal(profileId, { date, smoked, target, points }){
  const m = readMap(profileId)
  const prev = m[date] || {}
  m[date] = { ...prev, smoked, target, points }
  writeMap(profileId, m)
}

