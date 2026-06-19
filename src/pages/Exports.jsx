import React, { useState, useRef } from "react";
import {
  Download, Upload, FileText, Code2, GraduationCap,
  HeartPulse, Target, Map, Database, CheckCircle2,
  AlertCircle, Loader, RotateCcw
} from "lucide-react";
import {
  computeDayNumber, getLevelInfo, computePlacementReadiness,
  computeScores, avg, pct, todayISO
} from "../utils.js";

// ─── Helpers ──────────────────────────────────────────────────────────────

function downloadText(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function formatLineBlock(title, content) {
  const line = "─".repeat(60);
  return `\n${line}\n${title}\n${line}\n${content}\n`;
}

// ─── Report Generators ────────────────────────────────────────────────────

function generateFullJSON(state) {
  return JSON.stringify(state, null, 2);
}

function generateCodingReport(state) {
  const coding      = state.coding || {};
  const sessions    = coding.sessions || [];
  const totalHours  = coding.totalHours || 0;
  const languages   = coding.languages || {};
  const heatmap     = coding.heatmap || {};
  const notes       = coding.notes || [];

  const sessionsByDate = {};
  sessions.forEach(s => {
    if (s.date) sessionsByDate[s.date] = (sessionsByDate[s.date] || 0) + (s.hours || 0);
  });
  const sessionDates = Object.keys(sessionsByDate).sort().slice(-7);

  let report = `LIFEOS 365 — CODING REPORT\nGenerated: ${new Date().toLocaleString()}\n`;
  report += formatLineBlock("SUMMARY", [
    `Total Hours Logged   : ${totalHours}h`,
    `Total Sessions       : ${sessions.length}`,
    `Weekly Goal          : ${coding.weeklyGoal || "Not set"}h`,
    `Daily Goal           : ${coding.dailyGoal || "Not set"}h`,
    `Languages Tracked    : ${Object.keys(languages).join(", ") || "None"}`,
  ].join("\n"));

  if (sessions.length > 0) {
    report += formatLineBlock("LAST 7 SESSIONS", sessions.slice(-7).map(s =>
      `• ${s.date || "—"}  | ${s.hours || 0}h | ${s.language || "General"} | ${s.notes || ""}`
    ).join("\n"));
  }

  if (Object.keys(languages).length > 0) {
    report += formatLineBlock("LANGUAGE BREAKDOWN", Object.entries(languages).map(([lang, hrs]) =>
      `• ${lang.padEnd(20)} ${hrs}h`
    ).join("\n"));
  }

  if (sessionDates.length > 0) {
    report += formatLineBlock("LAST 7 DAYS ACTIVITY", sessionDates.map(d =>
      `• ${d}: ${sessionsByDate[d].toFixed(1)}h`
    ).join("\n"));
  }

  if (notes.length > 0) {
    report += formatLineBlock("CODING NOTES", notes.slice(-5).map(n =>
      `[${n.date || "—"}] ${n.content}`
    ).join("\n"));
  }

  const level = getLevelInfo(state.gamification?.xp || 0).level;
  report += formatLineBlock("ASSESSMENT", [
    `Coding Score   : ${Math.min(100, Math.round((totalHours / 200) * 100))}%`,
    `Level          : ${level}`,
    totalHours < 10
      ? "Action: Start with HTML/CSS basics, aim for 1h/day."
      : totalHours < 50
      ? "Action: Focus on JavaScript and start building small projects."
      : totalHours < 100
      ? "Action: Learn React + Node.js to complete your full-stack foundation."
      : "Status: Excellent! You're in the top tier of consistency.",
  ].join("\n"));

  return report;
}

function generatePlacementReport(state) {
  const placement  = state.placement || {};
  const subjects   = placement.subjects || [];
  const interviews = placement.mockInterviews || [];
  const readiness  = computePlacementReadiness(state.placement);

  let report = `LIFEOS 365 — PLACEMENT READINESS REPORT\nGenerated: ${new Date().toLocaleString()}\n`;
  report += formatLineBlock("OVERVIEW", [
    `Placement Readiness : ${readiness}%`,
    `Profile             : ${state.profile?.name || "Developer"}`,
    `Target Role         : ${state.profile?.targetRole || "Not set"}`,
    `Dream Company       : ${state.profile?.dreamCompany || "Not set"}`,
    `Total Subjects      : ${subjects.length}`,
    `Mock Interviews     : ${interviews.length}`,
  ].join("\n"));

  if (subjects.length > 0) {
    report += formatLineBlock("SUBJECT-WISE PROGRESS", subjects.map(s => {
      const topics    = s.topics || [];
      const done      = topics.filter(t => t.completed).length;
      const progress  = pct(done, topics.length);
      const bar       = "█".repeat(Math.floor(progress / 10)) + "░".repeat(10 - Math.floor(progress / 10));
      return `• ${s.title.padEnd(25)} [${bar}] ${progress}%  (${done}/${topics.length} topics)`;
    }).join("\n"));
  }

  if (subjects.length > 0) {
    const weak = subjects.filter(s => {
      const topics = s.topics || [];
      return pct(topics.filter(t => t.completed).length, topics.length) < 50;
    });
    if (weak.length > 0) {
      report += formatLineBlock("WEAK AREAS (< 50%)", weak.map(s => `• ${s.title} — focus here!`).join("\n"));
    }
    const strong = subjects.filter(s => {
      const topics = s.topics || [];
      return pct(topics.filter(t => t.completed).length, topics.length) >= 80;
    });
    if (strong.length > 0) {
      report += formatLineBlock("STRONG AREAS (≥ 80%)", strong.map(s => `• ${s.title} ✓`).join("\n"));
    }
  }

  report += formatLineBlock("NEXT ACTIONS", [
    readiness < 20  ? "→ Start with DSA fundamentals and Core Java basics." : "",
    readiness < 50  ? "→ Practice 2 LeetCode problems daily." : "",
    readiness < 70  ? "→ Complete DBMS, OS, and CN theory modules." : "",
    readiness >= 70 ? "→ Mock interviews and company-specific prep." : "",
    "→ Track every topic completion in your Placement page.",
  ].filter(Boolean).join("\n"));

  return report;
}

function generateHealthReport(state) {
  const health    = state.health || {};
  const workouts  = health.workouts || [];
  const sleepLog  = health.sleepLog || [];
  const waterLog  = health.waterLog || [];
  const moodLog   = health.moodLog || [];
  const weight    = health.weight || [];
  const meditation = health.meditationLog || [];

  const avgSleep = sleepLog.length
    ? (sleepLog.reduce((s, x) => s + (x.hours || 0), 0) / sleepLog.length).toFixed(1)
    : "0";
  const avgWater = waterLog.length
    ? (waterLog.reduce((s, x) => s + (x.litres || 0), 0) / waterLog.length).toFixed(1)
    : "0";

  let report = `LIFEOS 365 — HEALTH REPORT\nGenerated: ${new Date().toLocaleString()}\n`;
  report += formatLineBlock("SUMMARY", [
    `Total Workouts       : ${workouts.length}`,
    `Average Sleep        : ${avgSleep}h per night`,
    `Average Water Intake : ${avgWater}L per day`,
    `Mood Entries         : ${moodLog.length}`,
    `Weight Entries       : ${weight.length}`,
    `Meditation Sessions  : ${meditation.length}`,
  ].join("\n"));

  if (workouts.length > 0) {
    const last5 = workouts.slice(-5);
    report += formatLineBlock("RECENT WORKOUTS (Last 5)", last5.map(w =>
      `• ${w.date || "—"} | ${w.type || "General"} | ${w.duration || 0} min | ${w.notes || ""}`
    ).join("\n"));
  }

  if (sleepLog.length > 0) {
    report += formatLineBlock("SLEEP LOG (Last 7)", sleepLog.slice(-7).map(s =>
      `• ${s.date || "—"}: ${s.hours || 0}h — ${s.quality || "—"}`
    ).join("\n"));
  }

  if (waterLog.length > 0) {
    report += formatLineBlock("WATER LOG (Last 7)", waterLog.slice(-7).map(w =>
      `• ${w.date || "—"}: ${w.litres || 0}L`
    ).join("\n"));
  }

  const healthScore = (() => {
    const wScore = Math.min(100, workouts.length * 5);
    const sScore = Math.min(100, parseFloat(avgSleep) / 8 * 100);
    const waScore = Math.min(100, parseFloat(avgWater) / 3 * 100);
    return Math.round((wScore + sScore + waScore) / 3);
  })();

  report += formatLineBlock("ASSESSMENT", [
    `Health Score   : ${healthScore}%`,
    parseFloat(avgSleep) < 7 ? "⚠ Sleep is below 7h — aim for 7-8h nightly." : "✓ Good sleep average.",
    parseFloat(avgWater) < 2 ? "⚠ Water intake is low — aim for 3L daily." : "✓ Good hydration.",
    workouts.length < 5 ? "⚠ Try to workout 3+ times per week." : "✓ Great workout consistency.",
  ].join("\n"));

  return report;
}

function generateHabitReport(state) {
  const habits     = state.habits || [];
  const gamification = state.gamification || {};
  const streaks    = gamification.streaks || {};

  let report = `LIFEOS 365 — HABIT REPORT\nGenerated: ${new Date().toLocaleString()}\n`;
  report += formatLineBlock("SUMMARY", [
    `Total Habits     : ${habits.length}`,
    `Completed Today  : ${habits.filter(h => h.completed).length}`,
    `Overall Streak   : ${streaks.overall?.current || 0} days (Best: ${streaks.overall?.best || 0})`,
    `Coding Streak    : ${streaks.coding?.current || 0} days`,
    `Workout Streak   : ${streaks.workout?.current || 0} days`,
    `English Streak   : ${streaks.english?.current || 0} days`,
  ].join("\n"));

  if (habits.length > 0) {
    report += formatLineBlock("HABIT LIST", habits.map(h =>
      `${h.completed ? "✓" : "○"} ${h.title.padEnd(30)} [${h.category || "General"}] +${h.xp || 0} XP`
    ).join("\n"));

    const categories = [...new Set(habits.map(h => h.category || "General"))];
    report += formatLineBlock("COMPLETION BY CATEGORY", categories.map(cat => {
      const catHabits = habits.filter(h => (h.category || "General") === cat);
      const done = catHabits.filter(h => h.completed).length;
      const rate = pct(done, catHabits.length);
      return `• ${cat.padEnd(20)} ${done}/${catHabits.length} (${rate}%)`;
    }).join("\n"));
  }

  report += formatLineBlock("NEXT ACTIONS", [
    "→ Complete all habits daily to maintain your streak.",
    "→ Focus on building 3-5 core daily habits.",
    "→ Habits with icons in LifeOS earn bonus XP.",
  ].join("\n"));

  return report;
}

function generateRoadmapReport(state) {
  const roadmap = state.roadmap || [];

  let report = `LIFEOS 365 — ROADMAP PROGRESS REPORT\nGenerated: ${new Date().toLocaleString()}\n`;

  const totalTopics   = roadmap.flatMap(m => m.topics || []).length;
  const doneTopics    = roadmap.flatMap(m => m.topics || []).filter(t => t.completed).length;
  const overallPct    = pct(doneTopics, totalTopics);

  report += formatLineBlock("OVERALL PROGRESS", [
    `Overall Completion : ${overallPct}% (${doneTopics}/${totalTopics} topics)`,
    `Total Modules      : ${roadmap.length}`,
  ].join("\n"));

  roadmap.forEach(mod => {
    const topics    = mod.topics || [];
    const done      = topics.filter(t => t.completed).length;
    const progress  = pct(done, topics.length);
    const bar       = "█".repeat(Math.floor(progress / 10)) + "░".repeat(10 - Math.floor(progress / 10));

    report += formatLineBlock(
      `MODULE: ${mod.title} [${mod.category || ""}]`,
      [
        `Progress : [${bar}] ${progress}% (${done}/${topics.length})`,
        `Difficulty: ${mod.difficulty || "—"}`,
        `Est. Hours: ${mod.estimatedHours || "—"}`,
        "",
        topics.length > 0 ? "Topics:" : "No topics added yet.",
        ...topics.map(t => `  ${t.completed ? "✓" : "○"} ${t.title}`),
      ].join("\n")
    );
  });

  if (roadmap.length === 0) {
    report += "\nNo roadmap modules found. Visit the Roadmap page to add modules.\n";
  }

  return report;
}

// ─── Export Card ───────────────────────────────────────────────────────────

function ExportCard({ icon: Icon, title, description, tone, onGenerate, status }) {
  const toneColors = { cyan:"#06b6d4", green:"#10b981", purple:"#8b5cf6", amber:"#f59e0b", blue:"#3b82f6", rose:"#f43f5e", indigo:"#6366f1" };
  const c = toneColors[tone] || "#6366f1";

  return (
    <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c}1a`, border: `1px solid ${c}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} style={{ color: c }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{title}</div>
          <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: 2 }}>{description}</div>
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={status === "generating"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "9px 16px", borderRadius: 10, cursor: status === "generating" ? "not-allowed" : "pointer",
          fontWeight: 600, fontSize: "0.82rem", border: "none", transition: "all 0.2s",
          background: status === "done"
            ? "rgba(16,185,129,0.15)"
            : status === "generating"
            ? "rgba(255,255,255,0.05)"
            : `${c}1a`,
          color: status === "done" ? "#10b981" : status === "generating" ? "var(--text-muted)" : c,
          borderWidth: 1, borderStyle: "solid",
          borderColor: status === "done" ? "rgba(16,185,129,0.3)" : `${c}33`,
          opacity: status === "generating" ? 0.7 : 1,
        }}
      >
        {status === "generating" ? (
          <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating…</>
        ) : status === "done" ? (
          <><CheckCircle2 size={14} /> Downloaded!</>
        ) : (
          <><Download size={14} /> Generate & Download</>
        )}
      </button>
    </div>
  );
}

