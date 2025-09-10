export default function ChallengePicker({ list, onPick, onClose }){
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col">
        <div className="sticky top-0 z-10 bg-white p-5 pb-3 flex items-center justify-between border-b border-black/5">
          <h2 className="text-lg font-bold text-[#111]">Scegli una sfida</h2>
          <button onClick={onClose} className="btn px-3 py-1 text-xs font-bold text-white" style={{background:'var(--g2)'}}>Chiudi</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-2 pr-3">
          {list.map(p=> (
            <button key={p.name} onClick={()=>onPick(p)} className="card w-full p-3 text-left hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#111]">{p.name}</div>
                  <div className="text-xs text-[#111]/85">{p.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip px-2 py-1 text-sm font-bold rounded-md" style={{background:'#fff'}}> {p.days} giorni</span>
                  <span className="chip px-2 py-1 text-sm font-bold rounded-md" style={{background:'#fff'}}> +{p.reward} pt</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
