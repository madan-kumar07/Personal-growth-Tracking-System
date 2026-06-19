import React, { useState, useRef, useCallback } from "react";
import {
  Coffee, Clock, Calculator, Layers, FileText, Grid,
  BookOpen, Search, RotateCcw, Play, Pause, Plus, Trash2,
  Check, ChevronLeft, ChevronRight, RefreshCw, Eye, EyeOff,
  Flag, AlertCircle, Star
} from "lucide-react";
import { usePomodoroTimer, useStopwatch } from "../hooks.js";
import { todayISO } from "../utils.js";

// ─── Constants ────────────────────────────────────────────────────────────

const TOOLS = [
  { id: "pomodoro",   label: "Pomodoro Timer",       icon: Coffee      },
  { id: "stopwatch",  label: "Stopwatch",             icon: Clock       },
  { id: "cgpa",       label: "CGPA Calculator",       icon: Calculator  },
  { id: "flashcards", label: "Flashcards",            icon: Layers      },
  { id: "notes",      label: "Quick Notes",           icon: FileText    },
  { id: "matrix",     label: "Priority Matrix",       icon: Grid        },
  { id: "questions",  label: "Interview Question Bank", icon: BookOpen  },
];

const GRADE_POINTS = { S: 10, A: 9, "A+": 10, B: 8, C: 7, D: 6, E: 5, F: 0 };

const INTERVIEW_QUESTIONS = {
  DSA: [
    "What is the time complexity of binary search?",
    "Explain BFS vs DFS with examples.",
    "What is dynamic programming? Give an example.",
    "How does merge sort work? What is its complexity?",
    "What is a hash table and how does it handle collisions?",
    "Explain the difference between stack and queue.",
    "What is a linked list? Types of linked lists?",
    "How do you detect a cycle in a linked list?",
    "What is a balanced BST? Name some examples.",
    "Explain the sliding window technique.",
    "What is the two-pointer approach?",
    "How does quicksort work? Best/worst case complexity?",
  ],
  Java: [
    "What is the difference between JDK, JRE, and JVM?",
    "Explain OOP principles in Java.",
    "What is the difference between abstract class and interface?",
    "What is Java Collections Framework?",
    "Explain exception handling in Java.",
    "What is multithreading in Java?",
    "What are generics in Java?",
    "Explain the concept of serialization.",
    "What is the difference between '==' and '.equals()'?",
    "What are Java 8 features? Explain Streams and Lambdas.",
    "What is garbage collection in Java?",
    "Explain the Singleton design pattern.",
  ],
  DBMS: [
    "What is a primary key vs foreign key?",
    "Explain ACID properties.",
    "What are the different types of SQL joins?",
    "What is normalization? Explain 1NF, 2NF, 3NF.",
    "What is a transaction? How do you handle concurrency?",
    "What is an index? How does it improve query performance?",
    "Explain the difference between SQL and NoSQL databases.",
    "What is a stored procedure?",
    "What are triggers in DBMS?",
    "Explain the ER model.",
    "What is denormalization? When should you use it?",
    "What is a deadlock in DBMS?",
  ],
  OS: [
    "What is the difference between process and thread?",
    "Explain CPU scheduling algorithms.",
    "What is deadlock? How is it prevented?",
    "Explain virtual memory and paging.",
    "What is a semaphore?",
    "What is the difference between mutex and semaphore?",
    "Explain memory management techniques.",
    "What is thrashing in OS?",
    "Explain the producer-consumer problem.",
    "What is context switching?",
    "What are system calls?",
    "Explain file system structure.",
  ],
  CN: [
    "What is the OSI model? Explain each layer.",
    "What is the difference between TCP and UDP?",
    "How does DNS work?",
    "Explain the three-way handshake in TCP.",
    "What is HTTP vs HTTPS?",
    "What is IP addressing and subnetting?",
    "What is a router vs switch vs hub?",
    "Explain DHCP protocol.",
    "What is ARP?",
    "What is a firewall?",
    "Explain the concept of latency and bandwidth.",
    "What is CDN?",
  ],
  HR: [
    "Tell me about yourself.",
    "Where do you see yourself in 5 years?",
    "What are your strengths and weaknesses?",
    "Why do you want to work at this company?",
    "Describe a challenge you faced and how you overcame it.",
    "How do you handle pressure and tight deadlines?",
    "What motivates you?",
    "Describe a time when you worked in a team.",
    "How do you prioritize your tasks?",
    "What is your greatest achievement?",
    "Do you have any questions for us?",
    "Why should we hire you?",
  ],
  "System Design": [
    "How would you design a URL shortener?",
    "Design a Twitter-like social media platform.",
    "How would you design a distributed cache?",
    "Explain consistent hashing.",
    "What is horizontal vs vertical scaling?",
    "Design a notification system.",
    "What is a message queue? When do you use it?",
    "Design a rate limiter.",
    "Explain CAP theorem.",
    "How would you design Netflix?",
    "What is a microservices architecture?",
    "Design a search autocomplete system.",
  ],
};

