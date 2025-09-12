import { clamp } from './calc.js'

/**
 * Sistema di punteggio “fair” per 1 round/giorno (auto-tuned):
 * - Curvatura adattiva: punisce forte quando C→B, specie se B è alta.
 * - Near-miss monotono per B basse: piccolo extra a C>=B che decresce linearmente (niente picchi).
 * - Penalità per consumo assoluto: frena i punti quando C è alto in termini assoluti.
 * - Bonus zero-day e bonus target (solo se T≤B e C≤T). Nessun overachieve/bonus negativo.
 */

export const SCORE_CFG = {
  zeroDayBonus: 20,
  targetBonusMax: 10,
  scoreCap: 150,

  // Curvatura adattiva (parametri ottimizzati)
  curvature: {
    min: 1.1167098746017665,
    max: 2.387043415678317,
    maxAtB: 23.459600929153567,
  },

  // Near-miss monotono per baseline basse (parametri ottimizzati)
  nearMiss: {
    bThreshold: 5.70224546823322,      // attivo se 0 < B ≤ bThreshold
    scaleMax: 0.25048555105918224,     // ampiezza massima quando B→0
    scalePow: 1.4314746432153327,      // come scalaEff cala con B
    widthAbs: 2.0891984130371206,      // ampiezza assoluta del cuscinetto
    widthPct: 0.6056780862804592,      // alternativa proporzionale: max(widthAbs, widthPct*B)
  },

  // Penalità per consumo assoluto (parametri ottimizzati)
  absPenalty: {
    c0: 6.088731303821968,
    expo: 0.73430969093362,
  },
}

/**
 * Calcola i punti del giorno.
 * @param {number} baseline - B = baseline personale (media/EMA recente)
 * @param {number} target   - T = target giornaliero impostato dall’utente (≥0)
 * @param {number} smoked   - C = sigarette odierne (≥0)
 * @returns {number} punti totali (0..scoreCap)
 */
export const computePoints = (baseline, target, smoked) => {
  const B = Math.max(0, Number.isFinite(baseline) ? baseline : 0)
  const T = Math.max(0, Number.isFinite(target) ? target : 0)
  const C = Math.max(0, Number.isFinite(smoked) ? smoked : 0)

  const Bn = Math.max(1, B) // evita divisioni per 0

  // --- 1) Base “verso zero” con curvatura adattiva su B ---
  const pRel = clamp(1 - C / Bn) // 0..1
  const { min: gMin, max: gMax, maxAtB: gSat } = SCORE_CFG.curvature
  const logDen = Math.log(gSat || 20)
  const logRatio = logDen > 0 ? Math.log(Bn) / logDen : 0 // ~0..1
  const gamma = gMin + (gMax - gMin) * clamp(logRatio)    // esponente cresce con B
  let pBase = Math.pow(pRel, gamma)                        // più ripido quando B è alta

  // --- 2) Near-miss monotono per B basse (C ≥ B) ---
  const nmCfg = SCORE_CFG.nearMiss
  if (B > 0 && B <= nmCfg.bThreshold && C >= B) {
    const smallness = clamp((nmCfg.bThreshold - B) / nmCfg.bThreshold) // 0..1
    const scaleEff = nmCfg.scaleMax * Math.pow(smallness, nmCfg.scalePow)
    const widthEff = Math.max(nmCfg.widthAbs, nmCfg.widthPct * B)
    const over = C - B
    const nm = scaleEff * clamp(1 - over / widthEff)      // max a C=B, poi decresce → 0
    pBase = clamp(pBase + nm)                              // somma soft; resta in [0,1]
  }

  // --- 3) Penalità per consumo assoluto ---
  const { c0, expo } = SCORE_CFG.absPenalty
  const absFactor = Math.pow(1 / (1 + C / (c0 || 1)), expo) // 0..1
  const Base = 100 * pBase * absFactor

  // --- 4) Bonus zero-day ---
  const Zero = (C === 0) ? SCORE_CFG.zeroDayBonus : 0

  // --- 5) Bonus target (solo se rispettato; niente negativo/overachieve) ---
  const sMax = SCORE_CFG.targetBonusMax
  const targetBonus = (C <= T && T <= Bn) ? (sMax * (1 - (T / Bn))) : 0

  // --- 6) Somma, arrotonda, cap ---
  const S = Math.round(Base + Zero + targetBonus)
  return Math.max(0, Math.min(SCORE_CFG.scoreCap, S))
}

/**
 * Progressione livelli: XP necessari dal livello n al n+1.
 */
export const lvlStep = (n) => Math.round(200 * Math.pow(1.33, Math.max(0, n - 1)));

/**
 * Info sul livello corrente dato il totale di punti/XP p.
 * Ritorna: { lvl, start, end, have, need, pct }
 */
export const levelInfo = (p) => {
  let lvl = 1, start = 0, step = lvlStep(1)
  for (let i = 0; i < 100; i++) {
    const end = start + step
    if (p < end) {
      return {
        lvl,
        start,
        end,
        have: p - start,
        need: end - p,
        pct: Math.max(0, Math.min(100, Math.round((p - start) / step * 100))),
      }
    }
    start = end
    lvl++
    step = lvlStep(lvl)
  }
  return {
    lvl: 100,
    start,
    end: start + step,
    have: p - start,
    need: start + step - p,
    pct: Math.round((p - start) / step * 100),
  }
}

/** Ritorna il livello corrente dato p. */
export const levelFrom = (p) => levelInfo(p).lvl

/* --------------------------------------------------------------------------
   NOTE
   - Monotonia: per C≥1 la curva è non-crescente (il salto a C=0 è dovuto al bonus zero-day).
   - Severità: C=B ≈ 0 pt per B alte; su B basse c'è un piccolo cuscinetto (near-miss) a C≥B.
   - Fairness: a C assoluto fisso i punti non aumentano con B; C alti restano penalizzati.
   - Cap globale a 150; bonus target solo se T ≤ B e C ≤ T.
-------------------------------------------------------------------------- */
