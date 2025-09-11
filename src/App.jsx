import React, { useEffect, useMemo, useRef, useState } from "react";
import { badges } from './lib/badges.js';

// Ford Puma Blu • Compact Mock UI (skeuo + bright palette)
export default function FordPumaBlu(){
  // ---- styles ----
  // moved to CSS (see src/index.css)

  // ---- state ----
  const [tab,setTab]=useState('home');
  const [mode,setMode]=useState('reduction');
  const [targetToday,setTargetToday]=useState(10);
  const [smokedToday,setSmokedToday]=useState(0);
  const [streakDays,setStreakDays]=useState(0);
  const [showUndo,setShowUndo]=useState(false);
  const [undoCount,setUndoCount]=useState(0);
  const undoTO=useRef(null);
  const [showCh,setShowCh]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const [onboarded,setOnboarded]=useState(false);
  const [profiles,setProfiles]=useState([]);
  const [authStage,setAuthStage]=useState('login'); // 'login' | 'onboard' | 'ready'
  const [name,setName]=useState('');
  const [baseline,setBaseline]=useState(null); // sig/die
  const [pack,setPack]=useState(null); // € pacco (20)
  const [daysSF,setDaysSF]=useState(0);
  const [history,setHistory]=useState([]);
  const [challenge,setChallenge]=useState(null);
  const [dailyTargets,setDailyTargets]=useState({});
  const [rewardsByDate,setRewardsByDate]=useState({});
  const [activeId,setActiveId]=useState(null);
  const [myPoints,setMyPoints]=useState(0);
  const [recentActIds,setRecentActIds]=useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const logLockRef=useRef(null);
  const undoLockRef=useRef(false);
  const lastActIdRef=useRef(null);
  const smokedRef=useRef(0);
  useEffect(()=>{ smokedRef.current = smokedToday; }, [smokedToday]);
  const [onboardDate,setOnboardDate]=useState(null);
  const [debugEpoch,setDebugEpoch]=useState(0);
  const [timeTick,setTimeTick]=useState(0);
  const [todayTracked,setTodayTracked]=useState(false);
  const [zeroLocked,setZeroLocked]=useState(false);
  // re-render every 45s so timeAgo() updates naturally, and on debug changes
  useEffect(()=>{
    const id=setInterval(()=>setTimeTick(t=>t+1), 45000);
    return ()=>clearInterval(id);
  },[]);
  
  // ---- Supabase helper (centralized via lib/supabase.js) ----
  const getSB = async () => {
    try {
      const mod = await import('./lib/supabase.js');
      return mod.supabase || null;
    } catch {
      return null;
    }
  };
  const [lastActive,setLastActive]=useState(null);
  
  // ---- auth/load profiles ----
  const applyProfile=(p)=>{
    setName(p.name||'');
    setBaseline(p.baseline ?? null);
    setPack(p.pack ?? null);
    const m=p.mode||'reduction';
    setMode(m);
    setTargetToday(m==='zero'?0:(p.targetToday ?? p.baseline ?? 0));
    setActiveId(p.id||null);
    setEarnedBadges(p.badges || []);
  };
  const loginAs=(p)=>{
    try{localStorage.setItem('fbl_active',p.id||p.name)}catch{}
    applyProfile(p);
    setOnboarded(true);
    setAuthStage('ready');
    // Initialize/load onboarding date for this profile
    try{
      const key = 'fbl_onboard_'+(p.id||p.name);
      let ob = localStorage.getItem(key);
      if(!ob){ ob = todayStr(); localStorage.setItem(key, ob); }
      setOnboardDate(ob);
    }catch{ setOnboardDate(todayStr()); }
  };
  useEffect(()=>{
    (async () => {
      try{
        const sb = await getSB();
        if (sb) {
          const { data, error } = await sb.from('profiles').select('id, name, baseline, pack, mode, target_today, badges').order('name');
          if (error) throw error;
          const list = (data||[]).map(r=>({ id:r.id, name:r.name, baseline:r.baseline, pack:r.pack, mode:r.mode, targetToday:r.target_today, badges: r.badges }))
          setProfiles(list);
        } else {
          const list=JSON.parse(localStorage.getItem('fbl_profiles')||'[]');
          setProfiles(Array.isArray(list)?list:[]);
        }
        const active=localStorage.getItem('fbl_active');
        setLastActive(active||null);
        setAuthStage('login');
      }catch{ setProfiles([]); setAuthStage('login'); }
    })();
  },[]);

  // Load daily stats when profile changes (remote or local fallback)
  useEffect(()=>{
    (async ()=>{
      if(!activeId) return;
      try{
        const sb = await getSB();
        const today = todayStr();
        const from = toISO(addDays(nowWithOffset(), -60));
        let data = [];
        if (sb){
          const res = await sb
            .from('daily_stats')
            .select('date, smoked, target, points')
            .eq('profile_id', activeId)
            .gte('date', from)
            .order('date', { ascending: false });
          data = res.data || [];
          try{
            const { data:rw } = await sb
              .from('challenge_rewards')
              .select('date, points, challenge_key')
              .eq('profile_id', activeId)
              .gte('date', from)
              .order('date', { ascending: false });
            const m={}; (rw||[]).forEach(r=>{ m[r.date]=(m[r.date]||0)+(r.points||0); });
            setRewardsByDate(m);
          }catch{}
        } else {
          data = loadDailyStatsLocal(activeId, from);
        }
        const arr=(data||[]).map(r=>({date:r.date,smoked:r.smoked}));
        setHistory(arr);
        try{ setMyPoints((data||[]).reduce((a,r)=> a + (r.points||0), 0)); }catch{ setMyPoints(0); }
        const tg={}; (data||[]).forEach(r=>{ if(typeof r.target==='number') tg[r.date]=r.target; });
        setDailyTargets(tg);
        const todayRow=(data||[]).find(r=>r.date===today);
        if(todayRow){ setSmokedToday(todayRow.smoked||0); if(typeof todayRow.target==='number') setTargetToday(todayRow.target); }
        else { setSmokedToday(0); }
        // compute zero-only streak across tracked days; do not count untracked days
        const byDate=new Map((data||[]).map(r=>[r.date,r]));
        const todayKey = todayStr();
        setTodayTracked(byDate.has(todayKey));
        try{ const lk = localStorage.getItem('fbl_zero_lock_'+(activeId||'local')+'_'+todayKey); setZeroLocked(lk==='1'); }catch{}
        let streak=0;
        const startDayOffset = byDate.has(todayKey) ? 0 : 1;
        for(let i=startDayOffset;i<60;i++){
          const dKey=toISO(addDays(nowWithOffset(),-i));
          const row=byDate.get(dKey);
          if(!row) break; // stop if day not tracked
          if((row.smoked||0)===0) streak++; else break;
        }
        setStreakDays(streak);
      }catch(e){ /* ignore */ }
    })();
  },[activeId, debugEpoch]);

  // export/import per migrare i profili tra browser
  const exportProfiles=async ()=>{
    const payload={profiles, active:lastActive};
    const text=JSON.stringify(payload,null,2);
    try{ await navigator.clipboard.writeText(text); alert('Profili copiati negli appunti. Incollali nel browser di destinazione (Importa).'); }
    catch{ prompt('Copia manualmente e conserva questo JSON:', text); }
  };

  // activities feed (remote if available)
  useEffect(()=>{
    let unsub=()=>{};
    (async ()=>{
      try{
        const sb = await getSB();
        if (sb){
          const { data } = await sb
            .from('activities')
            .select('id, created_at, icon, text, profile_id')
            .order('created_at', { ascending: false })
            .limit(30);
          const raw = data||[];
          const deduped=[];
          for(const n of raw){
            const dup = deduped.some(a=> a.id===n.id || (a.profile_id===n.profile_id && a.text===n.text && Math.abs(new Date(a.created_at)-new Date(n.created_at))<3000));
            if(!dup) deduped.push(n);
          }
          setActs(deduped);
          const ch = sb
            .channel('realtime:activities')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload)=>{
              setActs(prev=>{
                const n=payload.new;
                const dup = prev.some(a=> a.id===n.id || (a.profile_id===n.profile_id && a.text===n.text && Math.abs(new Date(a.created_at)-new Date(n.created_at))<3000));
                if(dup) return prev;
                return [n, ...prev].slice(0,50);
              })
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'activities' }, (payload)=>{
              const delId = payload.old?.id; if(delId){ setActs(prev => prev.filter(a=>a.id!==delId)); }
            })
            .subscribe();
          unsub=()=>{ try{sb.removeChannel(ch)}catch{} };
        } else {
          setActs([]);
        }
      }catch(e){ console.warn('feed load error', e); }
    })();
    return ()=>{ try{unsub()}catch{} };
  },[]);
  const importProfiles=()=>{
    const text=prompt('Incolla qui il JSON dei profili esportati');
    if(!text) return;
    try{
      const data=JSON.parse(text);
      const list=Array.isArray(data?.profiles)?data.profiles:[];
      const active=data?.active||null;
      setProfiles(list);
      setLastActive(active);
      try{localStorage.setItem('fbl_profiles',JSON.stringify(list)); if(active) localStorage.setItem('fbl_active',active);}catch{}
      setAuthStage('login');
      alert('Profili importati. Seleziona chi sei per continuare.');
    }catch(e){ alert('JSON non valido.'); }
  };
  const chPresets=[
    {key:'weekend_zero',name:'Weekend totalmente smoke-free',desc:'Zero sigarette il prossimo sabato e domenica',days:2,reward:100,verify:'automatico: giorni Sab/Dom con 0 fumate'},
    {key:'week_max5',name:'Settimana da massimo cinque',desc:'<5 sigarette al giorno per 7 giorni',days:7,reward:85,verify:'automatico: ogni giorno ≤5 dal registro'},
    {key:'ten_respect_target',name:'Dieci su dieci',desc:'Dieci giorni di fila rispettando il target',days:10,reward:120,verify:'automatico: streak di giorni sotto/uguale al target'},
  ];
  const [leaderboard,setLeaderboard]=useState([]);
  const [acts,setActs]=useState([]);

  // ---- derived ----
  const restr=useMemo(()=>{const b=baseline ?? 0; if(targetToday===0||mode==='zero') return 2.0; if(b<=0) return 1.0; const r=Math.max(0,Math.min(1,(b-targetToday)/b)); return 1+1.0*r;},[baseline,targetToday,mode]);
  // Streak bonus grows with consecutive zero-cig days; only when today is tracked and zero
  const streakBonus = (n)=> Math.min(40, Math.max(0, 5 + (n-1)*2));
  const pointsToday=useMemo(()=>{
    const base = computePoints(baseline ?? 20,targetToday,smokedToday);
    const chBonus = rewardsByDate[todayStr()]||0;
    const sb = (todayTracked && smokedToday===0) ? streakBonus(streakDays||0) : 0;
    return base + chBonus + sb;
  },[baseline,targetToday,smokedToday,todayTracked,streakDays,rewardsByDate]);
  // Savings/avoided based on baseline and ONLY on tracked days
  const avoidedToday=useMemo(()=>{const b=baseline ?? 20; const s=Math.max(0,smokedToday); return Math.max(0, Math.round(b - s));},[baseline,smokedToday]);
  const savingToday=useMemo(()=>{const b=baseline ?? 20; const p=pack ?? 0; const s=Math.max(0,smokedToday); return dailySaving(s,p,b);},[baseline,smokedToday,pack]);
  const historyWithToday=useMemo(()=>{const t=todayStr(); return history.some(h=>h.date===t)?history:[{date:t,smoked:smokedToday}, ...history]},[history,smokedToday]);
  const totalsTracked=useMemo(()=>{const b=baseline ?? 20; const p=pack ?? 0; let saving=0, avoided=0; for(const x of historyWithToday){ const s=Math.max(0,x.smoked||0); const av=Math.max(0,b-s); avoided+=av; saving+= (av*p)/20; } return { saving: round2(saving), avoided };},[historyWithToday,baseline,pack]);
  const savingTotal=totalsTracked.saving;
  const avoidedTotal=totalsTracked.avoided;
  const showConfetti=smokedToday<=targetToday;

  useEffect(() => {
    if (activeId) {
      const stats = {
        streakDays,
        avoidedTotal,
        level: levelFrom(myPoints),
      };

      const currentBadges = badges.filter(badge => badge.checker(stats));
      const currentBadgeIds = currentBadges.map(b => b.id);
      
      const userBadges = earnedBadges || [];
      const newlyEarned = currentBadgeIds.filter(id => !userBadges.includes(id));

      if (newlyEarned.length > 0) {
        const updatedBadges = [...userBadges, ...newlyEarned];
        setEarnedBadges(updatedBadges);
        (async () => {
          try {
            const sb = await getSB();
            if (sb) {
              await sb.from('profiles').update({ badges: updatedBadges }).eq('id', activeId);
              for (const badgeId of newlyEarned) {
                const badge = badges.find(b => b.id === badgeId);
                if (badge) {
                  await sb.from('activities').insert({
                    icon: badge.icon,
                    text: `${name} ha guadagnato il badge "${badge.name}"!`,
                    profile_id: activeId,
                  });
                }
              }
            }
          } catch (e) {
            console.error('Error updating badges or activity feed', e);
          }
        })();
      }
    }
  }, [streakDays, avoidedTotal, myPoints, activeId, name]);

  // leaderboard from daily_stats (sum points total + last 7 days)
  useEffect(()=>{
    (async ()=>{
      try{
        const sb = await getSB();
        if(!sb || !profiles.length){ setLeaderboard([]); return; }
        const today = nowWithOffset();
        const dayOfWeek = today.getDay();
        const daysToSubtract = (dayOfWeek === 0) ? 6 : (dayOfWeek - 1);
        const lastMondayDate = new Date(today);
        lastMondayDate.setDate(today.getDate() - daysToSubtract);

        const start365 = toISO(addDays(today, -365));
        const start7 = toISO(lastMondayDate);
        const { data } = await sb
          .from('daily_stats')
          .select('profile_id, date, points')
          .gte('date', start365);
        const byId = new Map();
        (data||[]).forEach(r=>{
          const cur = byId.get(r.profile_id) || { total:0, weekly:0 };
          cur.total += (r.points||0);
          if(r.date>=start7) cur.weekly += (r.points||0);
          byId.set(r.profile_id, cur);
        });
        const rows = profiles.map(p=>({ name:p.name, points:(byId.get(p.id)?.total||0), weekly:(byId.get(p.id)?.weekly||0) }));
        rows.sort((a, b) => (b.weekly||0) - (a.weekly||0));
        setLeaderboard(rows);
      }catch{ setLeaderboard([]); }
    })();
  },[profiles]);

    
  const prog=(p)=>levelInfo(p);

  // ---- handlers ----
  const unlockZeroToday = () => {
    const d = todayStr();
    try { localStorage.removeItem('fbl_zero_lock_'+(activeId||'local')+'_'+d); } catch {}
    setZeroLocked(false);

    (async ()=>{
      try {
        const sb = await getSB();
        if (sb && activeId) {
          await sb.from('daily_stats').delete().match({ profile_id: activeId, date: d });
        } else if (activeId) {
          const { deleteDailyStatLocal } = await import('./lib/storage.js');
          deleteDailyStatLocal(activeId, d);
        }
        // Reset local state and force a re-fetch of stats
        setTodayTracked(false);
        setSmokedToday(0);
        setDebugEpoch(x => x + 1);
      } catch (e) {
        console.error('Error unlocking zero today', e);
      }
    })();
  };
  const certifyZeroToday = () => {
    if ((smokedRef.current||0) > 0) { alert('Non puoi certificare 0: oggi hai già registrato sigarette.'); return; }
    const ok = window.confirm('Confermi che oggi NON hai fumato? Salveremo il giorno come 0 e verrà conteggiato nella streak.');
    if (!ok) return;
    const d = todayStr();
    const newCount = 0;
    const base = computePoints(baseline ?? 20, targetToday, newCount);
    const chBonus = rewardsByDate[d] || 0;
    const streakForToday = (todayTracked ? (streakDays||0) : ((streakDays||0)+1));
    const sbn = streakBonus(streakForToday);
    const total = base + chBonus + sbn;
    setSmokedToday(0);
    setHistory(h=>upsert(h, d, 0));
    setTodayTracked(true);
    try{ localStorage.setItem('fbl_zero_lock_'+(activeId||'local')+'_'+d, '1'); }catch{}
    try{ setZeroLocked(true); }catch{}
    (async ()=>{ try{ const sb=await getSB(); if(sb && activeId){
      await sb.from('daily_stats').upsert({ profile_id: activeId, date: d, smoked: 0, target: targetToday, points: total });
      // force recompute of streak on next load
      setDebugEpoch(x=>x+1);
    }}catch{} })();
    (async ()=>{ try{ const sb=await getSB(); if((!sb) && activeId){
      upsertDailyStatLocal(activeId, { date:d, smoked:0, target: targetToday, points: total });
    }}catch{} })();
  };
  // removed legacy local log/undo handlers in favor of remote-aware versions
  // Remote-aware versions (Supabase) to keep DB/feed/daily_stats in sync
  const logRemote=()=>{
    if(zeroLocked){ return; }
    if(logLockRef.current) return; // prevent accidental double log
    logLockRef.current = true; setTimeout(()=>{ try{logLockRef.current=false}catch{} }, 600);
    const d=todayStr();
    const newCount = Math.max(0, (smokedRef.current||0) + 1);
    setSmokedToday(newCount);
    setHistory(h=>upsert(h,d,newCount));
    (async ()=>{ try{ const sb=await getSB(); if(sb && name && activeId){
      const { data:act } = await sb.from('activities').insert({ icon:'🚬', text:`${name} ha registrato una sigaretta`, profile_id: activeId, created_at: new Date(nowWithOffset().getTime()).toISOString() }).select('id').single();
      const actId=act?.id; if(actId){ lastActIdRef.current = actId; setRecentActIds(st=>[...st,actId]); }
      // no smoke_logs insert here to avoid duplicate feed entries
      const base=computePoints(baseline ?? 20,targetToday,newCount);
      const bonus=(rewardsByDate[d]||0);
      const sbn = (todayTracked && newCount===0) ? streakBonus(streakDays||0) : 0;
      await sb.from('daily_stats').upsert({ profile_id: activeId, date: d, smoked: newCount, target: targetToday, points: base+bonus+sbn });
    }}catch{ } })();
    (async ()=>{ try{ const sb=await getSB(); if((!sb) && activeId){
      const base=computePoints(baseline ?? 20,targetToday,newCount);
      const sbn = (todayTracked && newCount===0) ? streakBonus(streakDays||0) : 0;
      upsertDailyStatLocal(activeId, { date:d, smoked:newCount, target: targetToday, points: base+sbn });
    }}catch{ } })();
    setUndoCount(c=>c+1); setShowUndo(true); if(undoTO.current) clearTimeout(undoTO.current); undoTO.current=setTimeout(()=>{setShowUndo(false);setUndoCount(0);},30000)
  };
  const undoRemote=()=>{
    if(undoLockRef.current) return;
    undoLockRef.current = true; setTimeout(()=>{ try{undoLockRef.current=false}catch{} }, 600);
    if(undoCount<=0){ setShowUndo(false); return; }
    const d=todayStr();
    const newCount = Math.max(0, (smokedRef.current||0) - 1);
    setSmokedToday(newCount);
    setHistory(h=>upsert(h,d,newCount));
    (async ()=>{ try{ const sb=await getSB(); if(sb && activeId){
      let actId = lastActIdRef.current || recentActIds.slice(-1)[0];
      if(!actId){
        try{
          const { data:recent } = await sb.from('activities')
            .select('id')
            .eq('profile_id', activeId)
            .order('created_at', { ascending:false })
            .limit(1);
          actId = (recent||[])[0]?.id || null;
        }catch{}
      }
      if(actId){ await sb.from('activities').delete().eq('id', actId); lastActIdRef.current = null; setRecentActIds(st=>st.filter(id=>id!==actId)); }
      const base=computePoints(baseline ?? 20,targetToday,newCount);
      const bonus=(rewardsByDate[d]||0);
      const sbn = (todayTracked && newCount===0) ? streakBonus(streakDays||0) : 0;
      await sb.from('daily_stats').upsert({ profile_id: activeId, date: d, smoked: newCount, target: targetToday, points: base+bonus+sbn });
    }}catch{ } })();
    (async ()=>{ try{ const sb=await getSB(); if((!sb) && activeId){
      const base=computePoints(baseline ?? 20,targetToday,newCount);
      const sbn = (todayTracked && newCount===0) ? streakBonus(streakDays||0) : 0;
      upsertDailyStatLocal(activeId, { date:d, smoked:newCount, target: targetToday, points: base+sbn });
    }}catch{ } })();
    setUndoCount(c=>{ const nx=c-1; if(nx<=0) setShowUndo(false); return nx; });
  };
  // Load challenge from storage on profile change
  useEffect(()=>{
    try{
      if(!activeId) return;
      const raw = localStorage.getItem('fbl_ch_'+activeId);
      if(raw){ setChallenge(JSON.parse(raw)); }
    }catch{}
  },[activeId]);
