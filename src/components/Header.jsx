export default function Header({ name }){
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/src/assets/icon.png" alt="Ford Puma Blu" className="h-10 w-10 rounded-2xl"/>
        <div>
          <h1 className="text-xl font-bold text-[#111]">Ford Puma Blu</h1>
          <p className="text-xs text-[#111]/85">Traccia, divertiti, smetti.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {name ? (
          <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-[#111] shadow">Ciao, {name}</span>
        ) : null}
      </div>
    </div>
  )
}
