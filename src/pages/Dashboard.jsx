import React, { useState, useCallback } from "react";
import {
  Zap, Flame, Trophy, TrendingUp, Code2, GraduationCap,
  CheckCircle2, Check, Map as MapIcon, Calendar, Sparkles, Lightbulb,
  Star, BarChart2, Activity, MessageSquare, HeartPulse,
  ChevronRight, Target, Award, Clock, ArrowRight
} from "lucide-react";
import {
  computeScores, computeDayNumber, computeMissionProgress,
  getLevelInfo, getDailyQuote, getLast7Days, DAYS_SHORT,
  formatDate, todayISO
} from "../utils.js";

const API = "/api";

// ─── SVG Score Ring ───────────────────────────────────────────────────────────
function PremiumScoreRing({ value = 0, size = 80, strokeWidth = 8, tone = "cyan", label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const val = Math.min(100, Math.max(0, Math.round(value)));
  const offset = circumference - (val / 100) * circumference;

  let color = "var(--cyan)";
  let dimColor = "rgba(6, 182, 212, 0.1)";
  if (tone === "cyan") {
    color = "var(--cyan)";
    dimColor = "rgba(6, 182, 212, 0.08)";
  } else if (tone === "green" || tone === "emerald") {
    color = "var(--emerald)";
    dimColor = "rgba(16, 185, 129, 0.08)";
  } else if (tone === "purple") {
    color = "var(--purple)";
    dimColor = "rgba(168, 85, 247, 0.08)";
  } else if (tone === "amber") {
    color = "var(--amber)";
    dimColor = "rgba(245, 158, 11, 0.08)";
  } else if (tone === "blue") {
    color = "var(--blue)";
    dimColor = "rgba(59, 130, 246, 0.08)";
  } else if (tone === "rose") {
    color = "var(--rose)";
    dimColor = "rgba(244, 63, 94, 0.08)";
  }

  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dimColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <strong style={{ fontSize: size > 70 ? "1.2rem" : "0.95rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
          {val}%
        </strong>
        {label && <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>}
      </div>
    </div>
  );
}

// ─── Weekly Activity SVG Bar Chart ───────────────────────────────────────────
function PremiumWeeklyChart({ xpHistory = [] }) {
  const last7 = getLast7Days();
  const dataMap = new Map();
  xpHistory.forEach(entry => {
    const date = entry.date || (entry.timestamp ? entry.timestamp.slice(0, 10) : null);
    if (date) dataMap.set(date, (dataMap.get(date) || 0) + (entry.amount || 0));
  });

  const bars = last7.map((date, i) => {
    const dayIdx = new Date(date).getDay();
    const shortIdx = dayIdx === 0 ? 6 : dayIdx - 1;
    return {
      date,
      label: DAYS_SHORT[shortIdx],
      value: dataMap.get(date) || 0,
      isToday: date === todayISO()
    };
  });

  const maxVal = Math.max(...bars.map(b => b.value), 100); // minimum scale peak at 100
  const hasData = bars.some(b => b.value > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative", height: 140, width: "100%", marginTop: 10 }}>
        {/* Horizontal dashed gridlines */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none",
          opacity: 0.15
        }}>
          <div style={{ flex: 1, borderBottom: "1px dashed var(--border-2)" }} />
          <div style={{ flex: 1, borderBottom: "1px dashed var(--border-2)" }} />
          <div style={{ flex: 1, borderBottom: "1px dashed var(--border-2)" }} />
          <div style={{ flex: 1 }} />
        </div>

        {/* Bars Container */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 14, paddingBottom: 8
        }}>
          {bars.map((bar, i) => {
            const barHeightPct = Math.max(4, Math.round((bar.value / maxVal) * 100));
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  height: "100%",
                  justifyContent: "flex-end",
                  position: "relative"
                }}
              >
                <div
                  className="bar-shape"
                  style={{
                    width: "100%",
                    height: `${barHeightPct}%`,
                    borderRadius: "4px 4px 0 0",
                    background: bar.isToday
                      ? "linear-gradient(180deg, var(--cyan) 0%, rgba(6,182,212,0.3) 100%)"
                      : "linear-gradient(180deg, var(--indigo) 0%, rgba(99,102,241,0.2) 100%)",
                    boxShadow: bar.isToday ? "0 0 12px rgba(6,182,212,0.2)" : "none",
                    transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s",
                    cursor: "pointer"
                  }}
                />

                <div className="bar-tooltip" style={{
                  position: "absolute",
                  bottom: `${barHeightPct + 8}%`,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  padding: "4px 8px",
                  fontSize: "10px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  boxShadow: "var(--shadow-md)",
                  pointerEvents: "none",
                  opacity: 0,
                  transform: "translateY(5px)",
                  transition: "all 0.2s ease",
                  zIndex: 10
                }}>
                  {bar.value} XP
                </div>

                <span style={{
                  fontSize: "10px",
                  fontWeight: bar.isToday ? 700 : 500,
                  color: bar.isToday ? "var(--cyan)" : "var(--text-muted)"
                }}>
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {!hasData && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "rgba(255,255,255,0.01)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "1rem" }}>📈</span>
          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>No XP activity yet. Complete today's missions and habits to see trends.</span>
        </div>
      )}
    </div>
  );
}

