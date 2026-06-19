import React, { useState, useMemo } from "react";
import {
  Code2, Clock3, Github, Flame, Target, Play, Pause, RotateCcw,
  Plus, Trash2, ChevronDown, ChevronRight, BookOpen, AlertTriangle,
  CheckCircle2, Coffee, Zap, TrendingUp, BarChart3
} from "lucide-react";
import { Panel, ProgressBar, Ring, EmptyState } from "../components/ui.jsx";
import { BarChart } from "../components/charts.jsx";
import { todayISO, getLast7Days, DAYS_SHORT, MONTHS_SHORT, formatDate } from "../utils.js";
import { usePomodoroTimer } from "../hooks.js";

// Helper components for stats and graphs
function MiniStat({ icon: Icon, label, value, tone }) {
  const toneColors = {
    indigo: "var(--indigo)",
    cyan: "var(--cyan)",
    emerald: "var(--emerald)",
    amber: "var(--amber)",
    rose: "var(--rose)",
    purple: "var(--purple)",
    blue: "var(--blue)"
  };
  const c = toneColors[tone] || "var(--indigo)";
  return (
    <div className="glass-card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ padding: "8px", background: `rgba(99,102,241,0.06)`, borderRadius: "8px", color: c }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>{value}</div>
      </div>
    </div>
  );
}

function BarGraph({ data, tone, height }) {
  const toneColors = {
    cyan: "var(--cyan)",
    indigo: "var(--indigo)",
    purple: "var(--purple)"
  };
  return <BarChart data={data} color={toneColors[tone] || "var(--indigo)"} height={height} />;
}

const API = "/api";

const LANGUAGES = [
  "JavaScript", "Python", "Java", "C++", "TypeScript",
  "HTML/CSS", "Go", "Rust", "Other"
];

const LANG_COLORS = {
  JavaScript: "#f7df1e", Python: "#3572a5", Java: "#b07219",
  "C++": "#f34b7d", TypeScript: "#2b7489", "HTML/CSS": "#e34c26",
  Go: "#00add8", Rust: "#dea584", Other: "#8b949e"
};

// ─────────────────────────────────────────────────────────────────────────────
// Pomodoro Widget
// ─────────────────────────────────────────────────────────────────────────────

function PomodoroWidget() {
  const { mode, display, running, sessions, start, pause, reset, seconds } =
    usePomodoroTimer(25, 5);

  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const pct = Math.round(((totalSeconds - seconds) / totalSeconds) * 100);
  const R = 52;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Mode label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-muted)",
          fontSize: ".85rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: ".08em",
        }}
      >
        {mode === "work" ? (
          <>
            <Zap size={14} style={{ color: "var(--cyan)" }} />
            Focus Session
          </>
        ) : (
          <>
            <Coffee size={14} style={{ color: "var(--green)" }} />
            Break Time
          </>
        )}
      </div>

      {/* Circular progress */}
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg
          width="140"
          height="140"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,.08)"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={mode === "work" ? "var(--cyan)" : "var(--green)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              fontFamily: "var(--font-mono)",
              color: mode === "work" ? "var(--cyan)" : "var(--green)",
              letterSpacing: "-.02em",
            }}
          >
            {display}
          </span>
          <span
            style={{
              fontSize: ".65rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
            }}
          >
            {pct}%
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10 }}>
        {running ? (
          <button
            className="primary-btn"
            onClick={pause}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button
            className="primary-btn"
            onClick={start}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Play size={16} />
            {seconds === totalSeconds ? "Start" : "Resume"}
          </button>
        )}
        <button
          className="secondary-btn"
          onClick={reset}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Session dots */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {Array.from({ length: Math.max(4, sessions + 1) }, (_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background:
                i < sessions ? "var(--cyan)" : "rgba(255,255,255,.12)",
              boxShadow:
                i < sessions ? "0 0 6px var(--cyan)" : "none",
            }}
          />
        ))}
        <span
          style={{
            fontSize: ".75rem",
            color: "var(--text-muted)",
            marginLeft: 4,
          }}
        >
          {sessions} session{sessions !== 1 ? "s" : ""} completed
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub-style Coding Heatmap (52 × 7)
// ─────────────────────────────────────────────────────────────────────────────

