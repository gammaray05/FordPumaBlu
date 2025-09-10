import Initial from '../components/ui/Initial.jsx'
import Metric from '../components/ui/Metric.jsx'
import { timeAgo } from '../utils/dates.js'
import { useApp } from '../state/AppContext.jsx'

export default function Home({target,smoked,points,log,undo,certifyZero,unlockZero,zeroLocked,showUndo,undoCount,ch,shareWA,lb,acts,avoidedToday,avoidedTotal,savingTotal,onChangeCh,streakDays,streakBonusToday,levelFromXp,levelProg,goBoard,debugShiftDay,debugResetDay,simDate,tick,myPoints}){
  const app = useApp?.()
  const sDays = app?.streakDays ?? streakDays
  const under=smoked<=target
  const p = levelProg ? levelProg(myPoints) : { lvl: levelFromXp(myPoints), start:0, end:0, have:0, need:0, pct:0 }
  const pct = Math.min(100, Math.max(0, p.pct||0))
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full" style={{background:`conic-gradient(#00B7FF ${pct}%, #E5E7EB ${pct}%)`}}/>
              <div className="absolute inset-1.5 rounded-full bg-white shadow-inner"/>
              <div className="absolute inset-0 grid place-items-center text-[14px] font-extrabold text-[#111]">Lv {p.lvl}</div>
            </div>
            <div>
              <div className="text-xs text-[#111]/80">Progresso livello ✨</div>
              <div className="text-sm text-[#111]/85">mancano <span className="font-semibold">{p.need}</span> pt</div>
            </div>
          </div>
          <div className="text-right">
            <span className="chip rounded-md px-2 py-1 text-xs font-bold" style={{background:'#fff'}}>{myPoints} pt tot</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-[#111]/70"><span>Lv {p.lvl}</span><span>Lv {p.lvl+1}</span></div>
          <div className="relative mt-1 h-3 w-full overflow-hidden rounded-full" style={{background:'linear-gradient(90deg, #EEF2FF, #F8FAFC)'}}>
            <div className="h-full rounded-full" style={{width:`${pct}%`,background:'linear-gradient(90deg, #00B7FF, #7B42FF)'}}/>
            <div className="pointer-events-none absolute inset-0 rounded-full" style={{background:'linear-gradient(90deg, rgba(255,255,255,.28), transparent 35%)'}}/>
          </div>
          <div className="mt-1 text-[11px] text-[#111]/70">{p.have} / {Math.max(1, (p.end-p.start)||1)} pt nel livello</div>
        </div>
      </div>
      <button disabled={!!zeroLocked} onClick={(e)=>{e.preventDefault(); e.stopPropagation(); log();}} className="btn w-full py-4 text-lg font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed" style={{background:'var(--g2)'}}>{zeroLocked?'🚫 + Sigaretta':'+ Sigaretta'}</button>
      {zeroLocked && (
        <div className="card mt-2 p-3 text-xs flex items-center justify-between">
          <div className="text-[#111]/90">Giornata smoke‑free.</div>
          <button onClick={(e)=>{e.preventDefault(); e.stopPropagation(); unlockZero();}} className="btn px-3 py-1 text-xs font-bold text-white" style={{background:'var(--g1)'}}>Annulla</button>
        </div>
      )}
      {showUndo&&(
        <div className="card p-3 text-sm">
          Registrata ☹️.{'  '}
          <button onClick={(e)=>{e.preventDefault(); e.stopPropagation(); undo();}} className="font-semibold underline">Annulla x{undoCount}</button>
          {' '}(hai 30s)
        </div>
      )}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="text-xl">🚬</span><div><p className="text-sm text-[#111]/90">Oggi</p><h2 className="text-2xl font-extrabold text-[#111]">{smoked}/{target} <span className="text-sm font-normal">sigarette</span></h2></div></div>
          <div className="text-right"><p className="text-sm text-[#111]/90">Punti a fine giornata</p><h2 className="text-2xl font-extrabold text-[#111]">{points}</h2></div>
        </div>
        <div className="mt-3 h-3 w-full rounded-full" style={{background:'rgba(0,0,0,.08)'}}>
          <div className="h-full rounded-full" style={{width:`${Math.min(100,Math.round((smoked/Math.max(1,target))*100))}%`,background:under?'var(--g2)':'var(--g1)'}}/>
        </div>
        <div className="mt-4 flex justify-center">
          <button disabled={smoked>0 || !!zeroLocked} onClick={(e)=>{e.preventDefault(); e.stopPropagation(); certifyZero();}} className="btn px-5 py-3 text-base font-extrabold text-white disabled:opacity-60 disabled:cursor-not-allowed" style={{background:'var(--t)'}}>
            {(smoked>0 || !!zeroLocked) ? '🚫 Oggi non ho fumato' : 'Oggi non ho fumato'}
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-[#111]/90">🔥 Streak di 0 sigarette: <span className="font-semibold">{sDays}</span> giorni {streakBonusToday? (<span className="ml-2 chip rounded-md px-2 py-0.5" style={{background:'#fff'}}>+{streakBonusToday} pt</span>) : null}</div>
      <div className="card p-4">
        <div className="grid grid-cols-2 gap-3">
          <Metric title="Evitate oggi" icon="✅" val={avoidedToday}/>
          <Metric title="Risparmio totale" icon="💰" val={`€${savingTotal.toFixed(2)}`}/>
          <Metric title="Evitate totali" icon="📉" val={avoidedTotal}/>
          <div className="rounded-xl bg-white/95 p-3 shadow">
            <div className="flex items-center justify-between"><div className="text-xs text-[#111]/90">Condividi</div><span className="text-lg">📣</span></div>
            <button onClick={shareWA} className="btn mt-2 w-full px-3 py-2 text-sm font-bold text-white" style={{background:"var(--wa)"}}>WhatsApp</button>
          </div>
        </div>
      </div>
      
      <div className="card p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="text-[#111]/85">Debug giorno • Oggi simulato: <span className="font-semibold">{simDate}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={()=>debugShiftDay(-1)} className="btn px-3 py-1 text-white" style={{background:'var(--g1)'}}>-1</button>
            <button onClick={()=>debugShiftDay(+1)} className="btn px-3 py-1 text-white" style={{background:'var(--g2)'}}>+1</button>
            <button onClick={debugResetDay} className="btn px-3 py-1 text-white" style={{background:'#444'}}>Reset</button>
          </div>
        </div>
      </div>
      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between"><h3 className="text-lg font-bold text-[#111]">Classifica (top 3)</h3><a href="#" onClick={(e)=>{e.preventDefault(); (goBoard ? goBoard() : app?.setTab?.('classifica'))}} className="text-xs font-semibold underline">Vedi tutto</a></div>
        <div className="space-y-2">{lb.slice(0,3).map((u,i)=>{const lvl=levelFromXp(u.points);return(
          <div key={u.name} className="flex items-center justify-between rounded-xl bg-white/95 p-2 shadow">
            <div className="flex items-center gap-2"><Initial s={u.name}/><div className="text-sm font-medium text-[#111]">{i+1}. {u.name} <span className="text-xs text-[#111]/85">Livello {lvl}</span></div></div>
            <div className="text-right text-xs"><div className="font-bold text-[#111]">{u.weekly} pt</div></div>
          </div>)})}
        </div>
      </div>
      <div className="card p-4"><h3 className="text-lg font-bold text-[#111] mb-2">Attività del gruppo</h3><ul className="space-y-2">{(acts||[]).slice(0,5).map((a,i)=> (
        <li key={(a.id||i)} className="flex items-center justify-between rounded-xl bg-white/95 p-2 shadow"><span className="text-sm"><span className="mr-1">{a.icon}</span>{a.text}</span><span className="text-[11px] text-[#111]/70">{timeAgo(a.created_at)}</span></li>
      ))}</ul></div>
      {ch ? (
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111]">Sfida: {ch.name}</h3>
            <span className="chip px-2 py-1 text-sm font-bold rounded-md" style={{background:'#fff'}}>+{ch.reward} pt</span>
          </div>
          {ch.status==='pending' ? (
            <div className="text-xs text-[#111]/85">Inizia tra {ch.startsIn} giorni (dal {ch.startKey}).</div>
          ) : (
            <>
              <div className="h-2 w-full rounded-full bg-black/10">
                <div className="h-full rounded-full" style={{width:`${Math.round(((ch.daysOk||0)/ch.days)*100)}%`,background:'var(--g1)'}}/>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm text-[#111]/90">
                <span>{ch.daysOk||0}/{ch.days} giorni OK</span>
                {ch.status==='active' && (<span>Finisce tra {ch.endsIn} giorni (al {ch.endKey})</span>)}
                {ch.status==='won' && (<span className="font-semibold text-green-700">Completata! +{ch.reward} pt</span>)}
                {ch.status==='failed' && (<span className="font-semibold text-red-600">Fallita</span>)}
              </div>
            </>
          )}
          <button onClick={onChangeCh} className="btn mt-3 w-full py-2 text-sm font-bold text-white" style={{background:'var(--g2)'}}>Cambia sfida</button>
        </div>
      ) : (
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111]">Nessuna sfida attiva</h3>
            <span className="chip px-2 py-1 text-sm font-bold rounded-md" style={{background:'#fff'}}>Pronto?</span>
          </div>
          <p className="text-xs text-[#111]/90">Scegli una sfida per iniziare.</p>
          <button onClick={onChangeCh} className="btn mt-3 w-full py-2 text-sm font-bold text-white" style={{background:'var(--g2)'}}>Scegli una sfida</button>
        </div>
      )}
    </div>
  )
}