// ─── Main Exports Component ───────────────────────────────────────────────

export default function Exports({ state, setState, onNav, onXP }) {
  const [statuses, setStatuses] = useState({});
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef(null);

  function setStatus(id, s) {
    setStatuses(p => ({ ...p, [id]: s }));
    if (s === "done") setTimeout(() => setStatuses(p => ({ ...p, [id]: null })), 3000);
  }

  async function handleExport(id, filename, generator, mimeType = "text/plain") {
    setStatus(id, "generating");
    await new Promise(r => setTimeout(r, 600)); // simulate generation
    try {
      const content = generator();
      downloadText(filename, content, mimeType);
      setStatus(id, "done");
      onXP?.(10, "Data Exported");
    } catch (err) {
      console.error("Export error:", err);
      setStatus(id, null);
      alert("Export failed. Please try again.");
    }
  }

  async function handleJSONExport() {
    setStatus("json", "generating");
    await new Promise(r => setTimeout(r, 400));
    try {
      // Try API first
      const res = await fetch("/api/export/json");
      if (res.ok) {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = `lifeos-backup-${todayISO()}.json`; a.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error("API unavailable");
      }
    } catch {
      // Fallback: client-side
      downloadText(`lifeos-backup-${todayISO()}.json`, generateFullJSON(state), "application/json");
    }
    setStatus("json", "done");
    onXP?.(10, "Data Exported");
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError("");
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid format");
        setState(parsed);
        setImportSuccess(true);
        setImporting(false);
        setTimeout(() => setImportSuccess(false), 4000);
      } catch {
        setImportError("Invalid backup file. Please upload a valid LifeOS JSON backup.");
        setImporting(false);
      }
    };
    reader.onerror = () => { setImportError("Failed to read file."); setImporting(false); };
    reader.readAsText(file);

    // Reset file input
    e.target.value = "";
  }

  const xp      = state.gamification?.xp || 0;
  const day     = computeDayNumber(state.startDate);
  const li      = getLevelInfo(xp);
  const coding  = state.coding?.totalHours || 0;
  const streak  = state.gamification?.streaks?.overall?.current || 0;

  const EXPORT_CARDS = [
    {
      id: "json",
      icon: Database,
      title: "Full Backup (JSON)",
      description: "Complete state backup — all your data, progress, and settings",
      tone: "indigo",
      onGenerate: handleJSONExport,
    },
    {
      id: "coding",
      icon: Code2,
      title: "Coding Report",
      description: "Sessions, hours logged, language breakdown, and assessment",
      tone: "cyan",
      onGenerate: () => handleExport("coding", `coding-report-${todayISO()}.txt`, () => generateCodingReport(state)),
    },
    {
      id: "placement",
      icon: GraduationCap,
      title: "Placement Report",
      description: "Subject-wise progress, weak areas, and readiness score",
      tone: "blue",
      onGenerate: () => handleExport("placement", `placement-report-${todayISO()}.txt`, () => generatePlacementReport(state)),
    },
    {
      id: "health",
      icon: HeartPulse,
      title: "Health Report",
      description: "Workout log, sleep avg, water intake, and health score",
      tone: "green",
      onGenerate: () => handleExport("health", `health-report-${todayISO()}.txt`, () => generateHealthReport(state)),
    },
    {
      id: "habits",
      icon: Target,
      title: "Habit Report",
      description: "Completion rates, streaks, and daily patterns by category",
      tone: "amber",
      onGenerate: () => handleExport("habits", `habit-report-${todayISO()}.txt`, () => generateHabitReport(state)),
    },
    {
      id: "roadmap",
      icon: Map,
      title: "Roadmap Report",
      description: "Module-wise progress, completed vs pending topics",
      tone: "purple",
      onGenerate: () => handleExport("roadmap", `roadmap-report-${todayISO()}.txt`, () => generateRoadmapReport(state)),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>Export Center</h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Download your data, generate reports, or restore a backup
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div className="glass-card" style={{ padding: "14px 18px", marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { label: "XP Earned",    value: xp.toLocaleString(),  emoji: "⚡" },
          { label: "Level",        value: `${li.level}`,        emoji: "🏆" },
          { label: "Day",          value: `${day}/365`,          emoji: "📅" },
          { label: "Coding",       value: `${coding}h`,          emoji: "💻" },
          { label: "Streak",       value: `${streak}d`,          emoji: "🔥" },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem" }}>
            <span style={{ fontSize: "1rem" }}>{s.emoji}</span>
            <div>
              <strong style={{ fontSize: "0.95rem" }}>{s.value}</strong>
              <span style={{ color: "var(--text-muted)", marginLeft: 5 }}>{s.label}</span>
            </div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-muted)", alignSelf: "center" }}>
          as of {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Export Cards */}
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
        <Download size={15} /> Export Reports
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginBottom: 24 }}>
        {EXPORT_CARDS.map(card => (
          <ExportCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            description={card.description}
            tone={card.tone}
            onGenerate={card.onGenerate}
            status={statuses[card.id]}
          />
        ))}
      </div>

      {/* Import / Restore */}
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
        <Upload size={15} /> Import & Restore
      </div>
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>Restore from Backup</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Upload a <strong>LifeOS JSON backup</strong> file to restore your complete state — missions, habits, coding sessions, and more.
            </div>
            <div style={{ fontSize: "0.7rem", color: "#f59e0b", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertCircle size={12} />
              Warning: This will overwrite your current data.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
                cursor: importing ? "not-allowed" : "pointer", fontSize: "0.84rem", fontWeight: 600,
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                color: "#f59e0b",
              }}
            >
              <Upload size={15} />
              {importing ? "Importing…" : "Choose Backup File"}
            </button>

            {importSuccess && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#10b981", padding: "7px 12px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <CheckCircle2 size={14} /> Backup restored successfully!
              </div>
            )}
            {importError && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#f87171", padding: "7px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={14} /> {importError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