const shareWA = () => {
  // una 🚬 per ogni sigaretta fumata; se 0, mostra 🚭
  const cigStr = smokedToday > 0 ? '🚬'.repeat(smokedToday) : '🚭';

  // testo: niente target/evitate, aggiungi risparmio con emoji soldi negli occhi
  const t = `Oggi ${cigStr}. Risparmio: 🤑 €${savingTotal.toFixed(2)}`;

  const u = `https://wa.me/?text=${encodeURIComponent(t)}`;
  if (navigator.share) {
    navigator.share({ text: t }).catch(() => window.open(u, '_blank'));
  } else {
    window.open(u, '_blank');
  }
};

const shareSmokedCount = () => {
  const t = `🚬 (oggi: ${'🚬'.repeat(smokedToday)})`;
  const u = `https://wa.me/?text=${encodeURIComponent(t)}`;
  window.open(u, '_blank');
};

  // Debug day offset helpers (stored in localStorage so date helpers pick it up)
  const getDbg = () => { try { return parseInt(localStorage.getItem('fbl_debug_offset')||'0',10)||0 } catch { return 0 } }
  const setDbg = (n) => { try { localStorage.setItem('fbl_debug_offset', String(n)); } catch {} }
  const debugShiftDay = (delta) => {
    const cur = getDbg(); const nx = cur + delta; setDbg(nx);
    // Trigger refresh of today stats by re-running the load effect
    setSmokedToday(0);
    setDebugEpoch((x)=>x+1);
    setActs(a=>a.slice());
  }
  const debugResetDay = () => { setDbg(0); setSmokedToday(0); setDebugEpoch((x)=>x+1); setActs(a=>a.slice()); }

  // Challenge awarding: when a challenge is won, award bonus once on endKey
  useEffect(()=>{
    (async ()=>{
      try{
        if(!activeId || !challenge) return;
        const ctx = { baseline: baseline??20, getSmoked:(k)=> (k===todayStr()?smokedToday: (history.find(h=>h.date===k)?.smoked||0)), getTarget:(k)=> (k===todayStr()?targetToday: (dailyTargets[k]??(baseline??20))) }
        const st = computeChallengeState(challenge, ctx);
        if(!st || st.status!=='won') return;
        const awardKey = `fbl_ch_awarded_${activeId}_${challenge.key}_${challenge.startKey}`;
        if(localStorage.getItem(awardKey)) return;
        const sb = await getSB();
        const endK = st.endKey;
        const reward = st.reward||0;
        if(sb){
          // record reward
          try{ await sb.from('challenge_rewards').insert({ profile_id: activeId, date: endK, challenge_key: challenge.key, points: reward }); }catch{}
          try{ setRewardsByDate(m=> ({ ...m, [endK]: (m[endK]||0)+reward })); }catch{}
          // update points on end day
          try{
            const { data:row } = await sb.from('daily_stats').select('smoked, target, points').eq('profile_id', activeId).eq('date', endK).single();
            const basePts = row?.points ?? computePoints(baseline??20, (dailyTargets[endK]??baseline??20), (history.find(h=>h.date===endK)?.smoked||0));
            await sb.from('daily_stats').upsert({ profile_id: activeId, date: endK, smoked: (row?.smoked??(history.find(h=>h.date===endK)?.smoked||0)), target: (row?.target??(dailyTargets[endK]??baseline??20)), points: (basePts + reward) });
          }catch{}
          // feed
          try{ await sb.from('activities').insert({ icon:'🏁', text:`${name} ha completato la sfida “${st.name}” (+${reward} pt)`, profile_id: activeId, created_at: new Date(nowWithOffset().getTime()).toISOString() }); }catch{}
        } else {
          // local fallback
          try{ upsertDailyStatLocal(activeId, { date:endK, smoked:(history.find(h=>h.date===endK)?.smoked||0), target:(dailyTargets[endK]??baseline??20), points: reward }); }catch{}
        }
        try{ localStorage.setItem(awardKey, '1'); }catch{}
      }catch{}
    })();
  },[activeId, challenge, history, dailyTargets, smokedToday, targetToday]);

  // (runtime asserts removed due to new scoring model)

  // Wrap target setter to auto-switch mode (0 => 'zero', >0 => 'reduction') and persist
  const setTargetTodayAuto = (val) => {
    const v = Math.max(0, val);
    const m2 = (v===0) ? 'zero' : 'reduction';
    setTargetToday(v);
    setMode(m2);
    setDailyTargets(t=>({ ...t, [todayStr()]: v }));
    (async()=>{
      try{
        const sb = await getSB();
        const d = todayStr();
        const b = baseline ?? 20;
        const base = computePoints(b, v, smokedToday);
        const bonus = (rewardsByDate[d]||0);
        const sbn = (todayTracked && smokedToday===0)?(5 + Math.max(0,streakDays-1)*2):0;
        if(sb && activeId){
          await sb.from('profiles').update({ target_today:v, mode:m2 }).eq('id', activeId);
          await sb.from('daily_stats').upsert({ profile_id: activeId, date: d, smoked: smokedToday, target: v, points: base+bonus+sbn });
        } else if(activeId){
          upsertDailyStatLocal(activeId, { date:d, smoked: smokedToday, target: v, points: base+sbn });
        }
      }catch{}
    })();
  };

  const appValue = { tab, setTab, mode, setMode, targetToday, setTargetToday: setTargetTodayAuto, smokedToday, setSmokedToday, streakDays, setStreakDays };
  return (<AppProvider value={appValue}><div className={"min-h-screen w-full"} style={{background:'var(--bg)'}}>
    {showConfetti && (<><Confetti/></>)}
    {authStage==='login' && (<Login profiles={profiles} lastActive={lastActive} onPick={loginAs} onNew={()=>setAuthStage('onboard')} />)}
    {authStage==='onboard' && (<Onboard onDone={async (n,c,cost,mm,initT)=>{
      const prof={id:'p_'+Date.now(),name:n,baseline:c,pack:cost,mode:mm,targetToday:mm==='zero'?0:(Number(initT||c))};
      try{
        const sb = await getSB();
        if (sb){
          const { data, error } = await sb
            .from('profiles')
            .upsert({ name: prof.name, baseline: prof.baseline, pack: prof.pack, mode: prof.mode, target_today: prof.targetToday }, { onConflict: 'name' })
            .select()
            .single();
          if (!error && data){ prof.id = data.id; }
        } else {
          const list=[...profiles.filter(x=>x.name!==n),prof];
          setProfiles(list);
          try{localStorage.setItem('fbl_profiles',JSON.stringify(list));}catch{}
        }
      }catch{}
      try{localStorage.setItem('fbl_active',prof.id);}catch{}
      applyProfile(prof);
      setOnboarded(true);
      setAuthStage('login');
      // Hard reload to re-evaluate profiles/login overlay and ensure the new name appears
      setTimeout(()=>{ try{ window.location.reload(); }catch{} }, 150);
    }} />)}
    {showCh && (<ChallengePicker list={chPresets} onPick={(p)=>{
      const key = p.key; const def = (CHALLENGES[key]||{}); const startKey = def.startFor ? def.startFor(todayStr()) : todayStr();
      const chObj = { key, name:p.name, reward:p.reward, days:p.days, startKey };
      setChallenge(chObj);
      try{ localStorage.setItem('fbl_ch_'+(activeId||'local'), JSON.stringify(chObj)); }catch{}
      setShowCh(false)
    }} onClose={()=>setShowCh(false)}/>) }
    {showEdit && (<Edit initial={{name,baseline:baseline??0,pack:pack??0}} onSave={async (v)=>{      setName(v.name);      setBaseline(v.baseline);      setPack(v.pack);      if(mode==='reduction') setTargetToday(v.baseline);      setShowEdit(false);      try {        const sb = await getSB();        if (sb && activeId) {          const { error } = await sb.from('profiles').update({            name: v.name,            baseline: v.baseline,            pack: v.pack,            target_today: (mode==='reduction' ? v.baseline : targetToday)          }).eq('id', activeId);          if (error) throw error;        }      } catch (e) { console.error('save profile err', e); }    }} onClose={()=>setShowEdit(false)}/>) }

    <div className="mx-auto max-w-md px-4 pt-6 pb-28">
      <Header name={name} />
      {tab==='home' && (<Home target={targetToday} smoked={smokedToday} points={pointsToday} log={logRemote} undo={undoRemote} certifyZero={certifyZeroToday} unlockZero={unlockZeroToday} zeroLocked={zeroLocked} showUndo={showUndo} undoCount={undoCount} ch={computeChallengeState(challenge, { baseline: baseline??20, getSmoked:(k)=> (k===todayStr()?smokedToday: (history.find(h=>h.date===k)?.smoked||0)), getTarget:(k)=> (k===todayStr()?targetToday: (dailyTargets[k]??(baseline??20))) })} shareWA={shareWA} shareSmokedCount={shareSmokedCount} lb={leaderboard} acts={acts} avoidedToday={avoidedToday} avoidedTotal={avoidedTotal} savingTotal={savingTotal} onChangeCh={()=>setShowCh(true)} streakDays={streakDays} streakBonusToday={(todayTracked && smokedToday===0)?(5 + Math.max(0,streakDays-1)*2):0} levelFromXp={(p)=>levelFrom(p)} levelProg={(p)=>levelInfo(p)} goBoard={()=>setTab('classifica')} debugShiftDay={debugShiftDay} debugResetDay={debugResetDay} simDate={todayStr()} tick={timeTick} myPoints={myPoints} />)}
      {tab==='registro' && (<Registro history={history} historyAgg={historyWithToday} todaySmoked={smokedToday} pack={pack??0} baseline={baseline??20} onboardDate={onboardDate}/>) }
      {tab==='classifica' && (<Board data={leaderboard} levelFrom={levelFrom} prog={prog} lvlStep={lvlStep} meName={name||'Tu'} />) }
      {tab==='salute' && (<Health daysSF={streakDays}/>)}
      {tab==='profilo' && (<Profile name={name} baseline={baseline??0} pack={pack??0} streak={streakDays} daysSF={daysSF} mode={mode} setMode={(m)=>{setMode(m); const newT = (m==='zero')?0:(baseline??targetToday); setTargetToday(newT); setDailyTargets(t=>({ ...t, [todayStr()]: newT })); (async()=>{ try{ const sb=await getSB(); const d=todayStr(); const b=baseline??20; const base=computePoints(b,newT,smokedToday); const bonus=(rewardsByDate[d]||0); const sbn=(todayTracked && smokedToday===0)?(5 + Math.max(0,streakDays-1)*2):0; if(sb && activeId){ await sb.from('profiles').update({ mode:m, target_today:newT }).eq('id', activeId); await sb.from('daily_stats').upsert({ profile_id: activeId, date: d, smoked: smokedToday, target: newT, points: base+bonus+sbn }); } else if(activeId){ upsertDailyStatLocal(activeId, { date:d, smoked: smokedToday, target: newT, points: base+sbn }); } }catch{} })(); }} target={targetToday} setTarget={(n)=>{const v=Math.max(0,n); const m2 = (v===0)?'zero':'reduction'; setTargetToday(v); setMode(m2); setDailyTargets(t=>({ ...t, [todayStr()]: v })); (async()=>{ try{ const sb=await getSB(); const d=todayStr(); const b=baseline??20; const base=computePoints(b,v,smokedToday); const bonus=(rewardsByDate[d]||0); const sbn=(todayTracked && smokedToday===0)?(5 + Math.max(0,streakDays-1)*2):0; if(sb && activeId){ await sb.from('profiles').update({ target_today:v, mode:m2 }).eq('id', activeId); await sb.from('daily_stats').upsert({ profile_id: activeId, date: d, smoked: smokedToday, target: v, points: base+bonus+sbn }); } else if(activeId){ upsertDailyStatLocal(activeId, { date:d, smoked: smokedToday, target: v, points: base+sbn }); } }catch{} })(); }} setDaysSF={setDaysSF} onEdit={()=>setShowEdit(true)} badges={badges} earnedBadgeIds={earnedBadges} />)}
    </div>
    <Tabs tab={tab} setTab={setTab}/>
  </div></AppProvider>);
}

