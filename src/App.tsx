import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ModulePicker from "./components/ModulePicker";
import TransitionLesson from "./components/TransitionLesson";
import CompletionScreen from "./components/CompletionScreen";
import PracticeHub from "./components/PracticeHub";
import PracticeProblemView from "./components/PracticeProblemView";
import ComingSoonScreen from "./components/ComingSoonScreen";
import ProgressBar from "./components/ProgressBar";

// Lazy-loaded secondary screens — each becomes its own chunk so the
// initial load only pulls ~200KB of home-view code instead of the full
// bundle. The rest loads in the background as users navigate.
const AccountPage           = lazy(() => import("./components/AccountPage"));
const TrainingCenter        = lazy(() => import("./components/TrainingCenter"));
const CheatSheet            = lazy(() => import("./components/CheatSheet"));
const PatternFlowchart      = lazy(() => import("./components/PatternFlowchart"));
const LanguageGuide         = lazy(() => import("./components/LanguageGuide"));
const PythonTrainer         = lazy(() => import("./components/PythonTrainer"));
const ComplexityVisualizer  = lazy(() => import("./components/ComplexityVisualizer"));
const DataStructureSandbox  = lazy(() => import("./components/DataStructureSandbox"));
const PythonDPTrainer       = lazy(() => import("./components/PythonDPTrainer"));
const StatsDashboard        = lazy(() => import("./components/StatsDashboard"));
const PythonGotchas         = lazy(() => import("./components/PythonGotchas"));
const DPStateFinder         = lazy(() => import("./components/DPStateFinder"));
const RecurrenceBuilder     = lazy(() => import("./components/RecurrenceBuilder"));
const StringDPTrainer       = lazy(() => import("./components/StringDPTrainer"));
const IntervalDPTrainer     = lazy(() => import("./components/IntervalDPTrainer"));
const BitmaskDPTrainer      = lazy(() => import("./components/BitmaskDPTrainer"));
const TreeDPTrainer         = lazy(() => import("./components/TreeDPTrainer"));
const DPPatternRecognizer   = lazy(() => import("./components/DPPatternRecognizer"));
const WhiteboardMode        = lazy(() => import("./components/WhiteboardMode"));
import DailyChallenge from "./components/DailyChallenge";
import { dailyProblems } from "./content/dailyProblems";
import Confetti from "./components/Confetti";
import AchievementToast from "./components/AchievementToast";
import XPToast from "./components/XPToast";
import ResumeCard from "./components/ResumeCard";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
import CommandPalette from "./components/CommandPalette";
import type { CommandItem } from "./components/CommandPalette";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { modules as allModuleConfigs } from "./modules/registry";
import { dpModule } from "./modules/dp";
import { graphsModule } from "./modules/graphs";
import type { ModuleId, ModuleExport, ProblemEntry } from "./modules/types";
import {
  XP_REWARDS,
  ACHIEVEMENTS,
  TRAINER_COMPLETION_ACHIEVEMENTS,
  DP_MASTERCLASS_TRAINER_IDS,
  addXP,
  unlockAchievement,
  recordActivity,
  calculateStreak,
  getLevel,
  type Achievement,
} from "./engine/gamification";
import {
  loadUserData,
  debouncedSave,
  flushPendingSave,
  loadLocalData,
  saveLocalData,
  getModuleProgress,
  updateModuleProgress,
  recordTrainingScore,
  recordTrainerCompletion,
  type UserData,
  type LessonProgress,
} from "./services/userDataService";

// ─── Module registry ───

const moduleExports: Partial<Record<ModuleId, ModuleExport>> = {
  dp: dpModule,
  graphs: graphsModule,
};

function getModuleExport(id: ModuleId): ModuleExport | null {
  return moduleExports[id] ?? null;
}

// ─── Routing ───

type AppView =
  | { screen: "home" }
  | { screen: "module-intro"; moduleId: ModuleId }
  | { screen: "lesson"; moduleId: ModuleId; problemId: string }
  | { screen: "transition"; moduleId: ModuleId; transitionId: string }
  | { screen: "module-complete"; moduleId: ModuleId }
  | { screen: "practice"; moduleId: ModuleId }
  | { screen: "practice-problem"; moduleId: ModuleId; problemId: string }
  | { screen: "account" }
  | { screen: "training" }
  | { screen: "cheatsheet" }
  | { screen: "flowchart" }
  | { screen: "languages" }
  | { screen: "python" }
  | { screen: "complexity-viz" }
  | { screen: "sandbox" }
  | { screen: "python-dp" }
  | { screen: "stats" }
  | { screen: "gotchas" }
  | { screen: "state-finder" }
  | { screen: "recurrence-builder" }
  | { screen: "string-dp" }
  | { screen: "interval-dp" }
  | { screen: "bitmask-dp" }
  | { screen: "tree-dp" }
  | { screen: "pattern-recognizer" }
  | { screen: "whiteboard" };

