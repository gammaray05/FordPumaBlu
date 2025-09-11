import React, { useState } from 'react'

export default function Onboard({ onDone }){
  const [n,setN]=useState('')
  const [c,setC]=useState('')
  const [pk,setPk]=useState('')
  const [m,setM]=useState('reduction')
  const [ti,setTi]=useState('')
  const ok=n.trim()&&Number(c)>0&&Number(pk)>0&&(m==='zero'||Number(ti)>=0)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 p-4 flex flex-col">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl m-auto">
        <h2 className="mb-1 text-lg font-bold text-[#111]">Crea un nuovo profilo</h2>
        <p className="mb-4 text-sm text-[#111]/85">Stai creando un <b>nuovo utente Ford Puma Blu</b>. Questi dati servono per calcolare risparmi e progressi.</p>
        <label className="mb-3 block text-sm">Nome
          <input value={n} onChange={e=>setN(e.target.value)} placeholder="Es. Attilio" className="mt-1 w-full rounded-xl border border-black/10 p-2"/>
        </label>
        <label className="mb-3 block text-sm">Media di sigarette fumate al giorno
          <input type="number" inputMode="numeric" value={c} onChange={e=>setC(e.target.value)} placeholder="Es. 12" className="mt-1 w-full rounded-xl border border-black/10 p-2"/>
        </label>
        <label className="mb-3 block text-sm">Costo medio che spendi per un pacchetto da 20
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-xl bg-black/5 px-2 py-2 text-sm">€</span>
            <input type="number" step="0.01" inputMode="decimal" value={pk} onChange={e=>setPk(e.target.value)} placeholder="Es. 6.50" className="w-full rounded-xl border border-black/10 p-2"/>
          </div>
        </label>
        <div className="mb-3">
          <div className="mb-1 text-sm font-semibold">Vuoi ridurre o fumare zero? (Potrai modificarlo dal profilo)</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>setM('reduction')} className={`btn px-3 py-2 text-sm font-bold text-white ${m==='reduction'?'ring-2 ring-white':''}`} style={{background:'var(--t)'}}>Riduzione</button>
            <button onClick={()=>setM('zero')} className={`btn px-3 py-2 text-sm font-bold text-white ${m==='zero'?'ring-2 ring-white':''}`} style={{background:'var(--r)'}}>Zero</button>
          </div>
        </div>
        {m==='reduction' && (
          <label className="mb-4 block text-sm">Target iniziale di sigarette al giorno
            <input type="number" inputMode="numeric" value={ti} onChange={e=>setTi(e.target.value)} placeholder="Es.: 4" className="mt-1 w-full rounded-xl border border-black/10 p-2"/>
          </label>
        )}
        <div className="mb-3 text-xs text-[#111]/85">
          Suggerimento: <b>più il tuo target è restrittivo</b> rispetto alla tua media, <b>più punti guadagnerai</b> ogni giorno. Potrai <b>modificare</b> target e modalità in qualsiasi momento dalla sezione <b>Profilo</b>.
        </div>
        <button disabled={!ok} onClick={()=>onDone(n,Number(c),Number(pk),m,m==='zero'?0:Number(ti||c))} className="btn w-full py-3 text-sm font-bold text-white disabled:opacity-60" style={{background:'var(--g2)'}}>Crea profilo</button>
      </div>
    </div>
  )
}
