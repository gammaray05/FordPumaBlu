import Field from '../components/ui/Field.jsx'
import { useApp } from '../state/AppContext.jsx'

export default function Profile({name,baseline,pack,streak,daysSF,mode,setMode,target,setTarget,setDaysSF,onEdit}){
  const app = useApp?.()
  const _mode = app?.mode ?? mode
  const _setMode = app?.setMode ?? setMode
  const _target = app?.targetToday ?? target
  const _setTarget = app?.setTargetToday ?? setTarget
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#111]">Profilo</h3>
          <button onClick={onEdit} className="btn px-3 py-2 text-xs font-bold text-white" style={{background:'var(--p)'}}>Modifica dati ✏️</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field k="Nome" v={name||'?'} />
          <Field k="Sig./die (baseline)" v={baseline} />
          <Field k="Costo pacchetto" v={`€${pack.toFixed(2)}`} />
          <Field k="Giorni smoke-free" v={daysSF} />
        </div>
      </div>
      <div className="card p-4">
        <h3 className="text-lg font-bold text-[#111] mb-2">Target & modalità</h3>
        <div className="mb-2 text-sm font-extrabold">Modalità attiva: <span className="chip px-2 py-1 rounded-md" style={{background:'#fff'}}>{_mode==='zero'?'Zero':'Riduzione'}</span></div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button onClick={()=>{_setMode('reduction'); if(baseline) _setTarget(baseline)}} className={`btn px-4 py-2 text-sm font-bold text-white ${_mode==='reduction'?'ring-2 ring-white':''}`} style={{background:'var(--t)'}}>Riduzione</button>
          <button onClick={()=>{_setMode('zero'); _setTarget(0)}} className={`btn px-4 py-2 text-sm font-bold text-white ${_mode==='zero'?'ring-2 ring-white':''}`} style={{background:'var(--r)'}}>Zero</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#111]/85">Target di oggi</span>
          <button onClick={()=>_setTarget(Math.max(0,_target-1))} className="btn px-3 py-2 text-white" style={{background:'var(--g2)'}}>-</button>
          <div className="px-4 py-2 text-lg font-bold rounded-md" style={{background:'#fff'}}>{_target}</div>
          <button onClick={()=>_setTarget(_target+1)} className="btn px-3 py-2 text-white" style={{background:'var(--g1)'}}>+</button>
        </div>
      </div>
    </div>
  )
}
