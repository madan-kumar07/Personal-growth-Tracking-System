// ─── XP & Level System ────────────────────────────────────────────────────────

export const XP_PER_CODING_HOUR = 50;
export const XP_PER_TOPIC       = 20;
export const XP_PER_MISSION     = 20; // base, actual is per-mission
export const XP_PER_WORKOUT     = 20;
export const XP_PER_JOURNAL     = 10;
export const XP_PER_PROJECT     = 500;

// Level n requires cumulative: n*(n+1)/2 * 50 XP
export function getLevelInfo(totalXP = 0) {
  let level = 0;
  while (level < 100) {
    const next = (level + 1) * (level + 2) / 2 * 50;
    if (totalXP < next) break;
    level++;
  }
  const curThreshold  = level > 0 ? level * (level + 1) / 2 * 50 : 0;
  const nextThreshold = (level + 1) * (level + 2) / 2 * 50;
  const cur  = totalXP - curThreshold;
  const need = nextThreshold - curThreshold;
  return {
    level,
    currentXP: cur,
    neededXP:  need,
    progress:  level >= 100 ? 100 : Math.min(100, Math.round((cur / need) * 100)),
    totalXP,
    title:     getLevelTitle(level)
  };
}

const LEVEL_TITLES = [
  [0, "Beginner"],
  [5, "Rookie Developer"],
  [10, "Code Learner"],
  [15, "Junior Developer"],
  [20, "Consistent Builder"],
  [25, "Self-Taught Dev"],
  [30, "Active Developer"],
  [40, "Full Stack Warrior"],
  [50, "Senior Builder"],
  [60, "Tech Expert"],
  [75, "Elite Developer"],
  [90, "Software Architect"],
  [100, "Software Engineer Mode"]
];

export function getLevelTitle(level) {
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (level >= LEVEL_TITLES[i][0]) return LEVEL_TITLES[i][1];
  }
  return "Beginner";
}

// ─── Day System ───────────────────────────────────────────────────────────────

