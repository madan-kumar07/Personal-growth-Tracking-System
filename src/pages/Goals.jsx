import { useState, useMemo } from "react";
import {
  Target, Plus, X, Trash2, Edit3, CheckCircle, Circle, Clock,
  TrendingUp, Star, BarChart2, Zap, Award, Calendar, ChevronDown,
  ChevronUp, Save, Flag, Filter
} from "lucide-react";

const CATEGORIES = [
  { id:"Career",   emoji:"💼", color:"#a78bfa" },
  { id:"Health",   emoji:"💪", color:"#34d399" },
  { id:"Learning", emoji:"📚", color:"#60a5fa" },
  { id:"Personal", emoji:"🌟", color:"#f59e0b" },
  { id:"Finance",  emoji:"💰", color:"#4ade80" },
];

const TYPES = [
  { id:"short",  label:"Short-term",  sub:"1–4 weeks",     color:"#60a5fa" },
  { id:"monthly",label:"Monthly",     sub:"1–3 months",    color:"#a78bfa" },
  { id:"long",   label:"Long-term",   sub:"6–12 months",   color:"#f59e0b" },
];

const XP_BY_TYPE = { short:100, monthly:250, long:500 };

function getCategoryMeta(id) {
  return CATEGORIES.find(c => c.id===id) || { emoji:"🎯", color:"#a78bfa" };
}

function getTypeMeta(id) {
  return TYPES.find(t => t.id===id) || TYPES[0];
}

function daysLeft(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000*60*60*24));
}