// ---- parts ----
// ---- utils ----
import { todayStr, toISO, addDays, nowWithOffset, fromDayKey } from './utils/dates.js';
import { avoided, dailySaving, aggregate, upsert, round2 } from './utils/calc.js';
import { computePoints, lvlStep, levelInfo, levelFrom } from './utils/points.js';
import { loadDailyStatsLocal, upsertDailyStatLocal } from './lib/storage.js';
import Header from './components/Header.jsx';
import Tabs from './components/Tabs.jsx';
import Confetti from './components/ui/Confetti.jsx';
import Home from './views/Home.jsx';
import Registro from './views/Registro.jsx';
import Board from './views/Board.jsx';
import Health from './views/Health.jsx';
import Profile from './views/Profile.jsx';
import Onboard from './components/modals/Onboard.jsx';
import Edit from './components/modals/Edit.jsx';
import Login from './components/modals/Login.jsx';
import ChallengePicker from './components/modals/ChallengePicker.jsx';
import { CHALLENGES, computeChallengeState, dayKeyAdd } from './lib/challenges.js';
import { AppProvider } from './state/AppContext.jsx';

const _ConfettiOld=()=>{const n=18;const arr=[...Array(n).keys()];return(<>
  <div className="confetti">{arr.map(i=>{const left=Math.random()*100,delay=Math.random()*2,size=6+Math.random()*8;const colors=['#00B7FF','#FF2EA6','#00E3B5','#FF7A00','#7B42FF'];const st={position:'absolute',left:left+'%',top:'-10px',width:size,height:size,background:colors[i%colors.length],borderRadius:9999,opacity:.95,animation:`fall 1.8s ${delay}s ease-in forwards`,boxShadow:'0 2px 6px rgba(0,0,0,.12)'};return <span key={i} style={st}/>})}</div>
  <style>{`@keyframes fall{to{transform:translateY(120vh) rotate(240deg);opacity:.98}}`}</style>
</>)};


