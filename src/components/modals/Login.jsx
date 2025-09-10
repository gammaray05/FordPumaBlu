import Initial from '../ui/Initial.jsx'

export default function Login({ profiles, onPick, onNew, lastActive }){
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-[#111]">Chi sei?</h2>
        <p className="mb-3 text-xs text-[#111]/85">Seleziona il tuo profilo per continuare.{lastActive? ' (ultimo usato evidenziato)':''}</p>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {(profiles && profiles.length>0) ? profiles.map(p => { const isLast=(lastActive && (p.id===lastActive || p.name===lastActive)); return (
            <button key={(p.id||p.name)} onClick={()=>onPick(p)} className="card w-full p-3 text-left hover:shadow-lg flex items-center justify-between">
              <span className="flex items-center gap-3"><Initial s={p.name} /><span className="text-sm font-semibold text-[#111]">{p.name}</span></span>
              {isLast && (<span className="chip rounded-md px-2 py-1 text-[11px] font-bold" style={{background:'#fff'}}>Ultimo</span>)}
            </button>
          )}) : (
            <div className="text-xs text-[#111]/85">Nessun profilo salvato.</div>
          )}
        </div>
        <button onClick={onNew} className="btn mt-4 w-full py-3 text-sm font-bold text-white" style={{background:'#0057FF'}}>Sono nuovo nella Ford Puma Blu</button>
      </div>
    </div>
  )
}
