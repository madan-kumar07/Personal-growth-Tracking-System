import React, { useState, useEffect, useRef } from "react";
import {
  Send, Trash2, User, Bot, Sparkles, Star,
  ChevronRight, MessageSquare, BookOpen, Code2,
  GraduationCap, HeartPulse
} from "lucide-react";
import {
  getCoachResponse, computeDayNumber, computePlacementReadiness,
  getLevelInfo, computeScores, todayISO
} from "../utils.js";

// ─── Constants ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Give me today's plan", icon: "📋", category: "study"      },
  { label: "How's my progress?",   icon: "📊", category: "study"      },
  { label: "What to study next?",  icon: "📚", category: "study"      },
  { label: "Motivate me!",         icon: "🔥", category: "motivation" },
  { label: "Coding tips",          icon: "💻", category: "coding"     },
  { label: "Placement advice",     icon: "🎯", category: "placement"  },
];

const COACH_TABS = [
  { id: "all",        label: "All",        Icon: MessageSquare },
  { id: "study",      label: "Study",      Icon: BookOpen      },
  { id: "coding",     label: "Coding",     Icon: Code2         },
  { id: "placement",  label: "Placement",  Icon: GraduationCap },
  { id: "health",     label: "Health",     Icon: HeartPulse    },
  { id: "motivation", label: "Motivation", Icon: Sparkles      },
];

const WELCOME_MSG = {
  id: "welcome",
  role: "coach",
  content: "👋 Hey! I'm **LifeOS Coach** — your personal AI mentor. I know your XP, coding hours, streaks, and goals. Ask me anything, or tap a quick action below!",
  timestamp: new Date().toISOString(),
  category: "all",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatMsgTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (t.includes("cod") || t.includes("program"))                            return "coding";
  if (t.includes("placement") || t.includes("interview") || t.includes("job")) return "placement";
  if (t.includes("health") || t.includes("workout") || t.includes("sleep"))  return "health";
  if (t.includes("motivat") || t.includes("streak") || t.includes("tired"))  return "motivation";
  return "study";
}

// ─── Message Bubble ───────────────────────────────────────────────────────

