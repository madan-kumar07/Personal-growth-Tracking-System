import { useState, useEffect, useRef, useCallback } from "react";

const API = "/api";

// ─── useAutoSave ──────────────────────────────────────────────────────────────
// Debounced auto-save to backend. Returns saveStatus: 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(state, delay = 800) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const timerRef    = useRef(null);
  const mountedRef  = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (!state || !state.onboarded) return;

    setSaveStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/state`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(state)
        });
        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
        // Also cache locally
        try { localStorage.setItem("lifeos-cache", JSON.stringify({ state, savedAt: Date.now() })); } catch(_) {}
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (err) {
        setSaveStatus("error");
        // Fallback: cache locally anyway
        try { localStorage.setItem("lifeos-cache", JSON.stringify({ state, savedAt: Date.now() })); } catch(_) {}
        setTimeout(() => setSaveStatus("idle"), 4000);
      }
    }, delay);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state]);

  return saveStatus;
}

// ─── useLocalCache ────────────────────────────────────────────────────────────
// Returns cached state from localStorage while API loads

export function useLocalCache() {
  try {
    const raw = localStorage.getItem("lifeos-cache");
    if (!raw) return null;
    const { state, savedAt } = JSON.parse(raw);
    const age = Date.now() - savedAt;
    if (age > 24 * 3600 * 1000) return null; // ignore if > 24h old
    return state;
  } catch {
    return null;
  }
}

// ─── useDebounce ──────────────────────────────────────────────────────────────

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── usePomodoroTimer ─────────────────────────────────────────────────────────

export function usePomodoroTimer(workMin = 25, breakMin = 5) {
  const [mode, setMode]       = useState("work"); // 'work' | 'break'
  const [seconds, setSeconds] = useState(workMin * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setMode("work");
    setSeconds(workMin * 60);
  }, [workMin]);

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (mode === "work") {
            setSessions(n => n + 1);
            setMode("break");
            setSeconds(breakMin * 60);
            try { new Audio("data:audio/wav;base64,").play(); } catch(_) {}
          } else {
            setMode("work");
            setSeconds(workMin * 60);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode, workMin, breakMin]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return { mode, display: `${mins}:${secs}`, running, sessions, start, pause, reset, seconds };
}

// ─── useStopwatch ─────────────────────────────────────────────────────────────

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setElapsed(0); }, []);

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");

  return { elapsed, display: `${h}:${m}:${s}`, running, start, pause, reset };
}

// ─── useXPToast ───────────────────────────────────────────────────────────────

export function useXPToast() {
  const [toasts, setToasts] = useState([]);

  const showXP = useCallback((amount, label = "") => {
    const id = Date.now();
    setToasts(t => [...t, { id, amount, label }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return { toasts, showXP };
}