// ─── Timeline XP History ──────────────────────────────────────────────────────
function PremiumXPTimeline({ xpHistory = [] }) {
  const recent = [...xpHistory].reverse().slice(0, 5);
  if (!recent.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "2rem", marginBottom: 8 }}>⚡</span>
        <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>No XP Earned</strong>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0 0", maxWidth: 180 }}>
          Complete missions and habits to earn XP events.
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      {/* Timeline line */}
      <div style={{
        position: "absolute",
        left: 17,
        top: 8,
        bottom: 8,
        width: 2,
        background: "var(--border)",
        zIndex: 0
      }} />

      {recent.map((entry, i) => {
        let emoji = "⚡";
        let color = "var(--cyan)";
        let bg = "var(--cyan-dim)";
        
        if (entry.source === "mission") {
          emoji = "🎯";
          color = "var(--blue)";
          bg = "var(--blue-dim)";
        } else if (entry.source === "habit") {
          emoji = "💪";
          color = "var(--emerald)";
          bg = "var(--emerald-dim)";
        } else if (entry.source === "coding") {
          emoji = "💻";
          color = "var(--purple)";
          bg = "var(--purple-dim)";
        } else if (entry.source === "achievement") {
          emoji = "🏆";
          color = "var(--gold)";
          bg = "rgba(251, 191, 36, 0.1)";
        }

        return (
          <div key={i} className="timeline-item" style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            position: "relative",
            zIndex: 1,
            transition: "transform var(--t-fast)"
          }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: bg,
              border: "1px solid rgba(255, 255, 255, 0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0
            }}>
              {emoji}
            </div>
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {entry.label || entry.source || "XP earned"}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 800, color: color }}>
                  +{entry.amount} XP
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                <span style={{ fontSize: "10.5px", color: "var(--text-dim)", textTransform: "capitalize" }}>
                  {entry.source}
                </span>
                <span style={{ fontSize: "9.5px", color: "var(--text-dim)" }}>
                  {entry.date || (entry.timestamp ? entry.timestamp.slice(0, 10) : "")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ state, setState, onNav, onXP }) {
  const [completingHabit, setCompletingHabit] = useState(null);

  const dayNumber   = computeDayNumber(state.startDate);
  const scores      = computeScores(state);
  const li          = getLevelInfo(state.gamification?.xp || 0);
  const missions    = state.missions || [];
  const activeMissions = missions.filter(m => !m.archived);
  const missionProg = computeMissionProgress(activeMissions);
  const habits      = state.habits || [];
  const streaks     = state.gamification?.streaks || {};
  const xpHistory   = state.gamification?.xpHistory || [];
  const overallStreak = streaks.overall?.current || 0;
  const overallBest   = streaks.overall?.best || 0;
  const codingStreak  = streaks.coding?.current  || 0;
  const workoutStreak = streaks.workout?.current || 0;
  const englishStreak = streaks.english?.current || 0;
  const quote       = getDailyQuote(state.startDate);
  const profileName = state.profile?.name || "Developer";
  const daysLeft    = 365 - dayNumber;
  const journeyPct  = Math.round((dayNumber / 365) * 100);
  const completedHabits = habits.filter(h => h.completed).length;
  const habitPct    = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

  // Sub-metrics
  const codingHours = state.coding?.totalHours || 0;
  const completedProjects = (state.projects || []).filter(p => p.status === "completed").length;
  
  const workoutsCount = state.health?.workouts?.length || 0;
  const sleepLog = state.health?.sleepLog || [];
  const avgSleep = sleepLog.length
    ? (sleepLog.slice(-7).reduce((sum, s) => sum + (s.hours || 0), 0) / Math.min(sleepLog.length, 7)).toFixed(1)
    : "0.0";
  const waterLog = state.health?.waterLog || [];
  const avgWater = waterLog.length
    ? (waterLog.slice(-7).reduce((sum, w) => sum + (w.litres || 0), 0) / Math.min(waterLog.length, 7)).toFixed(1)
    : "0.0";

  const placementSubjects = state.placement?.subjects || [];
  const totalPlacementTopics = placementSubjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
  const completedPlacementTopics = placementSubjects.reduce((acc, s) => acc + (s.topics?.filter(t => t.completed).length || 0), 0);

  const englishSessions = state.english?.sessions?.length || 0;
  const vocabularyCount = state.english?.vocabulary?.length || 0;

  // Toggle habit completion
  const handleHabitClick = useCallback(async (habit) => {
    if (completingHabit === habit.id) return;
    setCompletingHabit(habit.id);
    const newCompleted = !habit.completed;
    const updatedHabits = (state.habits || []).map(h =>
      h.id === habit.id ? { ...h, completed: newCompleted } : h
    );
    setState(cur => ({ ...cur, habits: updatedHabits }));
    try {
      await fetch(`${API}/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: updatedHabits })
      });
      if (newCompleted) onXP(habit.xp || 10, `Habit: ${habit.title}`);
    } catch (_) {}
    setCompletingHabit(null);
  }, [state.habits, completingHabit, setState, onXP]);

  return (
    <div className="db-container">
      {/* Scope-injected css stylesheet for micro-animations and layout rules */}
      <style>{`
        .db-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
        .db-row-title {
          font-family: var(--font-head);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .db-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .db-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .db-grid-4 {
            grid-template-columns: 1fr;
          }
        }
        .db-card-premium {
          position: relative;
          overflow: hidden;
          padding: 20px;
          border-radius: var(--r-xl);
          background: var(--surface);
          border: 1px solid var(--border);
          transition: all var(--t-normal);
        }
        .db-card-premium:hover {
          transform: translateY(-2px);
          border-color: var(--border-2);
          box-shadow: var(--shadow-md);
        }
        .hero-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .hero-card-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
        .hero-card-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--r-md);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }
        .hero-card-value {
          font-family: var(--font-head);
          font-size: 32px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .hero-card-sub {
          font-size: 11.5px;
          color: var(--text-dim);
        }
        
        .db-competency-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 20px;
          border-radius: var(--r-xl);
          background: var(--surface);
          border: 1px solid var(--border);
          text-align: center;
          transition: all var(--t-normal);
        }
        .db-competency-card:hover {
          transform: translateY(-3px);
          border-color: var(--border-2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .competency-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          margin-bottom: 4px;
        }
        .competency-title {
          font-family: var(--font-head);
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .competency-subtext {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .competency-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }

        .db-row-3 {
          display: grid;
          grid-template-columns: 1.6fr 1.2fr 1.2fr;
          gap: 20px;
        }
        @media (max-width: 1200px) {
          .db-row-3 {
            grid-template-columns: 1.2fr 1fr;
          }
          .db-row-3 > *:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 800px) {
          .db-row-3 {
            grid-template-columns: 1fr;
          }
          .db-row-3 > *:last-child {
            grid-column: span 1;
          }
        }

        .db-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .db-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .db-panel-title {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 800;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-panel-subtitle {
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 1px;
        }
        .db-panel-action {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--cyan);
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--t-fast);
          padding: 4px 8px;
          border-radius: var(--r-sm);
        }
        .db-panel-action:hover {
          color: var(--indigo);
          background: rgba(255, 255, 255, 0.03);
        }

        .habit-item-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--r-md);
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          text-align: left;
          transition: all var(--t-fast);
          width: 100%;
        }
        .habit-item-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-2);
        }
        .habit-item-btn.completed {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .habit-item-btn.completed:hover {
          background: rgba(16, 185, 129, 0.07);
        }

        .mission-item-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--r-md);
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          transition: all var(--t-fast);
        }
        .mission-item-row:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-2);
        }
        
        .timeline-item:hover {
          transform: translateX(3px);
        }

        .bar-shape:hover + .bar-tooltip {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .db-quote-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 18px;
          border-radius: var(--r-lg);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          margin-top: 18px;
        }

        @keyframes pulse-glow {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.3)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.3)); }
        }
        .pulse-flame {
          animation: pulse-glow 2s infinite ease-in-out;
        }

        .db-shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .db-shortcuts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .db-shortcuts-grid {
            grid-template-columns: 1fr;
          }
        }
        .shortcut-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--r-lg);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          transition: all var(--t-normal);
          text-align: left;
          cursor: pointer;
          width: 100%;
          color: var(--text-primary);
        }
        .shortcut-btn:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--border-2);
          box-shadow: var(--shadow-sm);
          color: var(--text-primary);
        }
        .shortcut-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .shortcut-label {
          font-family: var(--font-head);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .shortcut-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
      `}</style>

      {/* ── ROW 1: HERO METRICS (4 columns) ────────────────────────────────── */}
      <div>
        <h2 className="db-row-title">Operational Metrics</h2>
        <div className="db-grid-4">
          
          {/* Day Progress Card */}
          <div className="db-card-premium">
            <div className="hero-card-header">
              <span className="hero-card-title">Day Progress</span>
              <div className="hero-card-icon-wrap" style={{ color: "var(--cyan)", background: "var(--cyan-dim)" }}>
                <Calendar size={15} />
              </div>
            </div>
            <div className="hero-card-value">
              Day {dayNumber}
              <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-muted)", marginLeft: 4 }}>/ 365</span>
            </div>
            <div className="hero-card-sub" style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600, marginBottom: 4 }}>
                <span>{journeyPct}% COMPLETE</span>
                <span>{daysLeft} DAYS REMAINING</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${journeyPct}%`, background: "linear-gradient(90deg, var(--cyan), var(--indigo))", borderRadius: 2 }} />
              </div>
            </div>
          </div>

          {/* Consistency Streak Card */}
          <div className="db-card-premium">
            <div className="hero-card-header">
              <span className="hero-card-title">Consistency Streak</span>
              <div className="hero-card-icon-wrap" style={{ color: "var(--amber)", background: "var(--amber-dim)" }}>
                <Flame size={15} className="pulse-flame" />
              </div>
            </div>
            <div className="hero-card-value">
              {overallStreak}
              <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-muted)", marginLeft: 4 }}>{overallStreak === 1 ? "day" : "days"}</span>
            </div>
            <div className="hero-card-sub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span>Best record: {overallBest} days</span>
              <span style={{
                color: overallStreak > 0 ? "var(--emerald)" : "var(--text-dim)",
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase"
              }}>
                {overallStreak > 0 ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </div>

          {/* Total XP Card */}
          <div className="db-card-premium">
            <div className="hero-card-header">
              <span className="hero-card-title">Total XP</span>
              <div className="hero-card-icon-wrap" style={{ color: "var(--purple)", background: "var(--purple-dim)" }}>
                <Zap size={15} />
              </div>
            </div>
            <div className="hero-card-value">
              {state.gamification?.xp || 0}
              <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-muted)", marginLeft: 4 }}>XP</span>
            </div>
            <div className="hero-card-sub" style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 600, marginBottom: 4 }}>
                <span>LEVEL {li.level}</span>
                <span>{li.neededXP - li.currentXP} XP TO NEXT LEVEL</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${li.progress}%`, background: "linear-gradient(90deg, var(--purple), var(--rose))", borderRadius: 2 }} />
              </div>
            </div>
          </div>

          {/* Current Level Card */}
          <div className="db-card-premium">
            <div className="hero-card-header">
              <span className="hero-card-title">Current Level</span>
              <div className="hero-card-icon-wrap" style={{ color: "var(--indigo)", background: "var(--indigo-dim)" }}>
                <Trophy size={15} />
              </div>
            </div>
            <div className="hero-card-value" style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--text-muted)" }}>Lv</span>
              <span>{li.level}</span>
            </div>
            <div className="hero-card-sub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{
                fontWeight: 700,
                color: "var(--gold)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.02em"
              }}>
                {li.title}
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>Global Rank</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── ROW 2: COMPETENCY OVERVIEW (4 columns) ─────────────────────────── */}
      <div>
        <h2 className="db-row-title">Competency Overview</h2>
        <div className="db-grid-4">

          {/* Coding Progress Card */}
          <div className="db-competency-card">
            <PremiumScoreRing value={scores.coding} size={80} strokeWidth={8} tone="cyan" />
            <div className="competency-title-row">
              <Code2 size={14} style={{ color: "var(--cyan)" }} />
              <h3 className="competency-title">Coding Progress</h3>
            </div>
            <p className="competency-subtext">
              {codingHours} hrs logged · {completedProjects} projects done
            </p>
            <div className="competency-tags">
              <span className="chip chip-cyan" style={{ fontSize: "9px", padding: "1px 6px" }}>
                {codingHours > 0 ? `${codingStreak}d streak` : "Not Started"}
              </span>
              <span className="chip chip-gray" style={{ fontSize: "9px", padding: "1px 6px" }}>
                Goal: 200 hrs
              </span>
            </div>
          </div>

          {/* Health Progress Card */}
          <div className="db-competency-card">
            <PremiumScoreRing value={scores.health} size={80} strokeWidth={8} tone="emerald" />
            <div className="competency-title-row">
              <HeartPulse size={14} style={{ color: "var(--emerald)" }} />
              <h3 className="competency-title">Health Score</h3>
            </div>
            <p className="competency-subtext">
              {workoutsCount} workouts · {avgSleep}h sleep · {avgWater}L water
            </p>
            <div className="competency-tags">
              <span className="chip chip-emerald" style={{ fontSize: "9px", padding: "1px 6px" }}>
                {workoutStreak > 0 ? `${workoutStreak}d streak` : "Inactive"}
              </span>
              <span className="chip chip-gray" style={{ fontSize: "9px", padding: "1px 6px" }}>
                Avg sleep
              </span>
            </div>
          </div>

          {/* Placement Readiness Card */}
          <div className="db-competency-card">
            <PremiumScoreRing value={scores.placement} size={80} strokeWidth={8} tone="blue" />
            <div className="competency-title-row">
              <GraduationCap size={14} style={{ color: "var(--blue)" }} />
              <h3 className="competency-title">Placement Prep</h3>
            </div>
            <p className="competency-subtext">
              {completedPlacementTopics}/{totalPlacementTopics || 0} topics completed across {placementSubjects.length} subjects
            </p>
            <div className="competency-tags">
              <span className="chip chip-blue" style={{ fontSize: "9px", padding: "1px 6px" }}>
                {scores.placement >= 50 ? "Ready" : "In Progress"}
              </span>
              <span className="chip chip-gray" style={{ fontSize: "9px", padding: "1px 6px" }}>
                DSA & Core
              </span>
            </div>
          </div>

          {/* English Progress Card */}
          <div className="db-competency-card">
            <PremiumScoreRing value={scores.communication} size={80} strokeWidth={8} tone="purple" />
            <div className="competency-title-row">
              <MessageSquare size={14} style={{ color: "var(--purple)" }} />
              <h3 className="competency-title">English & Comm</h3>
            </div>
            <p className="competency-subtext">
              {vocabularyCount} vocabulary words · {englishSessions} speaking sessions
            </p>
            <div className="competency-tags">
              <span className="chip chip-purple" style={{ fontSize: "9px", padding: "1px 6px" }}>
                {englishStreak > 0 ? `${englishStreak}d streak` : "Active"}
              </span>
              <span className="chip chip-gray" style={{ fontSize: "9px", padding: "1px 6px" }}>
                Vocab focus
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── ROW 3: ANALYTICS & WIDGETS (3 columns) ─────────────────────────── */}
      <div className="db-row-3">

        {/* Column 1: Weekly Activity Graph & Quote */}
        <div className="db-panel">
          <div className="db-panel-header">
            <div className="db-panel-title-wrap">
              <h3 className="db-panel-title">
                <BarChart2 size={16} style={{ color: "var(--indigo)" }} />
                Weekly Activity
              </h3>
              <span className="db-panel-subtitle">XP earned over the last 7 days</span>
            </div>
          </div>
          
          <PremiumWeeklyChart xpHistory={xpHistory} />

          {/* Quote Section inside the Weekly Panel */}
          <div className="db-quote-box">
            <Lightbulb size={18} style={{ color: "var(--amber)", marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontStyle: "italic", fontSize: "12px", lineHeight: 1.5, color: "var(--text-primary)", margin: 0 }}>
                "{quote}"
              </p>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: 6, fontWeight: 600 }}>
                DAY {dayNumber} · DAILY WISDOM FOR YOU
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Task Center (Today's Habits & Active Missions) */}
        <div className="db-panel">
          <div className="db-panel-header">
            <div className="db-panel-title-wrap">
              <h3 className="db-panel-title">
                <Activity size={16} style={{ color: "var(--emerald)" }} />
                Task Center
              </h3>
              <span className="db-panel-subtitle">
                Habits ({completedHabits}/{habits.length}) · Missions ({missionProg.completed}/{missionProg.total})
              </span>
            </div>
            <button className="db-panel-action" onClick={() => onNav("missions")}>
              View All
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", flex: 1 }}>
            {/* Habits Section */}
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.04em", marginBottom: 8 }}>
                Daily Habits
              </h4>
              {habits.length === 0 ? (
                <div style={{ padding: "12px 10px", background: "rgba(255,255,255,0.01)", borderRadius: "var(--r-md)", border: "1px dashed var(--border)", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>No active habits. Set them up in Health.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {habits.slice(0, 3).map(h => (
                    <button
                      key={h.id}
                      className={`habit-item-btn${h.completed ? " completed" : ""}`}
                      disabled={completingHabit === h.id}
                      onClick={() => handleHabitClick(h)}
                    >
                      <span style={{ fontSize: "1rem" }}>{h.icon || "✨"}</span>
                      <span style={{
                        flex: 1,
                        fontSize: "12px",
                        fontWeight: 500,
                        textDecoration: h.completed ? "line-through" : "none",
                        color: h.completed ? "var(--text-muted)" : "var(--text-primary)"
                      }}>
                        {h.title}
                      </span>
                      <span style={{ fontSize: "10.5px", color: "var(--amber)", fontWeight: 700, marginRight: 2 }}>+{h.xp || 10} XP</span>
                      {h.completed
                        ? <CheckCircle2 size={15} style={{ color: "var(--emerald)", flexShrink: 0 }} />
                        : <Check size={15} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                      }
                    </button>
                  ))}
                  {habits.length > 3 && (
                    <button onClick={() => onNav("health")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--cyan)", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "2px 4px" }}>
                      +{habits.length - 3} more habits →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Missions Section */}
            <div>
              <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.04em", marginBottom: 8 }}>
                Active Missions
              </h4>
              {activeMissions.length === 0 ? (
                <div style={{ padding: "12px 10px", background: "rgba(255,255,255,0.01)", borderRadius: "var(--r-md)", border: "1px dashed var(--border)", textAlign: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>No active missions for today.</span>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {activeMissions.slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      className="mission-item-row"
                      onClick={() => onNav("missions")}
                    >
                      {m.completed
                        ? <CheckCircle2 size={15} style={{ color: "var(--blue)", flexShrink: 0 }} />
                        : <Check size={15} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                      }
                      <span style={{
                        flex: 1,
                        fontSize: "12px",
                        fontWeight: 500,
                        textDecoration: m.completed ? "line-through" : "none",
                        color: m.completed ? "var(--text-muted)" : "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {m.title}
                      </span>
                      <span className="chip chip-gray" style={{ fontSize: "8.5px", padding: "1px 5px" }}>{m.category}</span>
                      <strong style={{ color: "var(--amber)", fontSize: "10.5px", fontWeight: 700 }}>+{m.xp} XP</strong>
                    </div>
                  ))}
                  {activeMissions.length > 3 && (
                    <button onClick={() => onNav("missions")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "var(--cyan)", fontSize: "11px", cursor: "pointer", fontWeight: 600, padding: "2px 4px" }}>
                      +{activeMissions.length - 3} more missions →
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Column 3: Recent Activity Feed */}
        <div className="db-panel">
          <div className="db-panel-header">
            <div className="db-panel-title-wrap">
              <h3 className="db-panel-title">
                <Star size={16} style={{ color: "var(--amber)" }} />
                Activity Timeline
              </h3>
              <span className="db-panel-subtitle">History of earned XP logs</span>
            </div>
          </div>
          
          <PremiumXPTimeline xpHistory={xpHistory} />
        </div>

      </div>

      {/* ── WELCOME BANNER FOR DAY 0 / FIRST LOGIN ────────────────────────── */}
      {dayNumber === 0 && (
        <div className="db-card-premium" style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.06) 100%)",
          borderColor: "rgba(6, 182, 212, 0.25)",
          padding: "24px 28px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <span style={{ fontSize: "2.4rem" }}>🚀</span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                Welcome to LifeOS 365, {profileName}!
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                Your 365-day transformation journey begins today. Create your first mission, check off daily habits, and earn XP to level up. Every single day counts towards placement readiness.
              </p>
            </div>
            <button className="primary-btn" onClick={() => onNav("missions")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={14} /> Start Journey Now
            </button>
          </div>
        </div>
      )}

      {/* ── ROW 4: QUICK ACTIONS SHORTCUTS PANEL (At the Bottom) ────────────────── */}
      <div>
        <h2 className="db-row-title">Quick Actions Panel</h2>
        <div className="db-shortcuts-grid">
          
          <button className="shortcut-btn" onClick={() => onNav("roadmap")}>
            <div className="shortcut-icon-box" style={{ background: "var(--cyan-dim)", color: "var(--cyan)" }}>
              <MapIcon size={18} />
            </div>
            <div className="shortcut-text">
              <span className="shortcut-label">Roadmap Pathway</span>
              <p className="shortcut-desc">Learn frontend, backend, DSA, database skills.</p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-dim)" }} />
          </button>

          <button className="shortcut-btn" onClick={() => onNav("coding")}>
            <div className="shortcut-icon-box" style={{ background: "var(--purple-dim)", color: "var(--purple)" }}>
              <Code2 size={18} />
            </div>
            <div className="shortcut-text">
              <span className="shortcut-label">Log Coding Hours</span>
              <p className="shortcut-desc">Track Pomodoro sessions and total study hours.</p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-dim)" }} />
          </button>

          <button className="shortcut-btn" onClick={() => onNav("missions")}>
            <div className="shortcut-icon-box" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
              <Target size={18} />
            </div>
            <div className="shortcut-text">
              <span className="shortcut-label">Daily Missions</span>
              <p className="shortcut-desc">Configure daily goals and priority checkboxes.</p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-dim)" }} />
          </button>

          <button className="shortcut-btn" onClick={() => onNav("calendar")}>
            <div className="shortcut-icon-box" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
              <Calendar size={18} />
            </div>
            <div className="shortcut-text">
              <span className="shortcut-label">365 Calendar Heatmap</span>
              <p className="shortcut-desc">Check streaks and consistency heat map.</p>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-dim)" }} />
          </button>

        </div>
      </div>
    </div>
  );
}
