// Date and formatting helpers
// The "day" starts at 05:00 local time.
const DAY_START_HOUR = 5
const SHIFT_MS = DAY_START_HOUR * 60 * 60 * 1000

const pad = (n) => String(n).padStart(2, '0')
const ymdLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const nowWithOffset = () => {
  const n = new Date()
  return n
}

export const todayStr = () => {
  const shifted = new Date(nowWithOffset().getTime() - SHIFT_MS)
  return ymdLocal(shifted)
}

export const toISO = (d) => {
  // Produce a day key honoring the 05:00 boundary for an arbitrary date
  const shifted = new Date(d.getTime() - SHIFT_MS)
  return ymdLocal(shifted)
}

export const addDays = (d, n) => { const x = new Date(d); x.setDate(d.getDate() + n); return x }
export const fmtDate = (d) => d.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })
export const label = (k) => k === 'day' ? 'Giorno' : k === 'week' ? 'Settimana' : k === 'month' ? 'Mese' : 'Anno'
export const timeAgo = (iso) => {
  try {
    const d = new Date(iso)
    const s = Math.floor(((nowWithOffset().getTime()) - d.getTime()) / 1000)
    if (s < 60) return 'adesso'
    const m = Math.floor(s / 60)
    if (m < 60) return m + (m === 1 ? ' min fa' : ' min fa')
    const h = Math.floor(m / 60)
    if (h < 24) return h + (h === 1 ? ' h fa' : ' h fa')
    const days = Math.floor(h / 24)
    if (days === 1) return 'ieri'
    return days + ' giorni fa'
  } catch { return '' }
}

// Build a Date object from a YYYY-MM-DD day key at local noon
// to avoid timezone parsing pitfalls and the 05:00 boundary shift.
export const fromDayKey = (key) => {
  try {
    const [y,m,d] = key.split('-').map((v)=>parseInt(v,10))
    if (!y || !m || !d) return nowWithOffset()
    return new Date(y, m-1, d, 12, 0, 0)
  } catch { return nowWithOffset() }
}
