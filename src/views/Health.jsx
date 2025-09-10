export default function Health({daysSF}){
  const ms=[
    {d:0,t:'Dopo 20 minuti',x:'Pressione e battito iniziano a scendere verso valori più sani: il cuore lavora con meno sforzo.'},
    {d:1,t:'12-24 ore',x:"Il monossido di carbonio nel sangue si abbassa e l'ossigeno disponibile per muscoli e cervello aumenta."},
    {d:2,t:'48 ore',x:'La nicotina viene quasi del tutto eliminata: gusto e olfatto iniziano a migliorare.'},
    {d:3,t:'72 ore',x:"I bronchi si rilassano, respirare diventa più facile e c'è più energia per le attività quotidiane."},
    {d:14,t:'2-12 settimane',x:'La circolazione migliora: salire le scale o camminare a passo sostenuto richiede meno fiato e fatica.'},
    {d:30,t:'1-9 mesi',x:'Le ciglia dei bronchi si riprendono e puliscono meglio le vie aeree: meno tosse e catarro, meno infezioni.'},
    {d:365,t:'1 anno',x:'Il rischio di malattia coronarica si riduce circa della metà rispetto a chi continua a fumare.'},
    {d:1825,t:'5 anni',x:'Cala il rischio di ictus: per molte persone si avvicina a quello di chi non ha mai fumato.'},
    {d:3650,t:'10 anni',x:'Il rischio di tumore del polmone scende circa della metà; diminuiscono anche tumori di bocca, gola ed esofago.'},
    {d:5475,t:'15 anni',x:'Il rischio cardiovascolare diventa simile a quello di un non fumatore.'},
  ]
  const perc=(d)=>d===0?100:Math.max(0,Math.min(100,Math.round((daysSF/d)*100)))
  return (
    <div className="space-y-3">
      <div className="card p-4 text-sm text-center text-gray-700">
        <p>Nota: i progressi di salute sono basati sui giorni consecutivi senza fumare. Anche una sola sigaretta azzera i progressi.</p>
      </div>
      {ms.map((m,i)=>{ const p=perc(m.d); return (
        <div key={i} className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#111]">{m.t}</div>
            <div className="chip px-3 py-1 text-base font-extrabold rounded-md" style={{background:'#fff'}}>{p}%</div>
          </div>
          <div className="h-3 w-full bg-black/10 rounded-full"><div className="h-3 rounded-full" style={{width:p+'%',background:'var(--p)'}}/></div>
          <p className="mt-2 text-xs text-[#111]/90">{m.x}</p>
        </div>
      )})}
    </div>
  )
}