function CodingHeatmap({ heatmap = {} }) {
  const [hovered, setHovered] = useState(null);

  const weeks = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 52 * 7 + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

    const grid = [];
    for (let w = 0; w < 53; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        if (date > today) {
          week.push(null);
          continue;
        }
        const iso = date.toISOString().slice(0, 10);
        const hours = heatmap[iso] || 0;
        let level = 0;
        if (hours > 0 && hours < 2) level = 1;
        else if (hours >= 2 && hours < 4) level = 2;
        else if (hours >= 4) level = 3;
        week.push({ date: iso, hours, level });
      }
      grid.push(week);
    }
    return grid;
  }, [heatmap]);

  const monthLabels = useMemo(() => {
    const labels = [];
    weeks.forEach((week, wi) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;
      const d = new Date(firstDay.date);
      if (d.getDate() <= 7) {
        labels.push({ week: wi, label: MONTHS_SHORT[d.getMonth()] });
      }
    });
    return labels;
  }, [weeks]);

  const HEAT_COLORS = [
    "rgba(255,255,255,.06)",
    "rgba(57,211,83,.25)",
    "rgba(57,211,83,.55)",
    "rgba(57,211,83,1)",
  ];

  const hasData = Object.values(heatmap).some((h) => h > 0);
  if (!hasData) {
    return (
      <EmptyState
        icon="📅"
        title="No coding activity yet"
        desc="Log your first session to start building your activity heatmap"
      />
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Month labels row */}
      <div
        style={{
          position: "relative",
          height: 16,
          paddingLeft: 28,
          marginBottom: 2,
        }}
      >
        {monthLabels.map(({ week, label }) => (
          <div
            key={`${week}-${label}`}
            style={{
              position: "absolute",
              left: 28 + week * 13,
              fontSize: ".62rem",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Day labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            marginRight: 4,
            paddingTop: 2,
          }}
        >
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              style={{
                height: 11,
                lineHeight: "11px",
                fontSize: ".6rem",
                color: i % 2 === 0 ? "var(--text-muted)" : "transparent",
                userSelect: "none",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div style={{ display: "flex", gap: 2 }}>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day ? `${day.date}: ${day.hours.toFixed(1)}h` : ""}
                  onMouseEnter={() => day && setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 2,
                    background: day ? HEAT_COLORS[day.level] : "transparent",
                    border: day
                      ? day.level > 0
                        ? "1px solid rgba(57,211,83,.18)"
                        : "1px solid rgba(255,255,255,.05)"
                      : "none",
                    cursor: day ? "pointer" : "default",
                    boxShadow:
                      day?.level === 3 ? "0 0 5px rgba(57,211,83,.35)" : "none",
                    transition: "transform .1s",
                    transform: hovered === day ? "scale(1.4)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            marginTop: 8,
            padding: "4px 12px",
            background: "rgba(0,0,0,.65)",
            borderRadius: 6,
            fontSize: ".75rem",
            color: "var(--text-secondary)",
            display: "inline-block",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <strong style={{ color: "var(--green)" }}>{hovered.date}</strong>
          {" — "}
          {hovered.hours.toFixed(1)}h coded
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
          fontSize: ".7rem",
          color: "var(--text-muted)",
        }}
      >
        <span>Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: 2,
              background: c,
              border: "1px solid rgba(255,255,255,.06)",
            }}
          />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 12 }}>0h &lt;2h &lt;4h 4h+</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Language Donut (SVG)
// ─────────────────────────────────────────────────────────────────────────────

