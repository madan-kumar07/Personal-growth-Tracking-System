import React, { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { getLevelInfo, getLevelTitle } from "../utils.js";

// ─── SVG Ring ─────────────────────────────────────────────────────────────────
export function Ring({ value = 0, size = 80, stroke = 7, color = "#6366f1", label, sublabel }) {
  const r   = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(100, Math.max(0, value));
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="ring-svg" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      {(label !== undefined) && (
        <div style={{ position:"absolute", textAlign:"center", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize: size > 70 ? 18 : 13, color:"var(--text)", lineHeight:1 }}>{label}</div>
          {sublabel && <div style={{ fontSize:10, color:"var(--text-3)", marginTop:2 }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
}

// ─── Score Ring Card ───────────────────────────────────────────────────────────
export function ScoreRing({ label, value = 0, icon: Icon, tone = "indigo", onClick }) {
  const colors = {
    indigo:  "#6366f1", purple: "#8b5cf6", cyan: "#06b6d4",
    emerald: "#10b981", amber:  "#f59e0b", rose: "#f43f5e",
    blue:    "#3b82f6", green:  "#22c55e",
  };
  const c = colors[tone] || "#6366f1";
  return (
    <div className="score-ring-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <Ring value={value} size={72} color={c} label={`${value}%`} />
      <div className="ring-label">{label}</div>
      {Icon && <Icon size={14} color={c} />}
    </div>
  );
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────
export function XPBar({ totalXP = 0 }) {
  const li = getLevelInfo(totalXP);
  return (
    <div className="xp-bar-container" style={{ minWidth: 180 }}>
      <div className="xp-bar-top">
        <span className="xp-bar-level">Level {li.level} — {li.title}</span>
        <span className="xp-bar-xp">{totalXP.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${li.progress}%` }} />
      </div>
      <div className="xp-bar-title">{li.currentXP} / {li.neededXP} XP to Level {li.level + 1}</div>
    </div>
  );
}

// ─── Day Counter ───────────────────────────────────────────────────────────────
export function DayCounter({ dayNumber = 0, startDate }) {
  return (
    <div className="day-counter">
      <div className="day-counter-num">
        Day <span>{dayNumber}</span>
      </div>
      <div className="day-counter-label">of 365 — {startDate ? `Started ${new Date(startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}` : "Begin your journey"}</div>
      <div className="day-counter-bar">
        <div className="day-counter-fill" style={{ width: `${(dayNumber / 365) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, color = "", size = "default", showLabel = false }) {
  const sizeClass = size === "lg" ? "progress-bar-lg" : size === "sm" ? "progress-bar-sm" : "";
  return (
    <div>
      {showLabel && (
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:11, color:"var(--text-3)" }}> </span>
          <span style={{ fontSize:11, fontWeight:600, color:"var(--text-2)" }}>{value}%</span>
        </div>
      )}
      <div className={`progress-bar ${sizeClass}`}>
        <div className={`progress-bar-fill ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export function Panel({ title, icon: Icon, children, action, className = "", style }) {
  return (
    <div className={`panel ${className}`} style={style}>
      {(title || action) && (
        <div className="panel-header">
          <div className="panel-title">
            {Icon && <Icon size={16} color="var(--indigo)" />}
            {title}
          </div>
          {action && <div className="panel-action">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = "✨", title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {desc && <div className="empty-state-desc">{desc}</div>}
      {action}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ type = "text", width, height }) {
  const style = {};
  if (width)  style.width  = width;
  if (height) style.height = height;
  return <div className={`skeleton skeleton-${type}`} style={style} />;
}

// ─── Chip / Badge ─────────────────────────────────────────────────────────────
export function Chip({ label, color = "indigo" }) {
  return <span className={`chip chip-${color}`}>{label}</span>;
}

export function PriorityBadge({ priority }) {
  const map = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };
  return <span className={`chip priority-${priority || "low"}`}>{map[priority] || priority}</span>;
}

export function CategoryChip({ category }) {
  const colorMap = {
    coding: "cyan", learning: "indigo", english: "purple",
    health: "emerald", journal: "amber", general: "gray",
    placement: "blue", discipline: "rose",
  };
  return <span className={`chip chip-${colorMap[category] || "gray"}`}>{category}</span>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose, width = 480 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <button className="icon-btn modal-close" onClick={onClose}>✕</button>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onSelect }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <div
          key={t.id || t}
          className={`tab ${(active === (t.id || t)) ? "active" : ""}`}
          onClick={() => onSelect(t.id || t)}
        >
          {t.label || t}
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = "indigo", onClick }) {
  const bgMap = {
    indigo: "var(--indigo-dim)", cyan: "var(--cyan-dim)", emerald: "var(--emerald-dim)",
    amber: "var(--amber-dim)", rose: "var(--rose-dim)", purple: "var(--purple-dim)",
  };
  const colMap = {
    indigo: "var(--indigo)", cyan: "var(--cyan)", emerald: "var(--emerald)",
    amber: "var(--amber)", rose: "var(--rose)", purple: "var(--purple)",
  };
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      {Icon && (
        <div className="stat-icon" style={{ background: bgMap[color] }}>
          <Icon size={18} color={colMap[color]} />
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title || "Are you sure?"}</div>
        <p style={{ color:"var(--text-2)", fontSize:14, margin:"12px 0 20px" }}>{message}</p>
        <div className="form-actions">
          <button className="secondary-btn" onClick={onCancel}>Cancel</button>
          <button className="danger-btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ─── 365-day Calendar Heatmap ─────────────────────────────────────────────────
export function Calendar365Heatmap({ days = [] }) {
  // Group into 7-day columns (Sunday-first weeks)
  const weeks = useMemo(() => {
    const cols = [];
    let col = [];
    days.forEach((d, i) => {
      col.push(d);
      if (col.length === 7) { cols.push(col); col = []; }
    });
    if (col.length) cols.push(col);
    return cols;
  }, [days]);

  const getClass = (status) => {
    if (status === "success") return "success";
    if (status === "missed")  return "missed";
    if (status === "pending") return "pending";
    return "";
  };

  if (!days.length) {
    return (
      <div className="empty-state" style={{ padding: "32px 0" }}>
        <div style={{ fontSize: 32 }}>📅</div>
        <div style={{ fontSize: 14, color: "var(--text-3)" }}>Complete onboarding to see your 365-day calendar</div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map((d, di) => (
              <div
                key={di}
                className={`heatmap-cell ${getClass(d.status)}`}
                title={`Day ${d.day}: ${d.date} — ${d.status}${d.xp ? ` (+${d.xp} XP)` : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Coding Heatmap ───────────────────────────────────────────────────────────
export function CodingHeatmap({ heatmap = {} }) {
  const weeks = useMemo(() => {
    const result = [];
    const today  = new Date();
    const start  = new Date(today);
    start.setDate(today.getDate() - 364);

    let week = [];
    const cur = new Date(start);
    while (cur <= today) {
      const iso   = cur.toISOString().slice(0, 10);
      const hours = heatmap[iso] || 0;
      let level   = 0;
      if (hours > 0 && hours <= 1)  level = 1;
      if (hours > 1 && hours <= 2)  level = 2;
      if (hours > 2 && hours <= 4)  level = 3;
      if (hours > 4)                level = 4;
      week.push({ iso, hours, level });
      if (week.length === 7) { result.push(week); week = []; }
      cur.setDate(cur.getDate() + 1);
    }
    if (week.length) result.push(week);
    return result;
  }, [heatmap]);

  const hasData = Object.keys(heatmap).length > 0;
  if (!hasData) {
    return (
      <div className="empty-state" style={{ padding: "24px 0" }}>
        <div style={{ fontSize: 28 }}>💻</div>
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>Start coding to fill your heatmap!</div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map((d, di) => (
              <div
                key={di}
                className={`heatmap-cell level-${d.level}`}
                title={`${d.iso}: ${d.hours}h coded`}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:8, fontSize:11, color:"var(--text-3)" }}>
        <span>Less</span>
        {[0,1,2,3,4].map(l => (
          <div key={l} className={`heatmap-cell level-${l}`} style={{ margin:0, flexShrink:0 }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
