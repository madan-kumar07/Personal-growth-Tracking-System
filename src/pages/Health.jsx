import { useState, useEffect, useRef, useMemo } from "react";
import {
  Activity, Droplets, Moon, Smile, Scale, Brain, BookOpen, Heart,
  Plus, Minus, X, Check, TrendingUp, TrendingDown, Timer, Play,
  Pause, RotateCcw, Flame, Zap, Star, ChevronLeft, ChevronRight,
  Dumbbell, Wind
} from "lucide-react";

const WORKOUT_TYPES = ["Gym","Run","Yoga","Calisthenics","Walk","Cycling","Swimming","HIIT"];
const MOODS = [
  { val:1, emoji:"😞", label:"Terrible" },
  { val:2, emoji:"😕", label:"Bad" },
  { val:3, emoji:"😐", label:"Okay" },
  { val:4, emoji:"🙂", label:"Good" },
  { val:5, emoji:"😄", label:"Great" },
];
const SLEEP_QUALITIES = [1,2,3,4,5];
const TIPS = [
  "💧 Drink a glass of water first thing in the morning.",
  "🛌 Aim for 7-9 hours of sleep each night for optimal recovery.",
  "🧘 Even 10 minutes of meditation can reduce stress significantly.",
  "🏃 A 30-min walk burns ~150 calories and clears your mind.",
  "📵 Avoid screens 1 hour before bed for better sleep quality.",
  "🥗 Fill half your plate with vegetables at every meal.",
  "💪 Compound lifts build more muscle in less time.",
  "🌅 Morning sunlight resets your circadian rhythm naturally.",
];