const DEFAULT_DATA: UserData = { modules: {}, gamification: { xp: 0, achievementsUnlocked: [], activityDates: [] } };

/**
 * Total lessons per standalone trainer. Used for completion-achievement
 * checks in `completeTrainerLesson`. Keep in sync with trainer lesson counts.
 */
const TRAINER_TOTALS: Record<string, number> = {
  "python":             8,
  "python-dp":          6,
  "string-dp":          6,
  "interval-dp":        5,
  "bitmask-dp":         5,
  "tree-dp":            5,
  "recurrence-builder": 3,
  "whiteboard":         5,
};

function AppInner() {
  const { user, loading, signIn } = useAuth();
  const [view, setView] = useState<AppView>({ screen: "home" });
  const [userData, setUserData] = useState<UserData>(DEFAULT_DATA);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);
  // XP toast: bump `xpToast.id` to retrigger the animation for rapid awards.
  const [xpToast, setXpToast] = useState<{ amount: number; id: number } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Load data on auth change
  useEffect(() => {
    async function load() {
      if (user) {
        const data = await loadUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(loadLocalData());
      }
      setDataLoaded(true);
    }
    load();
  }, [user]);

  const persist = useCallback(
    (data: UserData) => {
      if (user) {
        debouncedSave(user.uid, data);
      } else {
        saveLocalData(data);
      }
    },
    [user]
  );

  useEffect(() => {
    const handleUnload = () => flushPendingSave();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Flush pending saves when user signs out
  useEffect(() => {
    if (!user && dataLoaded) flushPendingSave();
  }, [user, dataLoaded]);

  // ─── Gamification helpers ───

  const awardXP = useCallback(
    (amount: number) => {
      if (amount <= 0) return;
      // Fire a transient "+N XP" toast on every award. Using a fresh id each
      // time retriggers the animation even if two awards land back-to-back.
      setXpToast({ amount, id: Date.now() });
      setTimeout(() => setXpToast(null), 1700);

      setUserData((prev) => {
        const oldLevel = getLevel(prev.gamification.xp);
        let gam = addXP(prev.gamification, amount);
        gam = recordActivity(gam);
        const newLevel = getLevel(gam.xp);

        if (newLevel.name !== oldLevel.name) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }

        const streak = calculateStreak(gam.activityDates);
        if (streak >= 3 && !gam.achievementsUnlocked.includes("streak-3")) gam = unlockAchievement(gam, "streak-3");
        if (streak >= 7 && !gam.achievementsUnlocked.includes("streak-7")) gam = unlockAchievement(gam, "streak-7");
        if (streak >= 14 && !gam.achievementsUnlocked.includes("streak-14")) gam = unlockAchievement(gam, "streak-14");

        if (gam.xp >= 350 && !gam.achievementsUnlocked.includes("level-intermediate")) gam = unlockAchievement(gam, "level-intermediate");
        if (gam.xp >= 1000 && !gam.achievementsUnlocked.includes("level-expert")) gam = unlockAchievement(gam, "level-expert");
        if (gam.xp >= 1500 && !gam.achievementsUnlocked.includes("level-master")) gam = unlockAchievement(gam, "level-master");

        const next = { ...prev, gamification: gam };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const tryUnlockAchievement = useCallback(
    (id: string) => {
      setUserData((prev) => {
        if (prev.gamification.achievementsUnlocked.includes(id)) return prev;
        const gam = unlockAchievement(prev.gamification, id);
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (achievement) {
          setToastAchievement(achievement);
          setTimeout(() => setToastAchievement(null), 3500);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        const next = { ...prev, gamification: gam };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // ─── Data helpers ───

  const activeModuleId = "moduleId" in view ? view.moduleId : null;
  const activeModule = activeModuleId ? allModuleConfigs.find((m) => m.id === activeModuleId) : null;
  const activeModuleExport = activeModuleId ? getModuleExport(activeModuleId) : null;

  const updateLessonProgress = useCallback(
    (moduleId: ModuleId, problemId: string, update: Partial<LessonProgress>) => {
      setUserData((prev) => {
        const modProgress = getModuleProgress(prev, moduleId);
        const existing = modProgress.lessonProgress[problemId] || { stage: "intro", challengePassed: false, code: { js: "", py: "" } };
        const nextMod = { ...modProgress, lessonProgress: { ...modProgress.lessonProgress, [problemId]: { ...existing, ...update } } };
        const next = updateModuleProgress(prev, moduleId, nextMod);
        persist(next);
        return next;
      });

      // Award XP for stage advancement
      if (update.stage) {
        awardXP(XP_REWARDS.lessonStageComplete);
        tryUnlockAchievement("first-lesson");
      }
      if (update.challengePassed) {
        awardXP(XP_REWARDS.lessonChallengePassed);
        tryUnlockAchievement("first-solve");

        // Check if all lessons in module are complete
        const mod = getModuleExport(moduleId);
        if (mod) {
          const progress = getModuleProgress(userData, moduleId);
          const allDone = mod.problems.every((p) =>
            p.id === problemId ? true : progress.lessonProgress[p.id]?.challengePassed
          );
          if (allDone) tryUnlockAchievement("module-complete");
        }
      }
    },
    [persist, awardXP, tryUnlockAchievement, userData]
  );

  const markPracticeComplete = useCallback(
    (moduleId: ModuleId, id: string) => {
      // Find difficulty for XP
      const mod = getModuleExport(moduleId);
      const problem = mod?.practice.find((p) => p.id === id);
      const xp = problem?.difficulty === "Hard" ? XP_REWARDS.practiceHard
        : problem?.difficulty === "Medium" ? XP_REWARDS.practiceMedium
        : XP_REWARDS.practiceEasy;

      setUserData((prev) => {
        const modProgress = getModuleProgress(prev, moduleId);
        if (modProgress.practiceCompleted.includes(id)) return prev;
        const next = updateModuleProgress(prev, moduleId, { practiceCompleted: [...modProgress.practiceCompleted, id] });
        persist(next);
        return next;
      });

      awardXP(xp);
      tryUnlockAchievement("first-practice");

      // Check completion achievements
      if (mod) {
        const progress = getModuleProgress(userData, moduleId);
        const newCompleted = [...progress.practiceCompleted, id];
        const allEasy = mod.practice.filter((p) => p.difficulty === "Easy").every((p) => newCompleted.includes(p.id));
        const allMedium = mod.practice.filter((p) => p.difficulty === "Medium").every((p) => newCompleted.includes(p.id));
        const allDone = mod.practice.every((p) => newCompleted.includes(p.id));
        if (allEasy) tryUnlockAchievement("all-practice-easy");
        if (allMedium) tryUnlockAchievement("all-practice-medium");
        if (allDone) tryUnlockAchievement("all-practice");
      }
    },
    [persist, awardXP, tryUnlockAchievement, userData]
  );

  const savePracticeCode = useCallback(
    (moduleId: ModuleId, id: string, lang: "js" | "py", code: string) => {
      setUserData((prev) => {
        const modProgress = getModuleProgress(prev, moduleId);
        const existing = modProgress.practiceCode[id] || { js: "", py: "" };
        const next = updateModuleProgress(prev, moduleId, { practiceCode: { ...modProgress.practiceCode, [id]: { ...existing, [lang]: code } } });
        persist(next);
        return next;
      });
    },
    [persist]
  );

  /**
   * Persistently records a trainer-lesson completion and awards XP only the
   * first time. Trainers just call with their id and lesson id; this handles
   * dedup across sessions via Firestore. When the completion fills up the
   * trainer's total, the trainer-completion achievement also unlocks.
   */
  const completeTrainerLesson = useCallback(
    (trainerId: string, lessonId: string, xp: number, trainerTotal?: number) => {
      setUserData((prev) => {
        const { data, firstTime } = recordTrainerCompletion(prev, trainerId, lessonId);
        if (!firstTime) return prev;
        persist(data);

        // XP after state update cycle.
        setTimeout(() => awardXP(xp), 0);

        // Check for trainer-completion achievement.
        if (trainerTotal !== undefined) {
          const doneCount = data.trainerCompletions?.[trainerId]?.length ?? 0;
          if (doneCount === trainerTotal) {
            const achievementId = TRAINER_COMPLETION_ACHIEVEMENTS[trainerId];
            if (achievementId) {
              setTimeout(() => tryUnlockAchievement(achievementId), 0);
            }
            // Meta achievement: if all DP masterclasses are complete.
            if (DP_MASTERCLASS_TRAINER_IDS.includes(trainerId)) {
              const allDone = DP_MASTERCLASS_TRAINER_IDS.every((tid) => {
                const tDone = tid === trainerId ? doneCount : data.trainerCompletions?.[tid]?.length ?? 0;
                const tTotal = TRAINER_TOTALS[tid] ?? 0;
                return tDone >= tTotal && tTotal > 0;
              });
              if (allDone) setTimeout(() => tryUnlockAchievement("trainer-all-dp"), 0);
            }
          }
        }
        return data;
      });
    },
    [persist, awardXP, tryUnlockAchievement]
  );

  const resetAllProgress = useCallback(() => {
    const fresh = { ...DEFAULT_DATA, gamification: { xp: 0, achievementsUnlocked: [], activityDates: [] } };
    setUserData(fresh);
    persist(fresh);
    setView({ screen: "home" });
  }, [persist]);

  // ─── Navigation helpers ───

  const nav = {
    home: () => setView({ screen: "home" }),
    moduleIntro: (m: ModuleId) => setView({ screen: "module-intro", moduleId: m }),
    lesson: (m: ModuleId, p: string) => setView({ screen: "lesson", moduleId: m, problemId: p }),
    transition: (m: ModuleId, t: string) => setView({ screen: "transition", moduleId: m, transitionId: t }),
    moduleComplete: (m: ModuleId) => setView({ screen: "module-complete", moduleId: m }),
    practice: (m: ModuleId) => setView({ screen: "practice", moduleId: m }),
    practiceProblem: (m: ModuleId, p: string) => setView({ screen: "practice-problem", moduleId: m, problemId: p }),
    account: () => setView({ screen: "account" }),
    training: () => setView({ screen: "training" }),
    cheatsheet: () => setView({ screen: "cheatsheet" }),
    flowchart: () => setView({ screen: "flowchart" }),
    languages: () => setView({ screen: "languages" }),
    python: () => setView({ screen: "python" }),
    complexityViz: () => setView({ screen: "complexity-viz" }),
    sandbox: () => setView({ screen: "sandbox" }),
    pythonDP: () => setView({ screen: "python-dp" }),
    stats: () => setView({ screen: "stats" }),
    gotchas: () => setView({ screen: "gotchas" }),
    stateFinder: () => setView({ screen: "state-finder" }),
    recurrenceBuilder: () => setView({ screen: "recurrence-builder" }),
    stringDP: () => setView({ screen: "string-dp" }),
    intervalDP: () => setView({ screen: "interval-dp" }),
    bitmaskDP: () => setView({ screen: "bitmask-dp" }),
    treeDP: () => setView({ screen: "tree-dp" }),
    patternRecognizer: () => setView({ screen: "pattern-recognizer" }),
    whiteboard: () => setView({ screen: "whiteboard" }),
  };

  // Keyboard shortcuts (global). Skipped when the user is typing in an input.
  const { theme, toggle: toggleTheme } = useTheme();
  useKeyboardShortcuts(
    [
      { keys: "?", description: "Show keyboard shortcuts", handler: () => setShowShortcuts(true) },
      { keys: "shift+/", description: "Show keyboard shortcuts", handler: () => setShowShortcuts(true) },
      { keys: "mod+k", description: "Open command palette", handler: () => setShowPalette(true), allowInInput: true },
      { keys: "/", description: "Open command palette", handler: () => setShowPalette(true) },
      { keys: "Escape", description: "Go home / close dialog", handler: () => {
        if (showPalette) setShowPalette(false);
        else if (showShortcuts) setShowShortcuts(false);
        else if (view.screen !== "home") setView({ screen: "home" });
      } },
      { keys: "g h", description: "Go home", handler: () => setView({ screen: "home" }) },
      { keys: "g s", description: "Go to stats", handler: () => setView({ screen: "stats" }) },
      { keys: "g t", description: "Go to training", handler: () => setView({ screen: "training" }) },
      { keys: "g c", description: "Open cheat sheet", handler: () => setView({ screen: "cheatsheet" }) },
      { keys: "t", description: "Toggle theme", handler: toggleTheme },
    ],
    true
  );
  // Silence theme unused warning in case of future refactor
  void theme;

  // Command palette items — keep declarative so we can iterate cheaply.
  const commandItems: CommandItem[] = [
    // Modules
    { id: "home",             label: "Home / Module picker",       category: "Navigation",  icon: "🏠", handler: () => setView({ screen: "home" }) },
    { id: "dp-module",        label: "Dynamic Programming",         category: "Module",      icon: "🎯", keywords: ["dp"], handler: () => setView({ screen: "module-intro", moduleId: "dp" }) },
    { id: "graphs-module",    label: "Graph Algorithms",            category: "Module",      icon: "🕸️", keywords: ["bfs", "dfs", "dijkstra"], handler: () => setView({ screen: "module-intro", moduleId: "graphs" }) },
    // DP masterclasses
    { id: "python-dp",        label: "Python DP Masterclass",       category: "DP Deep Dive", icon: "🧮", keywords: ["memoization", "lru_cache"], handler: () => setView({ screen: "python-dp" }) },
    { id: "string-dp",        label: "String DP Masterclass",       category: "DP Deep Dive", icon: "📝", keywords: ["lcs", "edit distance", "palindrome", "word break"], handler: () => setView({ screen: "string-dp" }) },
    { id: "interval-dp",      label: "Interval DP Masterclass",     category: "DP Deep Dive", icon: "⏏️", keywords: ["matrix chain", "burst balloons", "stone game"], handler: () => setView({ screen: "interval-dp" }) },
    { id: "bitmask-dp",       label: "Bitmask DP Masterclass",      category: "DP Deep Dive", icon: "🎛️", keywords: ["tsp", "subset", "traveling salesman"], handler: () => setView({ screen: "bitmask-dp" }) },
    { id: "tree-dp",          label: "Tree DP Masterclass",         category: "DP Deep Dive", icon: "🌳", keywords: ["diameter", "rerooting", "post-order"], handler: () => setView({ screen: "tree-dp" }) },
    // DP drills
    { id: "state-finder",     label: "DP State Finder",             category: "DP Drill",    icon: "🧠", keywords: ["state", "quiz"], handler: () => setView({ screen: "state-finder" }) },
    { id: "recurrence",       label: "Recurrence Builder",          category: "DP Drill",    icon: "🔁", keywords: ["derive", "transition"], handler: () => setView({ screen: "recurrence-builder" }) },
    { id: "pattern-quiz",     label: "DP Pattern Recognizer",       category: "DP Drill",    icon: "🎯", keywords: ["quiz", "identify"], handler: () => setView({ screen: "pattern-recognizer" }) },
    { id: "whiteboard",       label: "Whiteboard Mode",             category: "DP Drill",    icon: "📋", keywords: ["sketch", "approach", "interview"], handler: () => setView({ screen: "whiteboard" }) },
    // General
    { id: "python-trainer",   label: "Python for Interviews",       category: "Interview Prep", icon: "🐍", keywords: ["list comprehension", "counter", "enumerate"], handler: () => setView({ screen: "python" }) },
    { id: "gotchas",          label: "Python Gotchas",              category: "Interview Prep", icon: "⚠️", keywords: ["mutable default", "integer division"], handler: () => setView({ screen: "gotchas" }) },
    { id: "flowchart",        label: "Pattern Finder",              category: "Interview Prep", icon: "🧭", keywords: ["algorithm", "identify"], handler: () => setView({ screen: "flowchart" }) },
    { id: "languages",        label: "Language Guide",              category: "Interview Prep", icon: "💬", keywords: ["python", "java", "c++"], handler: () => setView({ screen: "languages" }) },
    { id: "sandbox",          label: "Data Structure Sandbox",      category: "Interview Prep", icon: "🎮", keywords: ["stack", "queue", "heap", "map", "set"], handler: () => setView({ screen: "sandbox" }) },
    { id: "training",         label: "Training Center",             category: "Interview Prep", icon: "⚡", keywords: ["quiz", "bug hunt", "drill"], handler: () => setView({ screen: "training" }) },
    // Reference
    { id: "cheatsheet",       label: "Cheat Sheet",                 category: "Reference",   icon: "📋", keywords: ["complexity", "big o", "patterns"], handler: () => setView({ screen: "cheatsheet" }) },
    { id: "complexity",       label: "Complexity Visualizer",       category: "Reference",   icon: "📈", keywords: ["big o", "log", "exponential"], handler: () => setView({ screen: "complexity-viz" }) },
    { id: "stats",            label: "My Stats",                    category: "Reference",   icon: "📊", keywords: ["xp", "progress", "achievements"], handler: () => setView({ screen: "stats" }) },
    { id: "account",          label: "Account",                     category: "Reference",   icon: "👤", keywords: ["sign out", "reset"], handler: () => setView({ screen: "account" }) },
    // Actions
    { id: "toggle-theme",     label: `Toggle theme (${theme === "light" ? "light → dark" : "dark → light"})`, category: "Action", icon: "🌓", handler: toggleTheme },
  ];

  // Get progress for module picker
  function getModulePickerProgress(id: ModuleId) {
    const mod = getModuleProgress(userData, id);
    return {
      lessons: Object.values(mod.lessonProgress).filter((l) => l.challengePassed).length,
      practice: mod.practiceCompleted.length,
    };
  }

  // ─── Current module context ───

  const currentProblems: ProblemEntry[] = activeModuleExport?.problems ?? [];
  const currentProblemIdx = view.screen === "lesson" ? currentProblems.findIndex((p) => p.id === view.problemId) : -1;
  const currentProblem = currentProblemIdx >= 0 ? currentProblems[currentProblemIdx] : null;
  const currentTransition = view.screen === "transition" && activeModuleExport
    ? currentProblems.find((p) => p.transitionAfter?.viewId === view.transitionId)?.transitionAfter
    : null;

  // Guard: redirect invalid problem/transition/practice IDs to module intro
  useEffect(() => {
    if (view.screen === "lesson" && activeModuleId && currentProblemIdx === -1 && currentProblems.length > 0) {
      nav.lesson(activeModuleId, currentProblems[0].id);
    }
    if (view.screen === "transition" && activeModuleId && !currentTransition) {
      nav.moduleIntro(activeModuleId);
    }
  }, [view, activeModuleId, currentProblemIdx, currentTransition, currentProblems]);

  const modProgress = activeModuleId ? getModuleProgress(userData, activeModuleId) : null;
  const practiceProblemId = view.screen === "practice-problem" ? view.problemId : null;
  const practiceProblem = practiceProblemId && activeModuleExport
    ? activeModuleExport.practice.find((p) => p.id === practiceProblemId)
    : null;

  // Guard: redirect invalid practice problem IDs
  useEffect(() => {
    if (view.screen === "practice-problem" && activeModuleId && !practiceProblem) {
      nav.practice(activeModuleId);
    }
  }, [view, activeModuleId, practiceProblem]);

  function handleNextFromLesson() {
    if (!activeModuleId || !currentProblem) return;
    if (currentProblem.transitionAfter) {
      nav.transition(activeModuleId, currentProblem.transitionAfter.viewId);
    } else if (currentProblemIdx === currentProblems.length - 1) {
      nav.moduleComplete(activeModuleId);
    }
  }

  // Active nav problem highlight
  const activeNavProblemId = view.screen === "lesson" ? view.problemId
    : view.screen === "transition" ? currentProblems.find((p) => p.transitionAfter?.viewId === view.transitionId)?.id ?? null
    : null;

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-blue-200 dark:border-blue-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400 dark:text-slate-500 animate-fade-in">Loading your progress...</p>
      </div>
    );
  }

  // Module nav shows when we're inside a module (intro / lesson / transition / practice / etc.).
  // Listing the module-scoped screens is shorter and safer than excluding every standalone view.
  const MODULE_SCREENS: ReadonlySet<AppView["screen"]> = new Set([
    "module-intro",
    "lesson",
    "transition",
    "module-complete",
    "practice",
    "practice-problem",
  ]);
  const showModuleNav = activeModule && MODULE_SCREENS.has(view.screen);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={nav.home} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">Interview Prep Lab</h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                {activeModule ? activeModule.title : "Master the hard stuff"}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {/* Module nav — shows problem tabs for current module */}
            {showModuleNav && activeModuleExport && (
              <nav className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs animate-fade-in">
                {currentProblems.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => nav.lesson(activeModuleId!, p.id)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                      p.id === activeNavProblemId
                        ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                {activeModuleExport.practice.length > 0 && (
                  <>
                    <div className="w-px bg-slate-300 mx-0.5" />
                    <button
                      onClick={() => nav.practice(activeModuleId!)}
                      className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                        view.screen === "practice" || view.screen === "practice-problem"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                      }`}
                    >
                      Practice
                      {modProgress && modProgress.practiceCompleted.length > 0 && (
                        <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                          {modProgress.practiceCompleted.length}/{activeModuleExport.practice.length}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </nav>
            )}

            {/* Keyboard shortcuts */}
            <button
              onClick={() => setShowShortcuts(true)}
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Auth */}
            {user ? (
              <button
                onClick={nav.account}
                aria-label={`Account menu for ${user.displayName || "user"}`}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${view.screen === "account" ? "bg-slate-100 dark:bg-slate-800" : ""}`}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                    {user.displayName?.[0] || "?"}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={signIn}
                aria-label="Sign in with Google"
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      {/* Confetti + Achievement Toast + XP Toast + Shortcuts modal */}
      {showConfetti && <Confetti />}
      {toastAchievement && <AchievementToast achievement={toastAchievement} />}
      {xpToast && <XPToast amount={xpToast.amount} instanceId={xpToast.id} />}
      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} items={commandItems} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Suspense fallback={<LazyLoadingFallback />}>
        {/* Home / Module Picker */}
        {view.screen === "home" && (
          <>
          {userData.gamification.xp > 0 && (
            <div className="mb-6">
              <ProgressBar data={userData.gamification} />
            </div>
          )}
          {/* Pick up where you left off (only shows when there's something to resume) */}
          <div className="mb-6">
            <ResumeCard
              userData={userData}
              onGoLesson={(m, p) => nav.lesson(m, p)}
              onGoPractice={(m) => nav.practice(m)}
              onGoTrainer={(trainerId) => {
                const handler: Record<string, () => void> = {
                  "python":             nav.python,
                  "python-dp":          nav.pythonDP,
                  "string-dp":          nav.stringDP,
                  "interval-dp":        nav.intervalDP,
                  "bitmask-dp":         nav.bitmaskDP,
                  "tree-dp":            nav.treeDP,
                  "recurrence-builder": nav.recurrenceBuilder,
                  "whiteboard":         nav.whiteboard,
                };
                handler[trainerId]?.();
              }}
            />
          </div>
          <div className="mb-6">
            <DailyChallenge
              problems={dailyProblems}
              completedToday={userData.gamification.activityDates.includes(
                `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
              )}
              streak={calculateStreak(userData.gamification.activityDates)}
              onComplete={() => { awardXP(25); tryUnlockAchievement("first-practice"); }}
            />
          </div>
          <ModulePicker
            modules={allModuleConfigs}
            onSelectModule={(id) => {
              const mod = getModuleExport(id);
              if (mod?.IntroScreen) {
                nav.moduleIntro(id);
              } else {
                // Coming soon module
                nav.moduleIntro(id);
              }
            }}
            getProgress={getModulePickerProgress}
            getTrainerProgress={(trainerId) => (userData.trainerCompletions?.[trainerId]?.length ?? 0)}
            onTraining={nav.training}
            tools={{
              cheatsheet: nav.cheatsheet,
              flowchart: nav.flowchart,
              languages: nav.languages,
              python: nav.python,
              complexityViz: nav.complexityViz,
              sandbox: nav.sandbox,
              pythonDP: nav.pythonDP,
              stats: nav.stats,
              gotchas: nav.gotchas,
              stateFinder: nav.stateFinder,
              recurrenceBuilder: nav.recurrenceBuilder,
              stringDP: nav.stringDP,
              intervalDP: nav.intervalDP,
              bitmaskDP: nav.bitmaskDP,
              treeDP: nav.treeDP,
              patternRecognizer: nav.patternRecognizer,
              whiteboard: nav.whiteboard,
            }}
          />
          </>
        )}

        {/* Module intro */}
        {view.screen === "module-intro" && activeModuleId && (() => {
          const mod = getModuleExport(activeModuleId);
          if (mod?.IntroScreen) {
            const IntroComp = mod.IntroScreen;
            const firstProblem = mod.problems[0];
            return <IntroComp onStart={() => firstProblem && nav.lesson(activeModuleId, firstProblem.id)} />;
          }
          const config = allModuleConfigs.find((m) => m.id === activeModuleId);
          if (config) return <ComingSoonScreen module={config} onBack={nav.home} />;
          return null;
        })()}

        {/* Lesson */}
        {view.screen === "lesson" && activeModuleId && currentProblem && activeModuleExport?.LessonComponent && (() => {
          const LessonComp = activeModuleExport.LessonComponent;
          const nextProblem = currentProblemIdx < currentProblems.length - 1 ? currentProblems[currentProblemIdx + 1] : null;
          const savedProgress = modProgress?.lessonProgress[currentProblem.id];
          return (
            <LessonComp
              key={currentProblem.id}
              config={currentProblem.config}
              nextProblemLabel={
                currentProblem.transitionAfter ? currentProblem.transitionAfter.content.toLabel
                : nextProblem ? nextProblem.label : null
              }
              onNextProblem={handleNextFromLesson}
              savedProgress={savedProgress}
              onProgressChange={(update: Partial<LessonProgress>) => updateLessonProgress(activeModuleId, currentProblem.id, update)}
            />
          );
        })()}

        {/* Transition */}
        {view.screen === "transition" && activeModuleId && currentTransition && (
          <TransitionLesson
            key={view.transitionId}
            content={currentTransition.content}
            onContinue={() => nav.lesson(activeModuleId, currentTransition.nextView)}
          />
        )}

        {/* Module complete */}
        {view.screen === "module-complete" && activeModuleId && activeModuleExport?.completionContent && (
          <CompletionScreen
            content={activeModuleExport.completionContent}
            onPractice={() => nav.practice(activeModuleId)}
            onHome={nav.home}
          />
        )}

        {/* Practice hub */}
        {view.screen === "practice" && activeModuleId && activeModuleExport && modProgress && (
          <PracticeHub
            problems={activeModuleExport.practice}
            completedIds={new Set(modProgress.practiceCompleted)}
            onSelectProblem={(id) => nav.practiceProblem(activeModuleId, id)}
          />
        )}

        {/* Practice problem */}
        {view.screen === "practice-problem" && activeModuleId && practiceProblem && modProgress && (
          <PracticeProblemView
            key={practiceProblem.id}
            problem={practiceProblem}
            onBack={() => nav.practice(activeModuleId)}
            onComplete={(id) => markPracticeComplete(activeModuleId, id)}
            isCompleted={modProgress.practiceCompleted.includes(practiceProblem.id)}
            savedCode={modProgress.practiceCode[practiceProblem.id]}
            onCodeChange={(lang, code) => savePracticeCode(activeModuleId, practiceProblem.id, lang, code)}
          />
        )}

        {/* Cheat Sheet */}
        {view.screen === "cheatsheet" && (
          <CheatSheet onBack={nav.home} />
        )}

        {/* Pattern Flowchart */}
        {view.screen === "flowchart" && (
          <PatternFlowchart onBack={nav.home} />
        )}

        {/* Language Guide */}
        {view.screen === "languages" && (
          <LanguageGuide onBack={nav.home} />
        )}

        {/* Python Trainer */}
        {view.screen === "python" && (
          <PythonTrainer
            onBack={nav.home}
            onLessonComplete={(id) => completeTrainerLesson("python", id, XP_REWARDS.trainerLessonComplete, TRAINER_TOTALS["python"])}
          />
        )}

        {/* Complexity Visualizer */}
        {view.screen === "complexity-viz" && (
          <ComplexityVisualizer onBack={nav.home} />
        )}

        {/* Data Structure Sandbox */}
        {view.screen === "sandbox" && (
          <DataStructureSandbox onBack={nav.home} />
        )}

        {/* Python DP Trainer */}
        {view.screen === "python-dp" && (
          <PythonDPTrainer
            onBack={nav.home}
            onLessonComplete={(id) => completeTrainerLesson("python-dp", id, XP_REWARDS.trainerLessonComplete, TRAINER_TOTALS["python-dp"])}
          />
        )}

        {/* Stats Dashboard */}
        {view.screen === "stats" && (
          <StatsDashboard userData={userData} moduleConfigs={allModuleConfigs} onBack={nav.home} />
        )}

        {/* Python Gotchas */}
        {view.screen === "gotchas" && (
          <PythonGotchas onBack={nav.home} />
        )}

        {/* DP State Finder */}
        {view.screen === "state-finder" && (
          <DPStateFinder onBack={nav.home} onCorrectAnswer={() => awardXP(XP_REWARDS.quizCorrect)} />
        )}

        {/* Recurrence Builder */}
        {view.screen === "recurrence-builder" && (
          <RecurrenceBuilder
            onBack={nav.home}
            onDrillComplete={(id) => completeTrainerLesson("recurrence-builder", id, XP_REWARDS.drillCompleted, TRAINER_TOTALS["recurrence-builder"])}
          />
        )}

        {/* String DP Masterclass */}
        {view.screen === "string-dp" && (
          <StringDPTrainer
            onBack={nav.home}
            onLessonComplete={(id) => completeTrainerLesson("string-dp", id, XP_REWARDS.trainerLessonComplete, TRAINER_TOTALS["string-dp"])}
          />
        )}

        {/* Interval DP Masterclass */}
        {view.screen === "interval-dp" && (
          <IntervalDPTrainer
            onBack={nav.home}
            onLessonComplete={(id) => completeTrainerLesson("interval-dp", id, XP_REWARDS.trainerLessonComplete, TRAINER_TOTALS["interval-dp"])}
          />
        )}

        {/* Bitmask DP Masterclass */}
        {view.screen === "bitmask-dp" && (
          <BitmaskDPTrainer
            onBack={nav.home}
            onLessonComplete={(id) => completeTrainerLesson("bitmask-dp", id, XP_REWARDS.trainerLessonComplete, TRAINER_TOTALS["bitmask-dp"])}
          />
        )}

        {/* Tree DP Masterclass */}
        {view.screen === "tree-dp" && (
          <TreeDPTrainer
            onBack={nav.home}
            onLessonComplete={(id) => completeTrainerLesson("tree-dp", id, XP_REWARDS.trainerLessonComplete, TRAINER_TOTALS["tree-dp"])}
          />
        )}

        {/* DP Pattern Recognizer */}
        {view.screen === "pattern-recognizer" && (
          <DPPatternRecognizer onBack={nav.home} onCorrectAnswer={() => awardXP(XP_REWARDS.quizCorrect)} />
        )}

        {/* Whiteboard Mode */}
        {view.screen === "whiteboard" && (
          <WhiteboardMode
            onBack={nav.home}
            onDrillComplete={(id) => completeTrainerLesson("whiteboard", id, XP_REWARDS.drillCompleted, TRAINER_TOTALS["whiteboard"])}
          />
        )}

        {/* Training Center */}
        {view.screen === "training" && (
          <TrainingCenter
            onBack={nav.home}
            onXP={awardXP}
            onRecordScore={(activityId, score, total) => {
              setUserData((prev) => {
                const next = recordTrainingScore(prev, activityId, score, total);
                persist(next);
                return next;
              });
            }}
          />
        )}

        {/* Account */}
        {view.screen === "account" && (
          <AccountPage
            userData={userData}
            onReset={resetAllProgress}
            moduleConfigs={allModuleConfigs}
            onHome={nav.home}
          />
        )}
        </Suspense>
      </main>
    </div>
  );
}

/** Fallback shown while a lazy-loaded screen's chunk is downloading. */
function LazyLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-xs text-slate-400 dark:text-slate-500">Loading…</p>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {theme === "light" ? (
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
