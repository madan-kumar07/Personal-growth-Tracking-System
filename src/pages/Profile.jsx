import React, { useState } from "react";
import {
  User, Mail, GraduationCap, Building2, Wallet, Settings,
  Trash2, ShieldAlert, Award, Star, Trophy, Sparkles, BookOpen,
  Clock, HeartPulse, Check, Save, ArrowRight
} from "lucide-react";
import { getLevelInfo, computeScores, computeDayNumber } from "../utils.js";
import { XPBar } from "../components/ui.jsx";

export default function Profile({ state, setState, onNav, onXP }) {
  const profile = state?.profile || {};
  const [formData, setFormData] = useState({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const scores = computeScores(state);
  const li = getLevelInfo(state?.gamification?.xp || 0);
  const dayNumber = computeDayNumber(state?.startDate);
  const unlockedCount = state?.gamification?.achievements?.length || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (group, key) => {
    setState(prev => {
      const updated = {
        ...prev,
        [group]: {
          ...prev[group],
          [key]: !prev[group]?.[key]
        }
      };
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...formData }
    }));
    setIsEditing(false);
    setSaveMessage("Profile updated and auto-saved!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleReset = async () => {
    if (window.confirm("🚨 CRITICAL WARNING 🚨\n\nAre you sure you want to reset ALL your progress? This will delete all your logs, streak data, habits, roadmap progress, and settings. This action is permanent and cannot be undone.")) {
      const res = await fetch("/api/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: 5, onboarded: false })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to reset. Please check if the server is running.");
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "OS";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "4px" }}>
      {/* Save Message Toast */}
      {saveMessage && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: "var(--emerald)", color: "#fff",
          padding: "12px 20px", borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-lg)", zIndex: 1000,
          animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <Check size={16} /> {saveMessage}
        </div>
      )}

      {/* Top Profile Summary */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px", padding: "32px" }}>
        <div style={{
          width: "96px", height: "96px", borderRadius: "50%",
          background: "linear-gradient(135deg, var(--indigo), var(--purple))",
          display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center",
          fontSize: "36px", fontWeight: 900, color: "var(--text)",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)", flexShrink: 0
        }}>
          {getInitials(profile.name)}
        </div>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "var(--font-head)", fontSize: "28px", fontWeight: 800, margin: 0 }}>
              {profile.name || "Student Developer"}
            </h1>
            <span className="chip chip-indigo">v1.0</span>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: "15px", marginTop: "4px" }}>
            {profile.degree || "Computer Science Student"}
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", color: "var(--text-3)", fontSize: "13px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><GraduationCap size={14} /> {profile.college || "Not set"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={14} /> {profile.targetRole || "Full Stack Developer"}</span>
          </div>
        </div>
        <div style={{ minWidth: "240px" }}>
          <XPBar totalXP={state?.gamification?.xp || 0} />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid-2" style={{ display: "grid", gap: "24px" }}>
        
        {/* Left Column: Editable Profile Details */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
              <User size={18} color="var(--indigo)" /> Personal Info
            </h2>
            <button
              className="secondary-btn"
              onClick={() => {
                if (isEditing) setFormData({ ...profile });
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="grid-2" style={{ gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)", transition: "all 0.2s"
                  }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="email@college.edu"
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>College / University</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="College Name"
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Degree / Program</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                />
              </div>
            </div>

            <div className="grid-3" style={{ gap: "12px" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Semester</label>
                <select
                  name="semester"
                  value={formData.semester || "1"}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 12px", color: "var(--text)"
                  }}
                >
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={String(s)}>Sem {s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="e.g. 8.5"
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Dream Salary (LPA)</label>
                <input
                  type="text"
                  name="dreamSalary"
                  value={formData.dreamSalary || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="e.g. 15 LPA"
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "16px" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Target Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="e.g. Frontend Dev"
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Dream Company</label>
                <input
                  type="text"
                  name="dreamCompany"
                  value={formData.dreamCompany || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="e.g. Google"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>About & Mission Statement</label>
              <textarea
                name="about"
                value={formData.about || ""}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                style={{
                  width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                  border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                  padding: "10px 14px", color: "var(--text)", resize: "none"
                }}
                placeholder="Write your personal mission statement or developer journey here..."
              />
            </div>

            <div className="grid-3" style={{ gap: "12px" }}>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Coding Level</label>
                <select
                  name="currentCodingLevel"
                  value={formData.currentCodingLevel || "Beginner"}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 12px", color: "var(--text)"
                  }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>English Level</label>
                <select
                  name="currentEnglishLevel"
                  value={formData.currentEnglishLevel || "Beginner"}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 12px", color: "var(--text)"
                  }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Fluent">Fluent</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Weight (kg)</label>
                <input
                  type="number"
                  name="currentWeight"
                  value={formData.currentWeight || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                    border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                    padding: "10px 14px", color: "var(--text)"
                  }}
                  placeholder="e.g. 70"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: "var(--text-3)", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>Skills (Comma-separated)</label>
              <input
                type="text"
                name="currentSkills"
                value={formData.currentSkills || ""}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="JavaScript, React, Node.js, Python, SQL"
                style={{
                  width: "100%", background: isEditing ? "var(--bg-3)" : "var(--bg-2)",
                  border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                  padding: "10px 14px", color: "var(--text)"
                }}
              />
            </div>

            {isEditing && (
              <button
                type="submit"
                className="primary-btn"
                style={{ marginTop: "10px", width: "100%", justifyContent: "center" }}
              >
                <Save size={16} /> Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Score Summary & Streaks & Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Stats Overview */}
          <div className="glass-card" style={{ padding: "28px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "20px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Award size={18} color="var(--purple)" /> Journey Stats
            </h2>
            <div className="grid-2" style={{ gap: "16px" }}>
              <div style={{ background: "var(--bg-2)", padding: "16px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>DAY NUMBER</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--indigo)", fontFamily: "var(--font-head)", marginTop: "4px" }}>
                  Day {dayNumber}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>of 365 days</div>
              </div>
              <div style={{ background: "var(--bg-2)", padding: "16px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600 }}>ACHIEVEMENTS</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--amber)", fontFamily: "var(--font-head)", marginTop: "4px" }}>
                  {unlockedCount}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>unlocked</div>
              </div>
            </div>

            {/* Score Bars */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 600, marginBottom: "4px" }}>Core Competency Scores</h3>
              {[
                { label: "Coding Score", val: scores.coding, color: "cyan" },
                { label: "Roadmap Progress", val: scores.roadmap, color: "indigo" },
                { label: "Placement Readiness", val: scores.placement, color: "blue" },
                { label: "English & Communication", val: scores.english, color: "purple" },
                { label: "Health & Vitality", val: scores.health, color: "emerald" },
                { label: "Discipline & Consistency", val: scores.discipline, color: "rose" }
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-2)" }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: `var(--${item.color})` }}>{item.val}%</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-3)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.val}%`, background: `var(--${item.color})`, borderRadius: "3px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div className="glass-card" style={{ padding: "28px" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "20px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Settings size={18} color="var(--text-2)" /> Notification Settings
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "morning", label: "Morning Motivation reminder" },
                { key: "coding", label: "Coding hour alert" },
                { key: "workout", label: "Workout check-in alert" },
                { key: "water", label: "Hydration interval reminder" },
                { key: "english", label: "Speaking practice alert" },
                { key: "journal", label: "Night journal review" }
              ].map(n => (
                <label key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "8px 0" }}>
                  <span style={{ color: "var(--text-2)" }}>{n.label}</span>
                  <input
                    type="checkbox"
                    checked={state?.notifications?.[n.key] || false}
                    onChange={() => handleCheckboxChange("notifications", n.key)}
                    style={{
                      accentColor: "var(--indigo)", width: "16px", height: "16px", cursor: "pointer"
                    }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card" style={{ padding: "28px", borderColor: "rgba(244,63,94,0.3)", background: "linear-gradient(135deg, rgba(244,63,94,0.06), rgba(7,7,15,0.85))" }}>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "20px", fontWeight: 700, color: "var(--rose)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert size={18} color="var(--rose)" /> Danger Zone
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "13px", marginBottom: "18px", lineHeight: "1.5" }}>
              Resetting progress will permanently erase your profile details, XP level, streaks, learning history, and accomplishments.
            </p>
            <button
              onClick={handleReset}
              className="primary-btn"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                boxShadow: "0 0 15px rgba(244, 63, 94, 0.4)",
                width: "100%", justifyContent: "center", color: "#fff"
              }}
            >
              <Trash2 size={16} /> Reset All Progress
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
