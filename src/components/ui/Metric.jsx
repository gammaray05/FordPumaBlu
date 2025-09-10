export default function Metric({ title, icon, val }) {
  return (
    <div className="rounded-xl bg-white/95 p-3 shadow">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-xs text-[#111]/90">{title}</div>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-xl font-extrabold text-[#111]">{val}</div>
    </div>
  )
}

