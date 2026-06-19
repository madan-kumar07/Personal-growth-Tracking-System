import React, { useState, useMemo } from "react";
import {
  BookOpen, Mic2, Globe, Plus, Trash2, Search, Star,
  TrendingUp, CheckCircle2, BarChart3, RefreshCw, Volume2,
  Target, Award, ChevronDown, ChevronRight, MessageSquare,
  Lightbulb, Clock3
} from "lucide-react";
import { Panel, ProgressBar, Ring, EmptyState } from "../components/ui.jsx";
import { BarChart, LineChart } from "../components/charts.jsx";
import { todayISO, getLast7Days, DAYS_SHORT, formatDate, computeEnglishScore } from "../utils.js";

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

function LineGraph({ data, tone, height }) {
  const toneColors = {
    cyan: "var(--cyan)",
    indigo: "var(--indigo)",
    purple: "var(--purple)",
    emerald: "var(--emerald)"
  };
  return <LineChart data={data} color={toneColors[tone] || "var(--indigo)"} height={height} />;
}

const API = "/api";

// ── Built-in Speaking Topics ──────────────────────────────────────────────────

const DEFAULT_SPEAKING_TOPICS = [
  "Introduce yourself in 60 seconds",
  "Describe your dream job and why",
  "Talk about your college experience so far",
  "Explain a recent project you worked on",
  "What is your biggest strength and weakness?",
  "Describe a challenge you overcame",
  "What motivates you to learn programming?",
  "Talk about your favourite technology or tool",
  "Where do you see yourself in 5 years?",
  "Explain REST APIs to a non-technical person",
  "Describe your daily study routine",
  "What makes a great software engineer?",
  "Talk about teamwork and collaboration",
  "Explain the importance of clean code",
  "Describe a time you had to debug a tough problem",
  "What are your hobbies outside of coding?",
  "Talk about open-source software and its importance",
  "How do you handle deadlines and pressure?",
  "Describe your learning strategy for new technologies",
  "What is your approach to problem-solving?",
];

// ── Built-in Grammar Exercises ────────────────────────────────────────────────

const GRAMMAR_EXERCISES = [
  {
    id: 1,
    question: "Which sentence is grammatically correct?",
    options: [
      "She don't know the answer.",
      "She doesn't know the answer.",
      "She not know the answer.",
      "She doesn't knows the answer.",
    ],
    answer: 1,
    explanation: "Use 'doesn't' (does + not) with third-person singular subjects.",
  },
  {
    id: 2,
    question: "Fill in the blank: I _____ coding for 3 years now.",
    options: ["am", "have been", "was", "had been"],
    answer: 1,
    explanation: "'Have been' is the present perfect continuous — used for ongoing actions that started in the past.",
  },
  {
    id: 3,
    question: "Which is the correct use of 'affect' vs 'effect'?",
    options: [
      "The bug effected the performance.",
      "The bug affected the performance.",
      "The bug effects the performance.",
      "The bug have affected the performance.",
    ],
    answer: 1,
    explanation: "'Affect' is the verb; 'effect' is usually the noun.",
  },
  {
    id: 4,
    question: "Choose the correct sentence:",
    options: [
      "Their going to the interview tomorrow.",
      "They're going to the interview tomorrow.",
      "There going to the interview tomorrow.",
      "Theyre going to the interview tomorrow.",
    ],
    answer: 1,
    explanation: "'They're' = 'they are'. 'Their' = possession. 'There' = place.",
  },
  {
    id: 5,
    question: "Which sentence uses the past perfect correctly?",
    options: [
      "She had submitted the report before the deadline.",
      "She has submitted the report before the deadline.",
      "She submitted the report before the deadline had.",
      "She had submitted the report before deadline.",
    ],
    answer: 0,
    explanation: "Past perfect: had + past participle — for actions completed before another past event.",
  },
  {
    id: 6,
    question: "Select the correct comparative form:",
    options: [
      "Python is more easier than Java.",
      "Python is easyer than Java.",
      "Python is easier than Java.",
      "Python is more easy than Java.",
    ],
    answer: 2,
    explanation: "One-syllable adjectives: add -er. 'Easy' → 'easier'. Don't use 'more' with -er.",
  },
  {
    id: 7,
    question: "Identify the passive voice sentence:",
    options: [
      "The team deployed the application.",
      "The application was deployed by the team.",
      "They are deploying the application.",
      "The team has deployed the application.",
    ],
    answer: 1,
    explanation: "Passive voice: subject receives the action (was + past participle).",
  },
  {
    id: 8,
    question: "Which article is correct? '_____ algorithm I wrote is efficient.'",
    options: ["A", "An", "The", "No article needed"],
    answer: 2,
    explanation: "'The' is used for specific, already-known items. We're referring to a specific algorithm.",
  },
  {
    id: 9,
    question: "Choose the sentence with correct subject-verb agreement:",
    options: [
      "The list of tasks are complete.",
      "The list of tasks is complete.",
      "The list of task is complete.",
      "The lists of tasks are completing.",
    ],
    answer: 1,
    explanation: "The subject is 'list' (singular), so use 'is'. 'Of tasks' is a prepositional phrase.",
  },
  {
    id: 10,
    question: "Which sentence correctly uses a conditional?",
    options: [
      "If I will study hard, I will pass.",
      "If I study hard, I will pass.",
      "If I studied hard, I will pass.",
      "If I study hard, I would pass.",
    ],
    answer: 1,
    explanation: "First conditional (real future): If + present simple, will + base verb.",
  },
];

