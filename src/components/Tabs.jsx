export default function Tabs({ tab, setTab }){
  const t = [
    ['home','🏠'],
    ['registro','📒'],
    ['classifica','🏆'],
    ['salute','💚'],
    ['profilo','👤']
  ]
  return (
    <nav className="tabbar z-50">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {t.map(([k,e]) => (
          <button key={k} onClick={()=>setTab(k)} className={`flex flex-col items-center text-xs ${tab===k?'font-bold text-[#111]':'text-[#111]/70'}`}>
            <span className="text-base">{e}</span>
            {k[0].toUpperCase()+k.slice(1)}
          </button>
        ))}
      </div>
    </nav>
  )
}
