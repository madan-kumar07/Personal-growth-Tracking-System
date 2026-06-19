import React, { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, Download, Zap, Calendar,
  Code2, HeartPulse, BookOpen, GraduationCap, Target,
  Flame, Trophy, Clock, Lightbulb, ChevronDown, ChevronUp
} from "lucide-react";
import {
  computeDayNumber, getLevelInfo, computePlacementReadiness,
  computeScores, getLast7Days, getLast30Days, DAYS_SHORT,
  MONTHS_SHORT, avg, pct, todayISO, formatDate
} from "../utils.js";

// ─── Mini SVG Line Chart ───────────────────────────────────────────────────

function MiniLineChart({ data = [], labels = [], tone = "cyan", height = 110 }) {
  const mn = Math.min(...data, 0);
  const mx = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
    const y = 90 - ((v - mn) / Math.max(mx - mn, 1)) * 80;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const colorMap = {
    cyan:   "#06b6d4",
    green:  "#10b981",
    purple: "#8b5cf6",
    amber:  "#f59e0b",
    blue:   "#3b82f6",
    rose:   "#f43f5e",
  };
  const color = colorMap[tone] || "#6366f1";

  if (!data.length || data.every(v => v === 0)) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        No data yet
      </div>
    );
  }

  return (
    <div style={{ height, position: "relative" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "80%" }}>
        <defs>
          <linearGradient id={`grad-${tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {pts && (
          <>
            <polygon points={`0,100 ${pts} 100,100`} fill={`url(#grad-${tone})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
      {labels.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4 }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────

function MiniBarChart({ data = [], labels = [], tone = "cyan", height = 110 }) {
  const peak = Math.max(...data.map(d => (typeof d === "object" ? d.value : d)), 1);
  const colorMap = { cyan:"#06b6d4", green:"#10b981", purple:"#8b5cf6", amber:"#f59e0b", blue:"#3b82f6" };
  const color = colorMap[tone] || "#6366f1";

  if (!data.length || data.every(v => (typeof v === "object" ? v.value : v) === 0)) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
        No data yet
      </div>
    );
  }

  return (
    <div style={{ height, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4 }}>
        {data.map((d, i) => {
          const val = typeof d === "object" ? d.value : d;
          const label = typeof d === "object" ? d.label : (labels[i] || i);
          const h = Math.max(3, Math.round((val / peak) * 100));
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                <div style={{
                  width: "100%", height: `${h}%`,
                  background: `linear-gradient(to top, ${color}aa, ${color}55)`,
                  borderRadius: "3px 3px 0 0", transition: "height 0.4s",
                }} title={String(val)} />
              </div>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, tone = "cyan" }) {
  const toneColors = { cyan:"#06b6d4", green:"#10b981", purple:"#8b5cf6", amber:"#f59e0b", blue:"#3b82f6", rose:"#f43f5e" };
  const c = toneColors[tone] || "#6366f1";
  return (
    <div className="glass-card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${c}1a`, border: `1px solid ${c}33`, flexShrink: 0 }}>
        {React.cloneElement(icon, { size: 20, color: c })}
      </div>
      <div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{value}</div>
        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{label}</div>
        {sub && <div style={{ fontSize: "0.68rem", color: c, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Section Panel ─────────────────────────────────────────────────────────

function Section({ title, icon: Icon, tone = "cyan", children, span2 = false }) {
  return (
    <div className="glass-card" style={{ padding: 18, gridColumn: span2 ? "1/-1" : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontWeight: 600, fontSize: "0.88rem" }}>
        <Icon size={16} style={{ color: tone === "cyan" ? "#06b6d4" : tone === "green" ? "#10b981" : tone === "purple" ? "#8b5cf6" : "#f59e0b" }} />
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Insight Card ──────────────────────────────────────────────────────────

function InsightRow({ emoji, text, type = "info" }) {
  const bg = type === "good" ? "rgba(16,185,129,0.1)" : type === "warn" ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.1)";
  const bc = type === "good" ? "rgba(16,185,129,0.2)" : type === "warn" ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: bg, border: `1px solid ${bc}`, marginBottom: 6 }}>
      <span style={{ fontSize: "1.1rem" }}>{emoji}</span>
      <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--text-primary)" }}>{text}</p>
    </div>
  );
}

// ─── Journey Cards ─────────────────────────────────────────────────────────

function JourneyCards({ state }) {
  const [show, setShow] = useState(false);
  const calendar = state.calendar || [];
  const active = calendar.filter(d => d.status === "completed").slice(0, show ? 30 : 7);

  if (!calendar.length) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
        Your journey cards will appear here once you start your 365-day journey.
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
        {active.map(d => (
          <div key={d.date} style={{
            padding: "10px 12px", borderRadius: 10,
            background: d.xp > 0 ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
            border: d.xp > 0 ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border)",
          }}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{formatDate(d.date)}</div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginTop: 2 }}>Day {d.day}</div>
            {d.xp > 0 && <div style={{ fontSize: "0.7rem", color: "#10b981", marginTop: 2 }}>+{d.xp} XP</div>}
          </div>
        ))}
      </div>
      {calendar.filter(d => d.status === "completed").length > 7 && (
        <button
          onClick={() => setShow(s => !s)}
          style={{ marginTop: 10, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 4 }}
        >
          {show ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show more days</>}
        </button>
      )}
    </>
  );
}

// ─── Auto Insights Generator ───────────────────────────────────────────────

function buildInsights(state) {
  const insights = [];
  const xp       = state.gamification?.xp || 0;
  const streak   = state.gamification?.streaks?.overall?.current || 0;
  const bestStreak = state.gamification?.streaks?.overall?.best || 0;
  const coding   = state.coding?.totalHours || 0;
  const sessions = state.coding?.sessions || [];
  const placement = computePlacementReadiness(state.placement);
  const missions = (state.missions || []).filter(m => m.completed).length;
  const totalM   = (state.missions || []).length;
  const day      = computeDayNumber(state.startDate);

  // Coding day pattern
  const dayCounts = [0,0,0,0,0,0,0];
  sessions.forEach(s => {
    if (s.date) { const d = new Date(s.date).getDay(); dayCounts[d] = (dayCounts[d]||0) + 1; }
  });
  const peakDay = dayCounts.indexOf(Math.max(...dayCounts));
  if (sessions.length > 3) {
    insights.push({ emoji: "💻", text: `You code most on ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][peakDay]}s — keep it consistent!`, type: "info" });
  }

  // Streak
  if (bestStreak > 0) {
    insights.push({ emoji: "🔥", text: `Your best streak was ${bestStreak} days — ${streak >= bestStreak ? "and you're matching it right now! 🏆" : `beat it by keeping your streak going!`}`, type: streak >= bestStreak ? "good" : "warn" });
  }

  // Weekly XP
  const xpHistory = state.gamification?.xpHistory || [];
  const last7 = getLast7Days();
  const weekXP = xpHistory.filter(h => last7.includes(h.date)).reduce((s, h) => s + (h.xp || 0), 0);
  if (weekXP > 0) {
    insights.push({ emoji: "⚡", text: `You've earned ${weekXP} XP this week — ${weekXP > 200 ? "incredible performance! 🌟" : "keep pushing for 200+ XP!"}`, type: weekXP > 200 ? "good" : "info" });
  }

  // Placement
  if (placement > 0) {
    insights.push({ emoji: "🎯", text: `Your placement readiness is ${placement}% — ${placement >= 70 ? "you're interview-ready! 🎓" : "focus on DSA and core subjects to level up."}`, type: placement >= 70 ? "good" : "warn" });
  }

  // Missions
  if (totalM > 0) {
    const rate = Math.round((missions / totalM) * 100);
    insights.push({ emoji: "✅", text: `Mission completion rate: ${rate}% — ${rate >= 80 ? "excellent discipline!" : rate >= 50 ? "good progress, push for 80%+" : "try completing more daily missions."}`, type: rate >= 80 ? "good" : rate >= 50 ? "info" : "warn" });
  }

  // Coding hours
  if (coding > 0) {
    insights.push({ emoji: "🚀", text: `${coding} total coding hours logged — ${coding >= 100 ? "you're in the top tier of consistency! 🏆" : `${200 - coding} more hours to reach the 200h milestone!`}`, type: coding >= 100 ? "good" : "info" });
  }

  // Day milestone
  if (day >= 7) {
    insights.push({ emoji: "📅", text: `You're on Day ${day} of your 365-day journey — ${Math.round((day/365)*100)}% complete!`, type: day >= 100 ? "good" : "info" });
  }

  if (!insights.length) {
    insights.push({ emoji: "🌱", text: "Start logging your activities to get personalized insights here!", type: "info" });
  }

  return insights;
}

// ─── Period Tab ─────────────────────────────────────────────────────────────

const PERIODS = ["Daily", "Weekly", "Monthly", "All Time"];

// ─── Main Analytics Component ─────────────────────────────────────────────

export default function Analytics({ state, setState, onNav, onXP }) {
  const [period, setPeriod]         = useState("Weekly");
  const [exporting, setExporting]   = useState(false);

  const xp       = state.gamification?.xp || 0;
  const day      = computeDayNumber(state.startDate);
  const li       = getLevelInfo(xp);
  const streak   = state.gamification?.streaks?.overall?.current || 0;
  const bestStr  = state.gamification?.streaks?.overall?.best || 0;
  const coding   = state.coding?.totalHours || 0;
  const missions = (state.missions || []).filter(m => m.completed).length;
  const placement = computePlacementReadiness(state.placement);
  const scores   = computeScores(state);

  // XP History chart
  const xpHistory = state.gamification?.xpHistory || [];
  const last7     = getLast7Days();
  const xpChartData = useMemo(() => {
    const map = new Map(xpHistory.map(h => [h.date, h.xp || 0]));
    return period === "Daily"
      ? last7.map(d => ({ label: d.slice(5), value: map.get(d) || 0 }))
      : period === "Weekly"
      ? DAYS_SHORT.map((lbl, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          return { label: lbl, value: map.get(d.toISOString().slice(0,10)) || 0 };
        })
      : xpHistory.slice(-30).map(h => ({ label: h.date?.slice(5) || "", value: h.xp || 0 }));
  }, [xpHistory, period]);

  // Coding chart
  const codingSessions = state.coding?.sessions || [];
  const codingChartData = useMemo(() => {
    const map = {};
    codingSessions.forEach(s => { if (s.date) map[s.date] = (map[s.date] || 0) + (s.hours || 0); });
    return last7.map((d, i) => ({ label: DAYS_SHORT[i], value: parseFloat((map[d] || 0).toFixed(1)) }));
  }, [codingSessions]);

  // Health chart
  const workouts = state.health?.workouts || [];
  const sleepLog = state.health?.sleepLog || [];
  const waterLog = state.health?.waterLog || [];
  const last30   = getLast30Days();
  const healthChartData = useMemo(() => {
    return last30.slice(-14).map((d, i) => ({
      label: i % 3 === 0 ? d.slice(5) : "",
      value: workouts.some(w => w.date === d) ? 1 : 0,
    }));
  }, [workouts, last30]);

  // Habit category rates
  const habits = state.habits || [];
  const habitCategories = [...new Set(habits.map(h => h.category || "General"))];
  const habitRates = habitCategories.map(cat => {
    const catHabits = habits.filter(h => (h.category || "General") === cat);
    const done = catHabits.filter(h => h.completed).length;
    return { cat, rate: pct(done, catHabits.length) };
  });

  // English sessions
  const englishSessions = state.english?.sessions || [];
  const engChartData = last7.map((d, i) => ({
    label: DAYS_SHORT[i],
    value: englishSessions.filter(s => s.date === d).length,
  }));

  // Avg daily XP
  const activeDays = xpHistory.filter(h => (h.xp || 0) > 0);
  const avgDailyXP = activeDays.length ? Math.round(xpHistory.reduce((s,h) => s+(h.xp||0),0)/Math.max(activeDays.length,1)) : 0;
  const bestDayXP  = Math.max(...xpHistory.map(h => h.xp || 0), 0);

  // Insights
  const insights = useMemo(() => buildInsights(state), [state]);

  // Export
  async function handleExportJSON() {
    setExporting(true);
    try {
      const res = await fetch("/api/export/json");
      if (res.ok) {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = "lifeos-export.json"; a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: client-side
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = "lifeos-backup.json"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "lifeos-backup.json"; a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>Analytics Center</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>Your complete progress overview</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer",
                background: period === p ? "rgba(99,102,241,0.2)" : "transparent",
                border: period === p ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
                color: period === p ? "#a5b4fc" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard icon={<Zap />}         label="Total XP"          value={xp.toLocaleString()} sub={`Level ${li.level}`}    tone="cyan"   />
        <StatCard icon={<Calendar />}     label="Days Active"        value={day}               sub={`/ 365 days`}           tone="blue"   />
        <StatCard icon={<TrendingUp />}   label="Avg Daily XP"       value={avgDailyXP}         sub="per active day"         tone="green"  />
        <StatCard icon={<Trophy />}       label="Best Day XP"        value={bestDayXP}          sub="single day record"      tone="amber"  />
        <StatCard icon={<Target />}       label="Missions Done"      value={missions}           sub="lifetime completed"     tone="purple" />
        <StatCard icon={<Flame />}        label="Current Streak"     value={`${streak}d`}       sub={`Best: ${bestStr}d`}    tone="rose"   />
        <StatCard icon={<Code2 />}        label="Coding Hours"       value={`${coding}h`}       sub="total logged"           tone="cyan"   />
        <StatCard icon={<GraduationCap />} label="Placement Ready"  value={`${placement}%`}    sub="readiness score"        tone="blue"   />
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
        {/* XP History */}
        <Section title="XP History" icon={TrendingUp} tone="cyan" span2>
          {xpChartData.every(d => d.value === 0) ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem" }}>📈</div>
              <div style={{ fontSize: "0.82rem", marginTop: 8 }}>No XP data yet — start completing missions!</div>
            </div>
          ) : (
            <MiniBarChart data={xpChartData} tone="cyan" height={130} />
          )}
        </Section>

        {/* Coding Hours */}
        <Section title="Coding Hours (Last 7 Days)" icon={Code2} tone="purple">
          {codingChartData.every(d => d.value === 0) ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem" }}>💻</div>
              <div style={{ fontSize: "0.78rem", marginTop: 6 }}>Log coding sessions to see your activity</div>
            </div>
          ) : (
            <MiniBarChart data={codingChartData} tone="purple" height={120} />
          )}
        </Section>

        {/* Health */}
        <Section title="Workout Activity (Last 14 Days)" icon={HeartPulse} tone="green">
          {workouts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem" }}>🏋️</div>
              <div style={{ fontSize: "0.78rem", marginTop: 6 }}>Log workouts to see your health chart</div>
            </div>
          ) : (
            <MiniBarChart data={healthChartData} tone="green" height={120} />
          )}
        </Section>

        {/* English */}
        <Section title="English Sessions (This Week)" icon={BookOpen} tone="amber">
          {engChartData.every(d => d.value === 0) ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem" }}>🗣️</div>
              <div style={{ fontSize: "0.78rem", marginTop: 6 }}>Practice English to see your session chart</div>
            </div>
          ) : (
            <MiniBarChart data={engChartData} tone="amber" height={120} />
          )}
        </Section>
      </div>

      {/* Full-width row */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
        {/* Habit Completion */}
        <Section title="Habit Completion by Category" icon={Target} tone="green">
          {habitRates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "2rem" }}>🏃</div>
              <div style={{ fontSize: "0.78rem", marginTop: 6 }}>Add habits to see category rates</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {habitRates.map(({ cat, rate }) => (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 3 }}>
                    <span>{cat}</span><span style={{ color: "#10b981" }}>{rate}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${rate}%`, background: "#10b981", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Performance Scores */}
        <Section title="Performance Scores" icon={BarChart3} tone="purple">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(scores).map(([key, val]) => {
              const tones = { coding:"#06b6d4", health:"#10b981", communication:"#8b5cf6", discipline:"#f59e0b", placement:"#3b82f6", roadmap:"#f43f5e" };
              const c = tones[key] || "#6366f1";
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 3 }}>
                    <span style={{ textTransform: "capitalize" }}>{key}</span>
                    <span style={{ color: c }}>{val}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${val}%`, background: c, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Insights */}
      <div className="glass-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontWeight: 600, fontSize: "0.88rem" }}>
          <Lightbulb size={16} style={{ color: "#f59e0b" }} />
          Auto-Generated Insights
        </div>
        <div>
          {insights.map((ins, i) => (
            <InsightRow key={i} emoji={ins.emoji} text={ins.text} type={ins.type} />
          ))}
        </div>
      </div>

      {/* Journey Cards */}
      <div className="glass-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontWeight: 600, fontSize: "0.88rem" }}>
          <Calendar size={16} style={{ color: "#06b6d4" }} />
          Your Journey So Far
        </div>
        <JourneyCards state={state} />
      </div>

      {/* Export */}
      <div className="glass-card" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontWeight: 600, fontSize: "0.88rem" }}>
          <Download size={16} style={{ color: "#8b5cf6" }} />
          Export Data
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              borderRadius: 10, cursor: "pointer", fontSize: "0.84rem",
              background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
              color: "#a5b4fc",
            }}
          >
            <Download size={15} />
            {exporting ? "Generating…" : "Download JSON Backup"}
          </button>
          <button
            onClick={() => {
              const text = `LifeOS 365 Analytics Report\nGenerated: ${new Date().toLocaleDateString()}\n\nTotal XP: ${xp}\nLevel: ${li.level}\nDays Active: ${day}\nCoding Hours: ${coding}h\nStreak: ${streak} days\nPlacement Readiness: ${placement}%\nMissions Completed: ${missions}`;
              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "analytics-report.txt"; a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              borderRadius: 10, cursor: "pointer", fontSize: "0.84rem",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
              color: "#10b981",
            }}
          >
            <Download size={15} />
            Download Text Report
          </button>
        </div>
      </div>
    </div>
  );
}
