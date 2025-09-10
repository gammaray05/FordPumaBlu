import React, { useState } from 'react'
import Initial from '../components/ui/Initial.jsx'

const medal = (i) => i===0?'🥇': i===1?'🥈': i===2?'🥉': null

export default function Board({data,levelFrom,prog,lvlStep,meName}){
  const [scope,setScope]=useState('weekly')
  const rows=data.slice().sort((a,b)=>scope==='weekly'?b.weekly-a.weekly:b.points-a.points)
  const me=data.find(u=>u.name===meName) || data[0]
  const my=prog(me?.points||0)
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(#00B7FF ${my.pct}%, #E5E7EB ${my.pct}%)`}}/>
              <div className="absolute inset-1 rounded-full bg-white"/>
              <div className="absolute inset-0 grid place-items-center text-[11px] font-extrabold text-[#111]">Lv {my.lvl}</div>
            </div>
            <div>
              <div className="text-xs text-[#111]/85">Il tuo livello</div>
              <div className="text-sm text-[#111]">mancano <b>{my.need}</b> pt</div>
            </div>
          </div>
          <div className="text-right text-xs text-[#111]/85">
            <div>Totale: <b>{me?.points||0}</b> pt</div>
            <div>Sett.: <b>{me?.weekly||0}</b> pt</div>
          </div>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full" style={{background:'linear-gradient(90deg, #EEF2FF, #F8FAFC)'}}>
          <div className="h-full rounded-full" style={{width: my.pct+'%', background:'linear-gradient(90deg,#00B7FF,#7B42FF)'}}/>
        </div>
      </div>
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-[#111]">Classifica</h3><div className="rounded-full bg-white/80 p-1 text-xs shadow"><button onClick={()=>setScope('weekly')} className={`px-2 py-1 rounded-full ${scope==='weekly'?'bg-white font-semibold':''}`}>Sett.</button><button onClick={()=>setScope('total')} className={`px-2 py-1 rounded-full ${scope==='total'?'bg-white font-semibold':''}`}>Totale</button></div></div>
      <div className="space-y-2">{rows.map((u,i)=>{const p=prog(u.points);const m=medal(i);return(
        <div key={u.name} className="card p-3 flex items-center justify-between" style={m?{background:'linear-gradient(135deg, rgba(255,215,0,.08), #fff)'}:undefined}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Initial s={u.name}/>
              {m && <span className="absolute -top-2 -right-2 text-lg" aria-hidden>{m}</span>}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111]">{i+1}. {u.name}</div>
              <div className="text-[11px] text-[#111]/80">Livello {p.lvl} • manca <b>{p.need}</b> pt</div>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-[#111]">{scope==='weekly'?u.weekly:u.points} pt</div>
            <div className="w-28 h-2 bg-black/10 rounded-full mt-1"><div className="h-2 rounded-full" style={{width:p.pct+'%',background:'linear-gradient(90deg,#FF2EA6,#FF7A00)'}}/></div>
          </div>
        </div>
      )})}</div>
    </div>
  )
}
