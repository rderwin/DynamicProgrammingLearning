// ─── XP & Levels ───

export const XP_REWARDS = {
  lessonStageComplete: 10,     // each wizard stage
  lessonChallengePassed: 50,   // passing the code challenge
  practiceEasy: 30,
  practiceMedium: 60,
  practiceHard: 100,
  dailyStreak: 15,             // bonus per day of streak
  trainerLessonComplete: 40,   // passing a masterclass trainer lesson
  quizCorrect: 5,              // per correct answer in short quizzes
  drillCompleted: 25,          // finishing a whiteboard / recurrence drill
} as const;

export interface Level {
  name: string;
  minXP: number;
  color: string;
  gradient: string;
}

export const LEVELS: Level[] = [
  { name: "Beginner", minXP: 0, color: "text-slate-500", gradient: "from-slate-400 to-slate-500" },
  { name: "Learner", minXP: 50, color: "text-blue-600", gradient: "from-blue-400 to-blue-600" },
  { name: "Apprentice", minXP: 150, color: "text-cyan-600", gradient: "from-cyan-400 to-cyan-600" },
  { name: "Intermediate", minXP: 350, color: "text-emerald-600", gradient: "from-emerald-400 to-emerald-600" },
  { name: "Advanced", minXP: 600, color: "text-violet-600", gradient: "from-violet-400 to-violet-600" },
  { name: "Expert", minXP: 1000, color: "text-amber-600", gradient: "from-amber-400 to-amber-600" },
  { name: "Master", minXP: 1500, color: "text-red-600", gradient: "from-red-400 to-red-600" },
];

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ─── Achievements ───

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // First steps
  { id: "first-lesson", title: "First Steps", description: "Complete your first lesson stage", icon: "👣", xpReward: 10 },
  { id: "first-solve", title: "Hello World", description: "Pass your first code challenge", icon: "🎯", xpReward: 20 },
  { id: "first-practice", title: "Practice Makes Perfect", description: "Solve your first practice problem", icon: "💪", xpReward: 15 },

  // Streaks
  { id: "streak-3", title: "On a Roll", description: "3-day practice streak", icon: "🔥", xpReward: 30 },
  { id: "streak-7", title: "Week Warrior", description: "7-day practice streak", icon: "⚡", xpReward: 75 },
  { id: "streak-14", title: "Unstoppable", description: "14-day practice streak", icon: "🏆", xpReward: 150 },

  // Modules
  { id: "module-complete", title: "Module Master", description: "Complete all lessons in a module", icon: "📚", xpReward: 100 },
  { id: "all-practice-easy", title: "Easy Sweep", description: "Solve all Easy practice problems", icon: "🧹", xpReward: 50 },
  { id: "all-practice-medium", title: "Medium Mastery", description: "Solve all Medium practice problems", icon: "🎓", xpReward: 100 },
  { id: "all-practice", title: "Complete Collection", description: "Solve all practice problems", icon: "👑", xpReward: 200 },

  // Levels
  { id: "level-intermediate", title: "Getting Serious", description: "Reach Intermediate level", icon: "📈", xpReward: 25 },
  { id: "level-expert", title: "The Expert", description: "Reach Expert level", icon: "🌟", xpReward: 50 },
  { id: "level-master", title: "Algorithm Master", description: "Reach Master level", icon: "💎", xpReward: 100 },

  // Fun
  { id: "no-hints", title: "No Training Wheels", description: "Solve a problem without using any hints", icon: "🚀", xpReward: 40 },
  { id: "speed-demon", title: "Speed Demon", description: "Solve a practice problem in under 2 minutes", icon: "⏱️", xpReward: 30 },
  { id: "polyglot", title: "Polyglot", description: "Solve the same problem in both JS and Python", icon: "🌐", xpReward: 25 },

  // Masterclass completions — one per trainer
  { id: "trainer-python",              title: "Snake Charmer",      description: "Finish every lesson in Python for Interviews",   icon: "🐍", xpReward: 75 },
  { id: "trainer-python-dp",           title: "DP in Python",       description: "Finish every lesson in the Python DP Masterclass", icon: "🧮", xpReward: 100 },
  { id: "trainer-string-dp",           title: "Word Wizard",        description: "Finish every lesson in the String DP Masterclass", icon: "📝", xpReward: 100 },
  { id: "trainer-interval-dp",         title: "Interval Champion",  description: "Finish every lesson in the Interval DP Masterclass", icon: "⏏️", xpReward: 125 },
  { id: "trainer-bitmask-dp",          title: "Bit Bender",         description: "Finish every lesson in the Bitmask DP Masterclass", icon: "🎛️", xpReward: 125 },
  { id: "trainer-tree-dp",             title: "Forest Ranger",      description: "Finish every lesson in the Tree DP Masterclass",  icon: "🌳", xpReward: 125 },
  { id: "trainer-recurrence-builder",  title: "Recurrence Ready",   description: "Derive every recurrence in Recurrence Builder",    icon: "🔁", xpReward: 60 },
  { id: "trainer-whiteboard",          title: "Board Sketcher",     description: "Complete every Whiteboard Mode problem",           icon: "📋", xpReward: 75 },
  { id: "trainer-all-dp",              title: "DP Grandmaster",     description: "Complete every DP masterclass",                    icon: "🏆", xpReward: 250 },
];

/**
 * Map trainerId → achievement unlocked when all its lessons are completed.
 * Used by App.tsx to fire the achievement right after trainerCompletions
 * reaches the trainer's total.
 */
export const TRAINER_COMPLETION_ACHIEVEMENTS: Record<string, string> = {
  "python":             "trainer-python",
  "python-dp":          "trainer-python-dp",
  "string-dp":          "trainer-string-dp",
  "interval-dp":        "trainer-interval-dp",
  "bitmask-dp":         "trainer-bitmask-dp",
  "tree-dp":            "trainer-tree-dp",
  "recurrence-builder": "trainer-recurrence-builder",
  "whiteboard":         "trainer-whiteboard",
};

/** Trainers that count toward the "DP Grandmaster" meta-achievement. */
export const DP_MASTERCLASS_TRAINER_IDS: string[] = [
  "python-dp",
  "string-dp",
  "interval-dp",
  "bitmask-dp",
  "tree-dp",
];

// ─── Streak ───

function localDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function calculateStreak(activityDates: string[]): number {
  if (activityDates.length === 0) return 0;

  const sorted = [...new Set(activityDates)].sort().reverse();
  const today = localDateString();
  const yesterday = localDateString(new Date(Date.now() - 86400000));

  // Streak must include today or yesterday
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Gamification state (stored in UserData) ───

export interface GamificationData {
  xp: number;
  achievementsUnlocked: string[]; // achievement IDs
  activityDates: string[];        // YYYY-MM-DD strings
}

export const DEFAULT_GAMIFICATION: GamificationData = {
  xp: 0,
  achievementsUnlocked: [],
  activityDates: [],
};

export function recordActivity(data: GamificationData): GamificationData {
  const today = localDateString();
  if (data.activityDates.includes(today)) return data;
  return { ...data, activityDates: [...data.activityDates, today] };
}

export function addXP(data: GamificationData, amount: number): GamificationData {
  return { ...data, xp: data.xp + amount };
}

export function unlockAchievement(data: GamificationData, id: string): GamificationData {
  if (data.achievementsUnlocked.includes(id)) return data;
  const achievement = ACHIEVEMENTS.find((a) => a.id === id);
  return {
    ...data,
    achievementsUnlocked: [...data.achievementsUnlocked, id],
    xp: data.xp + (achievement?.xpReward ?? 0),
  };
}
