import { toISO, addDays, todayStr, fromDayKey } from '../utils/dates.js'

export const dayKeyAdd = (key, n) => toISO(addDays(fromDayKey(key), n))

const isWeekendKey = (key) => {
  const d = fromDayKey(key).getDay() // 0 Sun .. 6 Sat
  return d === 6 || d === 0
}

const nextSaturdayKey = (key) => {
  const d = fromDayKey(key)
  const dow = d.getDay()
  const delta = (6 - dow + 7) % 7 || 7 // next Saturday (if today Sat, choose next week)
  return toISO(addDays(d, delta))
}

export const CHALLENGES = {
  weekend_zero: {
    key: 'weekend_zero',
    name: 'Weekend totalmente smoke-free',
    days: 2,
    reward: 100,
    startFor: (todayKey) => nextSaturdayKey(todayKey),
    evalDayOk: (k, ctx) => ctx.getSmoked(k) === 0,
  },
  week_max5: {
    key: 'week_max5',
    name: 'Settimana da massimo cinque',
    days: 7,
    reward: 85,
    startFor: (todayKey) => todayKey,
    evalDayOk: (k, ctx) => ctx.getSmoked(k) <= 5,
  },
  ten_respect_target: {
    key: 'ten_respect_target',
    name: 'Dieci su dieci',
    days: 10,
    reward: 120,
    startFor: (todayKey) => todayKey,
    evalDayOk: (k, ctx) => ctx.getSmoked(k) <= Math.max(0, ctx.getTarget(k)),
  },
  half_target: {
    key: 'half_target',
    name: 'Soglia dimezzata',
    days: 14,
    reward: 140,
    startFor: (todayKey) => todayKey,
    evalDayOk: (k, ctx) => ctx.getTarget(k) <= Math.ceil((ctx.baseline||20)/2) && ctx.getSmoked(k) <= Math.max(0, ctx.getTarget(k)),
  },
  twenty_percent: {
    key: 'twenty_percent',
    name: 'Venti percento in meno',
    days: 14,
    reward: 120,
    startFor: (todayKey) => todayKey,
    evalDayOk: (k, ctx) => ctx.getTarget(k) <= Math.ceil((ctx.baseline||20)*0.8) && ctx.getSmoked(k) <= Math.max(0, ctx.getTarget(k)),
  },
}

export function computeChallengeState(ch, ctx){
  if(!ch) return null
  const def = CHALLENGES[ch.key]
  if(!def) return null
  const todayKey = todayStr()
  const startKey = ch.startKey || def.startFor(todayKey)
  const endKey = dayKeyAdd(startKey, def.days-1)
  const pending = todayKey < startKey
  const within = (todayKey >= startKey && todayKey <= endKey)

  // Build range from start to min(today,end)
  const lastKey = todayKey < endKey ? todayKey : endKey
  let keys = []
  for(let k=startKey; k<=lastKey; k = dayKeyAdd(k, 1)) keys.push(k)

  const results = keys.map(k => {
    // Special case for weekend challenge: only Sat/Sun window
    if(def.key==='weekend_zero' && !isWeekendKey(k)) return { key:k, ok:true, smoked:ctx.getSmoked(k), target:ctx.getTarget(k) }
    const ok = def.evalDayOk(k, ctx)
    return { key:k, ok, smoked:ctx.getSmoked(k), target:ctx.getTarget(k) }
  })
  const anyFail = results.some(r => r.ok===false)
  const daysOk = results.filter(r => r.ok).length
  const doneDays = results.length
  const remaining = Math.max(0, def.days - doneDays)
  let status = 'pending'
  if(pending) status='pending'
  else if(anyFail) status='failed'
  else if(!within && lastKey===endKey) status='won'
  else status='active'

  const startsIn = pending ? Math.ceil((fromDayKey(startKey) - fromDayKey(todayKey))/(24*3600*1000)) : 0
  const endsIn = status==='active' ? Math.ceil((fromDayKey(endKey) - fromDayKey(todayKey))/(24*3600*1000)) : 0

  return {
    key:def.key,
    name:def.name,
    days:def.days,
    reward:def.reward,
    startKey, endKey,
    status,
    daysOk,
    done: Math.min(def.days, doneDays),
    remaining,
    startsIn,
    endsIn,
    results,
  }
}

