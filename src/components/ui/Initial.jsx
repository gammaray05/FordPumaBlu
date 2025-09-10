const AV_COLS = [
  'var(--g1)','var(--g2)','var(--g3)',
  'linear-gradient(135deg,#7B42FF,#00B7FF)',
  'linear-gradient(135deg,#FF7A00,#FFD400)',
  'linear-gradient(135deg,#FF2EA6,#7B42FF)',
  'linear-gradient(135deg,#00E3B5,#00B7FF)'
]
const avaColor = (s) => { let h = 0; for (let i = 0; i < (s || '').length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0 } return AV_COLS[h % AV_COLS.length] }

export default function Initial({ s }) {
  const c = s?.trim()?.[0]?.toUpperCase() || '?'
  const bg = avaColor(s || '?')
  return (
    <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold text-white" style={{ background: bg }}>{c}</div>
  )
}

