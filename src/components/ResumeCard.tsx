import type { UserData } from "../services/userDataService";

/**
 * "Pick up where you left off" — a prominent card on the home screen that
 * resumes the most likely thing the user wants to continue. Heuristic
 * priority:
 *   1. A DP-module lesson with stage != "challenge-passed" (still working)
 *   2. A trainer with partial progress (done > 0 and done < total)
 *   3. The first unattempted module if the user has XP > 0
 * If none of the above fits, returns null and the card is hidden.
 */
interface ResumeTarget {
  kind: "module-lesson" | "trainer" | "module-practice";
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  onGo: () => void;
}

interface Props {
  userData: UserData;
  onGoLesson: (moduleId: "dp" | "graphs", problemId: string) => void;
  onGoPractice: (moduleId: "dp" | "graphs") => void;
  onGoTrainer: (trainerId: string) => void;
}

interface TrainerMeta {
  id: string;
  total: number;
  label: string;
  icon: string;
  color: string;
}

const TRAINERS: TrainerMeta[] = [
  { id: "python-dp",          total: 6, label: "Python DP Masterclass",   icon: "🧮", color: "from-violet-500 to-blue-600" },
  { id: "string-dp",          total: 6, label: "String DP Masterclass",   icon: "📝", color: "from-rose-500 to-orange-600" },
  { id: "interval-dp",        total: 5, label: "Interval DP Masterclass", icon: "⏏️", color: "from-indigo-500 to-pink-600" },
  { id: "bitmask-dp",         total: 5, label: "Bitmask DP Masterclass",  icon: "🎛️", color: "from-cyan-500 to-emerald-600" },
  { id: "tree-dp",            total: 5, label: "Tree DP Masterclass",     icon: "🌳", color: "from-green-500 to-teal-600" },
  { id: "python",             total: 8, label: "Python for Interviews",   icon: "🐍", color: "from-blue-500 to-yellow-500" },
  { id: "recurrence-builder", total: 3, label: "Recurrence Builder",      icon: "🔁", color: "from-pink-500 to-rose-600" },
  { id: "whiteboard",         total: 5, label: "Whiteboard Mode",         icon: "📋", color: "from-slate-700 to-slate-900" },
];

function findResumeTarget(props: Props): ResumeTarget | null {
  const { userData, onGoLesson, onGoPractice, onGoTrainer } = props;

  // 1. Look for an in-progress module lesson — stage set but not challenge-passed
  for (const moduleId of ["dp", "graphs"] as const) {
    const mod = userData.modules[moduleId];
    if (!mod) continue;
    const entries = Object.entries(mod.lessonProgress);
    // Find one with progress but not yet passed
    const inProgress = entries.find(
      ([, prog]) => !prog.challengePassed && prog.stage && prog.stage !== "intro"
    );
    if (inProgress) {
      const [problemId, prog] = inProgress;
      const stageLabel = prog.stage === "challenge" ? "challenge" : prog.stage;
      return {
        kind: "module-lesson",
        label: `Resume ${moduleId.toUpperCase()} lesson`,
        subtitle: `${problemId.replace(/-/g, " ")} — ${stageLabel}`,
        icon: moduleId === "dp" ? "🎯" : "🕸️",
        color: moduleId === "dp" ? "from-blue-500 to-violet-600" : "from-emerald-500 to-teal-600",
        onGo: () => onGoLesson(moduleId, problemId),
      };
    }
  }

  // 2. Look for a partially-completed trainer
  for (const t of TRAINERS) {
    const done = userData.trainerCompletions?.[t.id]?.length ?? 0;
    if (done > 0 && done < t.total) {
      return {
        kind: "trainer",
        label: `Continue ${t.label}`,
        subtitle: `${done} of ${t.total} lessons complete`,
        icon: t.icon,
        color: t.color,
        onGo: () => onGoTrainer(t.id),
      };
    }
  }

  // 3. Look for a module with all lessons done but practice still unfinished
  for (const moduleId of ["dp", "graphs"] as const) {
    const mod = userData.modules[moduleId];
    if (!mod) continue;
    if (mod.practiceCompleted.length > 0) {
      // Active in practice — nudge them to keep practicing
      return {
        kind: "module-practice",
        label: `Keep practicing ${moduleId.toUpperCase()}`,
        subtitle: `${mod.practiceCompleted.length} practice problems solved`,
        icon: moduleId === "dp" ? "🎯" : "🕸️",
        color: moduleId === "dp" ? "from-blue-500 to-violet-600" : "from-emerald-500 to-teal-600",
        onGo: () => onGoPractice(moduleId),
      };
    }
  }

  return null;
}

export default function ResumeCard(props: Props) {
  const target = findResumeTarget(props);
  if (!target) return null;

  return (
    <button
      onClick={target.onGo}
      aria-label={target.label}
      className="w-full text-left bg-gradient-to-r from-blue-50 via-violet-50 to-fuchsia-50 dark:from-blue-950/30 dark:via-violet-950/30 dark:to-fuchsia-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${target.color} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
          <span className="text-xl">{target.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-0.5">Pick up where you left off</p>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{target.label}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{target.subtitle}</p>
        </div>
        <svg aria-hidden="true" className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all group-hover:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </button>
  );
}