// ── Daily English Tips ────────────────────────────────────────────────────────

const DAILY_TIPS = [
  "Read tech articles in English for 15 minutes daily — it improves vocabulary and comprehension.",
  "Record yourself speaking for 1 minute, then listen back. This reveals pronunciation patterns.",
  "Learn 5 new vocabulary words daily using spaced repetition.",
  "Watch 1 English YouTube video without subtitles to train your ears.",
  "Write a short paragraph about what you coded today — in English.",
  "Practice 'think in English' — avoid translating from your native language.",
  "Use Grammarly or LanguageTool to check your written English every time.",
  "Shadow a speaker: listen and repeat exactly what they say, including rhythm and intonation.",
  "Learn 3 formal and 3 informal synonyms for common words like 'good', 'help', 'use'.",
  "Join an English-speaking Discord community for developers.",
  "Practice answering HR interview questions aloud every day.",
  "Read aloud for 10 minutes to improve fluency and pronunciation.",
  "Focus on signal words in sentences: 'however', 'therefore', 'although' — they show relationships.",
  "Speak slowly and clearly — speed is not fluency; precision is.",
  "Every week, learn one English idiom commonly used in professional settings.",
];

// ─────────────────────────────────────────────────────────────────────────────
// Communication Score Ring
// ─────────────────────────────────────────────────────────────────────────────

