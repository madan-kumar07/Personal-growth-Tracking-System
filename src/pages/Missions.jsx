import React, { useState, useMemo, useCallback } from "react";
import {
  Zap, Plus, X, Edit2, Trash2, CheckCircle2, Check,
  Archive, ArchiveX, Filter, BarChart2, Clock, Target,
  ChevronDown, AlertCircle, Calendar, Sparkles, Flag
} from "lucide-react";
import { computeMissionProgress, pct, todayISO, MONTHS_SHORT } from "../utils.js";

const API = "/api";

// ─── CATEGORY CONFIG ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "All",       color: "cyan"   },
  { id: "coding",    label: "Coding",    color: "cyan"   },
  { id: "learning",  label: "Learning",  color: "blue"   },
  { id: "english",   label: "English",   color: "purple" },
  { id: "health",    label: "Health",    color: "green"  },
  { id: "journal",   label: "Journal",   color: "amber"  },
  { id: "general",   label: "General",   color: "rose"   },
];

const PRIORITIES = [
  { id: "all",    label: "All"    },
  { id: "high",   label: "High"   },
  { id: "medium", label: "Medium" },
  { id: "low",    label: "Low"    },
];

const CAT_ICONS = {
  coding: "💻", learning: "📚", english: "🗣️",
  health: "💪", journal: "📝", general: "⚡"
};

const PRIORITY_COLORS = {
  high:   { bg: "rgba(239,68,68,.12)",   color: "var(--red)",    border: "rgba(239,68,68,.3)"   },
  medium: { bg: "rgba(245,158,11,.12)",  color: "var(--amber)",  border: "rgba(245,158,11,.3)"  },
  low:    { bg: "rgba(34,197,94,.12)",   color: "var(--green)",  border: "rgba(34,197,94,.3)"   },
};

const CAT_COLORS = {
  coding:   { bg: "rgba(6,214,240,.1)",   color: "var(--cyan)"   },
  learning: { bg: "rgba(59,130,246,.1)",  color: "var(--blue)"   },
  english:  { bg: "rgba(168,85,247,.1)",  color: "var(--purple)" },
  health:   { bg: "rgba(34,197,94,.1)",   color: "var(--green)"  },
  journal:  { bg: "rgba(245,158,11,.1)",  color: "var(--amber)"  },
  general:  { bg: "rgba(244,63,94,.1)",   color: "var(--rose)"   },
};

