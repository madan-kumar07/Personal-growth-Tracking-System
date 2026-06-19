import { useState, useMemo } from "react";
import {
  BookOpen, Plus, X, Search, Calendar, Edit3, Trash2, ChevronDown,
  ChevronUp, Lightbulb, Tag, Filter, Clock, Hash, Smile, TrendingUp,
  Star, BarChart2, Save, ArrowLeft
} from "lucide-react";

const MOODS = [
  { val:1, emoji:"😞", label:"Terrible", color:"#f87171" },
  { val:2, emoji:"😕", label:"Bad",      color:"#fb923c" },
  { val:3, emoji:"😐", label:"Okay",     color:"#facc15" },
  { val:4, emoji:"🙂", label:"Good",     color:"#4ade80" },
  { val:5, emoji:"😄", label:"Amazing",  color:"#a78bfa" },
];

const PROMPTS = [
  "What was the highlight of your day?",
  "What are you grateful for right now?",
  "What challenge did you face and how did you handle it?",
  "What did you learn today that surprised you?",
  "How did you grow as a person today?",
  "What would you tell your past self from 1 year ago?",
  "Describe a moment that made you smile today.",
  "What's one thing you want to accomplish tomorrow?",
  "What's been on your mind lately?",
  "How are your energy levels and what's driving them?",
  "What conversation meant the most to you recently?",
  "What fear did you face or want to face?",
];

function getRandomPrompts(n=3) {
  const shuffled = [...PROMPTS].sort(() => Math.random()-0.5);
  return shuffled.slice(0, n);
}

function getMoodByVal(val) {
  return MOODS.find(m => m.val === val) || MOODS[2];
}

function StatCard({ icon: Icon, label, value, color="#a78bfa" }) {
  return (
    <div className="glass-card" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:color+"22",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={18} color={color}/>
      </div>
      <div>
        <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>{value}</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{label}</div>
      </div>
    </div>
  );
}

