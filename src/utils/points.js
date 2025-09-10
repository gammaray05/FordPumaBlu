import { clamp } from './calc.js'

// Config defaults per nuovo modello
export const SCORE_CFG = {
  baseWeights: { linear: 0.7, nonlinear: 0.3 },
  zeroDayBonus: 20,
  targetBonusMax: 10,
  scoreCap: 150,
}

// Nuovo punteggio normalizzato (indipendente dal target per la base):
// - Base verso zero: p0 = 1 - C / max(B,1) (clamp 0..1)
// - Base score: 100 * (wL*p0 + wN*p0^2)
// - Zero-day bonus: +20 se C==0
// - Bonus conformità alla severità del target se rispettato: C<=T → s_max * (1 - T/max(B,1))
// - Nessun overachieve e nessun fattore di ambizione; cap 150
export const computePoints = (baseline, target, smoked) => {
  const B = Math.max(0, Number.isFinite(baseline) ? baseline : 0)
  const T = Math.max(0, Number.isFinite(target) ? target : 0)
  const C = Math.max(0, Number.isFinite(smoked) ? smoked : 0)

  const Bn = Math.max(1, B)
  const p0 = clamp(1 - C / Bn)

  const { linear: wL, nonlinear: wN } = SCORE_CFG.baseWeights
  const Base = 100 * (wL * p0 + wN * p0 * p0)

  const Zero = (C === 0) ? SCORE_CFG.zeroDayBonus : 0
  const sMax = SCORE_CFG.targetBonusMax
  const targetBonus = (C <= T) ? (sMax * (1 - (T / Bn))) : 0

  const S = Math.round(Base + Zero + targetBonus)
  return Math.max(0, Math.min(SCORE_CFG.scoreCap, S))
}

export const lvlStep = (n) => Math.round(250 * Math.pow(1.25, Math.max(0, n - 1)))
export const levelInfo = (p) => {
  let lvl = 1, start = 0, step = lvlStep(1)
  for (let i = 0; i < 100; i++) {
    const end = start + step
    if (p < end) return { lvl, start, end, have: p - start, need: end - p, pct: Math.max(0, Math.min(100, Math.round((p - start) / step * 100))) }
    start = end; lvl++; step = lvlStep(lvl)
  }
  return { lvl: 100, start, end: start + step, have: p - start, need: start + step - p, pct: Math.round((p - start) / step * 100) }
}
export const levelFrom = (p) => levelInfo(p).lvl
