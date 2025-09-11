export default function Metric({ title, icon, val, color }) {
  return (
    <div className="rounded-xl bg-white/95 p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{background: color || 'var(--g2)'}}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <div className="text-xs text-[#111]/90">{title}</div>
          <div className="text-xl font-extrabold text-[#111]">{val}</div>
        </div>
      </div>
    </div>
  )
}

