import { useState, useMemo } from "react";
import {
  Plus, Github, ExternalLink, Trash2, Edit3, Clock, CheckCircle,
  Circle, X, ChevronDown, ChevronUp, BarChart2, Layers, Code2,
  FolderKanban, Trophy, Target, TrendingUp, Play, Pause, RotateCcw,
  Save, AlertCircle, Star
} from "lucide-react";

const STATUS_COLS = [
  { id: "todo",        label: "To Do",       color: "#94a3b8", accent: "rgba(148,163,184,0.15)" },
  { id: "in-progress", label: "In Progress", color: "#a78bfa", accent: "rgba(167,139,250,0.15)" },
  { id: "completed",   label: "Completed",   color: "#34d399", accent: "rgba(52,211,153,0.15)" },
];

const TECH_COLORS = [
  "#a78bfa","#60a5fa","#34d399","#f59e0b","#f87171",
  "#38bdf8","#fb923c","#e879f9","#4ade80","#facc15",
];

function techColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TECH_COLORS[Math.abs(h) % TECH_COLORS.length];
}

function ProgressRing({ pct = 0, size = 60, stroke = 6, color = "#a78bfa" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s ease" }}/>
    </svg>
  );
}

function TagInput({ tags, onChange, placeholder = "Add tech…" }) {
  const [val, setVal] = useState("");
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal("");
  };
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:6, padding:"8px 12px",
      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:10, minHeight:44 }}>
      {tags.map(t => (
        <span key={t} style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 8px",
          background: techColor(t)+"33", border:`1px solid ${techColor(t)}55`,
          borderRadius:20, fontSize:12, color:"#fff" }}>
          {t}
          <X size={10} style={{ cursor:"pointer" }} onClick={() => onChange(tags.filter(x => x !== t))}/>
        </span>
      ))}
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if(e.key==="Enter"||e.key===",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={placeholder}
        style={{ flex:1, minWidth:80, background:"transparent", border:"none", outline:"none",
          color:"#fff", fontSize:13 }}/>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color="#a78bfa" }) {
  return (
    <div className="glass-card" style={{ padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:14, background: color+"22",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Icon size={22} color={color}/>
      </div>
      <div>
        <div style={{ fontSize:24, fontWeight:700, color:"#fff" }}>{value}</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

function Modal({ onClose, title, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%", maxWidth: wide ? 860 : 520, maxHeight:"90vh",
        borderRadius:20, background:"rgba(20,20,35,0.98)",
        border:"1px solid rgba(255,255,255,0.1)", overflow:"auto", padding:28, position:"relative" }}>
        <button onClick={onClose}
          style={{ position:"absolute", top:18, right:18, background:"rgba(255,255,255,0.08)",
            border:"none", borderRadius:8, width:32, height:32, cursor:"pointer",
            color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <X size={16}/>
        </button>
        {title && <h2 style={{ margin:"0 0 20px", fontSize:20, fontWeight:700 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

function ProjectCard({ project, colColor, onOpen, onDelete, onDragStart, dragging }) {
  return (
    <div draggable onDragStart={onDragStart}
      style={{ borderRadius:14, padding:14, cursor:"grab",
        background: dragging ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
        border:`1px solid ${dragging ? colColor : "rgba(255,255,255,0.08)"}`,
        opacity: dragging ? 0.5 : 1, transition:"all 0.2s", userSelect:"none" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <h4 style={{ margin:0, fontSize:14, fontWeight:600, color:"#fff" }}>{project.title}</h4>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={onOpen} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:2 }}>
            <ChevronDown size={14}/>
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,100,100,0.5)", padding:2 }}>
            <Trash2 size={12}/>
          </button>
        </div>
      </div>
      {project.description && (
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", lineHeight:1.5,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {project.description}
        </p>
      )}
      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
        {(project.techStack||[]).slice(0,3).map(t => (
          <span key={t} style={{ padding:"1px 7px", borderRadius:20, fontSize:10,
            background: techColor(t)+"33", color:"#fff" }}>{t}</span>
        ))}
        {(project.techStack||[]).length > 3 && (
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>+{project.techStack.length-3}</span>
        )}
      </div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Progress</span>
          <span style={{ fontSize:11, color: colColor, fontWeight:600 }}>{project.progress||0}%</span>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:5, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${project.progress||0}%`,
            background: colColor, borderRadius:4, transition:"width 0.3s" }}/>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginTop:10 }}>
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
            style={{ color:"rgba(255,255,255,0.4)", lineHeight:0 }}><Github size={13}/></a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
            style={{ color:"rgba(167,139,250,0.6)", lineHeight:0 }}><ExternalLink size={13}/></a>
        )}
        {(project.hoursLogged||0) > 0 && (
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginLeft:"auto",
            display:"flex", alignItems:"center", gap:3 }}>
            <Clock size={10}/> {project.hoursLogged}h
          </span>
        )}
      </div>
    </div>
  );
}

export default function Projects({ state, setState, onNav, onXP }) {
  const projects = state.projects || [];

  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [form, setForm] = useState({
    title:"", description:"", techStack:[], status:"todo",
    githubUrl:"", liveUrl:"", progress:0
  });
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [logHours, setLogHours] = useState("");
  const [noteText, setNoteText] = useState("");
  const [searchQ, setSearchQ] = useState("");

  const selected = projects.find(p => p.id === selectedId);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === "in-progress").length;
    const completed = projects.filter(p => p.status === "completed").length;
    const hours = projects.reduce((s, p) => s + (p.hoursLogged || 0), 0);
    return { total, active, completed, hours };
  }, [projects]);

  const filtered = useMemo(() =>
    projects.filter(p => !searchQ || p.title.toLowerCase().includes(searchQ.toLowerCase())),
    [projects, searchQ]
  );

  const byStatus = (status) => filtered.filter(p => p.status === status);

  const techUsage = useMemo(() => {
    const map = {};
    projects.forEach(p => (p.techStack||[]).forEach(t => { map[t] = (map[t]||0)+1; }));
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8);
  }, [projects]);

  const maxTech = techUsage[0]?.[1] || 1;

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const newProj = { id: Date.now().toString(), ...form, milestones:[], hoursLogged:0, notes:"", createdAt: new Date().toISOString() };
    try {
      const res = await fetch("/api/projects", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(newProj)
      });
      const data = await res.json();
      setState(s => ({ ...s, projects: [...(s.projects||[]), data.project || data] }));
    } catch {
      setState(s => ({ ...s, projects: [...(s.projects||[]), newProj] }));
    }
    setForm({ title:"", description:"", techStack:[], status:"todo", githubUrl:"", liveUrl:"", progress:0 });
    setShowCreate(false);
    setSaving(false);
  }

  async function handleDelete(id) {
    try { await fetch(`/api/projects/${id}`, { method:"DELETE" }); } catch {}
    setState(s => ({ ...s, projects: s.projects.filter(p => p.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }

  function updateProject(id, patch) {
    setState(s => ({ ...s, projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p) }));
  }

  async function saveEdit() {
    if (!editForm) return;
    const wasCompleted = selected?.status !== "completed" && editForm.status === "completed";
    updateProject(selectedId, editForm);
    try {
      await fetch(`/api/projects/${selectedId}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(editForm)
      });
    } catch {}
    if (wasCompleted) onXP(500, "Project Completed! 🚀");
    setEditMode(false);
  }

  function openDetail(p) {
    setSelectedId(p.id);
    setEditForm({ ...p });
    setEditMode(false);
    setNoteText(p.notes || "");
  }

  function addMilestone() {
    if (!newMilestone.trim()) return;
    const ms = [...(selected?.milestones || []), { id:Date.now(), title: newMilestone.trim(), done:false }];
    updateProject(selectedId, { milestones: ms });
    setNewMilestone("");
  }

  function toggleMilestone(msId) {
    const ms = (selected?.milestones || []).map(m => m.id === msId ? { ...m, done:!m.done } : m);
    updateProject(selectedId, { milestones: ms });
  }

  function logTime() {
    const h = parseFloat(logHours);
    if (isNaN(h) || h <= 0) return;
    updateProject(selectedId, { hoursLogged: (selected?.hoursLogged || 0) + h });
    setLogHours("");
  }

  function onDragStart(e, project) {
    setDragging(project.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e, status) {
    e.preventDefault();
    if (!dragging) return;
    const proj = projects.find(p => p.id === dragging);
    if (!proj) return;
    const wasCompleted = proj.status !== "completed" && status === "completed";
    updateProject(dragging, { status });
    if (wasCompleted) onXP(500, "Project Completed! 🚀");
    setDragging(null);
    setDragOver(null);
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ display:"flex", alignItems:"center", gap:10, margin:0 }}>
            <FolderKanban size={28} color="#a78bfa"/> Projects
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", margin:"4px 0 0", fontSize:14 }}>Build. Ship. Grow.</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="secondary-btn" onClick={() => setShowAnalytics(v => !v)}
            style={{ display:"flex", alignItems:"center", gap:6 }}>
            <BarChart2 size={16}/> Analytics
          </button>
          <button className="primary-btn" onClick={() => setShowCreate(true)}
            style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Plus size={16}/> New Project
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:16, marginBottom:24 }}>
        <StatCard icon={Layers} label="Total Projects" value={stats.total} color="#a78bfa"/>
        <StatCard icon={Play} label="In Progress" value={stats.active} color="#60a5fa"/>
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="#34d399"/>
        <StatCard icon={Clock} label="Hours Logged" value={`${stats.hours.toFixed(1)}h`} color="#f59e0b"/>
      </div>

      {showAnalytics && (
        <div className="glass-card" style={{ padding:24, marginBottom:24 }}>
          <h3 className="section-title" style={{ marginBottom:20 }}>📊 Project Analytics</h3>
          <div className="grid-2" style={{ gap:24 }}>
            <div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:12 }}>Completion Rate</div>
              <div style={{ fontSize:40, fontWeight:700, color:"#34d399" }}>
                {stats.total ? Math.round((stats.completed/stats.total)*100) : 0}%
              </div>
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, height:8, marginTop:12, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${stats.total?(stats.completed/stats.total)*100:0}%`,
                  background:"linear-gradient(90deg,#34d399,#4ade80)", borderRadius:8 }}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:12 }}>Tech Stack Usage</div>
              {techUsage.length === 0
                ? <div style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>No data yet</div>
                : techUsage.map(([tech, count]) => (
                  <div key={tech} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{tech}</span>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{count}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, height:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(count/maxTech)*100}%`, background: techColor(tech), borderRadius:4 }}/>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom:20 }}>
        <input className="form-input" placeholder="🔍 Search projects…" value={searchQ}
          onChange={e => setSearchQ(e.target.value)} style={{ maxWidth:320 }}/>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize:56, marginBottom:16 }}>🚀</div>
          <h3>Start Your First Project</h3>
          <p>Track your builds, showcase your work, and level up your portfolio.</p>
          <button className="primary-btn" onClick={() => setShowCreate(true)}
            style={{ display:"flex", alignItems:"center", gap:6, margin:"0 auto" }}>
            <Plus size={16}/> Create Project
          </button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20 }}>
          {STATUS_COLS.map(col => (
            <div key={col.id}
              onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => onDrop(e, col.id)}
              style={{ borderRadius:16, padding:16, minHeight:300,
                background: dragOver===col.id ? col.accent : "rgba(255,255,255,0.03)",
                border:`1.5px dashed ${dragOver===col.id ? col.color : "rgba(255,255,255,0.08)"}`,
                transition:"all 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:col.color }}/>
                  <span style={{ fontWeight:600, fontSize:15 }}>{col.label}</span>
                </div>
                <span style={{ background:"rgba(255,255,255,0.08)", borderRadius:20,
                  padding:"2px 10px", fontSize:12, color:"rgba(255,255,255,0.5)" }}>
                  {byStatus(col.id).length}
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {byStatus(col.id).length === 0 && (
                  <div style={{ textAlign:"center", padding:"32px 0", color:"rgba(255,255,255,0.2)", fontSize:13 }}>
                    Drop here
                  </div>
                )}
                {byStatus(col.id).map(proj => (
                  <ProjectCard key={proj.id} project={proj} colColor={col.color}
                    onOpen={() => openDetail(proj)}
                    onDelete={() => handleDelete(proj.id)}
                    onDragStart={e => onDragStart(e, proj)}
                    dragging={dragging === proj.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="✨ New Project">
          <form onSubmit={handleCreate} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Project Title *</label>
              <input className="form-input" placeholder="My Awesome App" required
                value={form.title} onChange={e => setForm(f=>({...f, title:e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Description</label>
              <textarea className="form-textarea" placeholder="What are you building?" rows={3}
                value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Tech Stack (press Enter to add)</label>
              <TagInput tags={form.techStack} onChange={ts => setForm(f=>({...f, techStack:ts}))}/>
            </div>
            <div className="grid-2" style={{ gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Status</label>
                <select className="form-select" value={form.status}
                  onChange={e => setForm(f=>({...f, status:e.target.value}))}>
                  {STATUS_COLS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Initial Progress %</label>
                <input className="form-input" type="number" min={0} max={100}
                  value={form.progress} onChange={e => setForm(f=>({...f, progress:Number(e.target.value)}))}/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>GitHub URL</label>
              <input className="form-input" placeholder="https://github.com/…"
                value={form.githubUrl} onChange={e => setForm(f=>({...f, githubUrl:e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4, display:"block" }}>Live Demo URL</label>
              <input className="form-input" placeholder="https://…"
                value={form.liveUrl} onChange={e => setForm(f=>({...f, liveUrl:e.target.value}))}/>
            </div>
            <div className="form-actions" style={{ marginTop: 8 }}>
              <button type="button" className="secondary-btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Creating…" : "🚀 Create Project"}
              </button>
            </div>          </form>
        </Modal>
      )}

      {selected && (
        <Modal onClose={() => setSelectedId(null)} title={null} wide>
          <div>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ flex:1 }}>
                {editMode ? (
                  <input className="form-input" value={editForm?.title||""} style={{ fontSize:20, fontWeight:700 }}
                    onChange={e => setEditForm(f=>({...f, title:e.target.value}))}/>
                ) : (
                  <h2 style={{ margin:0, fontSize:22, fontWeight:700 }}>{selected.title}</h2>
                )}
                <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                  {(selected.techStack||[]).map(t => (
                    <span key={t} style={{ padding:"2px 10px", borderRadius:20, fontSize:11,
                      background: techColor(t)+"33", border:`1px solid ${techColor(t)}55`, color:"#fff" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, marginLeft:12 }}>
                <button className="secondary-btn" style={{ padding:"6px 12px", fontSize:12 }}
                  onClick={() => { setEditMode(v=>!v); setEditForm({...selected}); }}>
                  <Edit3 size={14}/>
                </button>
                <button className="danger-btn" style={{ padding:"6px 12px", fontSize:12 }}
                  onClick={() => handleDelete(selected.id)}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>

            <div className="grid-2" style={{ gap:20 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <ProgressRing pct={editMode ? (editForm?.progress||0) : (selected.progress||0)}
                      color={selected.status==="completed"?"#34d399":"#a78bfa"}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:6 }}>Progress</div>
                      {editMode ? (
                        <input type="range" min={0} max={100} value={editForm?.progress||0}
                          onChange={e => setEditForm(f=>({...f, progress:Number(e.target.value)}))}
                          style={{ width:"100%", accentColor:"#a78bfa" }}/>
                      ) : (
                        <div style={{ fontSize:24, fontWeight:700 }}>{selected.progress || 0}%</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:10 }}>Status</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {STATUS_COLS.map(col => (
                      <button key={col.id}
                        onClick={() => {
                          const wasCompleted = selected.status!=="completed" && col.id==="completed";
                          updateProject(selected.id, { status:col.id });
                          if (wasCompleted) onXP(500, "Project Completed! 🚀");
                          if (editMode) setEditForm(f=>({...f, status:col.id}));
                        }}
                        style={{ flex:1, padding:"6px 4px", borderRadius:8, border:"none", cursor:"pointer",
                          fontSize:11, fontWeight:600,
                          background: selected.status===col.id ? col.color+"33" : "rgba(255,255,255,0.06)",
                          color: selected.status===col.id ? col.color : "rgba(255,255,255,0.5)",
                          outline: selected.status===col.id ? `1px solid ${col.color}55` : "none" }}>
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:10 }}>Links</div>
                  {editMode ? (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      <input className="form-input" placeholder="GitHub URL"
                        value={editForm?.githubUrl||""} onChange={e => setEditForm(f=>({...f, githubUrl:e.target.value}))}/>
                      <input className="form-input" placeholder="Live Demo URL"
                        value={editForm?.liveUrl||""} onChange={e => setEditForm(f=>({...f, liveUrl:e.target.value}))}/>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:10 }}>
                      {selected.githubUrl && (
                        <a href={selected.githubUrl} target="_blank" rel="noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
                            borderRadius:8, background:"rgba(255,255,255,0.08)",
                            color:"#fff", textDecoration:"none", fontSize:13 }}>
                          <Github size={14}/> GitHub
                        </a>
                      )}
                      {selected.liveUrl && (
                        <a href={selected.liveUrl} target="_blank" rel="noreferrer"
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
                            borderRadius:8, background:"rgba(167,139,250,0.15)",
                            color:"#a78bfa", textDecoration:"none", fontSize:13 }}>
                          <ExternalLink size={14}/> Live Demo
                        </a>
                      )}
                      {!selected.githubUrl && !selected.liveUrl && (
                        <span style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>No links added</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>Time Tracked</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, color:"#f59e0b", fontWeight:700 }}>
                      <Clock size={14}/> {(selected.hoursLogged||0).toFixed(1)}h
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input className="form-input" type="number" min={0} step={0.5}
                      placeholder="Hours" value={logHours}
                      onChange={e => setLogHours(e.target.value)} style={{ flex:1 }}/>
                    <button className="primary-btn" style={{ padding:"8px 14px", fontSize:13 }} onClick={logTime}>Log</button>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>Description</div>
                  {editMode ? (
                    <textarea className="form-textarea" rows={3}
                      value={editForm?.description||""}
                      onChange={e => setEditForm(f=>({...f, description:e.target.value}))}/>
                  ) : (
                    <p style={{ color:"rgba(255,255,255,0.7)", fontSize:14, margin:0, lineHeight:1.6 }}>
                      {selected.description || <span style={{ color:"rgba(255,255,255,0.3)" }}>No description</span>}
                    </p>
                  )}
                </div>

                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:10 }}>Milestones</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
                    {(selected.milestones||[]).length === 0 && (
                      <div style={{ color:"rgba(255,255,255,0.25)", fontSize:13 }}>No milestones yet</div>
                    )}
                    {(selected.milestones||[]).map(m => (
                      <div key={m.id} onClick={() => toggleMilestone(m.id)}
                        style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                          padding:"6px 10px", borderRadius:8,
                          background: m.done ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.04)" }}>
                        {m.done
                          ? <CheckCircle size={15} color="#34d399"/>
                          : <Circle size={15} color="rgba(255,255,255,0.3)"/>}
                        <span style={{ fontSize:13, textDecoration: m.done?"line-through":"none",
                          color: m.done?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.8)" }}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input className="form-input" placeholder="Add milestone…" value={newMilestone}
                      onChange={e => setNewMilestone(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && addMilestone()} style={{ flex:1 }}/>
                    <button className="secondary-btn" style={{ padding:"8px 14px" }} onClick={addMilestone}>
                      <Plus size={14}/>
                    </button>
                  </div>
                </div>

                <div className="glass-card" style={{ padding:16 }}>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>Notes</div>
                  <textarea className="form-textarea" rows={4} placeholder="Add project notes…"
                    value={noteText} onChange={e => setNoteText(e.target.value)}/>
                  <button className="secondary-btn" style={{ marginTop:8, fontSize:12, display:"flex", alignItems:"center", gap:6 }}
                    onClick={() => updateProject(selectedId, { notes: noteText })}>
                    <Save size={13}/> Save Notes
                  </button>
                </div>

                {editMode && (
                  <div className="glass-card" style={{ padding:16 }}>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>Tech Stack</div>
                    <TagInput tags={editForm?.techStack||[]}
                      onChange={ts => setEditForm(f=>({...f, techStack:ts}))}/>
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button className="secondary-btn" onClick={() => setEditMode(false)}>Cancel</button>
                <button className="primary-btn" onClick={saveEdit}>
                  <Save size={14}/> Save Changes
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
