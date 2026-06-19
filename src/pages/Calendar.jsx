import React, { useState, useMemo } from "react";
import {
  CalendarDays, TrendingUp, Flame, Zap, CheckCircle2,
  X, ChevronLeft, ChevronRight, Star
} from "lucide-react";
import {
  generate365Days, computeDayNumber, MONTHS_SHORT, todayISO, pct
} from "../utils.js";

const API = "/api";

// ─── STATUS COLORS ────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  success: { bg: "var(--green)",               shadow: "0 0 5px rgba(34,197,94,.5)"  },
  missed:  { bg: "rgba(239,68,68,.35)",         shadow: "none"                        },
  partial: { bg: "rgba(245,158,11,.6)",         shadow: "none"                        },
  pending: { bg: "rgba(255,255,255,.1)",        shadow: "none"                        },
  future:  { bg: "rgba(255,255,255,.04)",       shadow: "none"                        },
};

const STATUS_LABELS = {
  success: "Completed",
  missed:  "Missed",
  partial: "Partial",
  pending: "Today — Pending",
  future:  "Future",
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function DayTooltip({ day, onClose }) {
  if (!day) return null;
  const style = STATUS_STYLE[day.status] || STATUS_STYLE.future;
  return (
    <div style={{
      position: "fixed", zIndex: 1000,
      background: "var(--panel-solid)", border: "1px solid var(--border-2)",
      borderRadius: "var(--r-md)", padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,.5)", minWidth: 180,
      pointerEvents: "none",
      top: "50%", left: "50%", transform: "translate(-50%, -50%)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <strong style={{ fontFamily: "var(--font-head)" }}>Day {day.day}</strong>
        <span style={{
          padding: "2px 8px", borderRadius: "var(--r-full)", fontSize: ".68rem", fontWeight: 700,
          background: day.status === "success" ? "rgba(34,197,94,.15)" :
                      day.status === "missed"  ? "rgba(239,68,68,.15)"  :
                      day.status === "partial" ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.05)",
          color:      day.status === "success" ? "var(--green)" :
                      day.status === "missed"  ? "var(--red)"   :
                      day.status === "partial" ? "var(--amber)"  : "var(--text-muted)"
        }}>
          {STATUS_LABELS[day.status] || day.status}
        </span>
      </div>
      <div style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: day.xp ? 6 : 0 }}>
        📅 {day.date}
      </div>
      {day.xp > 0 && (
        <div style={{ fontSize: ".78rem", color: "var(--amber)", fontWeight: 600 }}>
          ⚡ {day.xp} XP earned
        </div>
      )}
    </div>
  );
}

