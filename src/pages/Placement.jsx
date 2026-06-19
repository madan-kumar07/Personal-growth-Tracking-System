import React, { useState, useMemo } from "react";
import {
  GraduationCap, CheckCircle2, Check, Plus, Trash2,
  ChevronDown, ChevronRight, AlertTriangle, TrendingUp,
  BarChart3, Star, Target, BookOpen, Building2, Cpu,
  Database, Network, Globe, Calculator, Users, Code2
} from "lucide-react";
import { Panel, ProgressBar, Ring, EmptyState } from "../components/ui.jsx";
import { BarChart } from "../components/charts.jsx";
import {
  todayISO, formatDate, computePlacementReadiness,
} from "../utils.js";

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
    purple: "var(--purple)",
    emerald: "var(--emerald)"
  };
  return <BarChart data={data} color={toneColors[tone] || "var(--indigo)"} height={height} />;
}

const API = "/api";

// ── Default Subjects with built-in topic checklists ───────────────────────────

const DEFAULT_SUBJECTS = [
  {
    id: "dsa",
    title: "DSA",
    icon: "🧮",
    color: "cyan",
    topics: [
      { id: "dsa-1",  title: "Arrays & Strings",           completed: false, xp: 20 },
      { id: "dsa-2",  title: "Linked Lists",               completed: false, xp: 20 },
      { id: "dsa-3",  title: "Stacks & Queues",            completed: false, xp: 20 },
      { id: "dsa-4",  title: "Trees (Binary, BST)",        completed: false, xp: 30 },
      { id: "dsa-5",  title: "Graphs (BFS, DFS)",          completed: false, xp: 30 },
      { id: "dsa-6",  title: "Dynamic Programming",        completed: false, xp: 40 },
      { id: "dsa-7",  title: "Sorting Algorithms",         completed: false, xp: 25 },
      { id: "dsa-8",  title: "Searching Algorithms",       completed: false, xp: 20 },
      { id: "dsa-9",  title: "Recursion & Backtracking",   completed: false, xp: 30 },
      { id: "dsa-10", title: "Hashing & Hash Maps",        completed: false, xp: 25 },
      { id: "dsa-11", title: "Heaps & Priority Queues",    completed: false, xp: 25 },
      { id: "dsa-12", title: "Greedy Algorithms",          completed: false, xp: 25 },
    ],
  },
  {
    id: "java",
    title: "Java",
    icon: "☕",
    color: "amber",
    topics: [
      { id: "java-1",  title: "OOP Concepts (4 pillars)",  completed: false, xp: 20 },
      { id: "java-2",  title: "Inheritance & Polymorphism",completed: false, xp: 20 },
      { id: "java-3",  title: "Interfaces & Abstract Classes", completed: false, xp: 20 },
      { id: "java-4",  title: "Exception Handling",        completed: false, xp: 15 },
      { id: "java-5",  title: "Collections Framework",     completed: false, xp: 25 },
      { id: "java-6",  title: "Generics",                  completed: false, xp: 20 },
      { id: "java-7",  title: "Multithreading & Concurrency", completed: false, xp: 30 },
      { id: "java-8",  title: "Java 8+ Features (Streams, Lambda)", completed: false, xp: 25 },
      { id: "java-9",  title: "Design Patterns",           completed: false, xp: 30 },
      { id: "java-10", title: "JVM & Memory Management",  completed: false, xp: 25 },
    ],
  },
  {
    id: "dbms",
    title: "DBMS",
    icon: "🗄️",
    color: "green",
    topics: [
      { id: "dbms-1",  title: "ER Model & Normalization",  completed: false, xp: 20 },
      { id: "dbms-2",  title: "SQL Queries (DDL, DML, DCL)", completed: false, xp: 20 },
      { id: "dbms-3",  title: "Joins (Inner, Outer, Self)", completed: false, xp: 20 },
      { id: "dbms-4",  title: "Indexes & Query Optimization", completed: false, xp: 25 },
      { id: "dbms-5",  title: "Transactions & ACID Properties", completed: false, xp: 20 },
      { id: "dbms-6",  title: "Concurrency Control (Locks)", completed: false, xp: 25 },
      { id: "dbms-7",  title: "NoSQL vs SQL",              completed: false, xp: 15 },
      { id: "dbms-8",  title: "Stored Procedures & Triggers", completed: false, xp: 20 },
    ],
  },
  {
    id: "os",
    title: "OS",
    icon: "💻",
    color: "purple",
    topics: [
      { id: "os-1",  title: "Processes & Threads",         completed: false, xp: 20 },
      { id: "os-2",  title: "CPU Scheduling Algorithms",   completed: false, xp: 20 },
      { id: "os-3",  title: "Memory Management & Paging",  completed: false, xp: 25 },
      { id: "os-4",  title: "Deadlocks & Prevention",      completed: false, xp: 20 },
      { id: "os-5",  title: "File Systems",                completed: false, xp: 15 },
      { id: "os-6",  title: "Virtual Memory",              completed: false, xp: 20 },
      { id: "os-7",  title: "Semaphores & Mutex",          completed: false, xp: 25 },
      { id: "os-8",  title: "Disk Scheduling",             completed: false, xp: 15 },
    ],
  },
  {
    id: "cn",
    title: "CN",
    icon: "🌐",
    color: "blue",
    topics: [
      { id: "cn-1",  title: "OSI & TCP/IP Models",         completed: false, xp: 20 },
      { id: "cn-2",  title: "HTTP/HTTPS & REST",           completed: false, xp: 20 },
      { id: "cn-3",  title: "DNS, DHCP, NAT",              completed: false, xp: 15 },
      { id: "cn-4",  title: "TCP vs UDP",                  completed: false, xp: 20 },
      { id: "cn-5",  title: "Routing Protocols",           completed: false, xp: 25 },
      { id: "cn-6",  title: "Subnetting & IP Addressing",  completed: false, xp: 25 },
      { id: "cn-7",  title: "Socket Programming",          completed: false, xp: 20 },
      { id: "cn-8",  title: "Network Security (SSL/TLS)",  completed: false, xp: 20 },
    ],
  },
  {
    id: "aptitude",
    title: "Aptitude",
    icon: "🔢",
    color: "rose",
    topics: [
      { id: "apt-1",  title: "Number System",              completed: false, xp: 15 },
      { id: "apt-2",  title: "Percentage & Profit-Loss",   completed: false, xp: 15 },
      { id: "apt-3",  title: "Time & Work",                completed: false, xp: 15 },
      { id: "apt-4",  title: "Speed, Distance & Time",     completed: false, xp: 15 },
      { id: "apt-5",  title: "Ratio & Proportion",         completed: false, xp: 15 },
      { id: "apt-6",  title: "Permutations & Combinations",completed: false, xp: 20 },
      { id: "apt-7",  title: "Probability",                completed: false, xp: 20 },
      { id: "apt-8",  title: "Logical Reasoning",          completed: false, xp: 20 },
      { id: "apt-9",  title: "Verbal Ability",             completed: false, xp: 15 },
      { id: "apt-10", title: "Data Interpretation",        completed: false, xp: 20 },
    ],
  },
  {
    id: "hr",
    title: "HR",
    icon: "🗣️",
    color: "green",
    topics: [
      { id: "hr-1",  title: "Tell me about yourself",      completed: false, xp: 10 },
      { id: "hr-2",  title: "Strengths & Weaknesses",      completed: false, xp: 10 },
      { id: "hr-3",  title: "Why this company?",           completed: false, xp: 10 },
      { id: "hr-4",  title: "Where do you see yourself in 5 years?", completed: false, xp: 10 },
      { id: "hr-5",  title: "STAR Method (Situation-Task-Action-Result)", completed: false, xp: 15 },
      { id: "hr-6",  title: "Conflict resolution scenarios", completed: false, xp: 15 },
      { id: "hr-7",  title: "Salary negotiation",          completed: false, xp: 15 },
      { id: "hr-8",  title: "Questions to ask the interviewer", completed: false, xp: 10 },
    ],
  },
  {
    id: "mock",
    title: "Mock Interviews",
    icon: "🎯",
    color: "amber",
    topics: [
      { id: "mock-1",  title: "Technical Round 1 (DSA)",   completed: false, xp: 50 },
      { id: "mock-2",  title: "Technical Round 2 (System Design)", completed: false, xp: 50 },
      { id: "mock-3",  title: "Core Java Interview",       completed: false, xp: 40 },
      { id: "mock-4",  title: "DBMS Interview",            completed: false, xp: 40 },
      { id: "mock-5",  title: "OS & CN Combined Round",    completed: false, xp: 40 },
      { id: "mock-6",  title: "HR Interview Practice",     completed: false, xp: 30 },
      { id: "mock-7",  title: "LeetCode Contest",          completed: false, xp: 60 },
      { id: "mock-8",  title: "Full Interview Simulation", completed: false, xp: 100 },
    ],
  },
];

