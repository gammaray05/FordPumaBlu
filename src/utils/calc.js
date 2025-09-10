// Numeric helpers
export const clamp = (x) => Math.max(0, Math.min(1, x))
export const round2 = (n) => Math.round(n * 100) / 100
export const max0 = (x) => Math.max(0, x)

// Domain helpers
export const avoided = (s, baseline) => {
  const b = Math.max(0, baseline ?? 20)
  const s2 = Math.max(0, s)
  return Math.max(0, Math.round(b - s2))
}

export const dailySaving = (s, pack, baseline) => {
  const b = Math.max(0, baseline ?? 20)
  const p = Math.max(0, pack || 0)
  const s2 = Math.max(0, s)
  const saved = Math.max(0, b - s2)
  return round2((saved * p) / 20)
}

export const indexByDate = (h) => { const m = new Map(); h.forEach(x => m.set(x.date, x)); return m }

import { toISO, addDays, nowWithOffset } from './dates.js'
export const aggregate = (h, pack, baseline, days, onboardDate) => {
  const from = toISO(addDays(nowWithOffset(), -(days - 1)))
  const from2 = (onboardDate && onboardDate > from) ? onboardDate : from
  const within = h.filter(x => x.date >= from2)
  let smoked = 0, saving = 0, avoidedTot = 0
  for (const x of within) {
    const s = x.smoked || 0
    smoked += s
    saving += dailySaving(s, pack, baseline)
    avoidedTot += avoided(s, baseline)
  }
  return { smoked, saving: round2(saving), avoided: avoidedTot }
}

export const upsert = (h, date, smoked) => {
  const i = h.findIndex(x => x.date === date)
  if (i >= 0) { const n = h.slice(); n[i] = { date, smoked }; return n }
  return [{ date, smoked }, ...h]
}
