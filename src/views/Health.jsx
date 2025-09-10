export default function Health({daysSF}){
  const ms=[
    {d:1, t:'Dopo 24 ore', x:'Il corpo inizia a guarire. La pressione sanguigna e la frequenza cardiaca si normalizzano, riducendo lo sforzo del cuore. I livelli di monossido di carbonio nel sangue scendono, aumentando ossigeno per organi vitali come cervello e muscoli.'},
    {d:2, t:'Dopo 48 ore', x:'Le terminazioni nervose danneggiate dal fumo iniziano a ricrescere. L\'olfatto e il gusto, prima alterati, diventano più acuti. La nicotina è quasi completamente eliminata dal corpo.'},
    {d:3, t:'Dopo 72 ore', x:'I bronchioli nei polmoni si rilassano, aumentando la capacità polmonare e rendendo la respirazione più facile. Si può notare un aumento dei livelli di energia generale.'},
    {d:14, t:'2-12 settimane', x:'La circolazione sanguigna migliora. I polmoni funzionano fino al 30% meglio. Attività fisiche come camminare o correre diventano meno faticose, perché cuore e muscoli ricevono più ossigeno.'},
    {d:90, t:'3-9 mesi', x:'Le ciglia polmonari, piccole strutture che espellono muco e detriti, ricominciano a funzionare. Questo porta a una riduzione di tosse, congestione e rischio di infezioni respiratorie.'},
    {d:365, t:'1 anno', x:'Il rischio di infarto e altre malattie coronariche si dimezza. Le pareti delle arterie, non più danneggiate dal fumo, diventano più sane e flessibili.'},
    {d:1825, t:'5 anni', x:'Il rischio di ictus si riduce drasticamente, diventando quasi uguale a quello di un non fumatore, perché il sangue è meno denso e meno incline a formare coaguli.'},
    {d:3650, t:'10 anni', x:'Il rischio di morire per tumore al polmone si dimezza. Si riduce anche il rischio di cancro a bocca, gola, esofago, vescica, reni e pancreas.'},
    {d:5475, t:'15 anni', x:'Il rischio di malattia coronarica diventa identico a quello di una persona che non ha mai fumato. Il sistema circolatorio si è quasi completamente ripreso.'},
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