function ProgressRing({ pct=0, size=70, stroke=7, color="#a78bfa", children }) {
  const r = (size-stroke)/2;
  const circ = 2*Math.PI*r;
  const offset = circ - (pct/100)*circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center" }}>
        {children || <span style={{ fontSize:14, fontWeight:700, color }}>{pct}%</span>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color="#a78bfa" }) {
  return (
    <div className="glass-card" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:12, background:color+"22",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={20} color={color}/>
      </div>
      <div>
        <div style={{ fontSize:24, fontWeight:700, color:"#fff" }}>{value}</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onUpdate, onDelete, onEdit }) {
  const cat = getCategoryMeta(goal.category);
  const typ = getTypeMeta(goal.type);
  const days = daysLeft(goal.deadline);
  const [showSlider, setShowSlider] = useState(false);
  const [localProg, setLocalProg] = useState(goal.progress || 0);

  const isOverdue = days !== null && days < 0 && !goal.completed;
  const isUrgent = days !== null && days <= 7 && days >= 0 && !goal.completed;

  return (
    <div className="glass-card" style={{ padding:20,
      borderLeft:`3px solid ${goal.completed ? "#34d399" : cat.color}44`,
      opacity: goal.completed ? 0.75 : 1 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
        {/* Ring */}
        <ProgressRing pct={goal.progress||0} size={64} color={goal.completed?"#34d399":cat.color}>
          {goal.completed
            ? <CheckCircle size={22} color="#34d399"/>
            : <span style={{ fontSize:12, fontWeight:700, color: cat.color }}>{goal.progress||0}%</span>
          }
        </ProgressRing>

        {/* Content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:6 }}>
            <div>
              <h3 style={{ margin:0, fontSize:15, fontWeight:700,
                textDecoration: goal.completed?"line-through":"none",
                color: goal.completed?"rgba(255,255,255,0.5)":"#fff" }}>
                {goal.title}
              </h3>
              <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
                  background: cat.color+"22", color: cat.color }}>
                  {cat.emoji} {goal.category}
                </span>
                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
                  background: typ.color+"22", color: typ.color }}>
                  {typ.label}
                </span>
                {isOverdue && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
                    background:"rgba(248,113,113,0.15)", color:"#f87171" }}>
                    Overdue
                  </span>
                )}
                {isUrgent && !isOverdue && (
                  <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
                    background:"rgba(245,158,11,0.15)", color:"#f59e0b" }}>
                    Due soon
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              <button onClick={() => setShowSlider(v=>!v)}
                style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8,
                  width:30, height:30, cursor:"pointer", color:"rgba(255,255,255,0.5)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                <TrendingUp size={13}/>
              </button>
              <button onClick={onEdit}
                style={{ background:"rgba(255,255,255,0.07)", border:"none", borderRadius:8,
                  width:30, height:30, cursor:"pointer", color:"rgba(255,255,255,0.5)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Edit3 size={13}/>
              </button>
              <button onClick={onDelete}
                style={{ background:"rgba(248,113,113,0.08)", border:"none", borderRadius:8,
                  width:30, height:30, cursor:"pointer", color:"#f87171",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>

          {goal.description && (
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:"0 0 8px", lineHeight:1.5 }}>
              {goal.description}
            </p>
          )}

          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {days !== null && (
              <span style={{ fontSize:12, color: isOverdue?"#f87171" : isUrgent?"#f59e0b" : "rgba(255,255,255,0.35)",
                display:"flex", alignItems:"center", gap:4 }}>
                <Calendar size={12}/>
                {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today!" : `${days}d left`}
              </span>
            )}
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>
              +{XP_BY_TYPE[goal.type||"short"]} XP on completion
            </span>
          </div>
        </div>
      </div>

      {/* Progress slider */}
      {showSlider && !goal.completed && (
        <div style={{ marginTop:14, padding:"14px 16px", borderRadius:12, background:"rgba(255,255,255,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Update Progress</span>
            <span style={{ fontSize:14, fontWeight:700, color: cat.color }}>{localProg}%</span>
          </div>
          <input type="range" min={0} max={100} value={localProg}
            onChange={e => setLocalProg(Number(e.target.value))}
            style={{ width:"100%", accentColor: cat.color, marginBottom:10 }}/>
          <button className="primary-btn" style={{ width:"100%", fontSize:13 }}
            onClick={() => { onUpdate(localProg); setShowSlider(false); }}>
            Save Progress
          </button>
        </div>
      )}
    </div>
  );
}

export default function Goals({ state, setState, onNav, onXP }) {
  const goals = state.goals || [];

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterCat, setFilterCat] = useState(null);
  const [form, setForm] = useState({
    title:"", category:"Career", type:"short", deadline:"", description:"", progress:0
  });
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter(g => !g.completed).length;
    const completed = goals.filter(g => g.completed).length;
    const rate = total ? Math.round((completed/total)*100) : 0;
    return { total, active, completed, rate };
  }, [goals]);

  const filtered = useMemo(() => {
    let list = goals.filter(g => !g.completed || g.completed);
    if (filterType) list = list.filter(g => g.type===filterType);
    if (filterCat) list = list.filter(g => g.category===filterCat);
    return list;
  }, [goals, filterType, filterCat]);

  const byType = (type) => filtered.filter(g => g.type===type);

  const topGoals = useMemo(() =>
    goals.filter(g => !g.completed).slice(0,3),
    [goals]
  );

  function openCreate() {
    setEditId(null);
    setForm({ title:"", category:"Career", type:"short", deadline:"", description:"", progress:0 });
    setShowCreate(true);
  }

  function openEdit(goal) {
    setEditId(goal.id);
    setForm({
      title: goal.title||"", category: goal.category||"Career",
      type: goal.type||"short", deadline: goal.deadline||"",
      description: goal.description||"", progress: goal.progress||0
    });
    setShowCreate(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    const payload = { ...form, id: editId || Date.now().toString(), completed: false, createdAt: new Date().toISOString() };

    try {
      await fetch("/api/goals", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
    } catch {}

    if (!editId) {
      setState(s => ({ ...s, goals: [...(s.goals||[]), payload] }));
    } else {
      setState(s => ({ ...s, goals: (s.goals||[]).map(g => g.id===editId ? {...g, ...form} : g) }));
    }

    setShowCreate(false);
    setSaving(false);
  }

  function handleUpdate(id, progress) {
    const goal = goals.find(g => g.id===id);
    if (!goal) return;
    const wasCompleted = progress === 100 && !goal.completed;
    const patch = progress===100 ? { progress:100, completed:true, completedAt:new Date().toISOString() } : { progress };
    setState(s => ({ ...s, goals: s.goals.map(g => g.id===id ? {...g, ...patch} : g) }));
    if (wasCompleted) onXP(XP_BY_TYPE[goal.type||"short"], `Goal Completed! 🎯`);
  }

  function handleDelete(id) {
    setState(s => ({ ...s, goals: s.goals.filter(g => g.id!==id) }));
  }

  // Category breakdown
  const catBreakdown = CATEGORIES.map(c => ({
    ...c, count: goals.filter(g=>g.category===c.id).length,
    done: goals.filter(g=>g.category===c.id&&g.completed).length
  })).filter(c=>c.count>0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ display:"flex", alignItems:"center", gap:10, margin:0 }}>
            <Target size={28} color="#f59e0b"/> Goals
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", margin:"4px 0 0", fontSize:14 }}>
            Aim. Track. Achieve.
          </p>
        </div>
        <button className="primary-btn" onClick={openCreate}
          style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Plus size={16}/> New Goal
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard icon={Target} label="Active Goals" value={stats.active} color="#f59e0b"/>
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="#34d399"/>
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${stats.rate}%`} color="#a78bfa"/>
        <StatCard icon={Zap} label="Total Goals" value={stats.total} color="#60a5fa"/>
      </div>

      {/* Vision Board */}
      {topGoals.length > 0 && (
        <div className="glass-card" style={{ padding:24, marginBottom:24,
          background:"linear-gradient(135deg,rgba(167,139,250,0.08),rgba(245,158,11,0.05))" }}>
          <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
            <Star size={18} color="#f59e0b"/> Vision Board — Top Goals
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
            {topGoals.map((g,i) => {
              const cat = getCategoryMeta(g.category);
              const days = daysLeft(g.deadline);
              return (
                <div key={g.id} style={{ padding:"16px 18px", borderRadius:14,
                  background:`linear-gradient(135deg,${cat.color}15,${cat.color}05)`,
                  border:`1px solid ${cat.color}30` }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{cat.emoji}</div>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{g.title}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:10 }}>
                    {days !== null ? (days<0 ? "Overdue" : `${days}d left`) : "No deadline"}
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:6, height:6, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${g.progress||0}%`, background: cat.color, borderRadius:6, transition:"width 0.4s" }}/>
                  </div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:4 }}>{g.progress||0}% complete</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        <button onClick={() => { setFilterType(null); setFilterCat(null); }}
          style={{ padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
            background:!filterType&&!filterCat?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.05)",
            color:"rgba(255,255,255,0.6)" }}>
          All
        </button>
        {TYPES.map(t => (
          <button key={t.id} onClick={() => setFilterType(filterType===t.id?null:t.id)}
            style={{ padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
              background: filterType===t.id ? t.color+"22" : "rgba(255,255,255,0.05)",
              color: filterType===t.id ? t.color : "rgba(255,255,255,0.5)" }}>
            {t.label}
          </button>
        ))}
        <div style={{ width:1, background:"rgba(255,255,255,0.1)", margin:"0 4px" }}/>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setFilterCat(filterCat===c.id?null:c.id)}
            style={{ padding:"7px 12px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12,
              background: filterCat===c.id ? c.color+"22" : "rgba(255,255,255,0.05)",
              color: filterCat===c.id ? c.color : "rgba(255,255,255,0.5)" }}>
            {c.emoji} {c.id}
          </button>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
          <h3>Set Your First Goal</h3>
          <p>Dream big. Set goals. Make it happen, one step at a time.</p>
          <button className="primary-btn" onClick={openCreate}
            style={{ display:"flex", alignItems:"center", gap:6, margin:"0 auto" }}>
            <Plus size={16}/> Create Goal
          </button>
        </div>
      ) : (
        <div className="sidebar-layout" style={{ gap:24 }}>
          {/* Goal groups */}
          <div>
            {TYPES.map(typ => {
              const list = byType(typ.id);
              if (list.length === 0 && (filterType && filterType!==typ.id)) return null;
              return (
                <div key={typ.id} style={{ marginBottom:28 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background: typ.color }}/>
                    <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{typ.label}</h3>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{typ.sub}</span>
                    <span style={{ marginLeft:"auto", fontSize:12, color:"rgba(255,255,255,0.4)",
                      background:"rgba(255,255,255,0.06)", padding:"2px 10px", borderRadius:20 }}>
                      {list.length}
                    </span>
                  </div>
                  {list.length === 0 ? (
                    <div style={{ padding:"20px", borderRadius:12, border:"1.5px dashed rgba(255,255,255,0.07)",
                      textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:13 }}>
                      No {typ.label.toLowerCase()} goals
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {list.map(goal => (
                        <GoalCard key={goal.id} goal={goal}
                          onUpdate={(p) => handleUpdate(goal.id, p)}
                          onDelete={() => handleDelete(goal.id)}
                          onEdit={() => openEdit(goal)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Analytics sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Completion ring */}
            <div className="glass-card" style={{ padding:24, textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>📊 Overall Progress</div>
              <div style={{ display:"flex", justifyContent:"center" }}>
                <ProgressRing pct={stats.rate} size={100} stroke={10} color="#a78bfa">
                  <div style={{ fontSize:20, fontWeight:700, color:"#a78bfa" }}>{stats.rate}%</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>complete</div>
                </ProgressRing>
              </div>
              <div style={{ marginTop:16, fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                {stats.completed} of {stats.total} goals completed
              </div>
            </div>

            {/* Category breakdown */}
            <div className="glass-card" style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>By Category</div>
              {catBreakdown.length === 0 ? (
                <div style={{ color:"rgba(255,255,255,0.25)", fontSize:13, textAlign:"center", padding:"12px 0" }}>
                  No data yet
                </div>
              ) : (
                catBreakdown.map(c => (
                  <div key={c.id} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:16 }}>{c.emoji}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)", flex:1 }}>{c.id}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{c.done}/{c.count}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:5, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${c.count?(c.done/c.count)*100:0}%`,
                        background:c.color, borderRadius:4 }}/>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upcoming deadlines */}
            <div className="glass-card" style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>⏰ Upcoming</div>
              {goals.filter(g=>!g.completed&&g.deadline)
                .sort((a,b)=>new Date(a.deadline)-new Date(b.deadline))
                .slice(0,4)
                .map(g => {
                  const days = daysLeft(g.deadline);
                  const cat = getCategoryMeta(g.category);
                  return (
                    <div key={g.id} style={{ marginBottom:10, padding:"8px 12px", borderRadius:10,
                      background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:16 }}>{cat.emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.title}</div>
                        <div style={{ fontSize:11, color: days<=0?"#f87171" : days<=7?"#f59e0b" : "rgba(255,255,255,0.3)" }}>
                          {days<0?`${Math.abs(days)}d overdue` : days===0?"Today!" : `${days}d left`}
                        </div>
                      </div>
                    </div>
                  );
                })
              }
              {goals.filter(g=>!g.completed&&g.deadline).length===0 && (
                <div style={{ color:"rgba(255,255,255,0.25)", fontSize:13, textAlign:"center" }}>
                  No deadlines set
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
          onClick={e => { if(e.target===e.currentTarget) setShowCreate(false); }}>
          <div style={{ width:"100%", maxWidth:520, borderRadius:20, background:"rgba(18,18,30,0.98)",
            border:"1px solid rgba(255,255,255,0.1)", padding:28, position:"relative" }}>
            <button onClick={() => setShowCreate(false)}
              style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.08)",
                border:"none", borderRadius:8, width:32, height:32, cursor:"pointer",
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={16}/>
            </button>
            <h2 style={{ margin:"0 0 24px", fontSize:20, fontWeight:700 }}>
              {editId ? "✏️ Edit Goal" : "🎯 New Goal"}
            </h2>
            <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Goal Title *</label>
                <input className="form-input" placeholder="What do you want to achieve?" required
                  value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8, display:"block" }}>Category</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {CATEGORIES.map(c => (
                    <button type="button" key={c.id} onClick={() => setForm(f=>({...f,category:c.id}))}
                      style={{ padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                        background: form.category===c.id ? c.color+"33" : "rgba(255,255,255,0.06)",
                        color: form.category===c.id ? c.color : "rgba(255,255,255,0.5)",
                        outline: form.category===c.id ? `1px solid ${c.color}44` : "none" }}>
                      {c.emoji} {c.id}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8, display:"block" }}>Type</label>
                <div style={{ display:"flex", gap:8 }}>
                  {TYPES.map(t => (
                    <button type="button" key={t.id} onClick={() => setForm(f=>({...f,type:t.id}))}
                      style={{ flex:1, padding:"8px 4px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
                        background: form.type===t.id ? t.color+"22" : "rgba(255,255,255,0.06)",
                        color: form.type===t.id ? t.color : "rgba(255,255,255,0.4)",
                        outline: form.type===t.id ? `1px solid ${t.color}44` : "none" }}>
                      <div>{t.label}</div>
                      <div style={{ fontSize:10, opacity:0.6, marginTop:2 }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Deadline</label>
                <input className="form-input" type="date"
                  value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Description</label>
                <textarea className="form-textarea" rows={3} placeholder="Why is this goal important?"
                  value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
              </div>
              {editId && (
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>
                    Current Progress: {form.progress}%
                  </label>
                  <input type="range" min={0} max={100} value={form.progress}
                    onChange={e=>setForm(f=>({...f,progress:Number(e.target.value)}))}
                    style={{ width:"100%", accentColor:"#a78bfa" }}/>
                </div>
              )}
              <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <button type="button" className="secondary-btn" onClick={() => setShowCreate(false)} style={{ flex:1 }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving} style={{ flex:2, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
                  <Target size={15}/> {saving?"Saving…" : (editId?"Update Goal":"Create Goal")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