function MessageBubble({ msg, isTyping }) {
  const isCoach = msg.role === "coach";
  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-end",
      maxWidth: "85%",
      alignSelf: isCoach ? "flex-start" : "flex-end",
      flexDirection: isCoach ? "row" : "row-reverse",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.85rem", flexShrink: 0,
        background: isCoach ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)",
        border: isCoach ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(16,185,129,0.35)",
        color: isCoach ? "#a5b4fc" : "#10b981",
      }}>
        {isCoach ? "🤖" : <User size={14} />}
      </div>
      <div style={{
        padding: "10px 14px",
        borderRadius: 14,
        fontSize: "0.85rem",
        lineHeight: 1.55,
        background: isCoach
          ? "rgba(99,102,241,0.12)"
          : "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))",
        border: isCoach
          ? "1px solid rgba(99,102,241,0.2)"
          : "1px solid rgba(99,102,241,0.35)",
        borderBottomLeftRadius:  isCoach ? 4 : 14,
        borderBottomRightRadius: isCoach ? 14 : 4,
        color: "var(--text-primary)",
        maxWidth: "100%",
        wordBreak: "break-word",
      }}>
        {isTyping ? (
          <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: "50%", background: "#6366f1",
                display: "inline-block",
                animation: `typingBounce 1.2s ${delay}s infinite ease-in-out`,
              }} />
            ))}
          </div>
        ) : (
          <>
            <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
            <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4 }}>
              {formatMsgTime(msg.timestamp)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Context Panel ─────────────────────────────────────────────────────────

function ContextPanel({ state }) {
  const day       = computeDayNumber(state.startDate);
  const xp        = state.gamification?.xp || 0;
  const li        = getLevelInfo(xp);
  const streak    = state.gamification?.streaks?.overall?.current || 0;
  const coding    = state.coding?.totalHours || 0;
  const placement = computePlacementReadiness(state.placement);
  const missions  = (state.missions || []).filter(m => m.completed).length;
  const scores    = computeScores(state);

  const stats = [
    { icon: "📅", label: "Day",       value: `${day}/365`              },
    { icon: "⚡", label: "Total XP",  value: xp.toLocaleString()       },
    { icon: "🏆", label: "Level",     value: `${li.level} — ${li.title}` },
    { icon: "🔥", label: "Streak",    value: `${streak} days`          },
    { icon: "💻", label: "Coding",    value: `${coding}h`              },
    { icon: "🎯", label: "Placement", value: `${placement}%`           },
    { icon: "✅", label: "Missions",  value: missions                   },
  ];

  return (
    <div className="glass-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: "0.82rem", marginBottom: 12, color: "var(--text-muted)" }}>
        <Bot size={16} /> Your Stats
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
            <span style={{ width: 18, fontSize: "0.85rem" }}>{s.icon}</span>
            <span style={{ flex: 1, color: "var(--text-muted)" }}>{s.label}</span>
            <strong style={{ fontSize: "0.78rem" }}>{s.value}</strong>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>Performance</div>
      {Object.entries(scores).map(([key, val]) => (
        <div key={key} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", marginBottom: 2, color: "var(--text-secondary)" }}>
            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            <span>{val}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${val}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 2, transition: "width 0.5s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Weekly Report ─────────────────────────────────────────────────────────

function WeeklyReport({ state }) {
  const xp        = state.gamification?.xp || 0;
  const streak    = state.gamification?.streaks?.overall?.current || 0;
  const coding    = state.coding?.totalHours || 0;
  const sessions  = (state.coding?.sessions || []).length;
  const placement = computePlacementReadiness(state.placement);
  const missions  = (state.missions || []).filter(m => m.completed).length;
  const total     = (state.missions || []).length;
  const vocab     = (state.english?.vocabulary || []).length;
  const workouts  = (state.health?.workouts || []).length;

  const grade = xp > 1000 ? "A+" : xp > 500 ? "A" : xp > 200 ? "B+" : xp > 100 ? "B" : xp > 0 ? "C" : "—";

  const items = [
    { label: "XP Earned",    value: xp,               icon: "⚡", good: xp > 100                           },
    { label: "Streak",       value: `${streak}d`,     icon: "🔥", good: streak >= 3                         },
    { label: "Coding",       value: `${coding}h`,     icon: "💻", good: coding >= 5                         },
    { label: "Sessions",     value: sessions,          icon: "📈", good: sessions >= 5                       },
    { label: "Mission Rate", value: total ? `${Math.round((missions/total)*100)}%` : "0%", icon: "✅", good: total > 0 && missions/total >= 0.5 },
    { label: "Placement",    value: `${placement}%`,  icon: "🎯", good: placement >= 30                     },
    { label: "Vocab",        value: vocab,             icon: "📖", good: vocab >= 10                         },
    { label: "Workouts",     value: workouts,          icon: "🏃", good: workouts >= 3                       },
  ];

  return (
    <div className="glass-card" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: "0.82rem", marginBottom: 12 }}>
        <Star size={16} />
        <span>AI Report Card</span>
        <div style={{
          marginLeft: "auto", background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "white", width: 30, height: 30, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "0.85rem",
        }}>{grade}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {items.map(item => (
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 8px", borderRadius: 8, fontSize: "0.72rem",
            background: item.good ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.07)",
          }}>
            <span style={{ fontSize: "0.82rem" }}>{item.icon}</span>
            <div>
              <strong style={{ display: "block", fontSize: "0.78rem" }}>{item.value}</strong>
              <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
            </div>
            <span style={{ marginLeft: "auto", color: item.good ? "#10b981" : "var(--text-muted)" }}>
              {item.good ? "✓" : "→"}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: "0.73rem", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
        {xp === 0 ? "Start your journey to get your first report! 🚀"
          : `Keep going, ${state.profile?.name || "Developer"}! Consistency is your superpower.`}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function Coach({ state, setState, onNav, onXP }) {
  const messages               = state.aiCoach?.messages || [];
  const [input, setInput]      = useState("");
  const [isTyping, setIsTyping]= useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showReport, setShowReport] = useState(false);
  const endRef  = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const displayMessages = messages.length === 0 ? [WELCOME_MSG] : messages;
  const filtered = activeTab === "all"
    ? displayMessages
    : displayMessages.filter(m => m.category === activeTab || m.role === "user");

  function saveMessages(msgs) {
    setState(cur => ({ ...cur, aiCoach: { ...(cur.aiCoach || {}), messages: msgs } }));
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    const cat    = detectCategory(text);
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
      category: cat,
    };
    const next = [...messages, userMsg];
    saveMessages(next);
    setInput("");
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));

    const responseText = getCoachResponse(state, text);
    const coachMsg = {
      id: `c-${Date.now()}`,
      role: "coach",
      content: responseText,
      timestamp: new Date().toISOString(),
      category: cat,
    };
    setIsTyping(false);
    saveMessages([...next, coachMsg]);
    onXP?.(5, "AI Chat");
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30%          { transform: translateY(-6px); opacity: 1; }
        }
        .coach-layout {
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 20px;
          height: calc(100vh - 110px);
          overflow: hidden;
        }
        .coach-left { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-right: 4px; }
        .coach-chat { display: flex; flex-direction: column; overflow: hidden; padding: 0 !important; }
        .coach-profile { display: flex; align-items: center; gap: 12px; padding: 14px; }
        .coach-avatar-big {
          font-size: 2rem; width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(99,102,241,0.2); border-radius: 50%;
          border: 2px solid rgba(99,102,241,0.4);
        }
        .coach-tabs-bar {
          display: flex; align-items: center; gap: 3px; padding: 10px 12px;
          border-bottom: 1px solid var(--border); flex-wrap: wrap;
        }
        .c-tab {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 20px; font-size: 0.73rem;
          background: transparent; border: 1px solid transparent;
          color: var(--text-muted); cursor: pointer; transition: all 0.15s;
        }
        .c-tab:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        .c-tab.active {
          background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }
        .c-clear {
          margin-left: auto; padding: 5px; border-radius: 6px;
          background: transparent; border: none; color: var(--text-muted);
          cursor: pointer;
        }
        .c-clear:hover { color: #f87171; }
        .chat-msgs {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .quick-row {
          display: flex; gap: 5px; padding: 8px 12px; flex-wrap: wrap;
          border-top: 1px solid var(--border); background: rgba(0,0,0,0.08);
        }
        .qa-chip {
          display: flex; align-items: center; gap: 4px; padding: 4px 9px;
          border-radius: 14px; font-size: 0.71rem; white-space: nowrap;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
        }
        .qa-chip:hover:not(:disabled) {
          background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }
        .qa-chip:disabled { opacity: 0.4; cursor: not-allowed; }
        .chat-input-row {
          display: flex; gap: 8px; padding: 10px 12px;
          border-top: 1px solid var(--border); align-items: flex-end;
        }
        .chat-input {
          flex: 1; padding: 10px 13px; resize: none;
          background: rgba(255,255,255,0.05); border: 1px solid var(--border);
          border-radius: 12px; color: var(--text-primary); font-size: 0.84rem;
          font-family: inherit; line-height: 1.4;
        }
        .chat-input:focus { outline: none; border-color: rgba(99,102,241,0.5); }
        .chat-input::placeholder { color: var(--text-muted); }
        .send-btn {
          padding: 10px 14px; border-radius: 12px; cursor: pointer;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border: none; color: white; display: flex; align-items: center;
          flex-shrink: 0;
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .report-toggle {
          display: flex; align-items: center; gap: 8px; padding: 10px 14px;
          width: 100%; text-align: left; font-size: 0.8rem; cursor: pointer;
          background: transparent; border: none; color: var(--text-secondary);
        }
        .report-toggle span:nth-of-type(1) { flex: 1; }
        @media(max-width:900px) {
          .coach-layout { grid-template-columns: 1fr; height: auto; overflow: auto; }
          .coach-chat { height: 520px; }
        }
      `}</style>

      <div className="coach-layout">
        {/* ── Left Panel ── */}
        <div className="coach-left">
          {/* Profile */}
          <div className="coach-profile glass-card">
            <div className="coach-avatar-big">🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>LifeOS Coach</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Your Personal AI Mentor</div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4, marginTop: 5,
                padding: "2px 8px", background: "rgba(99,102,241,0.14)", borderRadius: 20,
                fontSize: "0.66rem", color: "#a5b4fc",
              }}>
                <Sparkles size={11} /> Context-Aware AI
              </div>
            </div>
          </div>

          {/* Stats */}
          <ContextPanel state={state} />

          {/* Report Toggle */}
          <button className="report-toggle glass-card" onClick={() => setShowReport(r => !r)}>
            <Star size={15} />
            <span>{showReport ? "Hide" : "View"} AI Report Card</span>
            <ChevronRight size={13} style={{ transform: showReport ? "rotate(90deg)" : "none", transition: "0.2s" }} />
          </button>

          {showReport && <WeeklyReport state={state} />}
        </div>

        {/* ── Chat Panel ── */}
        <div className="coach-chat glass-card">
          {/* Tabs */}
          <div className="coach-tabs-bar">
            {COACH_TABS.map(({ id, label, Icon }) => (
              <button key={id} className={`c-tab ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>
                <Icon size={12} /> {label}
              </button>
            ))}
            <button className="c-clear" onClick={() => saveMessages([])} title="Clear chat">
              <Trash2 size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-msgs">
            {filtered.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && (
              <MessageBubble
                msg={{ id: "t", role: "coach", content: "", timestamp: "" }}
                isTyping
              />
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Actions */}
          <div className="quick-row">
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.label}
                className="qa-chip"
                onClick={() => sendMessage(qa.label)}
                disabled={isTyping}
              >
                {qa.icon} {qa.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your AI coach anything… (Enter to send)"
              rows={2}
              disabled={isTyping}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage(input)}
              disabled={isTyping || !input.trim()}
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
