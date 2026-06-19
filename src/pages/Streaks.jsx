import React, { useState } from "react";
import {
  Flame, Code2, HeartPulse, BookOpen, Brain,
  Trophy, Star, TrendingUp, Lock, Calendar
} from "lucide-react";
import { getLast7Days, getLast30Days, formatDate, todayISO } from "../utils.js";

const API = "/api";

const MILESTONES = [
  { days: 7,   label: "1 Week",   icon: "🌱", xp: 100  },
  { days: 14,  label: "2 Weeks",  icon: "🔥", xp: 200  },
  { days: 30,  label: "1 Month",  icon: "⚡", xp: 500  },
  { days: 60,  label: "2 Months", icon: "💎", xp: 1000 },
  { days: 100, label: "100 Days", icon: "🏆", xp: 2000 },
  { days: 200, label: "200 Days", icon: "👑", xp: 3000 },
  { days: 365, label: "1 Year",   icon: "🌟", xp: 5000 },
];

const STREAK_TIPS = [
  { icon: "⏰", tip: "Set a daily alarm — your streak is a promise to yourself." },
  { icon: "📱", tip: "Check in first thing in the morning. Small wins compound." },
  { icon: "🎯", tip: "Even 15 minutes counts. Consistency beats intensity." },
  { icon: "🛡️", tip: "Use freeze days wisely — they protect your hard-earned streak." },
  { icon: "🧠", tip: "Track why you're building this habit. Emotion fuels consistency." },
  { icon: "📊", tip: "Look at your heatmap daily — visual progress is a powerful motivator." },
];

const STREAK_CARDS_CONFIG = [
  { key: "overall",  label: "Overall",   emoji: "🔥", color: "orange",  desc: "Daily consistency across all activities" },
  { key: "coding",   label: "Coding",    emoji: "💻", color: "cyan",    desc: "Consecutive days with coding sessions" },
  { key: "workout",  label: "Workout",   emoji: "🏋️", color: "green",   desc: "Consecutive days with physical activity" },
  { key: "english",  label: "English",   emoji: "🗣️", color: "purple",  desc: "Consecutive days of English practice" },
  { key: "study",    label: "Study",     emoji: "📚", color: "blue",    desc: "Consecutive days of focused studying" },
];

const COLOR_MAP = {
  orange: { border: "rgba(249,115,22,0.3)", glow: "rgba(249,115,22,0.12)", text: "#f97316" },
  cyan:   { border: "rgba(6,214,240,0.3)",  glow: "rgba(6,214,240,0.10)", text: "var(--cyan)" },
  green:  { border: "rgba(34,197,94,0.3)",  glow: "rgba(34,197,94,0.10)", text: "var(--green)" },
  purple: { border: "rgba(168,85,247,0.3)", glow: "rgba(168,85,247,0.10)", text: "var(--purple)" },
  blue:   { border: "rgba(59,130,246,0.3)", glow: "rgba(59,130,246,0.10)", text: "var(--blue)" },
};

// ─── Animated Flame ──────────────────────────────────────────────────────────