function ScoreRingSection({ score, sessions = [], vocabulary = [] }) {
  const sessionScore = Math.min(50, sessions.length * 2);
  const vocabScore = Math.min(50, vocabulary.length);

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: 28,
        flexWrap: "wrap",
      }}
    >
      <Ring value={score} size={120} tone="purple" label="Score" />
      <div style={{ flex: 1, minWidth: 200 }}>
        <h3
          style={{
            fontFamily: "var(--font-head)",
            fontSize: "1.1rem",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Communication Score
        </h3>
        <p style={{ fontSize: ".82rem", color: "var(--text-muted)", marginBottom: 14 }}>
          {score === 0
            ? "Start logging sessions and adding vocabulary to build your score."
            : score < 30
            ? "Good start! Keep practising speaking and expanding your vocabulary."
            : score < 60
            ? "Solid progress! Focus on consistency — daily practice compounds fast."
            : score < 80
            ? "Great communication skills developing! You're becoming confident."
            : "Excellent! Near-native communication skills. Keep the streak alive!"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ProgressBar
            value={sessionScore * 2}
            label={`Sessions score (${sessions.length} sessions)`}
            tone="purple"
            showPct={false}
          />
          <ProgressBar
            value={vocabScore * 2}
            label={`Vocabulary score (${vocabulary.length} words)`}
            tone="cyan"
            showPct={false}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Vocabulary Quiz Mode
// ─────────────────────────────────────────────────────────────────────────────

function VocabQuiz({ vocabulary }) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  if (!vocabulary.length) {
    return (
      <EmptyState
        icon="🧠"
        title="No vocabulary to quiz"
        desc="Add at least one word to start the quiz"
      />
    );
  }

  const word = vocabulary[idx % vocabulary.length];

  function check() {
    if (!answer.trim()) return;
    const correct =
      answer.trim().toLowerCase().includes(word.meaning.toLowerCase().slice(0, 6)) ||
      word.meaning.toLowerCase().includes(answer.trim().toLowerCase());
    setResult(correct ? "correct" : "wrong");
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
  }

  function next() {
    setIdx((i) => i + 1);
    setAnswer("");
    setResult(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Score strip */}
      <div style={{ display: "flex", gap: 16, fontSize: ".8rem" }}>
        <span style={{ color: "var(--green)", fontWeight: 700 }}>
          ✓ {score.correct} correct
        </span>
        <span style={{ color: "var(--red, #ef4444)", fontWeight: 700 }}>
          ✗ {score.wrong} wrong
        </span>
        <span style={{ color: "var(--text-muted)" }}>
          Word {(idx % vocabulary.length) + 1} / {vocabulary.length}
        </span>
      </div>

      {/* Word card */}
      <div
        className="glass-card"
        style={{
          padding: "24px",
          textAlign: "center",
          borderLeft: "3px solid var(--purple)",
        }}
      >
        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--purple)", marginBottom: 6 }}>
          {word.word}
        </div>
        {word.example && (
          <div style={{ fontSize: ".78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            "{word.example}"
          </div>
        )}
      </div>

      {/* Answer input */}
      {result === null ? (
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="form-input"
            placeholder="Type the meaning…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            style={{ flex: 1 }}
          />
          <button
            className="primary-btn"
            onClick={check}
            disabled={!answer.trim()}
          >
            Check
          </button>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: "12px 16px",
            borderLeft: `3px solid ${result === "correct" ? "var(--green)" : "var(--amber)"}`,
          }}
        >
          <div style={{ fontWeight: 700, color: result === "correct" ? "var(--green)" : "var(--amber)", marginBottom: 4 }}>
            {result === "correct" ? "✓ Correct!" : "✗ Not quite!"}
          </div>
          <div style={{ fontSize: ".82rem", color: "var(--text-primary)" }}>
            <strong>Meaning:</strong> {word.meaning}
          </div>
          <button
            className="primary-btn"
            onClick={next}
            style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} /> Next Word
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grammar Practice
// ─────────────────────────────────────────────────────────────────────────────

function GrammarPractice() {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const q = GRAMMAR_EXERCISES[qIdx % GRAMMAR_EXERCISES.length];

  function select(i) {
    if (revealed) return;
    setSelected(i);
  }

  function submit() {
    if (selected === null) return;
    setRevealed(true);
    const correct = selected === q.answer;
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
  }

  function nextQ() {
    setQIdx((i) => (i + 1) % GRAMMAR_EXERCISES.length);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Score + progress */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
          Q{(qIdx % GRAMMAR_EXERCISES.length) + 1} / {GRAMMAR_EXERCISES.length}
        </span>
        <span style={{ fontSize: ".8rem", color: "var(--green)", fontWeight: 700 }}>
          ✓ {score.correct}
        </span>
        <span style={{ fontSize: ".8rem", color: "var(--amber)", fontWeight: 700 }}>
          ✗ {score.wrong}
        </span>
        <span style={{ flex: 1 }} />
        <button
          className="secondary-btn"
          onClick={() => { setQIdx(0); setSelected(null); setRevealed(false); setScore({ correct: 0, wrong: 0 }); }}
          style={{ padding: "4px 12px", fontSize: ".75rem", display: "flex", alignItems: "center", gap: 4 }}
        >
          <RefreshCw size={12} /> Restart
        </button>
      </div>

      {/* Question */}
      <div
        className="glass-card"
        style={{ padding: "16px 18px", borderLeft: "3px solid var(--purple)" }}
      >
        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: ".9rem" }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          let borderColor = "rgba(255,255,255,.08)";
          let bg = "rgba(255,255,255,.03)";
          if (revealed) {
            if (i === q.answer) { borderColor = "var(--green)"; bg = "rgba(34,197,94,.08)"; }
            else if (i === selected && i !== q.answer) { borderColor = "var(--amber)"; bg = "rgba(245,158,11,.08)"; }
          } else if (selected === i) {
            borderColor = "var(--purple)";
            bg = "rgba(168,85,247,.1)";
          }

          return (
            <button
              key={i}
              onClick={() => select(i)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: bg,
                color: "var(--text-primary)",
                cursor: revealed ? "default" : "pointer",
                fontSize: ".84rem",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".72rem",
                  fontWeight: 700,
                  color: revealed && i === q.answer ? "var(--green)" : "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {revealed && i === q.answer && (
                <CheckCircle2 size={15} style={{ color: "var(--green)", marginLeft: "auto" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div
          className="glass-card"
          style={{
            padding: "12px 14px",
            borderLeft: "3px solid var(--cyan)",
            fontSize: ".82rem",
          }}
        >
          <div style={{ fontWeight: 700, color: "var(--cyan)", marginBottom: 4 }}>
            💡 Explanation
          </div>
          <div style={{ color: "var(--text-secondary)" }}>{q.explanation}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        {!revealed ? (
          <button
            className="primary-btn"
            onClick={submit}
            disabled={selected === null}
          >
            Submit Answer
          </button>
        ) : (
          <button
            className="primary-btn"
            onClick={nextQ}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ChevronRight size={15} /> Next Question
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main English Page
// ─────────────────────────────────────────────────────────────────────────────

export default function English({ state, setState, onNav, onXP }) {
  const english = state.english || {};
  const vocabulary = english.vocabulary || [];
  const sessions = english.sessions || [];
  const speakingTopics = english.speakingTopics?.length
    ? english.speakingTopics
    : DEFAULT_SPEAKING_TOPICS;
  const confidenceScore = english.confidenceScore || 0;

  const score = computeEnglishScore(english);
  const today = todayISO();
  const last7 = getLast7Days();

  // Today's speaking topic
  const [topicIdx, setTopicIdx] = useState(
    () => Math.floor(Math.random() * speakingTopics.length)
  );
  const currentTopic = speakingTopics[topicIdx % speakingTopics.length];

  // Vocabulary state
  const [vocabWord, setVocabWord] = useState("");
  const [vocabMeaning, setVocabMeaning] = useState("");
  const [vocabExample, setVocabExample] = useState("");
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabTab, setVocabTab] = useState("list"); // 'list' | 'quiz'

  // Session log
  const [sessionType, setSessionType] = useState("speaking");
  const [sessionDuration, setSessionDuration] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  // Grammar tab visibility
  const [showGrammar, setShowGrammar] = useState(false);

  // Daily tip (by day of week)
  const tipIdx = new Date().getDay() + new Date().getDate();
  const dailyTip = DAILY_TIPS[tipIdx % DAILY_TIPS.length];

  // ── Computed Stats ──

  const weekSessions = sessions.filter((s) => last7.includes(s.date));
  const speakingSessions = sessions.filter((s) => s.type === "speaking").length;
  const wordsThisWeek = vocabulary.filter((v) => last7.includes(v.date)).length;

  // Sessions per day bar data
  const weekBarData = last7.map((d, i) => ({
    label: DAYS_SHORT[new Date(d).getDay()],
    value: sessions.filter((s) => s.date === d).length,
  }));

  // Filtered vocab
  const filteredVocab = vocabSearch
    ? vocabulary.filter(
        (v) =>
          v.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
          v.meaning.toLowerCase().includes(vocabSearch.toLowerCase())
      )
    : vocabulary;

  // ── Handlers ──

  function markTopicPracticed() {
    const session = {
      id: `es-${Date.now()}`,
      date: today,
      type: "speaking",
      duration: 5,
      notes: `Practiced topic: ${currentTopic}`,
    };
    setState((cur) => ({
      ...cur,
      english: {
        ...cur.english,
        sessions: [session, ...(cur.english?.sessions || [])],
      },
    }));
    onXP?.(20, "Speaking Practice");
    setTopicIdx((i) => i + 1);
  }

  function addVocabWord() {
    if (!vocabWord.trim() || !vocabMeaning.trim()) return;
    const word = {
      id: `v-${Date.now()}`,
      date: today,
      word: vocabWord.trim(),
      meaning: vocabMeaning.trim(),
      example: vocabExample.trim(),
    };
    setState((cur) => ({
      ...cur,
      english: {
        ...cur.english,
        vocabulary: [word, ...(cur.english?.vocabulary || [])],
      },
    }));
    onXP?.(5, `New word: ${vocabWord}`);
    setVocabWord("");
    setVocabMeaning("");
    setVocabExample("");
  }

  function removeVocabWord(id) {
    setState((cur) => ({
      ...cur,
      english: {
        ...cur.english,
        vocabulary: (cur.english?.vocabulary || []).filter((v) => v.id !== id),
      },
    }));
  }

  async function logSession() {
    if (!sessionDuration || Number(sessionDuration) <= 0) return;
    const session = {
      id: `es-${Date.now()}`,
      date: today,
      type: sessionType,
      duration: Number(sessionDuration),
      notes: sessionNotes.trim(),
    };

    try {
      const res = await fetch(`${API}/english/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        } else {
          setState((cur) => ({
            ...cur,
            english: {
              ...cur.english,
              sessions: [session, ...(cur.english?.sessions || [])],
            },
          }));
        }
        if (data.xpGained) onXP?.(data.xpGained, `${sessionType} practice`);
        else onXP?.(15, `${sessionType} practice`);
      } else {
        throw new Error();
      }
    } catch {
      setState((cur) => ({
        ...cur,
        english: {
          ...cur.english,
          sessions: [session, ...(cur.english?.sessions || [])],
        },
      }));
      onXP?.(15, `${sessionType} practice`);
    }

    setSessionDuration("");
    setSessionNotes("");
  }

  function updateConfidence(val) {
    setState((cur) => ({
      ...cur,
      english: { ...cur.english, confidenceScore: Number(val) },
    }));
  }

  // ── Render ──

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 14,
        }}
      >
        {[
          { icon: Star,      label: "English Score",    value: score,              tone: "purple" },
          { icon: Clock3,    label: "Total Sessions",   value: sessions.length,    tone: "cyan"   },
          { icon: BookOpen,  label: "Vocabulary Words", value: vocabulary.length,  tone: "green"  },
          { icon: Mic2,      label: "Speaking Sessions",value: speakingSessions,   tone: "amber"  },
          { icon: Target,    label: "This Week",        value: `${weekSessions.length} sessions`, tone: "blue" },
        ].map((s) => (
          <MiniStat key={s.label} icon={s.icon} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      {/* ── Communication Score Ring ── */}
      <ScoreRingSection
        score={score}
        sessions={sessions}
        vocabulary={vocabulary}
      />

      {/* ── Speaking Topic + Log Session ── */}
      <div
        className="grid-2"
        style={{ gap: 20 }}
      >
        {/* Daily Speaking Topic */}
        <Panel title="Daily Speaking Topic" icon={Mic2}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              className="glass-card"
              style={{
                padding: "20px",
                textAlign: "center",
                borderLeft: "3px solid var(--purple)",
              }}
            >
              <div
                style={{
                  fontSize: ".68rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                Today's Topic
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.4,
                }}
              >
                {currentTopic}
              </div>
              <p
                style={{
                  fontSize: ".75rem",
                  color: "var(--text-muted)",
                  marginTop: 10,
                }}
              >
                Speak for 60–90 seconds. Record yourself and review.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="primary-btn"
                onClick={markTopicPracticed}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <CheckCircle2 size={15} /> Mark Practiced (+20 XP)
              </button>
              <button
                className="secondary-btn"
                onClick={() =>
                  setTopicIdx((i) => (i + 1) % speakingTopics.length)
                }
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} /> Next
              </button>
            </div>
          </div>
        </Panel>

        {/* Log Session */}
        <Panel title="Log English Session" icon={Plus}>
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
                  Session Type
                </label>
                <select
                  className="form-select"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {["speaking", "listening", "reading", "writing"].map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
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
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  className="form-input"
                  placeholder="e.g. 30"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <textarea
              className="form-textarea"
              placeholder="Session notes: what you practiced, resources used…"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
            <button
              className="primary-btn"
              onClick={logSession}
              disabled={!sessionDuration}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <CheckCircle2 size={16} /> Log Session
            </button>
          </div>
        </Panel>
      </div>

      {/* ── Confidence Score + Sessions per week ── */}
      <div
        className="grid-2"
        style={{ gap: 20 }}
      >
        <Panel title="Speaking Confidence Score" icon={Volume2}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--text-secondary)", fontSize: ".85rem" }}>
                Confidence Level
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-mono)",
                  color:
                    confidenceScore >= 70
                      ? "var(--green)"
                      : confidenceScore >= 40
                      ? "var(--amber)"
                      : "var(--purple)",
                }}
              >
                {confidenceScore}/100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceScore}
              onChange={(e) => updateConfidence(e.target.value)}
              style={{ width: "100%" }}
            />
            <ProgressBar
              value={confidenceScore}
              tone={
                confidenceScore >= 70
                  ? "green"
                  : confidenceScore >= 40
                  ? "amber"
                  : "purple"
              }
              showPct={false}
              animated
            />
            <div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>
              {confidenceScore === 0
                ? "Rate your speaking confidence from 0 to 100"
                : confidenceScore < 30
                ? "Keep practising — confidence grows with repetition."
                : confidenceScore < 60
                ? "Building well! Focus on speaking without hesitation."
                : confidenceScore < 80
                ? "Good confidence! Work on intonation and vocabulary now."
                : "Excellent confidence! You're nearly interview-ready. 🎉"}
            </div>
          </div>
        </Panel>

        <Panel title="Sessions This Week" icon={BarChart3}>
          {weekSessions.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No sessions this week"
              desc="Log daily English sessions to build the habit"
            />
          ) : (
            <BarGraph data={weekBarData} tone="purple" height={130} />
          )}
        </Panel>
      </div>

      {/* ── Vocabulary Builder ── */}
      <Panel
        title="Vocabulary Builder"
        icon={BookOpen}
        action={
          <div style={{ display: "flex", gap: 6 }}>
            {["list", "quiz"].map((tab) => (
              <button
                key={tab}
                className={vocabTab === tab ? "primary-btn" : "secondary-btn"}
                onClick={() => setVocabTab(tab)}
                style={{ padding: "4px 12px", fontSize: ".75rem" }}
              >
                {tab === "list" ? "📚 Word List" : "🧠 Quiz Mode"}
              </button>
            ))}
          </div>
        }
      >
        {vocabTab === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Add word form */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              <div>
                <label
                  style={{ fontSize: ".72rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}
                >
                  Word
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Proficient"
                  value={vocabWord}
                  onChange={(e) => setVocabWord(e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{ fontSize: ".72rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}
                >
                  Meaning
                </label>
                <input
                  className="form-input"
                  placeholder="Definition"
                  value={vocabMeaning}
                  onChange={(e) => setVocabMeaning(e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{ fontSize: ".72rem", color: "var(--text-muted)", marginBottom: 4, display: "block" }}
                >
                  Example (optional)
                </label>
                <input
                  className="form-input"
                  placeholder="Example sentence"
                  value={vocabExample}
                  onChange={(e) => setVocabExample(e.target.value)}
                />
              </div>
              <button
                className="primary-btn"
                onClick={addVocabWord}
                disabled={!vocabWord.trim() || !vocabMeaning.trim()}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <Plus size={15} /> Add
              </button>
            </div>

            {/* Stats bar */}
            <div
              style={{
                display: "flex",
                gap: 20,
                fontSize: ".8rem",
                color: "var(--text-muted)",
              }}
            >
              <span>
                📚 <strong style={{ color: "var(--text-primary)" }}>{vocabulary.length}</strong> words total
              </span>
              <span>
                📅 <strong style={{ color: "var(--cyan)" }}>{wordsThisWeek}</strong> added this week
              </span>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                className="form-input"
                placeholder="Search vocabulary…"
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                style={{ paddingLeft: 34, width: "100%" }}
              />
            </div>

            {/* Word list */}
            {vocabulary.length === 0 ? (
              <EmptyState
                icon="📖"
                title="No vocabulary words yet"
                desc="Add your first word above to start building your vocabulary"
              />
            ) : filteredVocab.length === 0 ? (
              <EmptyState icon="🔍" title="No results" desc={`No words match "${vocabSearch}"`} />
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
                {filteredVocab.map((v) => (
                  <div
                    key={v.id}
                    className="glass-card"
                    style={{ padding: "10px 14px", display: "flex", gap: 14, alignItems: "flex-start" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: "var(--purple)", fontSize: ".9rem" }}>
                          {v.word}
                        </span>
                        <span style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>
                          {formatDate(v.date)}
                        </span>
                      </div>
                      <div style={{ fontSize: ".82rem", color: "var(--text-secondary)", marginBottom: v.example ? 4 : 0 }}>
                        {v.meaning}
                      </div>
                      {v.example && (
                        <div style={{ fontSize: ".75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          "{v.example}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeVocabWord(v.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <VocabQuiz vocabulary={vocabulary} />
        )}
      </Panel>

      {/* ── Grammar Practice ── */}
      <Panel
        title="Grammar Practice"
        icon={Award}
        action={
          <button
            className="secondary-btn"
            onClick={() => setShowGrammar((v) => !v)}
            style={{ padding: "4px 12px", fontSize: ".75rem", display: "flex", alignItems: "center", gap: 4 }}
          >
            {showGrammar ? <><ChevronDown size={14} /> Hide</> : <><ChevronRight size={14} /> Open</>}
          </button>
        }
      >
        {showGrammar ? (
          <GrammarPractice />
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: ".85rem" }}>
            10 built-in grammar exercises. Click "Open" to start practising. ✏️
          </div>
        )}
      </Panel>

      {/* ── Weekly Report ── */}
      <Panel title="Weekly Activity Report" icon={TrendingUp}>
        {weekSessions.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No activity this week"
            desc="Log English sessions daily to see your weekly report"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 10,
              }}
            >
              {[
                { label: "Sessions", value: weekSessions.length, color: "var(--purple)" },
                { label: "Speaking", value: weekSessions.filter((s) => s.type === "speaking").length, color: "var(--cyan)" },
                { label: "Listening", value: weekSessions.filter((s) => s.type === "listening").length, color: "var(--green)" },
                { label: "Reading", value: weekSessions.filter((s) => s.type === "reading").length, color: "var(--amber)" },
                { label: "Writing", value: weekSessions.filter((s) => s.type === "writing").length, color: "var(--blue, #3b82f6)" },
                {
                  label: "Total Minutes",
                  value: weekSessions.reduce((s, x) => s + (x.duration || 0), 0),
                  color: "var(--text-primary)",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="glass-card"
                  style={{ padding: "12px", textAlign: "center" }}
                >
                  <div
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      fontFamily: "var(--font-mono)",
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Last 7 days session list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 250, overflowY: "auto" }}>
              {weekSessions.slice(0, 14).map((s) => (
                <div
                  key={s.id}
                  className="glass-card"
                  style={{
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: ".82rem",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 8,
                      background: "rgba(168,85,247,.15)",
                      color: "var(--purple)",
                      fontSize: ".72rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {s.type}
                  </span>
                  <span style={{ flex: 1, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.notes || "—"}
                  </span>
                  <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                    {s.duration}min
                  </span>
                  <span style={{ color: "var(--text-muted)", flexShrink: 0, fontSize: ".72rem" }}>
                    {formatDate(s.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* ── Daily Tips ── */}
      <Panel title="Daily English Tip" icon={Lightbulb}>
        <div
          className="glass-card"
          style={{
            padding: "18px 20px",
            borderLeft: "3px solid var(--amber)",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontSize: ".88rem", color: "var(--text-primary)", lineHeight: 1.55 }}>
              {dailyTip}
            </div>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {DAILY_TIPS.slice(0, 6).map((tip, i) => (
                <div
                  key={i}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,.06)",
                    fontSize: ".7rem",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    border: i === tipIdx % 6 ? "1px solid var(--amber)" : "1px solid transparent",
                  }}
                  onClick={() => {}}
                >
                  Tip {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