// ─── Pomodoro ─────────────────────────────────────────────────────────────

function PomodoroTool({ state, setState }) {
  const [preset, setPreset] = useState({ work: 25, brk: 5 });
  const pomo = usePomodoroTimer(preset.work, preset.brk);

  const presets = [
    { label: "25 / 5",   work: 25, brk: 5  },
    { label: "50 / 10",  work: 50, brk: 10 },
    { label: "Custom",   work: preset.work, brk: preset.brk },
  ];

  const circumference = 2 * Math.PI * 52;
  const totalSecs = pomo.mode === "work" ? preset.work * 60 : preset.brk * 60;
  const progress  = 1 - pomo.seconds / totalSecs;
  const strokeDash = circumference * progress;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Presets */}
      <div style={{ display: "flex", gap: 6 }}>
        {[{ label: "25/5", work: 25, brk: 5 }, { label: "50/10", work: 50, brk: 10 }].map(p => (
          <button
            key={p.label}
            onClick={() => { setPreset(p); pomo.reset(); }}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer",
              background: preset.work === p.work ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
              border: preset.work === p.work ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
              color: preset.work === p.work ? "#a5b4fc" : "var(--text-muted)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Circular Ring */}
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r="52" fill="none"
            stroke={pomo.mode === "work" ? "#6366f1" : "#10b981"}
            strokeWidth="10"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "monospace" }}>{pomo.display}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            {pomo.mode === "work" ? "Focus" : "Break"}
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--text-muted)" }}>
        <Coffee size={14} />
        {pomo.sessions} session{pomo.sessions !== 1 ? "s" : ""} completed today
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={pomo.running ? pomo.pause : pomo.start}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.84rem", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "white" }}
        >
          {pomo.running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start</>}
        </button>
        <button
          onClick={pomo.reset}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontSize: "0.84rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </div>
  );
}

// ─── Stopwatch ────────────────────────────────────────────────────────────