function AnimatedFlame({ size = "2rem", active = false }) {
  return (
    <span style={{
      fontSize: size, display: "inline-block",
      animation: active ? "flicker 1.5s ease-in-out infinite alternate" : "none",
      filter: active ? "drop-shadow(0 0 10px rgba(249,115,22,0.9))" : "grayscale(0.9) opacity(0.45)",
      transition: "filter 0.3s ease",
    }}>
      🔥
    </span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function StreakHero({ streaks }) {
  const overall  = streaks?.overall?.current || 0;
  const best     = streaks?.overall?.best    || 0;
  const isActive = overall > 0;

  return (
    <div className="glass-card" style={{
      padding: "36px 32px", textAlign: "center", position: "relative", overflow: "hidden",
      background: isActive
        ? "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(239,68,68,0.06), rgba(8,16,35,0.82))"
        : undefined,
      borderColor: isActive ? "rgba(249,115,22,0.35)" : undefined,
    }}>
      {isActive && <>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "250px", height: "250px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.18), transparent)",
          pointerEvents: "none",
        }}/>
        <div style={{
          position: "absolute", bottom: "-40px", left: "-40px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(239,68,68,0.12), transparent)",
          pointerEvents: "none",
        }}/>
      </>}
      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatedFlame size="3.5rem" active={isActive} />
        <div style={{
          fontFamily: "var(--font-head)", fontSize: "5.5rem", fontWeight: 900,
          lineHeight: 1.05, margin: "8px 0 4px",
          background: isActive
            ? "linear-gradient(135deg, #f97316, #ef4444)"
            : "rgba(255,255,255,0.18)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {overall}
        </div>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "1.3rem", fontWeight: 700, marginBottom: "6px" }}>
          Day Overall Streak
        </div>
        <p style={{ fontSize: ".88rem", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.6 }}>
          {isActive
            ? `🎉 Incredible! You've been consistent for ${overall} day${overall !== 1 ? "s" : ""} in a row.`
            : "Every legend starts with Day 1. Log an activity to ignite your streak!"}
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "20px",
          background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
          borderRadius: "var(--r-full)", padding: "10px 28px",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "1.8rem", fontWeight: 900, color: "var(--amber)" }}>
              {best}
            </div>
            <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>🏆 Best Streak</div>
          </div>
          <div style={{ width: "1px", height: "40px", background: "var(--border)" }}/>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "1.8rem", fontWeight: 900, color: "var(--cyan)" }}>
              {MILESTONES.filter(m => best >= m.days).length}
            </div>
            <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>🌟 Milestones</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Individual Streak Card ───────────────────────────────────────────────────

function StreakCard({ config, streaks, onUpdate, loading }) {
  const data    = streaks?.[config.key] || {};
  const current = data.current || 0;
  const best    = data.best    || 0;
  const isActive = current > 0;
  const colors  = COLOR_MAP[config.color] || COLOR_MAP.cyan;

  return (
    <div className="glass-card streak-page-card" style={{
      borderColor: isActive ? colors.border : undefined,
      background: isActive ? `linear-gradient(135deg, ${colors.glow}, rgba(8,16,35,0.82))` : undefined,
      transition: "all 0.3s ease",
    }}>
      <div className="spc-header">
        <div className="spc-emoji">
          <AnimatedFlame size="2.2rem" active={isActive} />
        </div>
        <div>
          <strong style={{ color: isActive ? colors.text : undefined }}>{config.label} Streak</strong>
          <span>{config.desc}</span>
        </div>
      </div>

      <div className="spc-numbers">
        <div className="spc-current">
          <strong style={{ color: isActive ? colors.text : "var(--text-dim)" }}>{current}</strong>
          <span>Current</span>
        </div>
        <div className="spc-divider"/>
        <div className="spc-record">
          <strong style={{ color: "var(--amber)" }}>{best}</strong>
          <span>Best</span>
        </div>
      </div>

      <div className="spc-milestones" style={{ marginBottom: "16px" }}>
        {[3, 7, 14, 30, 60].map(m => {
          const reached = current >= m;
          const wasBest = best >= m;
          return (
            <div key={m} className={`spc-milestone ${reached ? "done" : wasBest ? "reached" : ""}`} title={`${m}-day milestone`}>
              <span>{reached ? "✓" : wasBest ? "●" : "○"}</span>
              <span>{m}d</span>
            </div>
          );
        })}
      </div>

      <button
        className="primary-btn full"
        style={{ fontSize: ".82rem", padding: "10px 16px" }}
        onClick={() => onUpdate(config.key)}
        disabled={loading}
      >
        <Flame size={14} />
        {loading ? "Updating…" : "Update Streak"}
      </button>
    </div>
  );
}

// ─── Weekly Calendar ──────────────────────────────────────────────────────────

