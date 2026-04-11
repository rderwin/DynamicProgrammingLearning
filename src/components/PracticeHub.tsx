import { useState, useMemo } from "react";
import type { PracticeProblem, Difficulty } from "../modules/types";

interface Props {
  problems: PracticeProblem[];
  completedIds: Set<string>;
  onSelectProblem: (id: string) => void;
}

const difficultyColors: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const ALL_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function PracticeHub({ problems, completedIds, onSelectProblem }: Props) {
  const [filterPattern, setFilterPattern] = useState<string | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "all">("all");

  // Derive unique patterns from the problems themselves
  const allPatterns = useMemo(
    () => [...new Set(problems.map((p) => p.pattern))],
    [problems]
  );

  const filtered = problems.filter((p) => {
    if (filterPattern !== "all" && p.pattern !== filterPattern) return false;
    if (filterDifficulty !== "all" && p.difficulty !== filterDifficulty) return false;
    return true;
  });

  const completedCount = problems.filter((p) => completedIds.has(p.id)).length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Practice Problems</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {completedCount}/{problems.length} completed
        </p>
        <div className="w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mx-auto mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${(completedCount / problems.length) * 100}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        {allPatterns.length > 1 && (
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
            <button onClick={() => setFilterPattern("all")} className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterPattern === "all" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>All</button>
            {allPatterns.map((p) => (
              <button key={p} onClick={() => setFilterPattern(p)} className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterPattern === p ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>{p}</button>
            ))}
          </div>
        )}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs">
          <button onClick={() => setFilterDifficulty("all")} className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterDifficulty === "all" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>All</button>
          {ALL_DIFFICULTIES.map((d) => (
            <button key={d} onClick={() => setFilterDifficulty(d)} className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterDifficulty === d ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-slate-900/50" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>{d}</button>
          ))}
        </div>
      </div>

      {/* Problem list */}
      <div className="space-y-3">
        {filtered.map((p, i) => {
          const completed = completedIds.has(p.id);
          return (
            <button key={p.id} onClick={() => onSelectProblem(p.id)} className={`w-full text-left bg-white dark:bg-slate-900 border rounded-xl px-5 py-4 hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group ${completed ? "border-emerald-200 dark:border-emerald-800" : "border-slate-200 dark:border-slate-700"}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${completed ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-slate-100 dark:bg-slate-800"}`}>
                  {completed ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{p.title}</span>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{p.description.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.patternColor}`}>{p.pattern}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[p.difficulty]}`}>{p.difficulty}</span>
                </div>
                <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">No problems match these filters.</p>}
      </div>
    </div>
  );
}
