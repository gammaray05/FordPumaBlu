import React, { useState } from 'react'

export default function Edit({ initial, onSave, onClose }){
  const [n,setN]=useState(initial.name)
  const [b,setB]=useState(
    (typeof initial.baseline==='number' && isFinite(initial.baseline)) ? String(initial.baseline) : ''
  )
  const [p,setP]=useState(
    (typeof initial.pack==='number' && isFinite(initial.pack)) ? String(initial.pack) : ''
  )
  const bNum = parseFloat(b)
  const pNum = parseFloat(p)
  const ok = n.trim() && !Number.isNaN(bNum) && bNum>0 && !Number.isNaN(pNum) && pNum>0
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111]">Modifica dati</h2>
          <button onClick={onClose} className="btn px-3 py-1 text-xs font-bold text-white" style={{background:'var(--g2)'}}>Chiudi</button>
        </div>
        <label className="mb-3 block text-sm">Nome
          <input value={n} onChange={e=>setN(e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 p-2"/>
        </label>
        <label className="mb-3 block text-sm">Sigarette al giorno che fumavo di media
          <input type="number" inputMode="numeric" value={b} onChange={e=>setB(e.target.value)} placeholder="Es. 12" className="mt-1 w-full rounded-xl border border-black/10 p-2"/>
        </label>
        <label className="mb-4 block text-sm">Spesa per pacchetto da 20
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-xl bg-black/5 px-2 py-2 text-sm">€</span>
            <input type="number" step="0.01" inputMode="decimal" value={p} onChange={e=>setP(e.target.value)} placeholder="Es. 6.50" className="w-full rounded-xl border border-black/10 p-2"/>
          </div>
        </label>
        <button disabled={!ok} onClick={()=>onSave({name:n,baseline:bNum,pack:pNum})} className="btn w-full py-3 text-sm font-bold text-white disabled:opacity-60" style={{background:'var(--p)'}}>Salva</button>
      </div>
    </div>
  )
}