function StopwatchTool() {
  const sw   = useStopwatch();
  const [laps, setLaps] = useState([]);

  function addLap() { setLaps(l => [...l, sw.elapsed]); }
  function handleReset() { sw.reset(); setLaps([]); }

  function fmtElapsed(secs) {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: "2.8rem", fontWeight: 700, fontFamily: "monospace", letterSpacing: 2 }}>
        {sw.display}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={sw.running ? sw.pause : sw.start}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.84rem", background: "linear-gradient(135deg,#06b6d4,#3b82f6)", border: "none", color: "white" }}
        >
          {sw.running ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Start</>}
        </button>
        <button
          onClick={handleReset}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontSize: "0.84rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <RotateCcw size={14} /> Reset
        </button>
        {sw.running && (
          <button
            onClick={addLap}
            style={{ padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontSize: "0.84rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}
          >
            Lap
          </button>
        )}
      </div>
      {laps.length > 0 && (
        <div style={{ width: "100%", maxHeight: 160, overflowY: "auto" }}>
          {laps.map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 4, fontSize: "0.82rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Lap {i + 1}</span>
              <strong>{fmtElapsed(l)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CGPA Calculator ──────────────────────────────────────────────────────

function CGPATool() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: "", grade: "S", credits: "3" });

  function addSubject() {
    if (!form.name.trim()) return;
    setSubjects(s => [...s, {
      id: Date.now(),
      name: form.name.trim(),
      grade: form.grade,
      credits: parseInt(form.credits) || 3,
    }]);
    setForm({ name: "", grade: "S", credits: "3" });
  }

  const cgpa = (() => {
    if (!subjects.length) return 0;
    const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
    const totalGP      = subjects.reduce((s, sub) => s + (GRADE_POINTS[sub.grade] || 0) * sub.credits, 0);
    return totalCredits ? (totalGP / totalCredits).toFixed(2) : "0.00";
  })();

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, marginBottom: 12 }}>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Subject name"
          className="form-input"
          style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem" }}
        />
        <select
          value={form.grade}
          onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
          style={{ padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem" }}
        >
          {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>)}
        </select>
        <input
          type="number" min="1" max="6"
          value={form.credits}
          onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
          placeholder="Credits"
          style={{ width: 70, padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem" }}
        />
        <button
          onClick={addSubject}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc", fontSize: "0.82rem" }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {subjects.length > 0 ? (
        <>
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12 }}>
            {subjects.map(sub => (
              <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", marginBottom: 4, fontSize: "0.82rem" }}>
                <span style={{ flex: 1 }}>{sub.name}</span>
                <span style={{ color: "#06b6d4", fontWeight: 600 }}>{sub.grade}</span>
                <span style={{ color: "var(--text-muted)" }}>{sub.credits} cr</span>
                <span style={{ color: "#a5b4fc" }}>{GRADE_POINTS[sub.grade]} GP</span>
                <button onClick={() => setSubjects(s => s.filter(x => x.id !== sub.id))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", padding: "16px", borderRadius: 12, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#a5b4fc" }}>{cgpa}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>CGPA (10-point scale)</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
              {subjects.reduce((s, x) => s + x.credits, 0)} total credits · {subjects.length} subjects
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem" }}>📐</div>
          <div style={{ fontSize: "0.8rem", marginTop: 8 }}>Add subjects to calculate your CGPA</div>
        </div>
      )}
    </div>
  );
}

// ─── Flashcards ───────────────────────────────────────────────────────────

function FlashcardsTool({ state, setState }) {
  const cards  = state.tools?.flashcards || [];
  const [mode, setMode]     = useState("list"); // list | review | add
  const [idx, setIdx]       = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [form, setForm]     = useState({ question: "", answer: "", category: "General" });
  const [filter, setFilter] = useState("All");

  const today = todayISO();
  const reviewedToday = cards.filter(c => c.reviewedAt === today).length;

  function addCard() {
    if (!form.question.trim() || !form.answer.trim()) return;
    const newCards = [...cards, { id: Date.now(), ...form, known: false, createdAt: today, reviewedAt: null }];
    setState(cur => ({ ...cur, tools: { ...(cur.tools || {}), flashcards: newCards } }));
    setForm({ question: "", answer: "", category: "General" });
    setMode("list");
  }

  function markCard(known) {
    const newCards = cards.map((c, i) => i === idx ? { ...c, known, reviewedAt: today } : c);
    setState(cur => ({ ...cur, tools: { ...(cur.tools || {}), flashcards: newCards } }));
    setFlipped(false);
    if (idx < cards.length - 1) setIdx(i => i + 1);
  }

  function deleteCard(id) {
    setState(cur => ({ ...cur, tools: { ...(cur.tools || {}), flashcards: cards.filter(c => c.id !== id) } }));
  }

  const categories = ["All", ...new Set(cards.map(c => c.category || "General"))];
  const filteredCards = filter === "All" ? cards : cards.filter(c => (c.category || "General") === filter);
  const reviewCards = filteredCards.filter(c => !c.known);
  const currentCard = reviewCards[idx] || null;

  if (mode === "review") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => { setMode("list"); setIdx(0); setFlipped(false); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}>
            <ChevronLeft size={14} /> Back
          </button>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{idx + 1} / {reviewCards.length}</span>
        </div>

        {currentCard ? (
          <div
            onClick={() => setFlipped(f => !f)}
            style={{ minHeight: 160, borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer", textAlign: "center", position: "relative", background: flipped ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", border: flipped ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(99,102,241,0.3)", transition: "all 0.3s" }}
          >
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 10 }}>
              {flipped ? "Answer" : "Question — tap to flip"}
            </div>
            <div style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
              {flipped ? currentCard.answer : currentCard.question}
            </div>
            <div style={{ position: "absolute", top: 10, right: 12, fontSize: "0.65rem", color: "var(--text-muted)" }}>
              {currentCard.category}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
            🎉 All cards reviewed! Great job.
          </div>
        )}

        {flipped && currentCard && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => markCard(false)} style={{ flex: 1, padding: "9px", borderRadius: 10, cursor: "pointer", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "0.82rem" }}>
              Need Review
            </button>
            <button onClick={() => markCard(true)} style={{ flex: 1, padding: "9px", borderRadius: 10, cursor: "pointer", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "0.82rem" }}>
              Know It ✓
            </button>
          </div>
        )}

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button onClick={() => { setIdx(i => Math.max(0, i-1)); setFlipped(false); }} style={{ flex: 1, padding: "7px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            ← Prev
          </button>
          <button onClick={() => { setIdx(i => Math.min(reviewCards.length-1, i+1)); setFlipped(false); }} style={{ flex: 1, padding: "7px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            Next →
          </button>
        </div>
      </div>
    );
  }

  if (mode === "add") {
    return (
      <div>
        <button onClick={() => setMode("list")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", marginBottom: 12 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea
            value={form.question}
            onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
            placeholder="Question..."
            rows={3}
            style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.84rem", resize: "none", fontFamily: "inherit" }}
          />
          <textarea
            value={form.answer}
            onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
            placeholder="Answer..."
            rows={3}
            style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.84rem", resize: "none", fontFamily: "inherit" }}
          />
          <input
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="Category (e.g. DSA, Java...)"
            style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem" }}
          />
          <button onClick={addCard} style={{ padding: "10px", borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "white", fontWeight: 600, fontSize: "0.84rem" }}>
            Add Flashcard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", fontSize: "0.78rem", textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: "1.1rem" }}>{cards.length}</strong>
          <span style={{ color: "var(--text-muted)" }}>Total Cards</span>
        </div>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "0.78rem", textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: "1.1rem" }}>{reviewedToday}</strong>
          <span style={{ color: "var(--text-muted)" }}>Reviewed Today</span>
        </div>
        <div style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.78rem", textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: "1.1rem" }}>{cards.filter(c => c.known).length}</strong>
          <span style={{ color: "var(--text-muted)" }}>Known</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setMode("add")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: "0.8rem" }}>
          <Plus size={13} /> Add Card
        </button>
        {reviewCards.length > 0 && (
          <button onClick={() => { setMode("review"); setIdx(0); setFlipped(false); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "0.8rem" }}>
            <Play size={13} /> Review ({reviewCards.length})
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem" }}>🃏</div>
          <div style={{ fontSize: "0.8rem", marginTop: 8 }}>No flashcards yet. Add your first card!</div>
        </div>
      ) : (
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {filteredCards.slice(0, 10).map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 4, fontSize: "0.8rem" }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.question}</span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", flexShrink: 0 }}>{c.category}</span>
              {c.known && <span style={{ color: "#10b981", fontSize: "0.75rem" }}>✓</span>}
              <button onClick={() => deleteCard(c.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick Notes ──────────────────────────────────────────────────────────

function NotesTool({ state, setState }) {
  const notes = state.tools?.notes || [];
  const [form, setForm] = useState({ title: "", content: "" });
  const [adding, setAdding] = useState(false);

  function addNote() {
    if (!form.content.trim()) return;
    const newNote = { id: Date.now(), title: form.title || "Untitled", content: form.content, createdAt: new Date().toISOString() };
    setState(cur => ({ ...cur, tools: { ...(cur.tools || {}), notes: [...notes, newNote] } }));
    setForm({ title: "", content: "" });
    setAdding(false);
  }

  function deleteNote(id) {
    setState(cur => ({ ...cur, tools: { ...(cur.tools || {}), notes: notes.filter(n => n.id !== id) } }));
  }

  return (
    <div>
      {adding ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Note title..."
            style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem" }}
          />
          <textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Write your note..."
            rows={4}
            style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem", resize: "none", fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={addNote} style={{ flex: 1, padding: "8px", borderRadius: 8, cursor: "pointer", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc", fontSize: "0.82rem" }}>Save Note</button>
            <button onClick={() => setAdding(false)} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.82rem" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontSize: "0.8rem", marginBottom: 10 }}>
          <Plus size={13} /> New Note
        </button>
      )}

      {notes.length === 0 && !adding ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem" }}>📝</div>
          <div style={{ fontSize: "0.8rem", marginTop: 8 }}>No notes yet. Create your first quick note!</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 250, overflowY: "auto" }}>
          {[...notes].reverse().map(n => (
            <div key={n.id} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <strong style={{ fontSize: "0.82rem" }}>{n.title}</strong>
                <button onClick={() => deleteNote(n.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2 }}><Trash2 size={12} /></button>
              </div>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{n.content}</p>
              <div style={{ marginTop: 5, fontSize: "0.65rem", color: "var(--text-muted)" }}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Priority Matrix ───────────────────────────────────────────────────────

const QUADRANTS = [
  { id: "q1", label: "Do First",      sub: "Urgent + Important",     color: "#f43f5e", bg: "rgba(244,63,94,0.08)"    },
  { id: "q2", label: "Schedule",      sub: "Not Urgent + Important", color: "#6366f1", bg: "rgba(99,102,241,0.08)"   },
  { id: "q3", label: "Delegate",      sub: "Urgent + Not Important", color: "#f59e0b", bg: "rgba(245,158,11,0.08)"   },
  { id: "q4", label: "Eliminate",     sub: "Not Urgent + Not Important", color: "#6b7280", bg: "rgba(107,114,128,0.08)" },
];

function PriorityMatrix() {
  const [tasks, setTasks] = useState({ q1: [], q2: [], q3: [], q4: [] });
  const [inputs, setInputs] = useState({ q1: "", q2: "", q3: "", q4: "" });

  function addTask(qid) {
    if (!inputs[qid].trim()) return;
    setTasks(t => ({ ...t, [qid]: [...t[qid], { id: Date.now(), text: inputs[qid].trim(), done: false }] }));
    setInputs(i => ({ ...i, [qid]: "" }));
  }

  function toggleTask(qid, tid) {
    setTasks(t => ({ ...t, [qid]: t[qid].map(task => task.id === tid ? { ...task, done: !task.done } : task) }));
  }

  function deleteTask(qid, tid) {
    setTasks(t => ({ ...t, [qid]: t[qid].filter(task => task.id !== tid) }));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {QUADRANTS.map(q => (
        <div key={q.id} style={{ padding: 12, borderRadius: 12, background: q.bg, border: `1px solid ${q.color}33` }}>
          <div style={{ fontWeight: 700, fontSize: "0.8rem", color: q.color, marginBottom: 2 }}>{q.label}</div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 8 }}>{q.sub}</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            <input
              value={inputs[q.id]}
              onChange={e => setInputs(i => ({ ...i, [q.id]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addTask(q.id)}
              placeholder="Add task..."
              style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.75rem" }}
            />
            <button onClick={() => addTask(q.id)} style={{ padding: "5px 8px", borderRadius: 6, background: `${q.color}22`, border: `1px solid ${q.color}44`, color: q.color, cursor: "pointer" }}>
              <Plus size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
            {tasks[q.id].map(task => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem" }}>
                <button onClick={() => toggleTask(q.id, task.id)} style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${q.color}55`, background: task.done ? q.color : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {task.done && <Check size={9} color="white" />}
                </button>
                <span style={{ flex: 1, textDecoration: task.done ? "line-through" : "none", color: task.done ? "var(--text-muted)" : "var(--text-primary)", wordBreak: "break-word" }}>{task.text}</span>
                <button onClick={() => deleteTask(q.id, task.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 1 }}><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Interview Questions ───────────────────────────────────────────────────

function InterviewQuestions() {
  const [category, setCategory] = useState("DSA");
  const [search, setSearch]     = useState("");
  const [practiced, setPracticed] = useState(new Set());

  const categories = Object.keys(INTERVIEW_QUESTIONS);
  const questions  = INTERVIEW_QUESTIONS[category] || [];
  const filtered   = search
    ? Object.entries(INTERVIEW_QUESTIONS).flatMap(([cat, qs]) => qs.filter(q => q.toLowerCase().includes(search.toLowerCase())).map(q => ({ q, cat })))
    : questions.map(q => ({ q, cat: category }));

  function togglePracticed(q) {
    setPracticed(p => {
      const n = new Set(p);
      n.has(q) ? n.delete(q) : n.add(q);
      return n;
    });
  }

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions..."
          style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.82rem", boxSizing: "border-box" }}
        />
      </div>

      {/* Category Pills */}
      {!search && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "4px 10px", borderRadius: 14, fontSize: "0.72rem", cursor: "pointer",
              background: category === cat ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: category === cat ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
              color: category === cat ? "#a5b4fc" : "var(--text-muted)",
            }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>
        {practiced.size} of {questions.length} practiced in {category}
      </div>

      {/* Question List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 260, overflowY: "auto" }}>
        {filtered.map(({ q, cat }, i) => (
          <div
            key={i}
            onClick={() => togglePracticed(q)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
              background: practiced.has(q) ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
              border: practiced.has(q) ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border)",
              transition: "all 0.15s",
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: "50%", border: practiced.has(q) ? "none" : "1px solid var(--border)",
              background: practiced.has(q) ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
            }}>
              {practiced.has(q) && <Check size={10} color="white" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", lineHeight: 1.4, color: practiced.has(q) ? "var(--text-muted)" : "var(--text-primary)", textDecoration: practiced.has(q) ? "line-through" : "none" }}>{q}</div>
              {search && <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>{cat}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Tools Component ─────────────────────────────────────────────────

export default function Tools({ state, setState, onNav, onXP }) {
  const [activeTool, setActiveTool] = useState("pomodoro");

  const toolComponents = {
    pomodoro:   <PomodoroTool state={state} setState={setState} />,
    stopwatch:  <StopwatchTool />,
    cgpa:       <CGPATool />,
    flashcards: <FlashcardsTool state={state} setState={setState} />,
    notes:      <NotesTool state={state} setState={setState} />,
    matrix:     <PriorityMatrix />,
    questions:  <InterviewQuestions />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Split Layout Container */}
      <div className="tools-layout" style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        
        {/* Left Column: Sidebar selector */}
        <div className="tools-sidebar" style={{ width: "260px", display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
          {TOOLS.map(tool => {
            const isActive = activeTool === tool.id;
            return (
              <div
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className="glass-card"
                style={{
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s",
                  background: isActive ? "var(--indigo-dim)" : "rgba(20,20,43,0.5)",
                  borderColor: isActive ? "var(--indigo)" : "var(--border)",
                  boxShadow: isActive ? "var(--shadow-glow)" : "none"
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: isActive ? "var(--indigo)" : "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? "#fff" : "var(--text-2)",
                  flexShrink: 0
                }}>
                  <tool.icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: isActive ? "var(--text)" : "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tool.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tool.id === "pomodoro"   && "Focus cycles"}
                    {tool.id === "stopwatch"  && "Track time & laps"}
                    {tool.id === "cgpa"       && "GPA calculations"}
                    {tool.id === "flashcards" && `${(state.tools?.flashcards || []).length} cards`}
                    {tool.id === "notes"      && `${(state.tools?.notes || []).length} notes`}
                    {tool.id === "matrix"     && "Eisenhower grid"}
                    {tool.id === "questions"  && "Interview questions"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Tool View */}
        <div className="tools-content" style={{ flex: 1, minWidth: 0 }}>
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
              {(() => {
                const t = TOOLS.find(x => x.id === activeTool);
                if (!t) return null;
                return (
                  <>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--indigo-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--indigo)" }}>
                      <t.icon size={18} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 750, fontFamily: "var(--font-head)" }}>{t.label}</h2>
                      <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "var(--text-3)" }}>
                        {t.id === "pomodoro"   && "Focused study cycles with interval timers and alerts."}
                        {t.id === "stopwatch"  && "Accurate stopwatch with lap timing capabilities."}
                        {t.id === "cgpa"       && "CGPA / GPA calculator using subject grade point scales."}
                        {t.id === "flashcards" && "Active recall revision. Custom categories and flashcards."}
                        {t.id === "notes"      && "Fast scratchpad to write down notes, thoughts, and ideas."}
                        {t.id === "matrix"     && "Eisenhower Priority Matrix. Map tasks by urgency and importance."}
                        {t.id === "questions"  && "CS curriculum questions covering DSA, OS, DBMS, Networks, and Java."}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            {toolComponents[activeTool]}
          </div>
        </div>

      </div>
    </div>
  );
}