function StatCard({ icon: Icon, label, value, sub, color="#a78bfa" }) {
  return (
    <div className="glass-card" style={{ padding:"18px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:color+"22",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={18} color={color}/>
        </div>
        <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:"#fff" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function HealthRing({ score }) {
  const pct = Math.min(score, 100);
  const size = 120, stroke = 10, r = (size-stroke)/2;
  const circ = 2*Math.PI*r;
  const color = pct >= 80 ? "#34d399" : pct >= 50 ? "#f59e0b" : "#f87171";
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.6s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:22, fontWeight:700, color }}>{pct}</div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Health</div>
      </div>
    </div>
  );
}

function SimpleLineChart({ data, color="#a78bfa", label="kg" }) {
  if (!data || data.length < 2) return (
    <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center",
      color:"rgba(255,255,255,0.2)", fontSize:13 }}>Not enough data</div>
  );
  const vals = data.map(d => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const W = 300, H = 80;
  const pts = data.map((d, i) => {
    const x = (i / (data.length-1)) * W;
    const y = H - ((d.value - min) / range) * (H-10) - 5;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:H, overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round"/>
      {data.map((d, i) => {
        const x = (i / (data.length-1)) * W;
        const y = H - ((d.value - min) / range) * (H-10) - 5;
        return <circle key={i} cx={x} cy={y} r={3} fill={color}/>;
      })}
    </svg>
  );
}

export default function Health({ state, setState, onNav, onXP }) {
  const health = state.health || {};
  const workouts = health.workouts || [];
  const sleepLog = health.sleepLog || [];
  const waterLog = health.waterLog || [];
  const moodLog = health.moodLog || [];
  const weightLog = health.weight || [];
  const meditationLog = health.meditationLog || [];

  // Workout
  const [wType, setWType] = useState("Gym");
  const [wDuration, setWDuration] = useState("");
  const [wNotes, setWNotes] = useState("");
  const [wSaving, setWSaving] = useState(false);

  // Sleep
  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);

  // Water
  const todayWater = useMemo(() => {
    const today = new Date().toDateString();
    return (waterLog.filter(w => new Date(w.date).toDateString()===today)
      .reduce((s,w) => s+w.amount, 0));
  }, [waterLog]);

  // Mood
  const [moodVal, setMoodVal] = useState(3);
  const [moodNote, setMoodNote] = useState("");

  // Weight
  const [weightVal, setWeightVal] = useState("");

  // Meditation Timer
  const [medDuration, setMedDuration] = useState(10);
  const [medLeft, setMedLeft] = useState(null);
  const [medRunning, setMedRunning] = useState(false);
  const medInterval = useRef(null);

  // Reading
  const [readTitle, setReadTitle] = useState("");
  const [readType, setReadType] = useState("Book");
  const [readProgress, setReadProgress] = useState(0);
  const [reading, setReading] = useState(state.health?.reading || []);

  // Active tab
  const [tab, setTab] = useState("workout");
  const [tip] = useState(() => TIPS[Math.floor(Math.random()*TIPS.length)]);

  // Meditation timer
  useEffect(() => {
    if (medRunning && medLeft !== null) {
      medInterval.current = setInterval(() => {
        setMedLeft(l => {
          if (l <= 1) {
            setMedRunning(false);
            clearInterval(medInterval.current);
            logMeditation(medDuration);
            return 0;
          }
          return l - 1;
        });
      }, 1000);
    }
    return () => clearInterval(medInterval.current);
  }, [medRunning]);

  function startMed() {
    setMedLeft(medDuration * 60);
    setMedRunning(true);
  }
  function pauseMed() { setMedRunning(false); clearInterval(medInterval.current); }
  function resetMed() { setMedRunning(false); clearInterval(medInterval.current); setMedLeft(null); }

  function formatTime(sec) {
    const m = Math.floor(sec/60), s = sec%60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function updateHealth(patch) {
    setState(s => ({ ...s, health: { ...(s.health||{}), ...patch } }));
  }

  // Health score
  const healthScore = useMemo(() => {
    let score = 0;
    const last7 = (arr) => arr.filter(x => {
      const d = new Date(x.date||x.createdAt||Date.now());
      return (Date.now()-d.getTime()) < 7*24*60*60*1000;
    });
    score += Math.min(last7(workouts).length * 10, 35);
    const avgSleep = last7(sleepLog).reduce((s,x)=>s+x.hours,0)/Math.max(last7(sleepLog).length,1);
    score += avgSleep >= 7 ? 25 : Math.round((avgSleep/7)*25);
    const avgWater = last7(waterLog).reduce((s,x)=>s+x.amount,0)/Math.max(last7(waterLog).length,1);
    score += avgWater >= 2.5 ? 20 : Math.round((avgWater/2.5)*20);
    const avgMood = last7(moodLog).reduce((s,x)=>s+x.value,0)/Math.max(last7(moodLog).length,1);
    score += Math.round((avgMood/5)*20);
    return Math.min(Math.round(score), 100);
  }, [workouts, sleepLog, waterLog, moodLog]);

  // Last 7 days stats
  const last7 = (arr, key="date") => arr.filter(x => {
    const d = new Date(x[key]||x.date||Date.now());
    return (Date.now()-d.getTime()) < 7*24*60*60*1000;
  });
  const stats7 = {
    workouts: last7(workouts).length,
    avgSleep: last7(sleepLog).length
      ? (last7(sleepLog).reduce((s,x)=>s+x.hours,0)/last7(sleepLog).length).toFixed(1) : "—",
    avgWater: last7(waterLog).length
      ? (last7(waterLog).reduce((s,x)=>s+x.amount,0)/last7(waterLog).length).toFixed(1) : "—",
    avgMood: last7(moodLog).length
      ? (last7(moodLog).reduce((s,x)=>s+x.value,0)/last7(moodLog).length).toFixed(1) : "—",
  };

  async function logWorkout(e) {
    e.preventDefault();
    if (!wDuration) return;
    setWSaving(true);
    const entry = { id:Date.now().toString(), type:wType, duration:Number(wDuration), notes:wNotes, date: new Date().toISOString() };
    try {
      await fetch("/api/health/workout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry) });
    } catch {}
    updateHealth({ workouts: [...workouts, entry] });
    onXP(20, `${wType} Workout! 💪`);
    setWDuration(""); setWNotes("");
    setWSaving(false);
  }

  async function logSleep(e) {
    e.preventDefault();
    if (!sleepHours) return;
    const entry = { id:Date.now().toString(), hours:Number(sleepHours), quality:sleepQuality, date: new Date().toISOString() };
    try { await fetch("/api/health/sleep", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry) }); } catch {}
    updateHealth({ sleepLog: [...sleepLog, entry] });
    setSleepHours("");
  }

  async function addWater(amount) {
    const entry = { id:Date.now().toString(), amount, date: new Date().toISOString() };
    try { await fetch("/api/health/water", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry) }); } catch {}
    updateHealth({ waterLog: [...waterLog, entry] });
  }

  async function logMood(e) {
    e && e.preventDefault();
    const entry = { id:Date.now().toString(), value:moodVal, note:moodNote, date: new Date().toISOString() };
    try { await fetch("/api/health/mood", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(entry) }); } catch {}
    updateHealth({ moodLog: [...moodLog, entry] });
    setMoodNote("");
  }

  async function logMeditation(minutes) {
    const entry = { id:Date.now().toString(), duration:minutes, date: new Date().toISOString() };
    updateHealth({ meditationLog: [...meditationLog, entry] });
  }

  function logWeight(e) {
    e.preventDefault();
    if (!weightVal) return;
    const entry = { id:Date.now().toString(), value:Number(weightVal), date: new Date().toISOString() };
    updateHealth({ weight: [...weightLog, entry] });
    setWeightVal("");
  }

  function addReading(e) {
    e.preventDefault();
    if (!readTitle.trim()) return;
    const r = { id:Date.now().toString(), title:readTitle, type:readType, progress:readProgress, date: new Date().toISOString() };
    const updated = [...reading, r];
    setReading(updated);
    updateHealth({ reading: updated });
    setReadTitle(""); setReadProgress(0);
  }

  function updateReadProgress(id, val) {
    const updated = reading.map(r => r.id===id ? {...r, progress:val} : r);
    setReading(updated);
    updateHealth({ reading: updated });
  }

  const TABS = [
    { id:"workout", icon:Dumbbell, label:"Workout" },
    { id:"sleep", icon:Moon, label:"Sleep" },
    { id:"water", icon:Droplets, label:"Water" },
    { id:"mood", icon:Smile, label:"Mood" },
    { id:"weight", icon:Scale, label:"Weight" },
    { id:"meditation", icon:Brain, label:"Meditate" },
    { id:"reading", icon:BookOpen, label:"Reading" },
  ];

  const waterPct = Math.min((todayWater/4)*100, 100);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ display:"flex", alignItems:"center", gap:10, margin:0 }}>
            <Heart size={28} color="#f87171"/> Health
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", margin:"4px 0 0", fontSize:14 }}>Your body is your most important project.</p>
        </div>
        <HealthRing score={healthScore}/>
      </div>

      {/* 7-day stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard icon={Dumbbell} label="Workouts (7d)" value={stats7.workouts} color="#a78bfa"/>
        <StatCard icon={Moon} label="Avg Sleep" value={stats7.avgSleep !== "—" ? `${stats7.avgSleep}h` : "—"} color="#60a5fa"/>
        <StatCard icon={Droplets} label="Avg Water" value={stats7.avgWater !== "—" ? `${stats7.avgWater}L` : "—"} color="#38bdf8"/>
        <StatCard icon={Smile} label="Avg Mood" value={stats7.avgMood !== "—" ? `${stats7.avgMood}/5` : "—"} color="#f59e0b"/>
        <StatCard icon={Brain} label="Meditations" value={meditationLog.length} color="#34d399"/>
      </div>

      {/* Tip */}
      <div className="glass-card" style={{ padding:"14px 20px", marginBottom:24, display:"flex", alignItems:"center", gap:12,
        borderLeft:"3px solid #a78bfa" }}>
        <Zap size={18} color="#a78bfa" style={{ flexShrink:0 }}/>
        <span style={{ fontSize:14, color:"rgba(255,255,255,0.7)" }}>{tip}</span>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10,
              border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
              background: tab===t.id ? "#a78bfa22" : "rgba(255,255,255,0.06)",
              color: tab===t.id ? "#a78bfa" : "rgba(255,255,255,0.5)",
              outline: tab===t.id ? "1px solid #a78bfa44" : "none" }}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* Workout Tab */}
      {tab==="workout" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Log Workout</h3>
            <form onSubmit={logWorkout} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:6, display:"block" }}>Type</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {WORKOUT_TYPES.map(t => (
                    <button type="button" key={t} onClick={() => setWType(t)}
                      style={{ padding:"6px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                        background: wType===t ? "#a78bfa33" : "rgba(255,255,255,0.06)",
                        color: wType===t ? "#a78bfa" : "rgba(255,255,255,0.5)",
                        outline: wType===t ? "1px solid #a78bfa55" : "none" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Duration (minutes)</label>
                <input className="form-input" type="number" min={1} placeholder="30" required
                  value={wDuration} onChange={e=>setWDuration(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Notes</label>
                <input className="form-input" placeholder="What did you do?" value={wNotes} onChange={e=>setWNotes(e.target.value)}/>
              </div>
              <button type="submit" className="primary-btn" disabled={wSaving} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Dumbbell size={15}/> {wSaving?"Logging…":"Log Workout (+20 XP)"}
              </button>
            </form>
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Recent Workouts</h3>
            {workouts.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>💪</div>
                <p style={{ fontSize:14 }}>No workouts yet. Start moving!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[...workouts].reverse().slice(0,8).map(w => (
                  <div key={w.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{w.type}</div>
                      {w.notes && <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{w.notes}</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:13, color:"#a78bfa", fontWeight:600 }}>{w.duration}min</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>
                        {new Date(w.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sleep Tab */}
      {tab==="sleep" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Log Sleep</h3>
            <form onSubmit={logSleep} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Hours Slept</label>
                <input className="form-input" type="number" min={0} max={24} step={0.5} placeholder="7.5" required
                  value={sleepHours} onChange={e=>setSleepHours(e.target.value)}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8, display:"block" }}>Quality</label>
                <div style={{ display:"flex", gap:10 }}>
                  {SLEEP_QUALITIES.map(q => (
                    <button type="button" key={q} onClick={()=>setSleepQuality(q)}
                      style={{ width:40, height:40, borderRadius:10, border:"none", cursor:"pointer", fontSize:16, fontWeight:700,
                        background: sleepQuality===q ? "#60a5fa33" : "rgba(255,255,255,0.06)",
                        color: sleepQuality===q ? "#60a5fa" : "rgba(255,255,255,0.4)",
                        outline: sleepQuality===q ? "1px solid #60a5fa55" : "none" }}>
                      {q}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>1=Poor · 5=Excellent</div>
              </div>
              <button type="submit" className="primary-btn" style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Moon size={15}/> Log Sleep
              </button>
            </form>
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Sleep History</h3>
            {sleepLog.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🌙</div>
                <p style={{ fontSize:14 }}>Start tracking your sleep!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...sleepLog].reverse().slice(0,7).map(s => (
                  <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize:13 }}>{new Date(s.date).toLocaleDateString()}</div>
                    <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                      <span style={{ color:"#60a5fa", fontWeight:600 }}>{s.hours}h</span>
                      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Quality: {s.quality}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Water Tab */}
      {tab==="water" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:20 }}>Today's Water Intake</h3>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontSize:48, fontWeight:700, color:"#38bdf8" }}>{todayWater.toFixed(1)}L</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>of 4L daily goal</div>
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:20, height:16, overflow:"hidden", maxWidth:280, margin:"0 auto" }}>
                <div style={{ height:"100%", width:`${waterPct}%`,
                  background:"linear-gradient(90deg,#38bdf8,#60a5fa)", borderRadius:20, transition:"width 0.4s" }}/>
              </div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:8 }}>{waterPct.toFixed(0)}% of goal</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[0.25, 0.5, 1, 1.5].map(a => (
                <button key={a} className="secondary-btn" onClick={() => addWater(a)}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"12px" }}>
                  <Droplets size={15} color="#38bdf8"/> +{a}L
                </button>
              ))}
            </div>
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Water Log</h3>
            {waterLog.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>💧</div>
                <p style={{ fontSize:14 }}>Stay hydrated!</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...waterLog].reverse().slice(0,8).map(w => (
                  <div key={w.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 14px", borderRadius:10, background:"rgba(56,189,248,0.06)" }}>
                    <span style={{ color:"#38bdf8", fontSize:14, fontWeight:600 }}>+{w.amount}L</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>
                      {new Date(w.date).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood Tab */}
      {tab==="mood" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:20 }}>How are you feeling?</h3>
            <div className="mood-selectors" style={{ marginBottom: 20 }}>
              {MOODS.map(m => {
                const active = moodVal === m.val;
                return (
                  <button
                    key={m.val}
                    onClick={() => setMoodVal(m.val)}
                    className="mood-btn"
                    style={{
                      background: active ? "#f59e0b22" : "rgba(255,255,255,0.04)",
                      outline: active ? "2px solid #f59e0b55" : "none",
                      transform: active ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{m.emoji}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <input className="form-input" placeholder="Any notes? (optional)" value={moodNote}
              onChange={e=>setMoodNote(e.target.value)} style={{ marginBottom:12 }}/>
            <button className="primary-btn" onClick={logMood} style={{ display:"flex", alignItems:"center", gap:6, width:"100%" }}>
              <Smile size={15}/> Log Mood
            </button>
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Mood History</h3>
            {moodLog.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>😊</div>
                <p style={{ fontSize:14 }}>Track your emotional wellbeing</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...moodLog].reverse().slice(0,8).map(m => {
                  const mood = MOODS.find(x=>x.val===m.value)||MOODS[2];
                  return (
                    <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12,
                      padding:"8px 14px", borderRadius:10, background:"rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize:22 }}>{mood.emoji}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:600 }}>{mood.label}</div>
                        {m.note && <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{m.note}</div>}
                      </div>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>
                        {new Date(m.date).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weight Tab */}
      {tab==="weight" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Log Weight</h3>
            <form onSubmit={logWeight} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Weight (kg)</label>
                <input className="form-input" type="number" step={0.1} min={20} max={300} placeholder="70.5" required
                  value={weightVal} onChange={e=>setWeightVal(e.target.value)}/>
              </div>
              <button type="submit" className="primary-btn" style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Scale size={15}/> Log Weight
              </button>
            </form>
            {weightLog.length > 0 && (
              <div style={{ marginTop:20 }}>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:12 }}>Weight Trend</div>
                <SimpleLineChart data={weightLog.slice(-14).map(w=>({value:w.value,date:w.date}))} color="#34d399" label="kg"/>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>
                    Start: {weightLog[0]?.value}kg
                  </span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>
                    Latest: {weightLog[weightLog.length-1]?.value}kg
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Weight Log</h3>
            {weightLog.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>⚖️</div>
                <p style={{ fontSize:14 }}>Start tracking your weight</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...weightLog].reverse().slice(0,10).map((w,i) => (
                  <div key={w.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 14px", borderRadius:10, background:"rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"#34d399" }}>{w.value} kg</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{new Date(w.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meditation Tab */}
      {tab==="meditation" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24, textAlign:"center" }}>
            <h3 className="section-title" style={{ marginBottom:20 }}>Meditation Timer</h3>
            <div style={{ fontSize:64, fontWeight:300, color:"#a78bfa", letterSpacing:2, marginBottom:20, fontFamily:"monospace" }}>
              {medLeft !== null ? formatTime(medLeft) : `${String(medDuration).padStart(2,"0")}:00`}
            </div>
            {medLeft === null && (
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8, display:"block" }}>Duration (minutes)</label>
                <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                  {[5,10,15,20,30].map(d => (
                    <button key={d} onClick={() => setMedDuration(d)}
                      style={{ padding:"8px 12px", borderRadius:10, border:"none", cursor:"pointer", fontSize:13,
                        background: medDuration===d ? "#a78bfa33" : "rgba(255,255,255,0.06)",
                        color: medDuration===d ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              {!medRunning && medLeft === null && (
                <button className="primary-btn" onClick={startMed} style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 28px" }}>
                  <Play size={16}/> Start
                </button>
              )}
              {medRunning && (
                <button className="secondary-btn" onClick={pauseMed} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Pause size={16}/> Pause
                </button>
              )}
              {!medRunning && medLeft !== null && (
                <button className="primary-btn" onClick={() => setMedRunning(true)} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <Play size={16}/> Resume
                </button>
              )}
              {medLeft !== null && (
                <button className="secondary-btn" onClick={resetMed} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <RotateCcw size={16}/> Reset
                </button>
              )}
            </div>
            {medLeft === 0 && (
              <div style={{ marginTop:20, padding:"12px 20px", borderRadius:12,
                background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399", fontSize:14 }}>
                🎉 Session complete! Well done.
              </div>
            )}
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Meditation History</h3>
            <div style={{ fontSize:32, fontWeight:700, color:"#a78bfa", marginBottom:4 }}>{meditationLog.length}</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:16 }}>Total sessions</div>
            {meditationLog.length === 0 ? (
              <div className="empty-state" style={{ padding:"24px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🧘</div>
                <p style={{ fontSize:14 }}>Begin your mindfulness journey</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...meditationLog].reverse().slice(0,8).map(m => (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 14px", borderRadius:10, background:"rgba(167,139,250,0.06)" }}>
                    <span style={{ color:"#a78bfa", fontWeight:600 }}>{m.duration} min</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{new Date(m.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reading Tab */}
      {tab==="reading" && (
        <div className="grid-2" style={{ gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Add Reading</h3>
            <form onSubmit={addReading} style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Title *</label>
                <input className="form-input" placeholder="Book or article title" required
                  value={readTitle} onChange={e=>setReadTitle(e.target.value)}/>
              </div>
              <div className="grid-2" style={{ gap:10 }}>
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Type</label>
                  <select className="form-select" value={readType} onChange={e=>setReadType(e.target.value)}>
                    {["Book","Article","Paper","Blog","Video"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Progress %</label>
                  <input className="form-input" type="number" min={0} max={100}
                    value={readProgress} onChange={e=>setReadProgress(Number(e.target.value))}/>
                </div>
              </div>
              <button type="submit" className="primary-btn" style={{ display:"flex", alignItems:"center", gap:6 }}>
                <BookOpen size={15}/> Add
              </button>
            </form>
          </div>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 className="section-title" style={{ marginBottom:16 }}>Reading List</h3>
            {reading.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📚</div>
                <p style={{ fontSize:14 }}>Add books and articles to read</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {reading.map(r => (
                  <div key={r.id} style={{ padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,0.04)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600 }}>{r.title}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{r.type}</div>
                      </div>
                      <span style={{ fontSize:13, color:"#a78bfa", fontWeight:700 }}>{r.progress}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={r.progress}
                      onChange={e => updateReadProgress(r.id, Number(e.target.value))}
                      style={{ width:"100%", accentColor:"#a78bfa" }}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
