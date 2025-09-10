export default function Field({ k, v }) {
  return (
    <div className="rounded-xl bg-white/95 p-3 shadow">
      <div className="text-xs text-[#111]/85">{k}</div>
      <div className="text-sm font-semibold text-[#111]">{v}</div>
    </div>
  )
}