export function computeDayNumber(startDate) {
  if (!startDate) return 0; // Day 0 until journey starts
  const diff = Math.floor((new Date() - new Date(startDate)) / 86400000);
  return Math.max(0, Math.min(365, diff));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Scores (all return 0 for empty state) ────────────────────────────────────

export function computeRoadmapProgress(roadmap = []) {
  const all = roadmap.flatMap(m => m.topics || []);
  if (!all.length) return 0;
  const done = all.filter(t => t.completed).length;
  return Math.round((done / all.length) * 100);
}

export function computeModuleProgress(module) {
  const topics = module?.topics || [];
  if (!topics.length) return 0;
  const done = topics.filter(t => t.completed).length;
  return Math.round((done / topics.length) * 100);
}

export function computeModuleStatus(progress) {
  if (progress === 0) return "not-started";
  if (progress < 80) return "in-progress";
  if (progress < 100) return "completed";
  return "mastered";
}

export function computePlacementReadiness(placement) {
  const subjects = placement?.subjects || [];
  if (!subjects.length) return 0;
  const scores = subjects.map(s => {
    const topics = s.topics || [];
    if (!topics.length) return 0;
    return Math.round((topics.filter(t => t.completed).length / topics.length) * 100);
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function computeHealthScore(health) {
  const workouts = health?.workouts || [];
  const sleepLog = health?.sleepLog || [];
  const waterLog = health?.waterLog || [];
  if (!workouts.length && !sleepLog.length && !waterLog.length) return 0;
  const last7 = new Date();
  last7.setDate(last7.getDate() - 7);
  const recentWorkouts = workouts.filter(w => new Date(w.date) >= last7).length;
  const avgSleep = sleepLog.length
    ? sleepLog.slice(-7).reduce((a, s) => a + (s.hours || 0), 0) / Math.min(sleepLog.length, 7)
    : 0;
  const avgWater = waterLog.length
    ? waterLog.slice(-7).reduce((a, w) => a + (w.litres || 0), 0) / Math.min(waterLog.length, 7)
    : 0;
  const workoutScore = Math.min(100, recentWorkouts * 15);
  const sleepScore   = Math.min(100, (avgSleep / 8) * 100);
  const waterScore   = Math.min(100, (avgWater / 3) * 100);
  return Math.round((workoutScore + sleepScore + waterScore) / 3);
}

export function computeCodingScore(coding) {
  const totalHours = coding?.totalHours || 0;
  if (!totalHours) return 0;
  return Math.min(100, Math.round((totalHours / 200) * 100));
}

export function computeEnglishScore(english) {
  const sessions = english?.sessions || [];
  const vocab    = english?.vocabulary || [];
  if (!sessions.length && !vocab.length) return 0;
  const sessionScore = Math.min(50, sessions.length * 2);
  const vocabScore   = Math.min(50, vocab.length);
  return sessionScore + vocabScore;
}

export function computeDisciplineScore(state) {
  const missions = (state.missions || []).filter(m => m.completed).length;
  const total    = (state.missions || []).length;
  if (!total) return 0;
  return Math.round((missions / total) * 100);
}

export function computeScores(state) {
  return {
    coding:        computeCodingScore(state.coding),
    health:        computeHealthScore(state.health),
    communication: computeEnglishScore(state.english),
    discipline:    computeDisciplineScore(state),
    placement:     computePlacementReadiness(state.placement),
    roadmap:       computeRoadmapProgress(state.roadmap)
  };
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  // Bronze
  { id: "first_login",   tier: "bronze",    icon: "🌟", title: "First Step",        desc: "Complete onboarding",                    xp: 50,  check: s => s.onboarded },
  { id: "first_mission", tier: "bronze",    icon: "✅", title: "First Mission",      desc: "Complete your first mission",            xp: 50,  check: s => (s.gamification?.totalMissionsCompleted || 0) >= 1 },
  { id: "code_1h",       tier: "bronze",    icon: "💻", title: "Coder",              desc: "Log your first coding hour",             xp: 50,  check: s => (s.coding?.totalHours || 0) >= 1 },
  { id: "journal_1",     tier: "bronze",    icon: "📖", title: "Reflective",         desc: "Write your first journal entry",         xp: 30,  check: s => (s.journal?.entries?.length || 0) >= 1 },
  { id: "habit_7",       tier: "bronze",    icon: "🏃", title: "Habitual",           desc: "Complete habits for 7 days",             xp: 100, check: s => (s.gamification?.streaks?.overall?.current || 0) >= 7 },
  // Silver
  { id: "streak_7",      tier: "silver",    icon: "🔥", title: "7 Day Streak",       desc: "Maintain a 7-day overall streak",        xp: 150, check: s => (s.gamification?.streaks?.overall?.current || 0) >= 7 },
  { id: "missions_10",   tier: "silver",    icon: "⚡", title: "Mission Specialist", desc: "Complete 10 daily missions",             xp: 100, check: s => (s.gamification?.totalMissionsCompleted || 0) >= 10 },
  { id: "code_10h",      tier: "silver",    icon: "🖥️", title: "10 Coding Hours",    desc: "Code for 10+ total hours",               xp: 150, check: s => (s.coding?.totalHours || 0) >= 10 },
  { id: "level_5",       tier: "silver",    icon: "⭐", title: "Rising Star",        desc: "Reach Level 5",                         xp: 100, check: s => getLevelInfo(s.gamification?.xp || 0).level >= 5 },
  { id: "journal_10",    tier: "silver",    icon: "📔", title: "Diarist",            desc: "Write 10 journal entries",               xp: 100, check: s => (s.journal?.entries?.length || 0) >= 10 },
  // Gold
  { id: "streak_30",     tier: "gold",      icon: "⚡", title: "30 Day Streak",      desc: "30-day consistency streak",              xp: 300, check: s => (s.gamification?.streaks?.overall?.current || 0) >= 30 },
  { id: "missions_50",   tier: "gold",      icon: "🎯", title: "Mission Expert",     desc: "Complete 50 daily missions",             xp: 250, check: s => (s.gamification?.totalMissionsCompleted || 0) >= 50 },
  { id: "code_50h",      tier: "gold",      icon: "💡", title: "50 Coding Hours",    desc: "Code for 50+ total hours",               xp: 300, check: s => (s.coding?.totalHours || 0) >= 50 },
  { id: "level_15",      tier: "gold",      icon: "🏆", title: "Committed",          desc: "Reach Level 15",                         xp: 250, check: s => getLevelInfo(s.gamification?.xp || 0).level >= 15 },
  { id: "first_project", tier: "gold",      icon: "🏗️", title: "Builder",            desc: "Complete your first project",            xp: 500, check: s => (s.projects || []).some(p => p.status === "completed") },
  // Platinum
  { id: "streak_100",    tier: "platinum",  icon: "💎", title: "100 Day Warrior",    desc: "100-day consistency streak",             xp: 500, check: s => (s.gamification?.streaks?.overall?.current || 0) >= 100 },
  { id: "code_100h",     tier: "platinum",  icon: "🖥️", title: "100 Coding Hours",   desc: "Code for 100+ total hours",              xp: 500, check: s => (s.coding?.totalHours || 0) >= 100 },
  { id: "placement_50",  tier: "platinum",  icon: "🎓", title: "Placement Ready",    desc: "50% placement readiness",                xp: 400, check: s => computePlacementReadiness(s.placement) >= 50 },
  { id: "level_30",      tier: "platinum",  icon: "🌠", title: "Full Stack Path",    desc: "Reach Level 30",                         xp: 500, check: s => getLevelInfo(s.gamification?.xp || 0).level >= 30 },
  // Legendary
  { id: "legend_365",    tier: "legendary", icon: "👑", title: "365 Day Legend",     desc: "Complete the full 365-day journey",      xp: 5000, check: s => computeDayNumber(s.startDate) >= 365 },
  { id: "code_200h",     tier: "legendary", icon: "🚀", title: "Code Machine",       desc: "Code for 200+ hours",                    xp: 2000, check: s => (s.coding?.totalHours || 0) >= 200 },
  { id: "level_50",      tier: "legendary", icon: "⚔️", title: "Elite Developer",    desc: "Reach the legendary Level 50",           xp: 2000, check: s => getLevelInfo(s.gamification?.xp || 0).level >= 50 },
  { id: "roadmap_100",   tier: "legendary", icon: "🗺️", title: "Roadmap Master",     desc: "Complete the entire roadmap",            xp: 3000, check: s => computeRoadmapProgress(s.roadmap) >= 100 },
];

export function checkAchievements(state) {
  const earned   = new Set(state.gamification?.achievements || []);
  const newOnes  = [];
  for (const ach of ACHIEVEMENTS) {
    if (!earned.has(ach.id)) {
      try {
        if (ach.check(state)) newOnes.push(ach);
      } catch (_) { /* skip */ }
    }
  }
  return newOnes;
}

// ─── Smart Recommendations ────────────────────────────────────────────────────

export function getNextRecommendedTopic(roadmap = []) {
  for (const mod of roadmap) {
    for (const topic of (mod.topics || [])) {
      if (!topic.completed) {
        return { module: mod.title, topic: topic.title, moduleId: mod.id, category: mod.category };
      }
    }
  }
  return null;
}

export function getWeakAreas(roadmap = []) {
  return roadmap
    .map(mod => ({
      ...mod,
      progress: computeModuleProgress(mod)
    }))
    .filter(mod => mod.progress > 0 && mod.progress < 50)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 3);
}

export function getRevisionRecommendations(roadmap = []) {
  return roadmap
    .map(mod => ({
      ...mod,
      progress: computeModuleProgress(mod)
    }))
    .filter(mod => mod.progress >= 80 && mod.progress < 100)
    .slice(0, 3);
}

// ─── Calendar utilities ───────────────────────────────────────────────────────

export function generate365Days(startDate, calendarData = []) {
  if (!startDate) return [];
  const start   = new Date(startDate);
  const todayMs = new Date(todayISO()).getTime();
  const dataMap = new Map(calendarData.map(d => [d.date, d]));
  const days    = [];
  for (let i = 0; i < 365; i++) {
    const d   = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const rec = dataMap.get(iso);
    let status = "future";
    if (d.getTime() <= todayMs) {
      status = rec ? rec.status : (d.getTime() < todayMs ? "missed" : "pending");
    }
    days.push({ date: iso, day: i + 1, status, xp: rec?.xp || 0 });
  }
  return days;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

export function avg(arr) {
  if (!arr?.length) return 0;
  return Math.round(arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length);
}

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function pct(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export const DAYS_SHORT   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ─── Daily Quotes ─────────────────────────────────────────────────────────────

export const DAILY_QUOTES = [
  "Small daily progress beats occasional intensity.",
  "Discipline is doing what needs to be done even when you don't feel like it.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Every expert was once a beginner. Keep going.",
  "Code every day. Even 30 minutes. Consistency beats talent.",
  "Your only competition is who you were yesterday.",
  "Don't watch the clock; do what it does. Keep going.",
  "Dream big. Start small. Act now.",
  "The secret of getting ahead is getting started.",
  "You don't have to be great to start, but you have to start to be great.",
  "Hard work beats talent when talent doesn't work hard.",
  "Push yourself because no one else is going to do it for you.",
  "One day or day one. You decide.",
  "The journey of a thousand miles begins with a single step.",
];

export function getDailyQuote(startDate) {
  const dayNum = startDate ? computeDayNumber(startDate) : 0;
  return DAILY_QUOTES[dayNum % DAILY_QUOTES.length];
}

// ─── Mission utilities ────────────────────────────────────────────────────────

export function computeMissionProgress(missions = []) {
  const total     = missions.length;
  const completed = missions.filter(m => m.completed).length;
  return { completed, total, pct: pct(completed, total) };
}

// ─── Context-aware AI Coach Responses ────────────────────────────────────────

export function getCoachResponse(state, userMessage) {
  const msg  = userMessage.toLowerCase();
  const xp   = state.gamification?.xp || 0;
  const day  = computeDayNumber(state.startDate);
  const coding = state.coding?.totalHours || 0;
  const streak = state.gamification?.streaks?.overall?.current || 0;
  const placement = computePlacementReadiness(state.placement);
  const name = state.profile?.name || "Developer";

  // Coding related
  if (msg.includes("cod") || msg.includes("program")) {
    if (coding < 10) return `${name}, you've coded ${coding} hours so far. Start with HTML & CSS basics on your roadmap, then move to JavaScript. Aim for at least 1 hour every day — it adds up faster than you think! 💻`;
    if (coding < 50) return `Great progress! You've logged ${coding} coding hours. Focus on completing your JavaScript module next and start building small projects to reinforce your learning. Consistency is key! 🚀`;
    return `${coding} hours is impressive, ${name}! You're building real momentum. Now focus on React and backend Node.js to complete your full-stack foundation. 🏆`;
  }

  // Placement
  if (msg.includes("placement") || msg.includes("interview") || msg.includes("job")) {
    if (placement < 20) return `You're at ${placement}% placement readiness. Start with DSA fundamentals and Core Java — these are asked in every company. Solve 2 LeetCode problems daily. I'll track your progress! 🎯`;
    if (placement < 60) return `${placement}% placement ready — solid foundation! Focus on DBMS, OS, and CN theory now. Start mock interviews on platforms like Pramp or interviewing.io. 🎓`;
    return `${placement}% readiness is excellent, ${name}! Focus on company-specific preparation and mock interview rounds. You're almost there! 💼`;
  }

  // Streak / motivation
  if (msg.includes("motivat") || msg.includes("streak") || msg.includes("lazy") || msg.includes("tired")) {
    if (streak === 0) return `Every journey starts with Day 1, ${name}. Complete just one task today — even a small one. A streak of 1 is infinitely better than 0. I believe in you! 🔥`;
    if (streak < 7) return `You're on a ${streak}-day streak! Don't break it — even 20 minutes of coding counts. Momentum is everything in the early stages. Keep pushing! 💪`;
    return `${streak} days in a row — that's elite consistency, ${name}! You're building a habit that will define your career. Don't stop now! ⚡`;
  }

  // Health
  if (msg.includes("health") || msg.includes("workout") || msg.includes("sleep") || msg.includes("water")) {
    return `Your physical health directly impacts your coding performance. Aim for: 7-8h sleep, 3L water, 20-30min workout. When your body is optimized, your mind codes better. Track everything in your Health dashboard! 🏃‍♂️`;
  }

  // English
  if (msg.includes("english") || msg.includes("communicat") || msg.includes("speak")) {
    return `Communication is as important as coding for your career. Practice speaking for 15 minutes daily. Use the speaking topics in your English page, record yourself, and review the recording. Consistency here will pay off in HR rounds! 🗣️`;
  }

  // General greeting
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return `Hi ${name}! 👋 I'm your AI Coach. You're on Day ${day} of your journey with ${xp} XP earned. What area would you like to focus on today — Coding, Placement, Health, English, or Motivation?`;
  }

  // Progress check
  if (msg.includes("progress") || msg.includes("how am i") || msg.includes("report")) {
    return `📊 **Your Progress Report:**\n\n• **Day**: ${day} / 365\n• **XP**: ${xp} total\n• **Coding**: ${coding}h logged\n• **Streak**: ${streak} days\n• **Placement Readiness**: ${placement}%\n\nBased on your progress, my recommendation: ${getNextRecommendedTopic(state.roadmap)?.topic || "Start your first roadmap module"} should be your next focus!`;
  }

  // Roadmap
  if (msg.includes("roadmap") || msg.includes("learn") || msg.includes("study") || msg.includes("next")) {
    const next = getNextRecommendedTopic(state.roadmap);
    if (!next) return `Amazing — you've completed the entire roadmap! You're truly ready for the job market, ${name}. Start applying and building real-world projects! 🎉`;
    return `Your next recommended topic is **"${next.topic}"** in the **${next.module}** module (${next.category} path). Go to your Roadmap page, mark topics as you complete them, and earn XP! Each topic brings you closer to your dream role. 📚`;
  }

  // Default smart response
  const responses = [
    `Based on your Day ${day} progress with ${xp} XP, your biggest growth opportunity right now is consistent daily coding. Even 45 minutes daily will transform you in 90 days.`,
    `You're making progress, ${name}! Focus on completing your roadmap topics one by one. Each green checkmark moves you closer to your dream job.`,
    `The developers who succeed are the ones who show up every single day. Your ${streak}-day streak shows you have what it takes. Keep going!`,
    `${xp} XP earned, ${coding}h coded — you're building real skills. The key is maintaining your daily routine. What specific challenge are you facing today?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
