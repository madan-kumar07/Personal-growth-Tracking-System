import React, { useState } from "react";
import { User, Target, Briefcase, Activity, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Zap } from "lucide-react";

const API = "/api";

const STEPS = [
  { id: "welcome",  icon: Sparkles,  title: "Welcome to LifeOS 365",              sub: "Your personal growth operating system" },
  { id: "identity", icon: User,      title: "Tell us about you",                   sub: "Build your developer identity" },
  { id: "career",   icon: Target,    title: "Define your dream",                   sub: "Set your career targets" },
  { id: "skills",   icon: Activity,  title: "Where are you starting?",             sub: "Honest assessment — no judgment" },
  { id: "launch",   icon: Zap,       title: "You're ready to begin!",              sub: "Day 0 starts now" },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name:                "",
    email:               "",
    college:             "",
    degree:              "B.E Computer Science",
    semester:            "1",
    cgpa:                "",
    targetRole:          "Full Stack Developer",
    dreamCompany:        "",
    dreamSalary:         "10 LPA",
    about:               "",
    currentWeight:       0,
    targetWeight:        0,
    heightCm:            0,
    currentCodingLevel:  "Beginner",
    currentEnglishLevel: "Beginner",
    currentSkills:       "",
  });

  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  async function handleLaunch() {
    setLoading(true);
    try {
      await fetch(`${API}/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const res   = await fetch(`${API}/state`);
      const state = await res.json();
      onComplete(state);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const canNext = () => {
    if (step === 1) return profile.name.trim().length >= 2;
    if (step === 2) return profile.targetRole.trim().length >= 2;
    return true;
  };

  return (
    <div className="onboarding-bg">
      <div className="onboarding-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="onboarding-card">
        {/* Logo */}
        <div className="onboarding-logo">
          <div className="onboarding-logo-mark">L</div>
          <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:16 }}>
            Life<span style={{ color:"var(--indigo)" }}>OS</span> 365
          </div>
        </div>

        {/* Step indicators */}
        <div className="onboarding-step-indicators">
          {STEPS.map((s, i) => (
            <div key={i} className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
          ))}
        </div>

        {/* Step Content */}
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepIdentity profile={profile} update={update} />}
        {step === 2 && <StepCareer  profile={profile} update={update} />}
        {step === 3 && <StepSkills  profile={profile} update={update} />}
        {step === 4 && <StepLaunch  profile={profile} loading={loading} onLaunch={handleLaunch} />}

        {/* Navigation */}
        {step < 4 && (
          <div className="onboarding-actions">
            <button className="secondary-btn" onClick={() => setStep(s => Math.max(0, s-1))} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
              <ArrowLeft size={14} /> Back
            </button>
            <button
              className="primary-btn"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              style={{ opacity: canNext() ? 1 : 0.5 }}
            >
              {step === 3 ? "Almost there!" : "Continue"} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 0: Welcome ─────────────────────────────────────────────────────────
function StepWelcome() {
  return (
    <div>
      <h1 className="onboarding-h1">Your 365-day journey<br />starts <span>today.</span></h1>
      <p className="onboarding-sub">
        LifeOS 365 is your personal operating system. Track coding, health, placement prep, English skills, and more — all in one place, from Day 0 to Day 365.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:8 }}>
        {[
          { icon:"🚀", text: "Smart roadmap with detailed study checklists" },
          { icon:"🎮", text: "XP system, streaks, and achievements" },
          { icon:"📊", text: "Real analytics from your actual data" },
          { icon:"🤖", text: "AI coach that knows your progress" },
          { icon:"💪", text: "Track coding, health, english, placement & more" },
        ].map((f, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"var(--surface)", borderRadius:"var(--r-md)", border:"1px solid var(--border)" }}>
            <span style={{ fontSize:18 }}>{f.icon}</span>
            <span style={{ fontSize:13, color:"var(--text-2)" }}>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Identity ────────────────────────────────────────────────────────
function StepIdentity({ profile, update }) {
  return (
    <div>
      <h1 className="onboarding-h1">Tell us about <span>you</span></h1>
      <p className="onboarding-sub">This builds your developer identity card. Be honest — it's just for you.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input className="form-input" placeholder="Madankumar" value={profile.name} onChange={e => update("name", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" placeholder="you@email.com" value={profile.email} onChange={e => update("email", e.target.value)} type="email" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">College / University</label>
            <input className="form-input" placeholder="Your college name" value={profile.college} onChange={e => update("college", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Degree</label>
            <input className="form-input" placeholder="B.E Computer Science" value={profile.degree} onChange={e => update("degree", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Current Semester</label>
            <select className="form-select" value={profile.semester} onChange={e => update("semester", e.target.value)}>
              {["1","2","3","4","5","6","7","8"].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Current CGPA</label>
            <input className="form-input" placeholder="8.5" value={profile.cgpa} onChange={e => update("cgpa", e.target.value)} type="number" step="0.1" min="0" max="10" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">About you (1-2 sentences)</label>
          <input className="form-input" placeholder="CS student passionate about building real-world apps..." value={profile.about} onChange={e => update("about", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Career ──────────────────────────────────────────────────────────
function StepCareer({ profile, update }) {
  return (
    <div>
      <h1 className="onboarding-h1">Define your <span>dream</span></h1>
      <p className="onboarding-sub">Set your targets. This drives everything — your roadmap, missions, and progress.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className="form-group">
          <label className="form-label">Target Role *</label>
          <select className="form-select" value={profile.targetRole} onChange={e => update("targetRole", e.target.value)}>
            {["Full Stack Developer","Frontend Developer","Backend Developer","Software Engineer","DevOps Engineer","Data Engineer","Mobile Developer"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Dream Company</label>
            <input className="form-input" placeholder="Google, Amazon, Startup..." value={profile.dreamCompany} onChange={e => update("dreamCompany", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Salary (LPA)</label>
            <select className="form-select" value={profile.dreamSalary} onChange={e => update("dreamSalary", e.target.value)}>
              {["5 LPA","6 LPA","8 LPA","10 LPA","12 LPA","15 LPA","20 LPA","25+ LPA"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Skills Assessment ────────────────────────────────────────────────
function StepSkills({ profile, update }) {
  return (
    <div>
      <h1 className="onboarding-h1">Honest starting <span>point</span></h1>
      <p className="onboarding-sub">Don't worry about being a beginner. LifeOS tracks your growth from wherever you start.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Current Coding Level</label>
            <select className="form-select" value={profile.currentCodingLevel} onChange={e => update("currentCodingLevel", e.target.value)}>
              {["Absolute Beginner","Beginner","Intermediate","Advanced"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">English Level</label>
            <select className="form-select" value={profile.currentEnglishLevel} onChange={e => update("currentEnglishLevel", e.target.value)}>
              {["Beginner","Elementary","Intermediate","Upper Intermediate","Advanced"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Current Skills (comma separated)</label>
          <input className="form-input" placeholder="HTML, CSS, Basic Java, Python basics..." value={profile.currentSkills} onChange={e => update("currentSkills", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Current Weight (kg)</label>
            <input className="form-input" placeholder="65" type="number" value={profile.currentWeight || ""} onChange={e => update("currentWeight", Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Weight (kg)</label>
            <input className="form-input" placeholder="70" type="number" value={profile.targetWeight || ""} onChange={e => update("targetWeight", Number(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Launch ──────────────────────────────────────────────────────────
function StepLaunch({ profile, loading, onLaunch }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:56, marginBottom:16 }}>🚀</div>
      <h1 className="onboarding-h1" style={{ textAlign:"center" }}>
        Welcome, <span>{profile.name || "Developer"}</span>!
      </h1>
      <p className="onboarding-sub" style={{ textAlign:"center" }}>
        Your LifeOS is configured and ready. Day 0 begins when you click Launch. Every day you complete moves you one step closer to your goal.
      </p>

      {/* Identity preview card */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border-2)", borderRadius:"var(--r-xl)", padding:20, marginBottom:20, textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:44, height:44, background:"linear-gradient(135deg,var(--indigo),var(--purple))", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:18, color:"#fff", flexShrink:0 }}>
            {(profile.name[0] || "?").toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:16 }}>{profile.name}</div>
            <div style={{ fontSize:12, color:"var(--text-3)" }}>{profile.college} · {profile.degree}</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:12, color:"var(--text-2)" }}>
          {[
            ["🎯 Target", profile.targetRole],
            ["🏢 Dream Company", profile.dreamCompany || "Not set"],
            ["💰 Target Salary", profile.dreamSalary],
            ["💻 Coding Level", profile.currentCodingLevel],
          ].map(([k, v]) => (
            <div key={k} style={{ background:"var(--surface-2)", padding:"8px 10px", borderRadius:"var(--r-md)", border:"1px solid var(--border)" }}>
              <div style={{ color:"var(--text-3)", marginBottom:2 }}>{k}</div>
              <div style={{ fontWeight:600 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="primary-btn" onClick={onLaunch} disabled={loading} style={{ width:"100%", justifyContent:"center", padding:"14px 24px", fontSize:15, borderRadius:"var(--r-lg)" }}>
        {loading ? "Launching..." : "🚀 Launch My Journey — Day 0"}
      </button>
      <p style={{ fontSize:11, color:"var(--text-4)", marginTop:10 }}>Everything starts at zero. Every point you earn will be real.</p>
    </div>
  );
}