// ─── Ring component ───────────────────────────────────────────────────────────
function Ring({ value = 0, size = 100, stroke = 10, tone = "cyan" }) {
  const p = Math.min(100, Math.max(0, Math.round(value)));
  const deg = p * 3.6;
  return (
    <div
      className={`ring-wrap ${tone}`}
      style={{ "--ring-size": `${size}px`, "--ring-deg": `${deg}deg`, "--ring-stroke": `${stroke}px` }}
    >
      <div className="ring-inner">
        <strong>{p}%</strong>
        <span>done</span>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value = 0, label, tone = "accent", size = "md" }) {
  const p = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className={`progress-wrap ${size}`}>
      {label && <div className="progress-label"><span>{label}</span><span>{p}%</span></div>}
      <div className={`progress-track ${tone}`}>
        <div className="progress-fill" style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="glass-card" style={{ padding: 28, maxWidth: 380, width: "90%", textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontFamily: "var(--font-head)", marginBottom: 8 }}>Confirm Delete</h3>
        <p style={{ fontSize: ".85rem", color: "var(--text-muted)", marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.3)",
              color: "var(--red)", padding: "9px 20px", borderRadius: "var(--r-full)",
              fontWeight: 600, cursor: "pointer"
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mission Form Modal ───────────────────────────────────────────────────────
function MissionModal({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    title:    initial?.title    || "",
    xp:       initial?.xp      || 20,
    category: initial?.category || "general",
    priority: initial?.priority || "medium",
    deadline: initial?.deadline || "",
  });

  const isEdit = Boolean(initial?.id);
  const valid  = form.title.trim().length > 0;

  function field(key) {
    return {
      value: form[key],
      onChange: e => setForm(f => ({ ...f, [key]: e.target.value }))
    };
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card" style={{ padding: 28, maxWidth: 460, width: "92%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "var(--r-md)",
              background: "linear-gradient(135deg, rgba(6,214,240,.15), rgba(168,85,247,.15))",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cyan)"
            }}>
              {isEdit ? <Edit2 size={18} /> : <Plus size={18} />}
            </div>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800 }}>
              {isEdit ? "Edit Mission" : "New Mission"}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Title */}
          <label>
            <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Mission Title *
            </span>
            <input
              className="form-input"
              placeholder="e.g. Solve 2 LeetCode problems"
              autoFocus
              {...field("title")}
            />
          </label>

          {/* XP + Category row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <label>
              <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                XP Reward
              </span>
              <input
                className="form-input"
                type="number"
                min={1}
                max={500}
                {...field("xp")}
              />
            </label>
            <label>
              <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Category
              </span>
              <select className="form-select" {...field("category")}>
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{CAT_ICONS[c.id]} {c.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Priority + Deadline row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            <label>
              <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Priority
              </span>
              <select className="form-select" {...field("priority")}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </label>
            <label>
              <span style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Deadline (optional)
              </span>
              <input className="form-input" type="date" min={todayISO()} {...field("deadline")} />
            </label>
          </div>

          {/* Buttons */}
          <div className="form-actions" style={{ marginTop: 4 }}>
            <button className="secondary-btn" onClick={onClose}>Cancel</button>
            <button
              className="primary-btn"
              disabled={!valid || loading}
              onClick={() => onSave(form)}
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : `Create Mission (+${form.xp} XP)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mission Card ─────────────────────────────────────────────────────────────
function MissionCard({ mission, onComplete, onEdit, onDelete, onArchive, completing }) {
  const catStyle  = CAT_COLORS[mission.category]  || { bg: "rgba(255,255,255,.05)", color: "var(--text-muted)" };
  const priStyle  = PRIORITY_COLORS[mission.priority] || PRIORITY_COLORS.medium;
  const isOverdue = mission.deadline && mission.deadline < todayISO() && !mission.completed;

  return (
    <div className="mission-card" style={{
      border: `1px solid ${mission.completed ? "rgba(34,197,94,.25)" : "var(--border)"}`,
      background: mission.completed ? "rgba(34,197,94,.04)" : "var(--panel)",
      opacity: mission.archived ? 0.55 : 1
    }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, width: "100%" }}>
        {/* Category Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: "var(--r-md)", flexShrink: 0,
          background: catStyle.bg, color: catStyle.color,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem"
        }}>
          {CAT_ICONS[mission.category] || "⚡"}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontWeight: 600, fontSize: ".88rem",
              textDecoration: mission.completed ? "line-through" : "none",
              color: mission.completed ? "var(--text-muted)" : "var(--text)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {mission.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {/* Category chip */}
            <span style={{
              fontSize: ".62rem", fontWeight: 600, padding: "1px 7px",
              borderRadius: "var(--r-full)", background: catStyle.bg, color: catStyle.color
            }}>
              {mission.category}
            </span>
            {/* Priority badge */}
            <span style={{
              fontSize: ".62rem", fontWeight: 700, padding: "1px 7px",
              borderRadius: "var(--r-full)", background: priStyle.bg,
              color: priStyle.color, border: `1px solid ${priStyle.border}`
            }}>
              <Flag size={9} style={{ display: "inline", marginRight: 2 }} />
              {mission.priority}
            </span>
            {/* Deadline */}
            {mission.deadline && (
              <span style={{
                fontSize: ".62rem", color: isOverdue ? "var(--red)" : "var(--text-dim)",
                display: "flex", alignItems: "center", gap: 2
              }}>
                <Calendar size={10} />
                {mission.deadline}
                {isOverdue && " · overdue"}
              </span>
            )}
          </div>
        </div>

        {/* XP badge */}
        <div style={{
          padding: "3px 9px", borderRadius: "var(--r-full)", flexShrink: 0,
          background: "rgba(245,158,11,.1)", color: "var(--amber)",
          border: "1px solid rgba(245,158,11,.2)", fontSize: ".72rem", fontWeight: 700
        }}>
          +{mission.xp} XP
        </div>
      </div>

      {/* Actions */}
      <div className="mission-card-actions">
        {/* Edit */}
        <button
          className="icon-btn"
          onClick={() => onEdit(mission)}
          title="Edit"
          style={{ display: mission.completed ? "none" : "flex" }}
        >
          <Edit2 size={14} />
        </button>
        {/* Archive */}
        <button
          className="icon-btn"
          onClick={() => onArchive(mission)}
          title={mission.archived ? "Unarchive" : "Archive"}
        >
          {mission.archived ? <ArchiveX size={14} /> : <Archive size={14} />}
        </button>
        {/* Delete */}
        <button className="icon-btn danger" onClick={() => onDelete(mission)} title="Delete">
          <Trash2 size={14} />
        </button>
        {/* Complete */}
        <button
          disabled={mission.completed || completing === mission.id}
          onClick={() => onComplete(mission)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
            borderRadius: "var(--r-full)", border: "none", cursor: mission.completed ? "default" : "pointer",
            background: mission.completed
              ? "rgba(34,197,94,.12)"
              : "linear-gradient(135deg, var(--cyan), var(--indigo))",
            color: mission.completed ? "var(--green)" : "#fff",
            fontWeight: 600, fontSize: ".78rem",
            opacity: completing === mission.id ? 0.6 : 1,
            transition: "all .2s"
          }}
        >
          {mission.completed
            ? <><CheckCircle2 size={14} /> Done</>
            : completing === mission.id
              ? "…"
              : <><Check size={14} /> Complete</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Mini Bar chart for analytics ────────────────────────────────────────────
function MiniBarChart({ data, tone = "cyan" }) {
  const peak = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
          <div style={{
            flex: 1, width: "100%", display: "flex", alignItems: "flex-end",
            borderRadius: "3px 3px 0 0", background: "rgba(255,255,255,.04)", overflow: "hidden"
          }}>
            <div style={{
              width: "100%",
              height: `${Math.max(4, Math.round((d.value / peak) * 100))}%`,
              borderRadius: "3px 3px 0 0",
              background: CAT_COLORS[d.id]
                ? `linear-gradient(180deg, ${CAT_COLORS[d.id].color}, ${CAT_COLORS[d.id].color}55)`
                : `linear-gradient(180deg, var(--${tone}), rgba(6,214,240,.35))`,
              transition: "height .5s"
            }} />
          </div>
          <span style={{ fontSize: ".58rem", color: "var(--text-muted)" }}>{d.label}</span>
          {d.value > 0 && <small style={{ fontSize: ".56rem", color: "var(--text-dim)" }}>{d.value}</small>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MISSIONS PAGE (default export)
// ─────────────────────────────────────────────────────────────────────────────
export default function Missions({ state, setState, onNav, onXP }) {
  const [catFilter,    setCatFilter]    = useState("all");
  const [priFilter,    setPriFilter]    = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [modal,        setModal]        = useState(null); // null | "create" | mission object
  const [delTarget,    setDelTarget]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [completing,   setCompleting]   = useState(null);

  const missions = state.missions || [];

  // ─── Filtered missions ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return missions.filter(m => {
      if (!showArchived && m.archived) return false;
      if (catFilter !== "all" && m.category !== catFilter) return false;
      if (priFilter !== "all" && m.priority !== priFilter) return false;
      return true;
    });
  }, [missions, catFilter, priFilter, showArchived]);

  const active    = filtered.filter(m => !m.archived);
  const archived  = filtered.filter(m => m.archived);
  const allActive = missions.filter(m => !m.archived);
  const prog      = computeMissionProgress(allActive);

  // XP earned today from missions
  const xpEarnedToday = useMemo(() => {
    const today = todayISO();
    return (state.gamification?.xpHistory || [])
      .filter(e => (e.date || e.timestamp?.slice(0, 10)) === today && e.source === "mission")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [state.gamification?.xpHistory]);

  // ─── Analytics data ───────────────────────────────────────────────────────
  const catStats = useMemo(() => {
    const cats = CATEGORIES.filter(c => c.id !== "all");
    return cats.map(c => ({
      ...c,
      value: allActive.filter(m => m.category === c.id).length,
      completed: allActive.filter(m => m.category === c.id && m.completed).length,
      xp: allActive.filter(m => m.category === c.id && m.completed).reduce((s, m) => s + (m.xp || 0), 0),
    }));
  }, [allActive]);

  // ─── API: Complete mission ─────────────────────────────────────────────────
  const handleComplete = useCallback(async (mission) => {
    if (completing || mission.completed) return;
    setCompleting(mission.id);
    try {
      const res = await fetch(`${API}/missions/complete`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ missionId: mission.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(() => data.state);
        } else {
          setState(cur => ({
            ...cur,
            missions: cur.missions.map(m => m.id === mission.id ? { ...m, completed: true } : m),
            gamification: {
              ...cur.gamification,
              xp: (cur.gamification?.xp || 0) + (mission.xp || 0),
              totalMissionsCompleted: (cur.gamification?.totalMissionsCompleted || 0) + 1,
              xpHistory: [
                ...(cur.gamification?.xpHistory || []),
                { amount: mission.xp, label: mission.title, source: "mission", date: todayISO(), timestamp: new Date().toISOString() }
              ]
            }
          }));
        }
        onXP(mission.xp || 20, `Mission: ${mission.title}`);
      }
    } catch (_) {
      // Fallback optimistic
      setState(cur => ({
        ...cur,
        missions: cur.missions.map(m => m.id === mission.id ? { ...m, completed: true } : m)
      }));
      onXP(mission.xp || 20, `Mission: ${mission.title}`);
    }
    setCompleting(null);
  }, [completing, setState, onXP]);

  // ─── API: Create mission ──────────────────────────────────────────────────
  const handleCreate = useCallback(async (form) => {
    setLoading(true);
    const newMission = {
      id:       `mission-${Date.now()}`,
      title:    form.title.trim(),
      xp:       Number(form.xp) || 20,
      category: form.category,
      priority: form.priority,
      deadline: form.deadline || null,
      completed: false,
      archived:  false,
    };
    try {
      const res = await fetch(`${API}/missions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newMission)
      });
      if (res.ok) {
        const data = await res.json();
        const saved = data.mission || newMission;
        setState(cur => ({ ...cur, missions: [...(cur.missions || []), saved] }));
      } else {
        setState(cur => ({ ...cur, missions: [...(cur.missions || []), newMission] }));
      }
    } catch (_) {
      setState(cur => ({ ...cur, missions: [...(cur.missions || []), newMission] }));
    }
    setModal(null);
    setLoading(false);
  }, [setState]);

  // ─── API: Edit mission ────────────────────────────────────────────────────
  const handleEdit = useCallback(async (form) => {
    if (!modal?.id) return;
    setLoading(true);
    const updated = {
      ...modal,
      title:    form.title.trim(),
      xp:       Number(form.xp) || 20,
      category: form.category,
      priority: form.priority,
      deadline: form.deadline || null,
    };
    try {
      await fetch(`${API}/missions/${modal.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updated)
      });
    } catch (_) {}
    setState(cur => ({
      ...cur,
      missions: cur.missions.map(m => m.id === modal.id ? updated : m)
    }));
    setModal(null);
    setLoading(false);
  }, [modal, setState]);

  // ─── API: Delete mission ──────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!delTarget) return;
    try {
      await fetch(`${API}/missions/${delTarget.id}`, { method: "DELETE" });
    } catch (_) {}
    setState(cur => ({ ...cur, missions: cur.missions.filter(m => m.id !== delTarget.id) }));
    setDelTarget(null);
  }, [delTarget, setState]);

  // ─── Toggle archive ───────────────────────────────────────────────────────
  const handleArchive = useCallback(async (mission) => {
    const updated = { ...mission, archived: !mission.archived };
    try {
      await fetch(`${API}/missions/${mission.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updated)
      });
    } catch (_) {}
    setState(cur => ({
      ...cur,
      missions: cur.missions.map(m => m.id === mission.id ? updated : m)
    }));
  }, [setState]);

  const handleSave = (form) => {
    if (modal === "create") handleCreate(form);
    else handleEdit(form);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "center" }}>

        {/* Progress ring */}
        <div className="glass-card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <Ring value={prog.pct} size={96} stroke={9} tone="cyan" />
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.4rem" }}>
              {prog.completed}<span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/{prog.total}</span>
            </div>
            <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>missions completed</div>
            {prog.completed === prog.total && prog.total > 0 && (
              <div style={{
                marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5,
                background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)",
                color: "var(--green)", padding: "2px 10px", borderRadius: "var(--r-full)", fontSize: ".72rem"
              }}>
                <Sparkles size={11} /> Perfect Day!
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {[
            { icon: "🎯", label: "Total Missions", value: allActive.length, tone: "cyan"   },
            { icon: "✅", label: "Completed Today", value: prog.completed,   tone: "green"  },
            { icon: "⚡", label: "XP Earned Today", value: `${xpEarnedToday} XP`, tone: "amber"  },
            { icon: "📊", label: "Completion Rate", value: `${prog.pct}%`,  tone: "purple" },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: "var(--font-head)" }}>{s.value}</div>
              <div style={{ fontSize: ".68rem", color: "var(--text-muted)", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTERS + CREATE BUTTON ────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: "14px 16px" }}>
        <div className="missions-filter-bar">
          {/* Category filters */}
          <div className="scrollable-chips" style={{ flex: 1, minWidth: 0 }}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`chip${catFilter === c.id ? " active" : ""}`}
                onClick={() => setCatFilter(c.id)}
              >
                {c.id !== "all" && CAT_ICONS[c.id] + " "}{c.label}
              </button>
            ))}
          </div>

          <div className="filter-divider" />

          {/* Priority filters */}
          <div className="scrollable-chips">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                className={`chip${priFilter === p.id ? " active" : ""}`}
                onClick={() => setPriFilter(p.id)}
              >
                {p.id === "high" ? "🔴 " : p.id === "medium" ? "🟡 " : p.id === "low" ? "🟢 " : ""}{p.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="filter-actions">
            {/* Archive toggle */}
            <button
              className={`chip${showArchived ? " active" : ""}`}
              onClick={() => setShowArchived(v => !v)}
            >
              <Archive size={11} style={{ display: "inline", marginRight: 3 }} />
              Archived ({missions.filter(m => m.archived).length})
            </button>

            {/* Create button */}
            <button
              className="primary-btn"
              onClick={() => setModal("create")}
            >
              <Plus size={16} /> New Mission
            </button>
          </div>
        </div>
      </div>

      {/* ── MISSION LIST ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {active.length === 0 && !showArchived && (
          <div className="empty-state glass-card" style={{ padding: "40px 24px" }}>
            <span className="empty-icon">🎯</span>
            <strong>No missions found</strong>
            <p>
              {catFilter !== "all" || priFilter !== "all"
                ? "Try changing your filters, or"
                : "Get started by creating your first mission."
              }
            </p>
            <button className="primary-btn" style={{ marginTop: 8 }} onClick={() => setModal("create")}>
              <Plus size={16} /> Create Mission
            </button>
          </div>
        )}

        {active.map(m => (
          <MissionCard
            key={m.id}
            mission={m}
            onComplete={handleComplete}
            onEdit={m2 => setModal(m2)}
            onDelete={m2 => setDelTarget(m2)}
            onArchive={handleArchive}
            completing={completing}
          />
        ))}

        {/* Archived section */}
        {showArchived && archived.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 4px" }}>
              <Archive size={14} style={{ color: "var(--text-dim)" }} />
              <span style={{ fontSize: ".75rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Archived ({archived.length})
              </span>
            </div>
            {archived.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                onComplete={handleComplete}
                onEdit={m2 => setModal(m2)}
                onDelete={m2 => setDelTarget(m2)}
                onArchive={handleArchive}
                completing={completing}
              />
            ))}
          </>
        )}
      </div>

      {/* ── ANALYTICS SECTION ─────────────────────────────────────────── */}
      {allActive.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>

          {/* Category breakdown chart */}
          <article className="panel glass-card">
            <div className="panel-header">
              <div className="panel-title-row">
                <BarChart2 size={18} className="panel-icon" />
                <div>
                  <h2>Category Breakdown</h2>
                  <span className="panel-subtitle">Missions per category</span>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <MiniBarChart
                data={catStats.filter(c => c.value > 0).map(c => ({
                  id: c.id, label: c.label.slice(0, 3), value: c.value
                }))}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {catStats.filter(c => c.value > 0).map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: ".82rem", width: 80, flexShrink: 0 }}>
                      {CAT_ICONS[c.id]} {c.label}
                    </span>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct(c.completed, c.value)}%`, height: "100%",
                        borderRadius: 3, background: CAT_COLORS[c.id]?.color || "var(--cyan)",
                        transition: "width .5s"
                      }} />
                    </div>
                    <span style={{ fontSize: ".7rem", color: "var(--text-muted)", width: 50, textAlign: "right" }}>
                      {c.completed}/{c.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* XP per category + completion rate */}
          <article className="panel glass-card">
            <div className="panel-header">
              <div className="panel-title-row">
                <Zap size={18} className="panel-icon" />
                <div>
                  <h2>XP by Category</h2>
                  <span className="panel-subtitle">XP earned from completed missions</span>
                </div>
              </div>
            </div>
            <div className="panel-body">
              {catStats.filter(c => c.xp > 0).length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <span className="empty-icon">⚡</span>
                  <strong>No XP earned yet</strong>
                  <p>Complete missions to earn category XP</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {catStats.filter(c => c.value > 0).map(c => (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      borderRadius: "var(--r-sm)", background: "rgba(255,255,255,.03)"
                    }}>
                      <span style={{ fontSize: "1rem" }}>{CAT_ICONS[c.id]}</span>
                      <span style={{ flex: 1, fontSize: ".82rem", fontWeight: 500 }}>{c.label}</span>
                      <span style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>
                        {pct(c.completed, c.value)}% done
                      </span>
                      <strong style={{ color: "var(--amber)", fontSize: ".78rem" }}>
                        {c.xp > 0 ? `+${c.xp} XP` : "0 XP"}
                      </strong>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <ProgressBar
                      value={prog.pct}
                      label="Overall completion rate"
                      tone="cyan"
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {/* ── MISSION HISTORY ───────────────────────────────────────────── */}
      {(() => {
        const history = (state.gamification?.xpHistory || [])
          .filter(e => e.source === "mission")
          .slice(-10)
          .reverse();
        if (!history.length) return null;
        return (
          <article className="panel glass-card">
            <div className="panel-header">
              <div className="panel-title-row">
                <Clock size={18} className="panel-icon" />
                <div>
                  <h2>Mission History</h2>
                  <span className="panel-subtitle">Recent completed missions</span>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((e, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    borderRadius: "var(--r-sm)", background: "rgba(34,197,94,.04)",
                    border: "1px solid rgba(34,197,94,.12)"
                  }}>
                    <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: ".82rem" }}>{e.label}</span>
                    <strong style={{ color: "var(--amber)", fontSize: ".75rem" }}>+{e.amount} XP</strong>
                    <span style={{ fontSize: ".65rem", color: "var(--text-dim)" }}>
                      {e.date || e.timestamp?.slice(0, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })()}

      {/* ── MODALS ────────────────────────────────────────────────────── */}
      {modal && (
        <MissionModal
          initial={modal === "create" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={loading}
        />
      )}
      {delTarget && (
        <ConfirmDialog
          message={`Delete "${delTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDelTarget(null)}
        />
      )}

    </div>
  );
}
