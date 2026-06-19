import React, { useState, useMemo } from "react";
import { ACHIEVEMENTS, checkAchievements, getLevelInfo } from "../utils.js";
import { Lock, Star, Trophy, Zap, Filter } from "lucide-react";

const TIERS = ["All", "Bronze", "Silver", "Gold", "Platinum", "Legendary"];

const TIER_CONFIG = {
  bronze:   { color: "#cd7f32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.3)", glow: "rgba(205,127,50,0.2)" },
  silver:   { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", border: "rgba(156,163,175,0.3)", glow: "rgba(156,163,175,0.2)" },
  gold:     { color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", glow: "rgba(251,191,36,0.25)" },
  platinum: { color: "#e5e4e2", bg: "rgba(229,228,226,0.1)", border: "rgba(229,228,226,0.25)", glow: "rgba(229,228,226,0.15)" },
  legendary:{ color: "#8b5cf6", bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.5)", glow: "rgba(139,92,246,0.3)" },
};

export default function Achievements({ state, setState, onNav, onXP }) {
  const [filterTier, setFilterTier] = useState("All");

  const earned = new Set(state.gamification?.achievements || []);
  const totalXPFromAch = ACHIEVEMENTS
    .filter(a => earned.has(a.id))
    .reduce((s, a) => s + a.xp, 0);

  const filtered = filterTier === "All"
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.tier === filterTier.toLowerCase());

  const unlocked = ACHIEVEMENTS.filter(a => earned.has(a.id));
  const locked   = ACHIEVEMENTS.filter(a => !earned.has(a.id));
  const progress = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  // Next closest achievement (fewest requirements)
  const nextTargets = locked.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 style={{ fontFamily:"var(--font-head)", fontSize:26, fontWeight:800 }}>
              🏆 Achievements
            </h1>
            <p style={{ color:"var(--text-3)", marginTop:4 }}>
              {unlocked.length} unlocked · {locked.length} locked · {totalXPFromAch} XP earned
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stat-grid-4" style={{ marginBottom:24 }}>
        {[
          { label:"Unlocked", value: unlocked.length, color:"#10b981", bg:"rgba(16,185,129,0.1)" },
          { label:"Locked",   value: locked.length,   color:"var(--text-4)", bg:"var(--surface-2)" },
          { label:"XP Earned",value: `${totalXPFromAch}`, color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
          { label:"Progress", value: `${progress}%`,  color:"#6366f1", bg:"rgba(99,102,241,0.1)" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: s.bg, border:`1px solid ${s.color}30` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="panel" style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700 }}>Overall Achievement Progress</div>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--indigo)" }}>{unlocked.length} / {ACHIEVEMENTS.length}</div>
        </div>
        <div className="progress-bar progress-bar-lg">
          <div className="progress-bar-fill" style={{ width:`${progress}%` }} />
        </div>
        <div style={{ fontSize:12, color:"var(--text-3)", marginTop:6 }}>
          {ACHIEVEMENTS.length - unlocked.length} achievements remaining to unlock
        </div>
      </div>

      {/* Recently unlocked */}
      {unlocked.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div className="section-title">⭐ Recently Unlocked</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {unlocked.slice(-3).reverse().map(a => {
              const tc = TIER_CONFIG[a.tier];
              return (
                <div key={a.id} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                  background: tc.bg, border:`1px solid ${tc.border}`,
                  borderRadius:"var(--r-lg)", boxShadow:`0 0 12px ${tc.glow}`
                }}>
                  <span style={{ fontSize:24 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{a.title}</div>
                    <div style={{ fontSize:11, color:"var(--text-3)" }}>+{a.xp} XP · {a.tier}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next targets */}
      {locked.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div className="section-title">🎯 Next to Unlock</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {nextTargets.map(a => (
              <div key={a.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                background:"var(--surface)", border:"1px solid var(--border)",
                borderRadius:"var(--r-lg)", opacity:0.8, filter:"grayscale(0.3)"
              }}>
                <span style={{ fontSize:24, opacity:0.4 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:"var(--text-2)" }}>{a.title}</div>
                  <div style={{ fontSize:11, color:"var(--text-3)" }}>{a.desc}</div>
                </div>
                <Lock size={14} color="var(--text-4)" style={{ marginLeft:4 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier filters */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {TIERS.map(t => (
          <button
            key={t}
            onClick={() => setFilterTier(t)}
            style={{
              padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600,
              cursor:"pointer", border:"1px solid",
              background: filterTier === t ? "var(--indigo)" : "var(--surface)",
              color: filterTier === t ? "#fff" : "var(--text-3)",
              borderColor: filterTier === t ? "var(--indigo)" : "var(--border)",
              transition:"all 0.15s"
            }}
          >
            {t} {t !== "All" && `(${ACHIEVEMENTS.filter(a=>a.tier===t.toLowerCase()).filter(a=>earned.has(a.id)).length}/${ACHIEVEMENTS.filter(a=>a.tier===t.toLowerCase()).length})`}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:14 }}>
        {filtered.map(a => {
          const isUnlocked = earned.has(a.id);
          const tc = TIER_CONFIG[a.tier];
          return (
            <div
              key={a.id}
              className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
              style={{
                background: isUnlocked ? tc.bg : "rgba(10,10,20,0.4)",
                border: `1px solid ${isUnlocked ? tc.border : "rgba(99,102,241,0.08)"}`,
                boxShadow: isUnlocked ? `0 0 20px ${tc.glow}` : "none",
                borderRadius:"var(--r-xl)", padding:20,
                display:"flex", flexDirection:"column", alignItems:"center",
                gap:8, textAlign:"center", position:"relative",
                transition:"all 0.2s",
              }}
            >
              <div style={{ fontSize:36, opacity: isUnlocked ? 1 : 0.3 }}>{a.icon}</div>

              {/* Tier badge */}
              <span style={{
                padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.06em",
                background: isUnlocked ? tc.bg : "var(--surface-2)",
                color: isUnlocked ? tc.color : "var(--text-4)",
                border: `1px solid ${isUnlocked ? tc.border : "var(--border)"}`,
              }}>{a.tier}</span>

              <div style={{ fontWeight:700, fontSize:13, color: isUnlocked ? "var(--text)" : "var(--text-3)" }}>{a.title}</div>
              <div style={{ fontSize:11, color:"var(--text-3)", lineHeight:1.5 }}>{a.desc}</div>
              <div style={{ fontSize:12, fontWeight:700, color: isUnlocked ? "#f59e0b" : "var(--text-4)" }}>
                {isUnlocked ? `+${a.xp} XP ✓` : `🔒 ${a.xp} XP`}
              </div>

              {/* Lock overlay */}
              {!isUnlocked && (
                <div style={{
                  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(7,7,15,0.5)", borderRadius:"inherit"
                }}>
                  <Lock size={22} color="var(--text-4)" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty tier filter */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize:40 }}>🔒</div>
          <div className="empty-state-title">No {filterTier} achievements yet</div>
          <div className="empty-state-desc">Keep progressing to unlock these achievements!</div>
        </div>
      )}
    </div>
  );
}
