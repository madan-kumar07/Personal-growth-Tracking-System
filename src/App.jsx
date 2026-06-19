import React, { useEffect, useState, useCallback, lazy, Suspense } from "react";
import {
  LayoutDashboard, Zap, CalendarDays, Flame, Trophy, User,
  Code2, Github, BookOpen, GraduationCap, Briefcase,
  HeartPulse, NotebookPen, Target, Wallet, Brain,
  BarChart3, Wrench, Download, Search, LogOut,
  ChevronLeft, ChevronRight, Sparkles, Menu, X,
  Home, Map as MapIcon
} from "lucide-react";

import "./styles.css";
import { useAutoSave, useLocalCache, useXPToast } from "./hooks.js";
import { getLevelInfo, computeDayNumber, checkAchievements } from "./utils.js";
import { XPBar, DayCounter } from "./components/ui.jsx";
import Onboarding from "./components/Onboarding.jsx";

const API = "/api";

// ─── Lazy-load all pages ──────────────────────────────────────────────────────
const Dashboard    = lazy(() => import("./pages/Dashboard.jsx"));
const Missions     = lazy(() => import("./pages/Missions.jsx"));
const Calendar     = lazy(() => import("./pages/Calendar.jsx"));
const Streaks      = lazy(() => import("./pages/Streaks.jsx"));
const Achievements = lazy(() => import("./pages/Achievements.jsx"));
const Profile      = lazy(() => import("./pages/Profile.jsx"));
const Roadmap      = lazy(() => import("./pages/Roadmap.jsx"));
const Coding       = lazy(() => import("./pages/Coding.jsx"));
const English      = lazy(() => import("./pages/English.jsx"));
const Placement    = lazy(() => import("./pages/Placement.jsx"));
const Projects     = lazy(() => import("./pages/Projects.jsx"));
const Health       = lazy(() => import("./pages/Health.jsx"));
const Journal      = lazy(() => import("./pages/Journal.jsx"));
const Goals        = lazy(() => import("./pages/Goals.jsx"));
const Finance      = lazy(() => import("./pages/Finance.jsx"));
const Coach        = lazy(() => import("./pages/Coach.jsx"));
const Analytics    = lazy(() => import("./pages/Analytics.jsx"));
const Tools        = lazy(() => import("./pages/Tools.jsx"));
const Exports      = lazy(() => import("./pages/Exports.jsx"));

// ─── Navigation Config ────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",    label: "Dashboard",       icon: LayoutDashboard, group: "Main"      },
  { id: "missions",     label: "Daily Missions",  icon: Zap,             group: "Main"      },
  { id: "calendar",     label: "365 Calendar",    icon: CalendarDays,    group: "Main"      },
  { id: "streaks",      label: "Streaks",         icon: Flame,           group: "Main"      },
  { id: "achievements", label: "Achievements",    icon: Trophy,          group: "Main"      },
  { id: "profile",      label: "Profile",         icon: User,            group: "Main"      },
  { id: "roadmap",      label: "Roadmap",         icon: MapIcon,         group: "Learning"  },
  { id: "coding",       label: "Coding",          icon: Code2,           group: "Learning"  },
  { id: "english",      label: "English",         icon: BookOpen,        group: "Learning"  },
  { id: "placement",    label: "Placement",       icon: GraduationCap,   group: "Learning"  },
  { id: "projects",     label: "Projects",        icon: Briefcase,       group: "Learning"  },
  { id: "health",       label: "Health",          icon: HeartPulse,      group: "Life"      },
  { id: "journal",      label: "Journal",         icon: NotebookPen,     group: "Life"      },
  { id: "goals",        label: "Goals",           icon: Target,          group: "Life"      },
  { id: "finance",      label: "Finance",         icon: Wallet,          group: "Life"      },
  { id: "coach",        label: "AI Coach",        icon: Brain,           group: "Analytics" },
  { id: "analytics",    label: "Analytics",       icon: BarChart3,       group: "Analytics" },
  { id: "tools",        label: "Tools",           icon: Wrench,          group: "Analytics" },
  { id: "exports",      label: "Export",          icon: Download,        group: "Analytics" },
];
const NAV_GROUPS = ["Main", "Learning", "Life", "Analytics"];