// ── Subject Icon Map ──────────────────────────────────────────────────────────

const SUBJECT_ICONS = {
  dsa: Code2, java: Cpu, dbms: Database, os: Globe,
  cn: Network, aptitude: Calculator, hr: Users, mock: Target,
};

// ── Compute subject progress ──────────────────────────────────────────────────

function subjectProgress(subject) {
  const topics = subject.topics || [];
  if (!topics.length) return 0;
  return Math.round(
    (topics.filter((t) => t.completed).length / topics.length) * 100
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subject Card (with expandable topic checklist)
// ─────────────────────────────────────────────────────────────────────────────

function SubjectCard({ subject, onToggleTopic }) {
  const [expanded, setExpanded] = useState(false);
  const progress = subjectProgress(subject);
  const completed = subject.topics.filter((t) => t.completed).length;
  const total = subject.topics.length;
  const Icon = SUBJECT_ICONS[subject.id] || GraduationCap;

  const tone =
    progress === 0
      ? "muted"
      : progress < 50
      ? "amber"
      : progress < 100
      ? "cyan"
      : "green";

  return (
    <div
      className="glass-card"
      style={{
        overflow: "hidden",
        border: expanded ? "1px solid rgba(255,255,255,.12)" : "1px solid rgba(255,255,255,.06)",
        transition: "all .2s",
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          textAlign: "left",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(255,255,255,.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
        >
          {subject.icon}
        </div>

        {/* Title + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                color: "var(--text-primary)",
                fontSize: ".95rem",
                fontFamily: "var(--font-head)",
              }}
            >
              {subject.title}
            </span>
            <span
              style={{
                fontSize: ".8rem",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color:
                  progress === 100
                    ? "var(--green)"
                    : progress >= 50
                    ? "var(--cyan)"
                    : "var(--text-muted)",
              }}
            >
              {completed}/{total}
            </span>
          </div>
          <ProgressBar value={progress} tone={tone} showPct={false} size="sm" />
          <div
            style={{
              fontSize: ".7rem",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            {progress}% complete
            {progress === 100 && " 🏆"}
          </div>
        </div>

        {/* Expand arrow */}
        <div style={{ flexShrink: 0, color: "var(--text-muted)" }}>
          {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
        </div>
      </button>

      {/* Expanded topic checklist */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,.06)",
            padding: "12px 18px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: ".72rem",
              color: "var(--text-muted)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 6,
            }}
          >
            Topics Checklist
          </div>
          {subject.topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onToggleTopic(subject.id, topic.id)}
              style={{
                border: `1px solid ${topic.completed ? "rgba(34,197,94,.25)" : "rgba(255,255,255,.06)"}`,
                borderRadius: 8,
                cursor: "pointer",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                transition: "all .15s",
                background: topic.completed ? "rgba(34,197,94,.06)" : "rgba(255,255,255,.02)",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: `1.5px solid ${topic.completed ? "var(--green)" : "rgba(255,255,255,.2)"}`,
                  background: topic.completed ? "var(--green)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all .15s",
                }}
              >
                {topic.completed && (
                  <Check size={11} style={{ color: "#000", strokeWidth: 3 }} />
                )}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: ".83rem",
                  color: topic.completed ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: topic.completed ? "line-through" : "none",
                }}
              >
                {topic.title}
              </span>
              <span
                style={{
                  fontSize: ".68rem",
                  color: "var(--amber)",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                +{topic.xp} XP
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Placement Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Placement({ state, setState, onNav, onXP }) {
  // Initialize subjects from state or defaults
  const subjects = useMemo(() => {
    const stored = state.placement?.subjects;
    if (!stored?.length) return DEFAULT_SUBJECTS;
    // Merge stored progress into defaults (in case new topics were added)
    return DEFAULT_SUBJECTS.map((def) => {
      const stored_subj = stored.find((s) => s.id === def.id);
      if (!stored_subj) return def;
      return {
        ...def,
        topics: def.topics.map((t) => {
          const storedTopic = (stored_subj.topics || []).find((st) => st.id === t.id);
          return storedTopic ? { ...t, completed: storedTopic.completed } : t;
        }),
      };
    });
  }, [state.placement?.subjects]);

  const readiness = useMemo(
    () => Math.round(
      subjects.reduce((sum, s) => sum + subjectProgress(s), 0) / subjects.length
    ),
    [subjects]
  );

  // Mock interviews
  const interviews = state.placement?.mockInterviews || [];
  const targetCompanies = state.placement?.targetCompanies || [];

  // Local UI state
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [newInterview, setNewInterview] = useState({
    date: todayISO(), type: "Technical", duration: "", notes: "", rating: 3,
  });
  const [addingInterview, setAddingInterview] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [addingCompany, setAddingCompany] = useState(false);

  // ── Toggle topic completion ──────────────────────────────────────────────

  async function toggleTopic(subjectId, topicId) {
    // Find the topic and its current state
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    const topic = subject.topics.find((t) => t.id === topicId);
    if (!topic) return;
    const nowCompleted = !topic.completed;

    // Update local state
    const updatedSubjects = subjects.map((s) => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        topics: s.topics.map((t) =>
          t.id === topicId ? { ...t, completed: nowCompleted } : t
        ),
        progress: 0, // will be recomputed on next render
      };
    });

    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        subjects: updatedSubjects,
      },
    }));

    // Award XP if completing
    if (nowCompleted) {
      onXP?.(topic.xp || 20, `${subject.title}: ${topic.title}`);
    }

    // Save to backend
    try {
      await fetch(`${API}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...state,
          placement: {
            ...state.placement,
            subjects: updatedSubjects,
          },
        }),
      });
    } catch {
      // Offline — state already updated locally
    }
  }

  // ── Mock Interview handlers ──────────────────────────────────────────────

  function addInterview() {
    if (!newInterview.date) return;
    const iv = {
      id: `iv-${Date.now()}`,
      ...newInterview,
      duration: Number(newInterview.duration) || 60,
    };
    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        mockInterviews: [iv, ...(cur.placement?.mockInterviews || [])],
      },
    }));
    onXP?.(25, "Mock Interview Logged");
    setNewInterview({ date: todayISO(), type: "Technical", duration: "", notes: "", rating: 3 });
    setAddingInterview(false);
  }

  function removeInterview(id) {
    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        mockInterviews: (cur.placement?.mockInterviews || []).filter((iv) => iv.id !== id),
      },
    }));
  }

  function updateInterviewRating(id, rating) {
    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        mockInterviews: (cur.placement?.mockInterviews || []).map((iv) =>
          iv.id === id ? { ...iv, rating: Number(rating) } : iv
        ),
      },
    }));
  }

  // ── Company handlers ─────────────────────────────────────────────────────

  function addCompany() {
    if (!newCompany.trim()) return;
    const company = {
      id: `co-${Date.now()}`,
      name: newCompany.trim(),
      checklist: [
        { id: "c1", task: "Research company culture", done: false },
        { id: "c2", task: "Study company tech stack",  done: false },
        { id: "c3", task: "Review recent news/blogs",  done: false },
        { id: "c4", task: "Solve company-specific LeetCode", done: false },
        { id: "c5", task: "Prepare STAR stories",      done: false },
        { id: "c6", task: "Mock HR round",              done: false },
      ],
    };
    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        targetCompanies: [company, ...(cur.placement?.targetCompanies || [])],
      },
    }));
    setNewCompany("");
    setAddingCompany(false);
  }

  function toggleCompanyTask(companyId, taskId) {
    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        targetCompanies: (cur.placement?.targetCompanies || []).map((co) =>
          co.id !== companyId
            ? co
            : {
                ...co,
                checklist: co.checklist.map((t) =>
                  t.id === taskId ? { ...t, done: !t.done } : t
                ),
              }
        ),
      },
    }));
  }

  function removeCompany(id) {
    setState((cur) => ({
      ...cur,
      placement: {
        ...cur.placement,
        targetCompanies: (cur.placement?.targetCompanies || []).filter((c) => c.id !== id),
      },
    }));
  }

  // ── Derived data ─────────────────────────────────────────────────────────

  const weakSubjects = subjects.filter(
    (s) => subjectProgress(s) < 50 && subjectProgress(s) >= 0
  );

  const barData = subjects.map((s) => ({
    label: s.title.slice(0, 5),
    value: subjectProgress(s),
  }));

  const totalTopics = subjects.reduce((s, subj) => s + subj.topics.length, 0);
  const completedTopics = subjects.reduce(
    (s, subj) => s + subj.topics.filter((t) => t.completed).length,
    0
  );

  const READINESS_LABEL =
    readiness < 20
      ? { text: "🔴 Just Starting", color: "var(--amber)" }
      : readiness < 40
      ? { text: "🟡 Building Foundation", color: "var(--amber)" }
      : readiness < 60
      ? { text: "🟢 Good Progress", color: "var(--green)" }
      : readiness < 80
      ? { text: "🔵 Placement Confident", color: "var(--cyan)" }
      : { text: "🏆 Fully Placement Ready!", color: "var(--green)" };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Readiness Header ── */}
      <div
        className="glass-card"
        style={{
          padding: "24px",
          display: "flex",
          alignItems: "center",
          gap: 28,
          flexWrap: "wrap",
        }}
      >
        <Ring value={readiness} size={130} tone="blue" label="Ready" />

        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              fontSize: "1.7rem",
              fontWeight: 900,
              fontFamily: "var(--font-head)",
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {readiness}% Placement Ready
          </div>
          <div
            style={{
              fontSize: ".9rem",
              fontWeight: 700,
              color: READINESS_LABEL.color,
              marginBottom: 12,
            }}
          >
            {READINESS_LABEL.text}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Topics Done",    value: completedTopics,        color: "var(--green)" },
              { label: "Total Topics",   value: totalTopics,            color: "var(--text-muted)" },
              { label: "Mock Interviews",value: interviews.length,      color: "var(--cyan)" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: ".7rem", color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <ProgressBar value={readiness} tone="blue" showPct={false} animated />
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {subjects.map((s) => (
          <div
            key={s.id}
            className="glass-card"
            style={{ padding: "12px 14px", textAlign: "center" }}
          >
            <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: ".85rem" }}>
              {s.title}
            </div>
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: 900,
                fontFamily: "var(--font-mono)",
                color:
                  subjectProgress(s) >= 80
                    ? "var(--green)"
                    : subjectProgress(s) >= 50
                    ? "var(--cyan)"
                    : "var(--amber)",
                marginTop: 4,
              }}
            >
              {subjectProgress(s)}%
            </div>
            <div
              style={{
                width: "100%",
                height: 4,
                borderRadius: 4,
                background: "rgba(255,255,255,.08)",
                marginTop: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${subjectProgress(s)}%`,
                  borderRadius: 4,
                  background:
                    subjectProgress(s) >= 80
                      ? "var(--green)"
                      : subjectProgress(s) >= 50
                      ? "var(--cyan)"
                      : "var(--amber)",
                  transition: "width .4s",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Subject Cards with topic checklists ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            fontSize: ".72rem",
            color: "var(--text-muted)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".1em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={14} />
          Subject Topic Checklists — click a subject to expand
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onToggleTopic={toggleTopic}
            />
          ))}
        </div>
      </div>

      {/* ── Weak Area Detection ── */}
      {weakSubjects.length > 0 && (
        <Panel title="Weak Areas (< 50%)" icon={AlertTriangle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: ".82rem",
                color: "var(--text-muted)",
                marginBottom: 6,
              }}
            >
              Focus on these subjects to improve your overall readiness score.
            </div>
            {weakSubjects.map((s) => (
              <div
                key={s.id}
                className="glass-card"
                style={{
                  padding: "12px 16px",
                  borderLeft: "3px solid var(--amber)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    {s.title}
                  </div>
                  <ProgressBar value={subjectProgress(s)} tone="amber" showPct={false} size="sm" />
                </div>
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 900,
                    fontFamily: "var(--font-mono)",
                    color: "var(--amber)",
                    flexShrink: 0,
                  }}
                >
                  {subjectProgress(s)}%
                </div>
                <div style={{ fontSize: ".72rem", color: "var(--text-muted)", flexShrink: 0 }}>
                  {s.topics.filter((t) => !t.completed).length} topics left
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* ── Interview Analytics Bar Chart ── */}
      <Panel title="Subject Progress Analytics" icon={BarChart3}>
        <BarGraph data={barData} max={100} tone="blue" height={160} />
      </Panel>

      {/* ── Mock Interview Tracker ── */}
      <Panel
        title="Mock Interview Tracker"
        icon={Target}
        action={
          <button
            className="primary-btn"
            onClick={() => setAddingInterview((v) => !v)}
            style={{
              padding: "5px 14px",
              fontSize: ".78rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={14} /> Log Interview
          </button>
        }
      >
        {/* Add interview form */}
        {addingInterview && (
          <div
            className="glass-card"
            style={{
              padding: "16px",
              marginBottom: 16,
              borderLeft: "3px solid var(--cyan)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
              }}
            >
              <div>
                <label style={{ fontSize: ".72rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newInterview.date}
                  onChange={(e) => setNewInterview((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: ".72rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Type</label>
                <select
                  className="form-select"
                  value={newInterview.type}
                  onChange={(e) => setNewInterview((p) => ({ ...p, type: e.target.value }))}
                >
                  {["Technical", "HR", "Aptitude", "Coding Round", "System Design", "Full Simulation"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: ".72rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Duration (min)</label>
                <input
                  type="number"
                  min="10"
                  max="360"
                  className="form-input"
                  placeholder="60"
                  value={newInterview.duration}
                  onChange={(e) => setNewInterview((p) => ({ ...p, duration: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: ".72rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Performance Notes</label>
              <textarea
                className="form-textarea"
                placeholder="What went well? What to improve? Topics covered…"
                value={newInterview.notes}
                onChange={(e) => setNewInterview((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label style={{ fontSize: ".72rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Self-Rating: {newInterview.rating}/5
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setNewInterview((p) => ({ ...p, rating: r }))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.3rem",
                      opacity: r <= newInterview.rating ? 1 : 0.3,
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="primary-btn" onClick={addInterview} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={15} /> Save Interview
              </button>
              <button className="secondary-btn" onClick={() => setAddingInterview(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {interviews.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="No mock interviews logged yet"
            desc="Track your practice interviews to monitor progress"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {interviews.map((iv) => (
              <div
                key={iv.id}
                className="glass-card"
                style={{ padding: "14px 16px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: ".9rem" }}>
                      {iv.type}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>
                      {formatDate(iv.date)} · {iv.duration}min
                    </div>
                  </div>
                  <div style={{ flex: 1 }} />
                  {/* Star rating display */}
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <span
                        key={r}
                        onClick={() => updateInterviewRating(iv.id, r)}
                        style={{
                          cursor: "pointer",
                          fontSize: ".9rem",
                          opacity: r <= (iv.rating || 3) ? 1 : 0.25,
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => removeInterview(iv.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {iv.notes && (
                  <div style={{ fontSize: ".8rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                    {iv.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* ── Revision Planner ── */}
      <Panel title="Revision Planner" icon={BookOpen}>
        {(() => {
          const revisionTopics = subjects
            .flatMap((s) =>
              s.topics
                .filter((t) => t.completed)
                .map((t) => ({ ...t, subject: s.title, subjectIcon: s.icon }))
            )
            .slice(-10);

          if (!revisionTopics.length) {
            return (
              <EmptyState
                icon="📚"
                title="No topics completed yet"
                desc="Complete topics in the subject checklists to track revision"
              />
            );
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: ".82rem", color: "var(--text-muted)", marginBottom: 4 }}>
                Recently completed topics — recommended for revision:
              </div>
              {revisionTopics.reverse().map((t) => (
                <div
                  key={t.id}
                  className="glass-card"
                  style={{
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderLeft: "3px solid var(--green)",
                  }}
                >
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>{t.subjectIcon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: ".85rem" }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{t.subject}</div>
                  </div>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 8,
                      background: "rgba(34,197,94,.12)",
                      color: "var(--green)",
                      fontSize: ".7rem",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Done
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </Panel>

      {/* ── Company Preparation ── */}
      <Panel
        title="Company Preparation"
        icon={Building2}
        action={
          <button
            className="primary-btn"
            onClick={() => setAddingCompany((v) => !v)}
            style={{
              padding: "5px 14px",
              fontSize: ".78rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Plus size={14} /> Add Company
          </button>
        }
      >
        {/* Add company input */}
        {addingCompany && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              className="form-input"
              placeholder="Company name (e.g. Infosys, Wipro, TCS, Google…)"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCompany()}
              style={{ flex: 1 }}
            />
            <button className="primary-btn" onClick={addCompany} disabled={!newCompany.trim()}>
              Add
            </button>
            <button className="secondary-btn" onClick={() => setAddingCompany(false)}>
              Cancel
            </button>
          </div>
        )}

        {targetCompanies.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="No target companies added"
            desc="Add companies you're preparing for and track your readiness"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {targetCompanies.map((co) => {
              const done = co.checklist.filter((t) => t.done).length;
              const total = co.checklist.length;
              const pct = Math.round((done / total) * 100);

              return (
                <div key={co.id} className="glass-card" style={{ overflow: "hidden" }}>
                  {/* Company header */}
                  <button
                    onClick={() => setExpandedCompany(expandedCompany === co.id ? null : co.id)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        background: "rgba(255,255,255,.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                        flexShrink: 0,
                      }}
                    >
                      🏢
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: ".9rem" }}>
                          {co.name}
                        </span>
                        <span style={{ fontSize: ".8rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: pct >= 80 ? "var(--green)" : "var(--cyan)" }}>
                          {done}/{total}
                        </span>
                      </div>
                      <ProgressBar value={pct} tone={pct >= 80 ? "green" : "cyan"} showPct={false} size="sm" />
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
                      {expandedCompany === co.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeCompany(co.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </button>

                  {/* Checklist */}
                  {expandedCompany === co.id && (
                    <div
                      style={{
                        borderTop: "1px solid rgba(255,255,255,.06)",
                        padding: "10px 16px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {co.checklist.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => toggleCompanyTask(co.id, task.id)}
                          style={{
                            background: task.done ? "rgba(34,197,94,.06)" : "rgba(255,255,255,.02)",
                            border: `1px solid ${task.done ? "rgba(34,197,94,.2)" : "rgba(255,255,255,.06)"}`,
                            borderRadius: 7,
                            cursor: "pointer",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: 17,
                              height: 17,
                              borderRadius: 4,
                              border: `1.5px solid ${task.done ? "var(--green)" : "rgba(255,255,255,.2)"}`,
                              background: task.done ? "var(--green)" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {task.done && (
                              <Check size={10} style={{ color: "#000", strokeWidth: 3 }} />
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: ".83rem",
                              color: task.done ? "var(--text-muted)" : "var(--text-primary)",
                              textDecoration: task.done ? "line-through" : "none",
                            }}
                          >
                            {task.task}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