// ─── 365 Heatmap Grid ─────────────────────────────────────────────────────────
function HeatmapGrid({ days, hoveredDay, onHover }) {
  // Group days into weeks (columns)
  const weeks = useMemo(() => {
    if (!days.length) return [];
    const startDayOfWeek = new Date(days[0].date).getDay(); // 0=Sun
    const cols = [];
    let col = [];
    // Pad first column with empty cells
    for (let i = 0; i < startDayOfWeek; i++) col.push(null);
    for (const day of days) {
      col.push(day);
      if (col.length === 7) { cols.push(col); col = []; }
    }
    if (col.length > 0) {
      while (col.length < 7) col.push(null);
      cols.push(col);
    }
    return cols;
  }, [days]);

  // Month labels (find first occurrence of each month)
  const monthLabels = useMemo(() => {
    const labels = new Map();
    let weekIdx = 0;
    const startDow = days.length ? new Date(days[0].date).getDay() : 0;
    let dayCount = -startDow;
    for (let w = 0; w < weeks.length; w++) {
      for (let d = 0; d < 7; d++) {
        if (dayCount >= 0 && dayCount < days.length) {
          const month = new Date(days[dayCount].date).getMonth();
          if (!labels.has(month)) labels.set(month, w);
        }
        dayCount++;
      }
    }
    return labels;
  }, [weeks, days]);

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      {/* Month labels */}
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {weeks.map((_, wi) => {
          let label = "";
          for (const [month, weekStart] of monthLabels) {
            if (weekStart === wi) label = MONTHS_SHORT[month];
          }
          return (
            <div key={wi} style={{ width: 12, fontSize: ".52rem", color: "var(--text-dim)", textAlign: "center", flexShrink: 0 }}>
              {label}
            </div>
          );
        })}
      </div>
      {/* Day rows (7 rows = Mon-Sun) */}
      <div style={{ display: "flex", gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            {week.map((day, di) => {
              if (!day) {
                return <div key={di} style={{ width: 12, height: 12 }} />;
              }
              const st = STATUS_STYLE[day.status] || STATUS_STYLE.future;
              const isHovered = hoveredDay?.date === day.date;
              return (
                <div
                  key={di}
                  onMouseEnter={() => onHover(day)}
                  onMouseLeave={() => onHover(null)}
                  title={`Day ${day.day} · ${day.date} · ${STATUS_LABELS[day.status] || day.status}${day.xp ? ` · ${day.xp} XP` : ""}`}
                  style={{
                    width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                    background: st.bg, boxShadow: st.shadow,
                    cursor: day.status !== "future" ? "pointer" : "default",
                    transform: isHovered ? "scale(1.5)" : "scale(1)",
                    transition: "transform .1s",
                    outline: isHovered ? "1px solid rgba(255,255,255,.4)" : "none",
                    outlineOffset: 1
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Monthly Table ─────────────────────────────────────────────────────────────
function MonthlyBreakdown({ days }) {
  const months = useMemo(() => {
    const map = new Map();
    for (const day of days) {
      const m = new Date(day.date).getMonth();
      if (!map.has(m)) map.set(m, { name: MONTHS_SHORT[m], success: 0, missed: 0, partial: 0, pending: 0, future: 0, total: 0, xp: 0 });
      const rec = map.get(m);
      rec[day.status] = (rec[day.status] || 0) + 1;
      rec.total++;
      rec.xp += day.xp || 0;
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  }, [days]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Month", "Days", "✅ Done", "❌ Missed", "🟡 Partial", "⚡ XP", "Completion"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: ".72rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m, i) => {
            const doneable = m.success + m.missed + m.partial + m.pending;
            const completionPct = pct(m.success, doneable || 1);
            return (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: "8px 12px", color: "var(--text-muted)" }}>{m.total}</td>
                <td style={{ padding: "8px 12px", color: "var(--green)" }}>{m.success}</td>
                <td style={{ padding: "8px 12px", color: "var(--red)" }}>{m.missed}</td>
                <td style={{ padding: "8px 12px", color: "var(--amber)" }}>{m.partial || 0}</td>
                <td style={{ padding: "8px 12px", color: "var(--amber)", fontWeight: 600 }}>{m.xp > 0 ? `+${m.xp}` : "—"}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden", minWidth: 60 }}>
                      <div style={{
                        width: `${completionPct}%`, height: "100%", borderRadius: 3,
                        background: completionPct > 70 ? "var(--green)" : completionPct > 40 ? "var(--amber)" : "var(--red)",
                        transition: "width .5s"
                      }} />
                    </div>
                    <span style={{ fontSize: ".72rem", color: "var(--text-muted)", minWidth: 35 }}>
                      {completionPct}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
          {months.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "var(--text-dim)", fontSize: ".82rem" }}>
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, tone = "cyan", desc }) {
  return (
    <div className="glass-card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: "var(--r-md)", flexShrink: 0,
        background: `rgba(var(--${tone}-rgb, 6,214,240),.1)`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1.3rem"
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: "1.15rem", fontFamily: "var(--font-head)", color: `var(--${tone})` }}>
          {value}
        </div>
        <div style={{ fontSize: ".72rem", color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: ".65rem", color: "var(--text-dim)" }}>{desc}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR PAGE (default export)
// ─────────────────────────────────────────────────────────────────────────────
export default function Calendar({ state, setState, onNav, onXP }) {
  const [hoveredDay,   setHoveredDay]   = useState(null);
  const [markingToday, setMarkingToday] = useState(false);

  const dayNumber = computeDayNumber(state.startDate);
  const days365   = generate365Days(state.startDate, state.calendar || []);

  // ─── Stats ───────────────────────────────────────────────────────────────
  const successDays = days365.filter(d => d.status === "success").length;
  const missedDays  = days365.filter(d => d.status === "missed").length;
  const partialDays = days365.filter(d => d.status === "partial").length;
  const pendingDays = days365.filter(d => d.status === "pending").length;
  const totalXP     = days365.reduce((s, d) => s + (d.xp || 0), 0);
  const daysLeft    = 365 - dayNumber;

  // ─── Streak stats ─────────────────────────────────────────────────────────
  const overallStreak = state.gamification?.streaks?.overall?.current || 0;
  const bestStreak    = state.gamification?.streaks?.overall?.best    || 0;

  // ─── Today's status ───────────────────────────────────────────────────────
  const today      = todayISO();
  const todayEntry = (state.calendar || []).find(d => d.date === today);
  const todayDone  = todayEntry?.status === "success";

  // ─── Mark today complete ──────────────────────────────────────────────────
  async function handleMarkToday() {
    if (markingToday || todayDone) return;
    setMarkingToday(true);
    try {
      const res = await fetch(`${API}/day/complete`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ date: today })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(() => data.state);
        } else {
          setState(cur => {
            const existingCal  = cur.calendar || [];
            const filtered     = existingCal.filter(d => d.date !== today);
            const xpGain       = data.xpGained || 50;
            return {
              ...cur,
              calendar: [...filtered, { date: today, status: "success", xp: xpGain }],
              gamification: {
                ...cur.gamification,
                xp: (cur.gamification?.xp || 0) + xpGain,
                xpHistory: [
                  ...(cur.gamification?.xpHistory || []),
                  { amount: xpGain, label: "Day completed", source: "calendar", date: today, timestamp: new Date().toISOString() }
                ],
                streaks: {
                  ...cur.gamification?.streaks,
                  overall: {
                    current: (cur.gamification?.streaks?.overall?.current || 0) + 1,
                    best:    Math.max(cur.gamification?.streaks?.overall?.best || 0, (cur.gamification?.streaks?.overall?.current || 0) + 1)
                  }
                }
              }
            };
          });
          onXP(data.xpGained || 50, "Day completed! 🎉");
        }
      }
    } catch (_) {
      // Fallback
      setState(cur => {
        const existingCal = cur.calendar || [];
        return {
          ...cur,
          calendar: [...existingCal.filter(d => d.date !== today), { date: today, status: "success", xp: 50 }]
        };
      });
      onXP(50, "Day completed! 🎉");
    }
    setMarkingToday(false);
  }

  // ─── No journey yet ───────────────────────────────────────────────────────
  if (!state.startDate) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 500 }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>📅</div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1.8rem", fontWeight: 900, marginBottom: 12 }}>
            Begin Your 365-Day Journey
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24, fontSize: ".95rem" }}>
            Your 365-day calendar will appear here once your journey starts.
            Complete the onboarding to set your start date and begin tracking
            every day of your transformation.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32 }}>
            {[
              { icon: "🔥", label: "Build Streaks",    desc: "Track daily consistency" },
              { icon: "⚡", label: "Earn XP Daily",    desc: "Progress every day" },
              { icon: "🏆", label: "Unlock Badges",    desc: "Celebrate milestones" },
            ].map(f => (
              <div key={f.label} className="glass-card" style={{ padding: "16px 20px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{f.icon}</div>
                <strong style={{ fontSize: ".85rem", display: "block" }}>{f.label}</strong>
                <span style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{f.desc}</span>
              </div>
            ))}
          </div>
          <button className="primary-btn full" style={{ maxWidth: 280, margin: "0 auto" }}>
            <CalendarDays size={18} /> Start Your Journey
          </button>
        </div>
      </div>
    );
  }

  // ─── End date ────────────────────────────────────────────────────────────
  const endDate = (() => {
    const d = new Date(state.startDate);
    d.setDate(d.getDate() + 364);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="glass-card" style={{
        padding: "20px 24px", display: "flex", alignItems: "center", gap: 20,
        background: "linear-gradient(135deg, rgba(6,214,240,.06), rgba(168,85,247,.06))",
        border: "1px solid rgba(6,214,240,.2)"
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "var(--r-lg)", flexShrink: 0,
          background: "linear-gradient(135deg, var(--cyan), var(--purple))",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <CalendarDays size={28} style={{ color: "#fff" }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.3rem", marginBottom: 2 }}>
            Day {dayNumber} of 365
          </h2>
          <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
            {state.startDate} → {endDate} · {daysLeft} days remaining · 🔥 {overallStreak} day streak
          </div>
        </div>
        {/* Mark today */}
        {!todayDone ? (
          <button
            className="primary-btn"
            onClick={handleMarkToday}
            disabled={markingToday}
            style={{ flexShrink: 0 }}
          >
            {markingToday ? "Marking…" : <><CheckCircle2 size={16} /> Mark Today Complete</>}
          </button>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            borderRadius: "var(--r-full)", background: "rgba(34,197,94,.12)",
            border: "1px solid rgba(34,197,94,.25)", color: "var(--green)",
            fontSize: ".88rem", fontWeight: 600, flexShrink: 0
          }}>
            <CheckCircle2 size={16} /> Today Complete!
          </div>
        )}
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        <StatCard icon="✅" label="Days Completed" value={successDays} tone="green" desc={`out of ${dayNumber} days`} />
        <StatCard icon="❌" label="Days Missed"    value={missedDays}  tone="red"   desc="keep going!" />
        <StatCard icon="🔥" label="Best Streak"    value={`${bestStreak}d`} tone="orange" />
        <StatCard icon="⚡" label="Current Streak" value={`${overallStreak}d`} tone="cyan" />
        <StatCard icon="💎" label="Total XP"       value={totalXP}     tone="purple" desc="from calendar" />
      </div>

      {/* ── HEATMAP ───────────────────────────────────────────────────── */}
      <article className="panel glass-card">
        <div className="panel-header">
          <div className="panel-title-row">
            <CalendarDays size={18} className="panel-icon" />
            <div>
              <h2>365-Day Journey Map</h2>
              <span className="panel-subtitle">{state.startDate} → {endDate}</span>
            </div>
          </div>
        </div>
        <div className="panel-body">
          {/* Legend */}
          <div className="cal-legend-row" style={{ marginBottom: 14 }}>
            {[
              { cls: "future",  label: "Future"    },
              { cls: "missed",  label: "Missed"    },
              { cls: "partial", label: "Partial"   },
              { cls: "success", label: "Completed" },
            ].map(({ cls, label }) => (
              <span key={cls} className="cal-legend-item">
                <span className={`cal-legend-dot ${cls}`} />
                {label}
              </span>
            ))}
            {/* pending indicator */}
            <span className="cal-legend-item">
              <span style={{
                width: 12, height: 12, borderRadius: 3, display: "inline-block",
                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)"
              }} />
              Today
            </span>
          </div>

          {/* Grid */}
          <HeatmapGrid
            days={days365}
            hoveredDay={hoveredDay}
            onHover={setHoveredDay}
          />

          {/* Hovered day info */}
          {hoveredDay && (
            <div className="cal-tooltip" style={{ marginTop: 12 }}>
              <strong>Day {hoveredDay.day}</strong>
              <span>{hoveredDay.date}</span>
              <span className={`cal-status-badge ${hoveredDay.status}`}>
                {STATUS_LABELS[hoveredDay.status] || hoveredDay.status}
              </span>
              {hoveredDay.xp > 0 && <span>⚡ {hoveredDay.xp} XP</span>}
            </div>
          )}

          {/* Progress summary */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="progress-wrap sm">
              <div className="progress-label">
                <span>Journey Progress ({dayNumber}/365 days passed)</span>
                <span>{Math.round((dayNumber / 365) * 100)}%</span>
              </div>
              <div className="progress-track green">
                <div className="progress-fill" style={{ width: `${Math.round((dayNumber / 365) * 100)}%` }} />
              </div>
            </div>
            {dayNumber > 0 && (
              <div className="progress-wrap sm">
                <div className="progress-label">
                  <span>Completion rate of passed days</span>
                  <span>{pct(successDays, dayNumber || 1)}%</span>
                </div>
                <div className="progress-track cyan">
                  <div className="progress-fill" style={{ width: `${pct(successDays, dayNumber || 1)}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* ── MONTHLY BREAKDOWN ─────────────────────────────────────────── */}
      <article className="panel glass-card">
        <div className="panel-header">
          <div className="panel-title-row">
            <TrendingUp size={18} className="panel-icon" />
            <div>
              <h2>Monthly Breakdown</h2>
              <span className="panel-subtitle">Completion statistics by month</span>
            </div>
          </div>
        </div>
        <div className="panel-body">
          <MonthlyBreakdown days={days365.filter(d => d.status !== "future")} />
        </div>
      </article>

      {/* ── STREAK MILESTONES ─────────────────────────────────────────── */}
      <article className="panel glass-card">
        <div className="panel-header">
          <div className="panel-title-row">
            <Flame size={18} className="panel-icon" />
            <div>
              <h2>Streak Milestones</h2>
              <span className="panel-subtitle">Current streak: {overallStreak} days · Best: {bestStreak} days</span>
            </div>
          </div>
        </div>
        <div className="panel-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {[7, 14, 21, 30, 60, 90, 180, 365].map(ms => {
              const reached    = overallStreak >= ms;
              const everReached = bestStreak >= ms;
              return (
                <div key={ms} className="glass-card" style={{
                  padding: "14px 16px", textAlign: "center",
                  border: reached
                    ? "1px solid rgba(34,197,94,.3)"
                    : everReached
                      ? "1px solid rgba(245,158,11,.25)"
                      : "1px solid var(--border)",
                  background: reached ? "rgba(34,197,94,.06)" : "var(--panel)"
                }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>
                    {reached ? "🔥" : everReached ? "⭐" : "🔒"}
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: "1rem", fontFamily: "var(--font-head)",
                    color: reached ? "var(--green)" : everReached ? "var(--amber)" : "var(--text-muted)"
                  }}>
                    {ms} days
                  </div>
                  <div style={{ fontSize: ".65rem", color: "var(--text-dim)", marginTop: 2 }}>
                    {reached ? "🎉 Active!" : everReached ? "Best reached" : `${ms - overallStreak} more to go`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </article>

      {/* ── MINI XP TREND ─────────────────────────────────────────────── */}
      {(() => {
        const recentDays = days365
          .filter(d => d.status !== "future" && d.xp > 0)
          .slice(-10);
        if (!recentDays.length) return null;
        const peak = Math.max(...recentDays.map(d => d.xp), 1);
        return (
          <article className="panel glass-card">
            <div className="panel-header">
              <div className="panel-title-row">
                <Zap size={18} className="panel-icon" />
                <div>
                  <h2>Recent XP by Day</h2>
                  <span className="panel-subtitle">Last {recentDays.length} active days</span>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {recentDays.map((day, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%" }}>
                    <div style={{
                      flex: 1, width: "100%", display: "flex", alignItems: "flex-end",
                      borderRadius: "3px 3px 0 0", background: "rgba(255,255,255,.04)", overflow: "hidden"
                    }}>
                      <div style={{
                        width: "100%",
                        height: `${Math.max(4, Math.round((day.xp / peak) * 100))}%`,
                        borderRadius: "3px 3px 0 0",
                        background: day.date === today
                          ? "linear-gradient(180deg, var(--cyan), rgba(6,214,240,.4))"
                          : "linear-gradient(180deg, var(--green), rgba(34,197,94,.4))",
                        transition: "height .5s"
                      }} />
                    </div>
                    <span style={{ fontSize: ".52rem", color: "var(--text-dim)" }}>
                      D{day.day}
                    </span>
                    <small style={{ fontSize: ".5rem", color: "var(--amber)" }}>{day.xp}</small>
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })()}

    </div>
  );
}
