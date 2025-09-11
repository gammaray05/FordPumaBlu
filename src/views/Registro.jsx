import React, { useMemo, useState, useEffect } from 'react'
import Metric from '../components/ui/Metric.jsx'
import { todayStr, toISO, addDays, fmtDate, label, fromDayKey } from '../utils/dates.js'
import { indexByDate, dailySaving, avoided } from '../utils/calc.js'

export default function Registro({history,historyAgg,todaySmoked,pack,baseline,onboardDate}){
  const [scope,setScope]=useState('week');
  const [page, setPage] = useState(0);
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

  const handleSetScope = (s) => {
    setScope(s);
    setPage(0);
  }

  const { range, rangeLabel, canPrev, canNext } = useMemo(() => {
    const todayDate = fromDayKey(todayStr());
    let start, end, labelText;

    const go = (p) => {
        const d = new Date(todayDate);
        if (scope === 'week') {
            d.setDate(d.getDate() + p * 7);
            return d;
        }
        if (scope === 'month') {
            d.setMonth(d.getMonth() + p);
            return d;
        }
        if (scope === 'year') {
            d.setFullYear(d.getFullYear() + p);
            return d;
        }
        return d;
    }

    const refDate = go(page);

    if (scope === 'week') {
        const dayOfWeek = refDate.getDay();
        const diff = refDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        start = new Date(new Date(refDate).setDate(diff));
        end = addDays(start, 6);
        labelText = `${fmtDate(start)} - ${fmtDate(end)}`;
    } else if (scope === 'month') {
        start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
        labelText = refDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    } else if (scope === 'year') {
        start = new Date(refDate.getFullYear(), 0, 1);
        end = new Date(refDate.getFullYear(), 11, 31);
        labelText = refDate.getFullYear().toString();
    }

    const nextRef = go(page + 1);
    const isNextInFuture = nextRef > todayDate;

    const prevRef = go(page - 1);
    let isPrevBeforeOnboard = false;
    if (lowerBound) {
        const lowerBoundDate = fromDayKey(lowerBound);
        if (scope === 'week') {
            const dayOfWeek = prevRef.getDay();
            const diff = prevRef.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const prevWeekStart = new Date(new Date(prevRef).setDate(diff));
            isPrevBeforeOnboard = addDays(prevWeekStart, 6) < lowerBoundDate;
        } else if (scope === 'month') {
            const prevMonthEnd = new Date(prevRef.getFullYear(), prevRef.getMonth() + 1, 0);
            isPrevBeforeOnboard = prevMonthEnd < lowerBoundDate;
        } else if (scope === 'year') {
            const prevYearEnd = new Date(prevRef.getFullYear(), 11, 31);
            isPrevBeforeOnboard = prevYearEnd < lowerBoundDate;
        }
    }

    return {
        range: { start, end },
        rangeLabel: labelText,
        canPrev: !isPrevBeforeOnboard,
        canNext: !isNextInFuture
    };
  }, [scope, page, today, lowerBound]);

  const agg = useMemo(() => {
    if (scope === 'day') {
        const k=saneKey(dayKey);
        const isToday=(k===today);
        const hasRow = isToday || map.has(k);
        const smoked = isToday ? todaySmoked : (map.get(k)?.smoked ?? 0);
        const saving = hasRow ? dailySaving(smoked,pack,baseline) : 0;
        const av = hasRow ? avoided(smoked,baseline) : 0;
        return {smoked,saving,avoided:av, date: k};
    }

    if (!range.start) return { smoked: 0, avoided: 0, saving: 0 };

    const filteredHistory = historyPlusToday.filter(h => {
        const d = fromDayKey(h.date);
        return d >= range.start && d <= range.end;
    });
    
    const totalSmoked = filteredHistory.reduce((sum, item) => sum + (item.smoked || 0), 0);
    const totalAvoided = filteredHistory.reduce((sum, item) => sum + avoided(item.smoked || 0, baseline), 0);
    const totalSaving = filteredHistory.reduce((sum, item) => sum + dailySaving(item.smoked || 0, pack, baseline), 0);

    return {
        smoked: totalSmoked,
        avoided: totalAvoided,
        saving: totalSaving
    };
  }, [scope, page, historyPlusToday, range, dayKey, todaySmoked, baseline, pack, map, today]);

  const goPrev = () => setPage(p => p - 1);
  const goNext = () => setPage(p => p + 1);

  const prevDay=()=> setDayKey(k=> saneKey(toISO(addDays(fromDayKey(k), -1))));
  const nextDay=()=> setDayKey(k=> saneKey(toISO(addDays(fromDayKey(k), +1))));
  
  const canPrevDay = useMemo(()=>{
    if (!lowerBound) return dayKey > todayStr();
    const pk = toISO(addDays(fromDayKey(dayKey), -1));
    return pk >= lowerBound;
  },[dayKey,lowerBound]);
  const canNextDay = useMemo(()=>{
    const nk = toISO(addDays(fromDayKey(dayKey), +1));
    return nk <= today;
  },[dayKey,today]);

  useEffect(()=>{
    setDayKey(k=> saneKey(k));
  }, [today, lowerBound])

  return (
    <div className="space-y-4">
      <div className="card p-3"><div className="rounded-full bg-white/80 p-1 text-xs shadow inline-flex">{['day','week','month','year'].map(k=>(<button key={k} onClick={()=>handleSetScope(k)} className={`px-3 py-1 rounded-full ${scope===k?'bg-white font-semibold':''}`}>{label(k)}</button>))}</div></div>
      {scope==='day'&&(
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={prevDay} disabled={!canPrevDay} className="btn px-3 py-2 text-white disabled:opacity-60" style={{background:'var(--g1)'}}>{'<'}</button>
            <div className="text-sm font-semibold text-[#111]">{fmtDate(fromDayKey(agg.date))}</div>
            <button type="button" onClick={nextDay} disabled={!canNextDay} className="btn px-3 py-2 text-white disabled:opacity-60" style={{background:'var(--g2)'}}>{'>'}</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric title="Fumate" icon="🚬" val={agg.smoked} color="var(--g1)"/>
            <Metric title="Evitate" icon="🛡️" val={agg.avoided} color="var(--g2)"/>
            <div className="col-span-2">
                <Metric title="Risparmio €" icon="💰" val={agg.saving.toFixed(2)} color="var(--t)"/>
            </div>
          </div>
        </div>
      )}
      {scope!=='day'&&( // week, month, year
        <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={goPrev} disabled={!canPrev} className="btn px-3 py-2 text-white disabled:opacity-60" style={{background:'var(--g1)'}}>{'<'}</button>
                <div className="text-sm font-semibold text-[#111] text-center">{rangeLabel}</div>
                <button type="button" onClick={goNext} disabled={!canNext} className="btn px-3 py-2 text-white disabled:opacity-60" style={{background:'var(--g2)'}}>{'>'}</button>
            </div>
            <h4 className="mb-2 text-sm font-bold text-[#111]">Riepilogo {label(scope)}</h4>
            <div className="grid grid-cols-2 gap-3">
                <Metric title="Fumate" icon="🚬" val={agg.smoked} color="var(--g1)"/>
                <Metric title="Evitate" icon="🛡️" val={agg.avoided} color="var(--g2)"/>
                <div className="col-span-2">
                    <Metric title="Risparmio €" icon="💰" val={agg.saving.toFixed(2)} color="var(--t)"/>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}