function MonthCalendar({ entries }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const entryDates = new Set(
    entries.map(e => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const hasEntry = (day) => entryDates.has(`${year}-${month}-${day}`);
  const isToday = (day) => now.getFullYear()===year && now.getMonth()===month && now.getDate()===day;

  const prevMonth = () => { if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={prevMonth} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:4 }}>
          <ChevronDown size={16} style={{ transform:"rotate(90deg)" }}/>
        </button>
        <span style={{ fontSize:15, fontWeight:600 }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)", padding:4 }}>
          <ChevronDown size={16} style={{ transform:"rotate(-90deg)" }}/>
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.3)", padding:"4px 0" }}>{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`}/>)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i+1;
          const has = hasEntry(day);
          const today = isToday(day);
          return (
            <div key={day} style={{
              width:"100%", aspectRatio:"1", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight: today||has ? 700 : 400,
              background: has ? "rgba(167,139,250,0.2)" : today ? "rgba(255,255,255,0.08)" : "transparent",
              color: has ? "#a78bfa" : today ? "#fff" : "rgba(255,255,255,0.4)",
              border: today ? "1px solid rgba(255,255,255,0.2)" : "none",
              position:"relative"
            }}>
              {day}
              {has && <div style={{ position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
                width:4, height:4, borderRadius:"50%", background:"#a78bfa" }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Journal({ state, setState, onNav, onXP }) {
  const entries = (state.journal?.entries || []);

  const [showWrite, setShowWrite] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterMood, setFilterMood] = useState(null);
  const [prompts] = useState(getRandomPrompts(3));
  const [showPrompts, setShowPrompts] = useState(false);

  const [form, setForm] = useState({
    title: "", content: "", mood: 3, tags: "", date: new Date().toISOString().split("T")[0]
  });
  const [saving, setSaving] = useState(false);

  const filteredEntries = useMemo(() => {
    let list = [...entries].reverse();
    if (searchQ) list = list.filter(e =>
      e.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.content?.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.tags?.toLowerCase().includes(searchQ.toLowerCase())
    );
    if (filterMood) list = list.filter(e => e.mood === filterMood);
    return list;
  }, [entries, searchQ, filterMood]);

  const stats = useMemo(() => {
    const total = entries.length;
    const now = new Date();
    const thisMonth = entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    // streak
    const sortedDates = [...new Set(entries.map(e => e.date?.split("T")[0] || e.date))].sort();
    let streak = 0;
    let check = new Date(); check.setHours(0,0,0,0);
    for (let i = sortedDates.length-1; i >= 0; i--) {
      const d = new Date(sortedDates[i]);
      d.setHours(0,0,0,0);
      if (d.getTime() === check.getTime()) { streak++; check.setDate(check.getDate()-1); }
      else break;
    }
    return { total, thisMonth, streak };
  }, [entries]);

  function openCreate() {
    setEditId(null);
    setForm({ title:"", content:"", mood:3, tags:"", date: new Date().toISOString().split("T")[0] });
    setShowWrite(true);
  }

  function openEdit(entry) {
    setEditId(entry.id);
    setForm({ title:entry.title||"", content:entry.content||"", mood:entry.mood||3,
      tags:entry.tags||"", date: entry.date?.split("T")[0] || new Date().toISOString().split("T")[0] });
    setShowWrite(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.content.trim()) return;
    setSaving(true);

    const payload = {
      ...form,
      id: editId || Date.now().toString(),
      date: form.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
    } catch {}

    if (!editId) {
      setState(s => ({ ...s, journal: { ...(s.journal||{}), entries: [...(s.journal?.entries||[]), payload] } }));
      onXP(10, "Journal Entry! 📝");
    } else {
      setState(s => ({
        ...s,
        journal: { ...(s.journal||{}), entries: (s.journal?.entries||[]).map(en => en.id===editId ? payload : en) }
      }));
    }

    setShowWrite(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    setState(s => ({
      ...s,
      journal: { ...(s.journal||{}), entries: (s.journal?.entries||[]).filter(e => e.id!==id) }
    }));
    if (expandedId===id) setExpandedId(null);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ display:"flex", alignItems:"center", gap:10, margin:0 }}>
            <BookOpen size={28} color="#f59e0b"/> Journal
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", margin:"4px 0 0", fontSize:14 }}>
            Your story, one page at a time.
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="secondary-btn" onClick={() => setShowPrompts(v=>!v)}
            style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Lightbulb size={15}/> Prompts
          </button>
          <button className="primary-btn" onClick={openCreate}
            style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Plus size={15}/> Write Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard icon={BookOpen} label="Total Entries" value={stats.total} color="#f59e0b"/>
        <StatCard icon={Calendar} label="This Month" value={stats.thisMonth} color="#60a5fa"/>
        <StatCard icon={TrendingUp} label="Day Streak" value={`${stats.streak}🔥`} color="#34d399"/>
      </div>

      {/* Writing Prompts */}
      {showPrompts && (
        <div className="glass-card" style={{ padding:20, marginBottom:24 }}>
          <h3 style={{ margin:"0 0 14px", fontSize:15, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
            <Lightbulb size={16} color="#f59e0b"/> Writing Prompts
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {prompts.map((p, i) => (
              <button key={i}
                onClick={() => { setForm(f=>({...f, content: f.content ? f.content+"\n\n"+p : p})); setShowWrite(true); }}
                style={{ textAlign:"left", padding:"12px 16px", borderRadius:12, border:"1px dashed rgba(245,158,11,0.3)",
                  background:"rgba(245,158,11,0.05)", cursor:"pointer", color:"rgba(255,255,255,0.75)",
                  fontSize:14, lineHeight:1.5 }}>
                {i+1}. {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-layout">
        {/* Main area */}
        <div>
          {/* Search & filter */}
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <div style={{ flex:1, position:"relative", minWidth:200 }}>
              <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }}/>
              <input className="form-input" placeholder="Search entries…" value={searchQ}
                onChange={e=>setSearchQ(e.target.value)} style={{ paddingLeft:36 }}/>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setFilterMood(null)}
                style={{ padding:"8px 12px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12,
                  background: !filterMood ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                  color:"rgba(255,255,255,0.6)" }}>
                All
              </button>
              {MOODS.map(m => (
                <button key={m.val} onClick={() => setFilterMood(filterMood===m.val?null:m.val)}
                  style={{ padding:"8px 10px", borderRadius:10, border:"none", cursor:"pointer", fontSize:16,
                    background: filterMood===m.val ? m.color+"22" : "rgba(255,255,255,0.05)",
                    outline: filterMood===m.val ? `1px solid ${m.color}44` : "none" }}>
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Entries */}
          {filteredEntries.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize:56, marginBottom:16 }}>📓</div>
              <h3>Write Your First Journal Entry</h3>
              <p>Capture your thoughts, track your growth, and reflect on your journey.</p>
              <button className="primary-btn" onClick={openCreate}
                style={{ display:"flex", alignItems:"center", gap:6, margin:"0 auto" }}>
                <Plus size={16}/> Write Entry
              </button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {filteredEntries.map(entry => {
                const mood = getMoodByVal(entry.mood);
                const isExpanded = expandedId === entry.id;
                const tags = entry.tags ? entry.tags.split(",").map(t=>t.trim()).filter(Boolean) : [];
                return (
                  <div key={entry.id} className="glass-card"
                    style={{ padding:20, borderLeft:`3px solid ${mood.color}44`, cursor:"pointer" }}
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                          <span style={{ fontSize:22 }}>{mood.emoji}</span>
                          <div>
                            <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>
                              {entry.title || "Untitled Entry"}
                            </h3>
                            <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:1 }}>
                              {new Date(entry.date).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
                            </div>
                          </div>
                        </div>

                        {/* Preview or full content */}
                        <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", lineHeight:1.7, margin:"0 0 10px",
                          ...(isExpanded ? {} : {
                            display:"-webkit-box", WebkitLineClamp:2,
                            WebkitBoxOrient:"vertical", overflow:"hidden"
                          }) }}>
                          {entry.content}
                        </p>

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {tags.map(t => (
                              <span key={t} style={{ fontSize:11, padding:"2px 8px", borderRadius:20,
                                background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.4)" }}>
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        {isExpanded && (
                          <>
                            <button onClick={e=>{e.stopPropagation();openEdit(entry);}}
                              style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
                                width:32, height:32, cursor:"pointer", color:"rgba(255,255,255,0.6)",
                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Edit3 size={13}/>
                            </button>
                            <button onClick={e=>{e.stopPropagation();handleDelete(entry.id);}}
                              style={{ background:"rgba(248,113,113,0.1)", border:"none", borderRadius:8,
                                width:32, height:32, cursor:"pointer", color:"#f87171",
                                display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <Trash2 size={13}/>
                            </button>
                          </>
                        )}
                        <button onClick={e=>{e.stopPropagation();setExpandedId(isExpanded?null:entry.id);}}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", padding:4 }}>
                          {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Calendar */}
          <div className="glass-card" style={{ padding:20 }}>
            <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
              <Calendar size={14} color="#a78bfa"/> Calendar
            </h3>
            <MonthCalendar entries={entries}/>
          </div>

          {/* Mood Distribution */}
          <div className="glass-card" style={{ padding:20 }}>
            <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
              <BarChart2 size={14} color="#60a5fa"/> Mood Summary
            </h3>
            {entries.length === 0 ? (
              <div style={{ color:"rgba(255,255,255,0.25)", fontSize:13, textAlign:"center", padding:"16px 0" }}>No entries yet</div>
            ) : (
              MOODS.map(m => {
                const cnt = entries.filter(e => e.mood === m.val).length;
                const pct = entries.length ? Math.round((cnt/entries.length)*100) : 0;
                return (
                  <div key={m.val} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:16 }}>{m.emoji}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", flex:1 }}>{m.label}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{cnt}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:5, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background: m.color, borderRadius:4 }}/>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Write/Edit Modal */}
      {showWrite && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
          onClick={e => { if(e.target===e.currentTarget) setShowWrite(false); }}>
          <div style={{ width:"100%", maxWidth:680, maxHeight:"92vh", borderRadius:20,
            background:"rgba(18,18,30,0.98)", border:"1px solid rgba(255,255,255,0.1)",
            overflow:"auto", padding:32, position:"relative" }}>
            <button onClick={() => setShowWrite(false)}
              style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.08)",
                border:"none", borderRadius:8, width:32, height:32, cursor:"pointer",
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <X size={16}/>
            </button>

            <h2 style={{ margin:"0 0 24px", fontSize:20, fontWeight:700 }}>
              {editId ? "✏️ Edit Entry" : "📓 Write Entry"}
            </h2>

            <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Title</label>
                  <input className="form-input" placeholder="Give this entry a title…"
                    value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
                </div>
                <div>
                  <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Date</label>
                  <input className="form-input" type="date" value={form.date}
                    onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                </div>
              </div>

              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8, display:"block" }}>How are you feeling?</label>
                <div style={{ display:"flex", gap:10 }}>
                  {MOODS.map(m => (
                    <button type="button" key={m.val} onClick={() => setForm(f=>({...f,mood:m.val}))}
                      style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                        padding:"10px 6px", borderRadius:12, border:"none", cursor:"pointer",
                        background: form.mood===m.val ? m.color+"22" : "rgba(255,255,255,0.04)",
                        outline: form.mood===m.val ? `2px solid ${m.color}44` : "none",
                        transform: form.mood===m.val ? "scale(1.1)" : "scale(1)",
                        transition:"all 0.15s" }}>
                      <span style={{ fontSize:24 }}>{m.emoji}</span>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>
                  Your thoughts *
                  <button type="button" onClick={() => setShowPrompts(v=>!v)}
                    style={{ marginLeft:10, fontSize:11, background:"none", border:"none", color:"#f59e0b",
                      cursor:"pointer", textDecoration:"underline" }}>
                    Need inspiration?
                  </button>
                </label>
                <textarea className="form-textarea" rows={10} required
                  placeholder="What's on your mind? Write freely…"
                  value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
                  style={{ resize:"vertical", lineHeight:1.8 }}/>
              </div>

              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>
                  Tags <span style={{ color:"rgba(255,255,255,0.25)" }}>(comma separated)</span>
                </label>
                <input className="form-input" placeholder="gratitude, goals, reflection…"
                  value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))}/>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button type="button" className="secondary-btn" onClick={() => setShowWrite(false)} style={{ flex:1 }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={saving} style={{ flex:2, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
                  <Save size={15}/> {saving ? "Saving…" : (editId ? "Update Entry" : "Save Entry (+10 XP)")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
