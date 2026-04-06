import { useState } from "react";
import type { PracticeProblem, Difficulty, DPPattern } from "../practice/types";

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

const patternColors: Record<DPPattern, string> = {
  "1D Counting": "bg-blue-100 text-blue-700",
  "2D Counting": "bg-violet-100 text-violet-700",
  "1D Optimization": "bg-cyan-100 text-cyan-700",
  "2D Optimization": "bg-pink-100 text-pink-700",
  "Include/Exclude": "bg-orange-100 text-orange-700",
};

const ALL_PATTERNS: DPPattern[] = ["1D Counting", "2D Counting", "1D Optimization", "2D Optimization", "Include/Exclude"];
const ALL_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function PracticeHub({ problems, completedIds, onSelectProblem }: Props) {
  const [filterPattern, setFilterPattern] = useState<DPPattern | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "all">("all");

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
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Practice Problems</h2>
        <p className="text-slate-500 text-sm">
          {completedCount}/{problems.length} completed — real interview-style DP problems
        </p>
        {/* Progress bar */}
        <div className="w-48 bg-slate-100 rounded-full h-1.5 mx-auto mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / problems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs">
          <button
            onClick={() => setFilterPattern("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterPattern === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            All Patterns
          </button>
          {ALL_PATTERNS.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPattern(p)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterPattern === p ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs">
          <button
            onClick={() => setFilterDifficulty("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterDifficulty === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            All
          </button>
          {ALL_DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${filterDifficulty === d ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list */}
      <div className="space-y-3">
        {filtered.map((p, i) => {
          const completed = completedIds.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => onSelectProblem(p.id)}
              className={`w-full text-left bg-white border rounded-xl px-5 py-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 group ${
                completed ? "border-emerald-200" : "border-slate-200"
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Completion check */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  completed ? "bg-emerald-100" : "bg-slate-100"
                }`}>
                  {completed ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{i + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {p.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{p.description.slice(0, 80)}...</p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${patternColors[p.pattern]}`}>
                    {p.pattern}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                </div>

                {/* Arrow */}
                <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">No problems match these filters.</p>
        )}
      </div>
    </div>
  );
}
