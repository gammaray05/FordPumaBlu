import React, { useState } from 'react'
import LevelProgress from '../components/ui/LevelProgress.jsx';
import LeaderboardRow from '../components/ui/LeaderboardRow.jsx';

export default function Board({data,levelFrom,prog,lvlStep,meName}){
  const [scope,setScope]=useState('weekly')
  const rows=data.slice().sort((a,b)=>scope==='weekly'?b.weekly-a.weekly:b.points-a.points)
  const me=data.find(u=>u.name===meName) || data[0]
  const my=prog(me?.points||0)
  const topScore = rows.length > 0 ? rows[0][scope === 'weekly' ? 'weekly' : 'points'] : 1;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <LevelProgress
          level={my.lvl}
          xp={me?.points||0}
          progress={my.pct}
          needed={my.need}
          have={my.have}
          start={my.start}
          end={my.end}
        />
      </div>
      <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800">Classifica</h3><div className="rounded-full bg-white/80 p-1 text-xs shadow"><button onClick={()=>setScope('weekly')} className={`px-2 py-1 rounded-full ${scope==='weekly'?'bg-white font-semibold':''}`}>Sett.</button><button onClick={()=>setScope('total')} className={`px-2 py-1 rounded-full ${scope==='total'?'bg-white font-semibold':''}`}>Totale</button></div></div>
      <div className="space-y-2">{rows.map((u,i)=>(
        <LeaderboardRow key={u.name} rank={i+1} user={u} scope={scope} topScore={topScore} />
      ))}</div>
    </div>
  )
}
