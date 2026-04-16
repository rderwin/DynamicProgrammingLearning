import { useState, useMemo } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface DailyProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  testCases: TestCase[];
  functionName: string;
  starterJS: string;
  hint: string;
}

interface Props {
  problems: DailyProblem[];
  completedToday: boolean;
  streak: number;
  onComplete: () => void;
}

function getDailyProblem(problems: DailyProblem[]): DailyProblem {
  // Deterministic: same problem for everyone on the same day
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  return problems[daysSinceEpoch % problems.length];
}

export default function DailyChallenge({ problems, completedToday, streak, onComplete }: Props) {
  const [solved, setSolved] = useState(completedToday);
  const [showHint, setShowHint] = useState(false);
  const problem = useMemo(() => getDailyProblem(problems), [problems]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (solved) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Daily challenge complete!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {streak > 1 ? `${streak}-day streak! Come back tomorrow to keep it going.` : "Come back tomorrow for a new challenge!"}
            </p>
          </div>
          {streak > 0 && (
            <div className="ml-auto text-center flex-shrink-0">
              <div className="text-2xl font-bold text-orange-500">{streak}</div>
              <div className="text-[9px] text-slate-400 dark:text-slate-500">day streak</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            🔥 Daily Challenge
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${problem.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : problem.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            {problem.difficulty}
          </span>
          {streak > 0 && (
            <span className="text-xs font-bold text-orange-500">🔥 {streak}</span>
          )}
        </div>
      </div>

      {/* Problem */}
      <div className="px-6 py-4">
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{problem.title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{problem.description}</p>

        {showHint && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 mb-4 text-xs text-amber-700 dark:text-amber-400 animate-fade-in">
            💡 {problem.hint}
          </div>
        )}
        {!showHint && (
          <button onClick={() => setShowHint(true)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4">
            Need a hint?
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="px-4 pb-4">
        <CodeEditor
          functionName={problem.functionName}
          testCases={problem.testCases}
          starterJS={problem.starterJS}
          starterPython=""
          onPass={() => { setSolved(true); onComplete(); }}
        />
      </div>
    </div>
  );
}