// Bottom nav (mobile quick access)
const BOTTOM_NAV = [
  { id: "dashboard",  icon: Home,          label: "Home"     },
  { id: "missions",   icon: Zap,           label: "Missions" },
  { id: "roadmap",    icon: MapIcon,       label: "Roadmap"  },
  { id: "health",     icon: HeartPulse,    label: "Health"   },
  { id: "coach",      icon: Brain,         label: "Coach"    },
];

// ─── Page Map ─────────────────────────────────────────────────────────────────
const PAGE_MAP = {
  dashboard: Dashboard, missions: Missions, calendar: Calendar,
  streaks: Streaks, achievements: Achievements, profile: Profile,
  roadmap: Roadmap, coding: Coding, english: English,
  placement: Placement, projects: Projects, health: Health,
  journal: Journal, goals: Goals, finance: Finance,
  coach: Coach, analytics: Analytics, tools: Tools, exports: Exports,
};

// ─── XP Toast System ─────────────────────────────────────────────────────────
function XPToastContainer({ toasts }) {
  return (
    <div className="xp-toast-container">
      {toasts.map(t => (
        <div key={t.id} className="xp-toast">
          <Sparkles size={16} color="var(--amber)" />
          <strong>+{t.amount} XP</strong>
          {t.label && <span style={{ color:"var(--text-2)", fontSize:12 }}>{t.label}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Level Up Modal ───────────────────────────────────────────────────────────
function LevelUpModal({ level, title, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal level-up-modal" onClick={e => e.stopPropagation()}>
        <div className="level-up-stars">🌟⭐🌟</div>
        <div style={{ color:"var(--text-3)", fontWeight:700, marginBottom:4, fontSize:14 }}>LEVEL UP!</div>
        <div className="level-up-level">{level}</div>
        <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:700, color:"var(--indigo)", marginTop:4 }}>{title}</div>
        <p style={{ color:"var(--text-3)", fontSize:14, marginTop:12, lineHeight:1.6 }}>
          You're becoming unstoppable. Every level brings you closer to your dream. 🚀
        </p>
        <button className="primary-btn" style={{ marginTop:20, width:"100%", justifyContent:"center" }} onClick={onClose}>
          Keep Going! 💪
        </button>
      </div>
    </div>
  );
}

// ─── Achievement Unlock Banner ─────────────────────────────────────────────────
function AchievementBanner({ achievement, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
      background:"rgba(10,10,28,0.98)", border:"1px solid var(--indigo-glow)",
      borderRadius:"var(--r-xl)", padding:"14px 20px",
      display:"flex", alignItems:"center", gap:12,
      zIndex:1000, boxShadow:"0 0 30px var(--indigo-glow)",
      animation:"toastIn 0.3s ease", minWidth:280,
    }}>
      <span style={{ fontSize:28 }}>{achievement.icon}</span>
      <div>
        <div style={{ fontWeight:700, fontSize:13 }}>Achievement Unlocked!</div>
        <div style={{ color:"var(--text-2)", fontSize:12 }}>{achievement.title}</div>
      </div>
      <button className="icon-btn" style={{ marginLeft:"auto" }} onClick={onClose}>✕</button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{ padding:24 }}>
      <div style={{ height:32, background:"var(--surface)", borderRadius:"var(--r-md)", marginBottom:24, width:240 }} className="skeleton" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height:100 }} className="skeleton" />)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[1,2].map(i => <div key={i} style={{ height:200 }} className="skeleton" />)}
      </div>
    </div>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
import { Component } from "react";
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding:40, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:20, marginBottom:8 }}>Something went wrong</div>
          <div style={{ color:"var(--text-3)", fontSize:14, marginBottom:20 }}>{this.state.error.message}</div>
          <button className="primary-btn" onClick={() => this.setState({ error: null })}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Save Status ──────────────────────────────────────────────────────────────