function LanguageDonut({ languages = {} }) {
  const entries = Object.entries(languages).filter(([, h]) => h > 0);
  const total = entries.reduce((s, [, h]) => s + h, 0);

  if (!entries.length) {
    return (
      <EmptyState
        icon="🌐"
        title="No language data yet"
        desc="Log sessions to see the breakdown"
      />
    );
  }

  const R = 60;
  const cx = 80;
  const cy = 80;
  const sw = 22;
  const perimeter = 2 * Math.PI * R;
  let offset = 0;

  const slices = entries.map(([lang, hours]) => {
    const pct = hours / total;
    const len = pct * perimeter;
    const slice = {
      lang,
      hours,
      pct,
      len,
      offset,
      color: LANG_COLORS[lang] || "#8b949e",
    };
    offset += len;
    return slice;
  });

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <svg width={160} height={160} style={{ flexShrink: 0 }}>
        {slices.map((s) => (
          <circle
            key={s.lang}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={sw}
            strokeDasharray={`${s.len} ${perimeter - s.len}`}
            strokeDashoffset={-s.offset}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: "all .3s",
            }}
          />
        ))}
        <circle cx={cx} cy={cy} r={R - sw / 2 - 2} fill="rgba(0,0,0,.3)" />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-primary)"
          fontSize="15"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          {total.toFixed(1)}h
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-muted)"
          fontSize="9"
        >
          Total
        </text>
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          flex: 1,
          minWidth: 180,
        }}
      >
        {slices.map((s) => (
          <div
            key={s.lang}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                flex: 1,
                fontSize: ".8rem",
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.lang}
            </span>
            <span
              style={{
                fontSize: ".78rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {s.hours.toFixed(1)}h
            </span>
            <span
              style={{
                fontSize: ".72rem",
                color: "var(--text-muted)",
                width: 36,
                textAlign: "right",
              }}
            >
              {Math.round(s.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Coding Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Coding({ state, setState, onNav, onXP }) {
  const coding = state.coding || {};
  const sessions = coding.sessions || [];
  const heatmap = coding.heatmap || {};
  const notes = coding.notes || [];
  const mistakes = coding.mistakes || [];

  const today = todayISO();
  const todayHours = heatmap[today] || 0;
  const totalHours = coding.totalHours || 0;

  // Language hours from sessions
  const languageHours = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (s.language)
        map[s.language] = (map[s.language] || 0) + (s.hours || 0);
    });
    return map;
  }, [sessions]);

  // Weekly hours
  const last7 = getLast7Days();
  const weeklyHours = last7.reduce((s, d) => s + (heatmap[d] || 0), 0);

  // Goals
  const dailyGoal = coding.dailyGoal || 2;
  const weeklyGoal = coding.weeklyGoal || 14;
  const dailyPct = Math.min(100, Math.round((todayHours / dailyGoal) * 100));
  const weeklyPct = Math.min(100, Math.round((weeklyHours / weeklyGoal) * 100));
  const languagesUsed = Object.keys(languageHours).length;

  // Log session form
  const [logLang, setLogLang] = useState("JavaScript");
  const [logHours, setLogHours] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logLoading, setLogLoading] = useState(false);

  // Goal editing
  const [editingGoal, setEditingGoal] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState(String(dailyGoal));
  const [weeklyGoalInput, setWeeklyGoalInput] = useState(String(weeklyGoal));

  // Notes
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNote, setNewNote] = useState("");

  // Mistakes
  const [newMistake, setNewMistake] = useState("");
  const [newLesson, setNewLesson] = useState("");

  // Sessions pagination
  const [showAllSessions, setShowAllSessions] = useState(false);

  // ── Handlers ──

  async function logSession() {
    if (!logHours || Number(logHours) <= 0) return;
    setLogLoading(true);
    const hours = Number(logHours);
    const sessionObj = {
      id: `s-${Date.now()}`,
      date: today,
      language: logLang,
      hours,
      notes: logNotes.trim(),
    };

    try {
      const res = await fetch(`${API}/coding/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: logLang,
          hours,
          notes: logNotes.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        } else {
          // Partial update
          setState((cur) => ({
            ...cur,
            coding: {
              ...cur.coding,
              totalHours: (cur.coding?.totalHours || 0) + hours,
              heatmap: {
                ...(cur.coding?.heatmap || {}),
                [today]: (cur.coding?.heatmap?.[today] || 0) + hours,
              },
              sessions: [sessionObj, ...(cur.coding?.sessions || [])],
            },
          }));
        }
        const xp = data.xpGained || Math.round(hours * 50);
        onXP?.(xp, `${hours}h ${logLang} session`);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Offline fallback
      setState((cur) => ({
        ...cur,
        coding: {
          ...cur.coding,
          totalHours: (cur.coding?.totalHours || 0) + hours,
          heatmap: {
            ...(cur.coding?.heatmap || {}),
            [today]: (cur.coding?.heatmap?.[today] || 0) + hours,
          },
          sessions: [sessionObj, ...(cur.coding?.sessions || [])],
        },
      }));
      onXP?.(Math.round(hours * 50), `${hours}h ${logLang}`);
    }

    setLogHours("");
    setLogNotes("");
    setLogLoading(false);
  }

  function saveGoals() {
    const d = Math.max(0.5, Number(dailyGoalInput) || 2);
    const w = Math.max(1, Number(weeklyGoalInput) || 14);
    setState((cur) => ({
      ...cur,
      coding: { ...cur.coding, dailyGoal: d, weeklyGoal: w },
    }));
    setEditingGoal(false);
  }

  function addNote() {
    if (!newNote.trim()) return;
    const note = {
      id: `n-${Date.now()}`,
      date: today,
      title: newNoteTitle.trim() || "Coding Note",
      content: newNote.trim(),
    };
    setState((cur) => ({
      ...cur,
      coding: { ...cur.coding, notes: [note, ...(cur.coding?.notes || [])] },
    }));
    setNewNote("");
    setNewNoteTitle("");
  }

  function removeNote(id) {
    setState((cur) => ({
      ...cur,
      coding: {
        ...cur.coding,
        notes: (cur.coding?.notes || []).filter((n) => n.id !== id),
      },
    }));
  }

  function addMistake() {
    if (!newMistake.trim()) return;
    const mistake = {
      id: `m-${Date.now()}`,
      date: today,
      mistake: newMistake.trim(),
      lesson: newLesson.trim(),
    };
    setState((cur) => ({
      ...cur,
      coding: {
        ...cur.coding,
        mistakes: [mistake, ...(cur.coding?.mistakes || [])],
      },
    }));
    setNewMistake("");
    setNewLesson("");
  }

  function removeMistake(id) {
    setState((cur) => ({
      ...cur,
      coding: {
        ...cur.coding,
        mistakes: (cur.coding?.mistakes || []).filter((m) => m.id !== id),
      },
    }));
  }

  function removeSession(id) {
    setState((cur) => ({
      ...cur,
      coding: {
        ...cur.coding,
        sessions: (cur.coding?.sessions || []).filter((s) => s.id !== id),
      },
    }));
  }

  const displayedSessions = showAllSessions ? sessions : sessions.slice(0, 10);

  // Weekly bar chart
  const weekBarData = last7.map((d, i) => ({
    label: DAYS_SHORT[new Date(d).getDay()],
    value: parseFloat((heatmap[d] || 0).toFixed(1)),
  }));

  // ── Render ──

  return (
    <div
      className="coding-page"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* ── Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
        }}
      >
        {[
          {
            icon: Code2,
            label: "Total Hours",
            value: `${totalHours.toFixed ? totalHours.toFixed(1) : totalHours}h`,
            tone: "cyan",
          },
          {
            icon: Clock3,
            label: "Today",
            value: `${todayHours.toFixed(1)}h`,
            tone: "green",
          },
          {
            icon: TrendingUp,
            label: "This Week",
            value: `${weeklyHours.toFixed(1)}h`,
            tone: "amber",
          },
          {
            icon: Flame,
            label: "Sessions",
            value: sessions.length,
            tone: "purple",
          },
          {
            icon: Github,
            label: "Languages",
            value: languagesUsed,
            tone: "blue",
          },
        ].map((s) => (
          <MiniStat
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            tone={s.tone}
          />
        ))}
      </div>

      {/* ── Pomodoro + Log Session ── */}
      <div
        className="grid-2"
        style={{
          gap: 20,
        }}
      >
        {/* Pomodoro */}
        <div>
          <div
            style={{
              fontSize: ".72rem",
              color: "var(--text-muted)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 8,
            }}
          >
            🍅 Pomodoro Timer
          </div>
          <PomodoroWidget />
        </div>

        {/* Log Session */}
        <Panel title="Log Coding Session" icon={Plus}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="grid-2"
              style={{
                gap: 10,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: ".72rem",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Language
                </label>
                <select
                  className="form-select"
                  value={logLang}
                  onChange={(e) => setLogLang(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: ".72rem",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Hours Coded
                </label>
                <input
                  type="number"
                  min="0.25"
                  max="24"
                  step="0.25"
                  className="form-input"
                  placeholder="e.g. 1.5"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: ".72rem",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                Session Notes
              </label>
              <textarea
                className="form-textarea"
                placeholder="What did you work on? Topics covered, problems solved…"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                rows={3}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>
            <button
              className="primary-btn"
              onClick={logSession}
              disabled={logLoading || !logHours}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {logLoading ? (
                "Saving…"
              ) : (
                <>
                  <CheckCircle2 size={16} /> Log Session
                </>
              )}
            </button>
          </div>
        </Panel>
      </div>

      {/* ── Goal Trackers ── */}
      <Panel
        title="Goal Tracker"
        icon={Target}
        action={
          editingGoal ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="primary-btn"
                onClick={saveGoals}
                style={{ padding: "4px 12px", fontSize: ".78rem" }}
              >
                Save
              </button>
              <button
                className="secondary-btn"
                onClick={() => setEditingGoal(false)}
                style={{ padding: "4px 12px", fontSize: ".78rem" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="secondary-btn"
              onClick={() => setEditingGoal(true)}
              style={{ padding: "4px 12px", fontSize: ".78rem" }}
            >
              Edit Goals
            </button>
          )
        }
      >
        <div
          className="grid-2"
          style={{ gap: 24 }}
        >
          {/* Daily */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: ".9rem",
                  }}
                >
                  Daily Goal
                </div>
                <div
                  style={{ fontSize: ".75rem", color: "var(--text-muted)" }}
                >
                  {todayHours.toFixed(1)}h / {dailyGoal}h today
                </div>
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-mono)",
                  color: dailyPct >= 100 ? "var(--green)" : "var(--cyan)",
                }}
              >
                {dailyPct}%
              </div>
            </div>
            {editingGoal && (
              <input
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                className="form-input"
                value={dailyGoalInput}
                onChange={(e) => setDailyGoalInput(e.target.value)}
                placeholder="Daily goal (hours)"
              />
            )}
            <ProgressBar
              value={dailyPct}
              tone={dailyPct >= 100 ? "green" : "cyan"}
              showPct={false}
              animated
            />
            {dailyPct >= 100 && (
              <div
                style={{
                  fontSize: ".75rem",
                  color: "var(--green)",
                  fontWeight: 600,
                }}
              >
                🎉 Daily goal achieved!
              </div>
            )}
          </div>

          {/* Weekly */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontSize: ".9rem",
                  }}
                >
                  Weekly Goal
                </div>
                <div
                  style={{ fontSize: ".75rem", color: "var(--text-muted)" }}
                >
                  {weeklyHours.toFixed(1)}h / {weeklyGoal}h this week
                </div>
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-mono)",
                  color: weeklyPct >= 100 ? "var(--green)" : "var(--amber)",
                }}
              >
                {weeklyPct}%
              </div>
            </div>
            {editingGoal && (
              <input
                type="number"
                min="1"
                max="80"
                step="1"
                className="form-input"
                value={weeklyGoalInput}
                onChange={(e) => setWeeklyGoalInput(e.target.value)}
                placeholder="Weekly goal (hours)"
              />
            )}
            <ProgressBar
              value={weeklyPct}
              tone={weeklyPct >= 100 ? "green" : "amber"}
              showPct={false}
              animated
            />
            {weeklyPct >= 100 && (
              <div
                style={{
                  fontSize: ".75rem",
                  color: "var(--green)",
                  fontWeight: 600,
                }}
              >
                🏆 Weekly goal crushed!
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* ── Activity Heatmap ── */}
      <Panel title="Coding Activity Heatmap (52 Weeks)" icon={Github}>
        <CodingHeatmap heatmap={heatmap} />
      </Panel>

      {/* ── Weekly Bar + Language Donut ── */}
      <div
        className="grid-2"
        style={{ gap: 20 }}
      >
        <Panel title="Daily Activity This Week" icon={BarChart3}>
          {weeklyHours === 0 ? (
            <EmptyState
              icon="📊"
              title="No data this week"
              desc="Log sessions to see weekly trends"
            />
          ) : (
            <BarGraph data={weekBarData} tone="cyan" height={140} />
          )}
        </Panel>

        <Panel title="Language Breakdown" icon={Code2}>
          <LanguageDonut languages={languageHours} />
        </Panel>
      </div>

      {/* ── Sessions List ── */}
      <Panel
        title={`Recent Sessions ${sessions.length > 0 ? `(${sessions.length})` : ""}`}
        icon={Clock3}
        action={
          sessions.length > 10 ? (
            <button
              className="secondary-btn"
              onClick={() => setShowAllSessions((v) => !v)}
              style={{
                padding: "4px 12px",
                fontSize: ".78rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {showAllSessions ? (
                <>
                  <ChevronRight size={14} /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Show All ({sessions.length})
                </>
              )}
            </button>
          ) : null
        }
      >
        {sessions.length === 0 ? (
          <EmptyState
            icon="💻"
            title="No sessions logged yet"
            desc="Use the Log Coding Session form to get started"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayedSessions.map((s) => (
              <div
                key={s.id}
                className="glass-card"
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(255,255,255,.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Code2
                    size={16}
                    style={{ color: LANG_COLORS[s.language] || "var(--text-muted)" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontSize: ".85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {s.language}
                    <span
                      style={{
                        fontSize: ".7rem",
                        fontWeight: 600,
                        padding: "1px 7px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,.06)",
                        color: "var(--cyan)",
                      }}
                    >
                      {s.hours}h
                    </span>
                  </div>
                  {s.notes && (
                    <div
                      style={{
                        fontSize: ".75rem",
                        color: "var(--text-muted)",
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.notes}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: ".72rem",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {formatDate(s.date)}
                </div>
                <button
                  onClick={() => removeSession(s.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 4,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ── Coding Notes Journal ── */}
      <Panel title="Coding Notes & Journal" icon={BookOpen}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            className="form-input"
            placeholder="Note title (optional)"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <textarea
              className="form-textarea"
              placeholder="Write a coding insight, concept summary, or journal entry…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              style={{ flex: 1, resize: "vertical" }}
            />
            <button
              className="primary-btn"
              onClick={addNote}
              disabled={!newNote.trim()}
              style={{
                alignSelf: "flex-end",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={15} /> Add
            </button>
          </div>

          {notes.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No notes yet"
              desc="Add insights, concepts, and journal entries here"
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="glass-card"
                  style={{ padding: "12px 14px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          fontSize: ".85rem",
                          marginBottom: 4,
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: ".8rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.55,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {n.content}
                      </div>
                      <div
                        style={{
                          fontSize: ".68rem",
                          color: "var(--text-muted)",
                          marginTop: 6,
                        }}
                      >
                        {formatDate(n.date)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeNote(n.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: 4,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* ── Mistake Tracker ── */}
      <Panel title="Mistake Tracker & Lessons Learned" icon={AlertTriangle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            className="grid-2"
            style={{
              gap: 10,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: ".72rem",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                🐛 Mistake / Bug Encountered
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe the mistake or bug you made…"
                value={newMistake}
                onChange={(e) => setNewMistake(e.target.value)}
                rows={3}
                style={{ width: "100%", resize: "none" }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: ".72rem",
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  display: "block",
                }}
              >
                💡 Lesson Learned
              </label>
              <textarea
                className="form-textarea"
                placeholder="What did you learn? How to avoid it next time?"
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                rows={3}
                style={{ width: "100%", resize: "none" }}
              />
            </div>
          </div>
          <button
            className="primary-btn"
            onClick={addMistake}
            disabled={!newMistake.trim()}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={15} /> Log Mistake
          </button>

          {mistakes.length === 0 ? (
            <EmptyState
              icon="🐞"
              title="No mistakes tracked yet"
              desc="Track your bugs and lessons learned to grow faster as a developer"
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {mistakes.map((m) => (
                <div
                  key={m.id}
                  className="glass-card"
                  style={{
                    padding: "12px 14px",
                    borderLeft: "3px solid var(--amber)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: ".68rem",
                            fontWeight: 700,
                            color: "var(--amber)",
                            background: "rgba(245,158,11,.12)",
                            padding: "2px 7px",
                            borderRadius: 4,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          BUG
                        </span>
                        <span
                          style={{
                            fontSize: ".82rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {m.mistake}
                        </span>
                      </div>
                      {m.lesson && (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              fontSize: ".68rem",
                              fontWeight: 700,
                              color: "var(--green)",
                              background: "rgba(34,197,94,.12)",
                              padding: "2px 7px",
                              borderRadius: 4,
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            FIX
                          </span>
                          <span
                            style={{
                              fontSize: ".8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {m.lesson}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: ".68rem",
                          color: "var(--text-muted)",
                          marginTop: 6,
                        }}
                      >
                        {formatDate(m.date)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMistake(m.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: 4,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
