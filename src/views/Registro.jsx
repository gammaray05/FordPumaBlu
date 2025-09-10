import React, { useMemo, useState, useEffect } from 'react'
import Metric from '../components/ui/Metric.jsx'
import { todayStr, toISO, addDays, fmtDate, label, fromDayKey } from '../utils/dates.js'
import { indexByDate, dailySaving, avoided, aggregate } from '../utils/calc.js'

export default function Registro({history,historyAgg,todaySmoked,pack,baseline,onboardDate}){
  const [scope,setScope]=useState('week');
  const today = todayStr();
  const [dayKey,setDayKey]=useState(today);
  const map=useMemo(()=>indexByDate(history),[history]);
  const historyPlusToday = useMemo(()=>{
    if (Array.isArray(historyAgg)) return historyAgg
    const hasToday = history.some(h=> h.date === today)
    return hasToday ? history : [{ date: today, smoked: todaySmoked }, ...history]
  },[historyAgg,history,today,todaySmoked])
  const lowerBound = useMemo(()=>{
    const histStart = history.length ? history[history.length-1].date : null;
    const ob = (onboardDate && onboardDate <= today) ? onboardDate : null;
    return ob || histStart || null;
  },[history,onboardDate,today]);
  const saneKey=(k)=> {
    let x=k;
    if (x > today) x = today;
    if (lowerBound && x < lowerBound) x = lowerBound;
    return x;
  };
  const getDay=()=>{
    const k=saneKey(dayKey);
    const isToday=(k===today);
    const hasRow = isToday || map.has(k);
    const smoked = isToday ? todaySmoked : (map.get(k)?.smoked ?? 0);
    const saving = hasRow ? dailySaving(smoked,pack,baseline) : 0;
    const av = hasRow ? avoided(smoked,baseline) : 0;
    return {date:k,smoked,saving,avoided:av};
  };
  const agg=useMemo(()=> {
    const ob = lowerBound && lowerBound <= today ? lowerBound : null
    return scope==='week'
      ? aggregate(historyPlusToday,pack,baseline,7,ob)
      : scope==='month'
      ? aggregate(historyPlusToday,pack,baseline,30,ob)
      : scope==='year'
      ? aggregate(historyPlusToday,pack,baseline,365,ob)
      : { ...getDay() }
  },[scope,historyPlusToday,pack,baseline,dayKey,todaySmoked,lowerBound,today]);
  const prev=()=> setDayKey(k=>{
    const pk = toISO(addDays(fromDayKey(k), -1));
    return saneKey(pk);
  });
  const next=()=> setDayKey(k=>{
    const nk = toISO(addDays(fromDayKey(k), +1));
    return saneKey(nk);
  });
  const canPrev = useMemo(()=>{
    if (!lowerBound) return dayKey > todayStr();
    const pk = toISO(addDays(fromDayKey(dayKey), -1));
    return pk >= lowerBound;
  },[dayKey,lowerBound]);
  const canNext = useMemo(()=>{
    const nk = toISO(addDays(fromDayKey(dayKey), +1));
    return nk <= today;
  },[dayKey,today]);

  // Keep selected key within [onboardDate .. today(simulated)]
  useEffect(()=>{
    setDayKey(k=> saneKey(k));
  }, [today, lowerBound])
  return (
    <div className="space-y-4">
      <div className="card p-3"><div className="rounded-full bg-white/80 p-1 text-xs shadow inline-flex">{['day','week','month','year'].map(k=>(<button key={k} onClick={()=>setScope(k)} className={`px-3 py-1 rounded-full ${scope===k?'bg-white font-semibold':''}`}>{label(k)}</button>))}</div></div>
      {scope==='day'&&(
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={(e)=>{e.preventDefault(); prev();}} disabled={!canPrev} className="btn px-3 py-2 text-white disabled:opacity-60" style={{background:'var(--g1)'}}>{'<'}</button>
            <div className="text-sm font-semibold text-[#111]">{fmtDate(fromDayKey(dayKey))}</div>
            <button type="button" onClick={(e)=>{e.preventDefault(); next();}} disabled={!canNext} className="btn px-3 py-2 text-white disabled:opacity-60" style={{background:'var(--g2)'}}>{'>'}</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric title="Fumate" icon="" val={getDay().smoked}/>
            <Metric title="Evitate" icon="" val={getDay().avoided}/>
            <Metric title="Risparmio €" icon="" val={getDay().saving.toFixed(2)}/>
          </div>
        </div>
      )}
      {scope!=='day'&&(<div className="card p-4"><h4 className="mb-2 text-sm font-bold text-[#111]">Riepilogo {label(scope)}</h4><div className="grid grid-cols-3 gap-3"><Metric title="Fumate" icon="" val={agg.smoked}/><Metric title="Evitate" icon="" val={agg.avoided}/><Metric title="Risparmio €" icon="" val={agg.saving.toFixed(2)}/></div></div>)}
    </div>
  )
}