function SaveStatus({ status }) {
  if (status === "idle") return null;
  const map = {
    saving: { label: "Saving...", emoji: "💾" },
    saved:  { label: "Saved ✓",  emoji: "✅" },
    error:  { label: "Save failed — cached locally", emoji: "⚠️" },
  };
  const { label, emoji } = map[status] || {};
  return <div className={`save-status ${status}`}>{emoji} {label}</div>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setStateRaw]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawer, setMobileDrawer]         = useState(false);
  const [levelUp, setLevelUp]   = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [prevLevel, setPrevLevel] = useState(0);
  const { toasts, showXP }      = useXPToast();
  const localCache              = useLocalCache();

  // Auto-save hook
  const saveStatus = useAutoSave(state);

  // ─ Load state ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // Show cached state immediately while fetching
        if (localCache && localCache.onboarded) {
          setStateRaw(localCache);
          setLoading(false);
        }
        const res  = await fetch(`${API}/state`);
        const data = await res.json();
        setStateRaw(data);
        setPrevLevel(getLevelInfo(data.gamification?.xp || 0).level);
      } catch (err) {
        console.error("Failed to load state:", err);
        if (localCache) setStateRaw(localCache);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─ setState wrapper (checks achievements + level-ups) ─────────────────────
  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!next) return prev;

      // Check for level up
      const newLevel = getLevelInfo(next.gamification?.xp || 0).level;
      if (newLevel > prevLevel && prevLevel > 0) {
        setPrevLevel(newLevel);
        setLevelUp({ level: newLevel, title: getLevelInfo(next.gamification?.xp || 0).title });
      }

      // Check for new achievements
      const newOnes = checkAchievements(next);
      if (newOnes.length > 0) {
        const earned = next.gamification?.achievements || [];
        const firstNew = newOnes[0];
        next.gamification = {
          ...next.gamification,
          achievements: [...earned, ...newOnes.map(a => a.id)],
          xp: (next.gamification?.xp || 0) + newOnes.reduce((s, a) => s + a.xp, 0),
        };
        setNewAchievement(firstNew);
        showXP(firstNew.xp, `Achievement: ${firstNew.title}`);
      }

      return next;
    });
  }, [prevLevel, showXP]);

  const onXP = useCallback((amount, label = "") => {
    showXP(amount, label);
  }, [showXP]);

  const onNav = useCallback((pageId) => {
    setPage(pageId);
    setMobileDrawer(false);
    window.scrollTo(0, 0);
  }, []);

  // ─ Render ─────────────────────────────────────────────────────────────────
  if (loading && !state) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, background:"linear-gradient(135deg,var(--indigo),var(--purple))", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:24 }}>L</div>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:18 }}>LifeOS <span style={{ color:"var(--indigo)" }}>365</span></div>
          <div style={{ color:"var(--text-3)", fontSize:13, marginTop:4 }}>Loading your journey...</div>
        </div>
      </div>
    );
  }

  if (!state) return null;

  // Show onboarding for new users
  if (!state.onboarded) {
    return (
      <>
        <Onboarding onComplete={(newState) => { setStateRaw(newState); setPrevLevel(0); }} />
        <XPToastContainer toasts={toasts} />
      </>
    );
  }

  const PageComponent = PAGE_MAP[page] || Dashboard;
  const dayNumber = computeDayNumber(state.startDate);
  const li = getLevelInfo(state.gamification?.xp || 0);
  const navItem = NAV.find(n => n.id === page);

  return (
    <div className="app-shell">
      {/* ── Sidebar (desktop) ──────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">L</div>
          <span className="sidebar-logo-text">Life<span>OS</span> 365</span>
        </div>

        {/* Player card */}
        <div className="sidebar-player">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: sidebarCollapsed ? 0 : 10 }}>
            <div className="sidebar-avatar">
              {(state.profile?.name?.[0] || "L").toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-player-info">
                <div className="sidebar-player-name">{state.profile?.name || "Developer"}</div>
                <div className="sidebar-player-level">Lv.{li.level} · {li.title}</div>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div style={{ fontSize:11, color:"var(--text-4)", marginBottom:6 }}>Day {dayNumber} / 365</div>
          )}
          {!sidebarCollapsed && (
            <div style={{ height:4, background:"var(--surface-3)", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${li.progress}%`, background:"linear-gradient(90deg,var(--indigo),var(--purple))", borderRadius:99, transition:"width 0.8s ease" }} />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map(group => (
            <div key={group}>
              <div className="sidebar-group-label">{group}</div>
              {NAV.filter(n => n.group === group).map(n => (
                <div
                  key={n.id}
                  className={`nav-item ${page === n.id ? "active" : ""}`}
                  onClick={() => onNav(n.id)}
                  title={sidebarCollapsed ? n.label : ""}
                >
                  <n.icon size={18} className="nav-item-icon" />
                  <span className="nav-item-label">{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            className="nav-item"
            onClick={() => {
              if (window.confirm("Reset all data and start over?")) {
                fetch(`${API}/state`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ version:5, onboarded:false }) });
                localStorage.removeItem("lifeos-cache");
                window.location.reload();
              }
            }}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={18} className="nav-item-icon" />
            <span className="nav-item-label">Reset / Logout</span>
          </div>
          <div
            className="nav-item"
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{ marginTop:4 }}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} className="nav-item-icon" /> : <ChevronLeft size={18} className="nav-item-icon" />}
            <span className="nav-item-label">Collapse</span>
          </div>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className={`main-area ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Topbar */}
        <header className="topbar">
          {/* Mobile menu button */}
          <button className="icon-btn topbar-menu-btn" onClick={() => setMobileDrawer(true)}>
            <Menu size={18} />
          </button>

          <div className="topbar-title">{navItem?.label || "LifeOS 365"}</div>

          {/* Search */}
          <div className="topbar-search">
            <Search size={14} color="var(--text-4)" />
            <input
              placeholder="Search pages..."
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const q = e.target.value.toLowerCase();
                  const found = NAV.find(n => n.label.toLowerCase().includes(q) || n.id.includes(q));
                  if (found) { onNav(found.id); e.target.value = ""; }
                }
              }}
            />
          </div>

          <SaveStatus status={saveStatus} />
        </header>

        {/* Page content */}
        <main className="page-content">
          <ErrorBoundary key={page}>
            <Suspense fallback={<PageSkeleton />}>
              <PageComponent
                state={state}
                setState={setState}
                onNav={onNav}
                onXP={onXP}
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* ── Bottom Nav (mobile) ────────────────────────────────────────────── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {BOTTOM_NAV.map(n => (
            <div key={n.id} className={`bottom-nav-item ${page === n.id ? "active" : ""}`} onClick={() => onNav(n.id)}>
              <n.icon size={20} />
              <span>{n.label}</span>
            </div>
          ))}
          <div className="bottom-nav-item" onClick={() => setMobileDrawer(true)}>
            <Menu size={20} />
            <span>More</span>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      {mobileDrawer && (
        <>
          <div className="mobile-drawer-overlay" onClick={() => setMobileDrawer(false)} />
          <div className="mobile-drawer">
            <div style={{ padding:"20px 16px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, background:"linear-gradient(135deg,var(--indigo),var(--purple))", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff" }}>L</div>
                <div>
                  <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:14 }}>LifeOS 365</div>
                  <div style={{ fontSize:11, color:"var(--text-3)" }}>Day {dayNumber} / 365</div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setMobileDrawer(false)}><X size={18} /></button>
            </div>

            {/* Player in drawer */}
            <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <div className="sidebar-avatar">{(state.profile?.name?.[0] || "L").toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{state.profile?.name || "Developer"}</div>
                  <div style={{ fontSize:11, color:"var(--text-3)" }}>Lv.{li.level} · {state.gamification?.xp || 0} XP</div>
                </div>
              </div>
              <XPBar totalXP={state.gamification?.xp || 0} />
            </div>

            {/* Nav items in drawer */}
            <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
              {NAV_GROUPS.map(group => (
                <div key={group}>
                  <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-4)", padding:"10px 16px 4px" }}>{group}</div>
                  {NAV.filter(n => n.group === group).map(n => (
                    <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => onNav(n.id)}>
                      <n.icon size={18} className="nav-item-icon" />
                      <span>{n.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Overlays ──────────────────────────────────────────────────────── */}
      <XPToastContainer toasts={toasts} />

      {levelUp && (
        <LevelUpModal level={levelUp.level} title={levelUp.title} onClose={() => setLevelUp(null)} />
      )}

      {newAchievement && (
        <AchievementBanner achievement={newAchievement} onClose={() => setNewAchievement(null)} />
      )}
    </div>
  );
}