function WeeklyCalendar({ calendar }) {
  const last7  = getLast7Days();
  const calMap = new Map((calendar || []).map(d => [d.date, d]));
  const today  = todayISO();
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const STATUS_STYLE = {
    success: { bg: "var(--green)",          border: "rgba(34,197,94,0.5)",  text: "#fff",             icon: "✓" },
    partial: { bg: "rgba(245,158,11,0.55)", border: "rgba(245,158,11,0.4)", text: "#fff",             icon: "◑" },
    missed:  { bg: "rgba(239,68,68,0.25)",  border: "rgba(239,68,68,0.35)", text: "var(--red)",       icon: "✗" },
    pending: { bg: "rgba(6,214,240,0.15)",  border: "rgba(6,214,240,0.4)",  text: "var(--cyan)",      icon: "●" },
    future:  { bg: "rgba(255,255,255,0.03)",border: "var(--border)",         text: "var(--text-dim)", icon: "○" },
  };

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Calendar size={18} style={{ color: "var(--cyan)" }}/>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 700 }}>This Week</h2>
        <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "var(--text-muted)" }}>
          {last7.filter(d => (calMap.get(d)?.status === "success")).length} / 7 days
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
        {last7.map((date) => {
          const rec    = calMap.get(date);
          const isToday = date === today;
          const rawStatus = rec?.status || (date < today ? "missed" : date === today ? "pending" : "future");
          const s = STATUS_STYLE[rawStatus] || STATUS_STYLE.future;
          const dayName = dayNames[new Date(date + "T12:00:00").getDay()];
          return (
            <div key={date} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: ".65rem", fontWeight: isToday ? 700 : 400,
                color: isToday ? "var(--cyan)" : "var(--text-dim)", marginBottom: "6px",
              }}>
                {dayName}
              </div>
              <div style={{
                aspectRatio: "1", borderRadius: "var(--r-md)",
                background: s.bg, border: `1px solid ${s.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".85rem", color: s.text, fontWeight: 700,
                boxShadow: isToday ? "0 0 14px rgba(6,214,240,0.4)" : "none",
                transition: "transform 0.1s",
              }}>
                {s.icon}
              </div>
              {rec?.xp ? (
                <div style={{ fontSize: ".58rem", color: "var(--amber)", marginTop: "3px" }}>+{rec.xp}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Monthly Heatmap ──────────────────────────────────────────────────────────

function MonthlyHeatmap({ calendar }) {
  const last30 = getLast30Days();
  const calMap = new Map((calendar || []).map(d => [d.date, d]));
  const today  = todayISO();
  const successCount = last30.filter(d => calMap.get(d)?.status === "success").length;

  const CELL_STYLE = {
    success: { background: "var(--green)",           boxShadow: "0 0 6px rgba(34,197,94,0.5)" },
    partial: { background: "rgba(245,158,11,0.55)" },
    missed:  { background: "rgba(239,68,68,0.3)" },
    pending: { background: "rgba(6,214,240,0.25)",   boxShadow: "0 0 8px rgba(6,214,240,0.4)" },
    future:  { background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" },
  };

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <TrendingUp size={18} style={{ color: "var(--purple)" }}/>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 700 }}>
          Last 30 Days
        </h2>
        <span style={{
          marginLeft: "auto", fontSize: ".72rem", fontWeight: 700,
          color: successCount >= 20 ? "var(--green)" : successCount >= 10 ? "var(--amber)" : "var(--text-muted)",
        }}>
          {successCount} / 30 active
        </span>
      </div>
      <div style={{ fontSize: ".7rem", color: "var(--text-muted)", marginBottom: "12px" }}>
        {formatDate(last30[0])} — {formatDate(last30[29])}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "5px" }}>
        {last30.map(date => {
          const rec    = calMap.get(date);
          const status = rec?.status || (date < today ? "missed" : date === today ? "pending" : "future");
          const cs = CELL_STYLE[status] || CELL_STYLE.future;
          return (
            <div key={date} title={`${date} · ${status}${rec?.xp ? ` · ${rec.xp} XP` : ""}`} style={{
              aspectRatio: "1", borderRadius: "4px", cursor: "pointer", transition: "transform 0.1s",
              ...cs,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.4)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
        {[
          { label: "Completed", color: "var(--green)" },
          { label: "Partial",   color: "rgba(245,158,11,0.6)" },
          { label: "Missed",    color: "rgba(239,68,68,0.35)" },
          { label: "Today",     color: "rgba(6,214,240,0.3)" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: ".7rem", color: "var(--text-muted)" }}>
            <div style={{ width: 11, height: 11, borderRadius: 3, background: l.color }}/>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Milestones Panel ─────────────────────────────────────────────────────────

function MilestonesPanel({ currentStreak, bestStreak }) {
  const unlocked = MILESTONES.filter(m => bestStreak >= m.days).length;
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Trophy size={18} style={{ color: "var(--amber)" }}/>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 700 }}>
          Streak Milestones
        </h2>
        <span style={{ marginLeft: "auto", fontSize: ".72rem", color: "var(--amber)", fontWeight: 700 }}>
          {unlocked} / {MILESTONES.length} Unlocked
        </span>
      </div>
      <div className="milestone-grid">
        {MILESTONES.map((m, idx) => {
          const isUnlocked = bestStreak >= m.days;
          const isCurrent  = currentStreak >= m.days && currentStreak < (MILESTONES[idx + 1]?.days ?? Infinity);
          const isNext     = !isUnlocked && (idx === 0 || bestStreak >= MILESTONES[idx - 1]?.days);
          return (
            <div key={m.days} className={`milestone-item glass-card ${isUnlocked ? "unlocked" : "locked"}`} style={{
              borderColor: isCurrent ? "rgba(249,115,22,0.5)" : isNext ? "rgba(6,214,240,0.2)" : undefined,
              background: isCurrent ? "rgba(249,115,22,0.1)" : isNext ? "rgba(6,214,240,0.05)" : undefined,
              transform: isCurrent ? "scale(1.05)" : undefined,
              transition: "all 0.2s", position: "relative",
            }}>
              {isUnlocked
                ? <div style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", color: "#000", fontWeight: 900 }}>✓</div>
                : isNext
                  ? <div style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: "rgba(6,214,240,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Star size={8} style={{ color: "var(--cyan)" }}/></div>
                  : <Lock size={11} style={{ position: "absolute", top: 6, right: 6, color: "var(--text-dim)" }}/>
              }
              <div className="ms-icon" style={{ filter: isUnlocked ? "none" : "grayscale(1) opacity(0.35)" }}>{m.icon}</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "1.15rem", fontWeight: 900, color: isUnlocked ? "var(--amber)" : "var(--text-dim)" }}>{m.days}</div>
              <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>{m.label}</div>
              <div style={{ fontSize: ".65rem", color: isUnlocked ? "var(--amber)" : "var(--text-dim)", fontWeight: 600 }}>+{m.xp} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tips ─────────────────────────────────────────────────────────────────────

function StreakTips() {
  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <Star size={18} style={{ color: "var(--purple)" }}/>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 700 }}>Streak Tips</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "10px" }}>
        {STREAK_TIPS.map((t, i) => (
          <div key={i} style={{
            display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px",
            background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.1)",
            borderRadius: "var(--r-md)",
          }}>
            <span style={{ fontSize: "1.4rem", flexShrink: 0, lineHeight: 1 }}>{t.icon}</span>
            <p style={{ fontSize: ".82rem", lineHeight: 1.55, color: "var(--text-muted)" }}>{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function Streaks({ state, setState, onNav, onXP }) {
  const [loadingKey, setLoadingKey] = useState(null);

  const streaks  = state.gamification?.streaks || {};
  const calendar = state.calendar || [];
  const overall  = streaks?.overall?.current || 0;
  const bestEver = streaks?.overall?.best    || 0;
  const allZero  = STREAK_CARDS_CONFIG.every(c => (streaks?.[c.key]?.current || 0) === 0);

  async function handleUpdateStreak(streakKey) {
    setLoadingKey(streakKey);
    try {
      const res = await fetch(`${API}/streaks/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: streakKey, date: todayISO() }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setState(cur => {
        const prevS = cur.gamification?.streaks?.[streakKey] || {};
        const newCur = data.current ?? (prevS.current || 0) + 1;
        const newBest = data.best ?? Math.max(prevS.best || 0, newCur);
        const prevOvr = cur.gamification?.streaks?.overall || {};
        return {
          ...cur,
          gamification: {
            ...cur.gamification,
            streaks: {
              ...cur.gamification?.streaks,
              [streakKey]: { current: newCur, best: newBest },
              overall: {
                current: data.overallCurrent ?? Math.max(prevOvr.current || 0, newCur > 0 ? (prevOvr.current || 0) : 0),
                best: data.overallBest ?? Math.max(prevOvr.best || 0, prevOvr.current || 0),
              },
            },
            xp: (cur.gamification?.xp || 0) + 10,
          },
        };
      });
      onXP(10, `${STREAK_CARDS_CONFIG.find(c => c.key === streakKey)?.label} streak updated!`);
    } catch {
      // Optimistic local update
      setState(cur => {
        const prevS  = cur.gamification?.streaks?.[streakKey] || {};
        const newCur = (prevS.current || 0) + 1;
        const newBest = Math.max(prevS.best || 0, newCur);
        const prevOvr = cur.gamification?.streaks?.overall || {};
        const newOvrCur = Math.max(prevOvr.current || 0, 1);
        return {
          ...cur,
          gamification: {
            ...cur.gamification,
            streaks: {
              ...cur.gamification?.streaks,
              [streakKey]: { current: newCur, best: newBest },
              overall: { current: newOvrCur, best: Math.max(prevOvr.best || 0, newOvrCur) },
            },
            xp: (cur.gamification?.xp || 0) + 10,
          },
        };
      });
      onXP(10, "Streak updated!");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="streaks-page">
      {/* Hero Banner */}
      <StreakHero streaks={streaks} />

      {/* Empty state when everything is 0 */}
      {allZero && (
        <div className="glass-card" style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "16px", padding: "48px 24px", textAlign: "center",
        }}>
          <span style={{ fontSize: "3.5rem", filter: "grayscale(0.6) opacity(0.7)" }}>🔥</span>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "1.4rem", fontWeight: 800 }}>
            Start Your Streak Today
          </h2>
          <p style={{ fontSize: ".88rem", color: "var(--text-muted)", maxWidth: 400, lineHeight: 1.7 }}>
            Every legend starts with Day 1. Log any activity — coding, workout, English practice, or studying — and ignite your first streak. 🚀
          </p>
          <button className="primary-btn" onClick={() => handleUpdateStreak("overall")} disabled={loadingKey === "overall"}>
            <Flame size={16} />
            {loadingKey === "overall" ? "Igniting…" : "Log First Activity"}
          </button>
        </div>
      )}

      {/* 5 Streak Cards */}
      <div className="streak-cards-grid">
        {STREAK_CARDS_CONFIG.map(config => (
          <StreakCard
            key={config.key}
            config={config}
            streaks={streaks}
            onUpdate={handleUpdateStreak}
            loading={loadingKey === config.key}
          />
        ))}
      </div>

      {/* Weekly + Monthly Calendars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <WeeklyCalendar calendar={calendar} />
        <MonthlyHeatmap calendar={calendar} />
      </div>

      {/* Milestones */}
      <MilestonesPanel currentStreak={overall} bestStreak={bestEver} />

      {/* Tips */}
      <StreakTips />
    </div>
  );
}
