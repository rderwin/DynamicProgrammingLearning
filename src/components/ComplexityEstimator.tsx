import { useState } from "react";

export interface ComplexityChallenge {
  id: string;
  code: string;
  language: string;
  correctTime: string;
  correctSpace: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const TIME_OPTIONS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2^n)", "O(n!)"];
const SPACE_OPTIONS = ["O(1)", "O(log n)", "O(n)", "O(n²)", "O(n×m)"];

interface Props {
  challenges: ComplexityChallenge[];
  onComplete: (score: number, total: number) => void;
}

export default function ComplexityEstimator({ challenges, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [timeGuess, setTimeGuess] = useState<string | null>(null);
  const [spaceGuess, setSpaceGuess] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const c = challenges[idx];
  const total = challenges.length;
  const timeCorrect = timeGuess === c?.correctTime;
  const spaceCorrect = spaceGuess === c?.correctSpace;
  const bothCorrect = timeCorrect && spaceCorrect;

  function handleReveal() {
    if (!timeGuess || !spaceGuess) return;
    setRevealed(true);
    if (bothCorrect) setScore((s) => s + 1);
    else if (timeCorrect || spaceCorrect) setScore((s) => s + 0.5);
  }

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setTimeGuess(null);
      setSpaceGuess(null);
      setRevealed(false);
    } else {
      setDone(true);
      onComplete(Math.round(score + (bothCorrect ? 1 : timeCorrect || spaceCorrect ? 0.5 : 0)), total);
    }
  }

  if (done) {
    const finalScore = Math.round(score);
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-cyan-100 dark:bg-cyan-900/40">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{finalScore}/{total} correct ({pct}%)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pct >= 80 ? "Strong complexity analysis skills!" :
           pct >= 50 ? "Getting there — practice tracing through loops and recursion." :
           "Review how nested loops, recursion depth, and data structures affect complexity."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-cyan-50 dark:bg-cyan-950/30 border-b border-cyan-200 dark:border-cyan-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-cyan-800 dark:text-cyan-300">📊 Complexity Estimator</h3>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">What's the Big O?</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${c.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : c.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.difficulty}</span>
          <span className="text-cyan-500 font-mono">{idx + 1}/{total}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${((idx + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {/* Code */}
      <div className="bg-[#1e1e2e] p-4 font-mono text-sm leading-6">
        {c.code.split("\n").map((line, i) => (
          <div key={i} className="flex">
            <span className="text-slate-600 w-6 text-right mr-3 text-xs select-none">{i + 1}</span>
            <span className="text-slate-200 whitespace-pre">{line || " "}</span>
          </div>
        ))}
      </div>

      {/* Guesses */}
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">Time Complexity</label>
          <div className="flex flex-wrap gap-1.5">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => !revealed && setTimeGuess(opt)}
                disabled={revealed}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  revealed && opt === c.correctTime ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-400" :
                  revealed && opt === timeGuess && !timeCorrect ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 ring-2 ring-red-400" :
                  timeGuess === opt ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 ring-2 ring-blue-400" :
                  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">Space Complexity</label>
          <div className="flex flex-wrap gap-1.5">
            {SPACE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => !revealed && setSpaceGuess(opt)}
                disabled={revealed}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  revealed && opt === c.correctSpace ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-400" :
                  revealed && opt === spaceGuess && !spaceCorrect ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 ring-2 ring-red-400" :
                  spaceGuess === opt ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 ring-2 ring-blue-400" :
                  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="px-6 pb-4 animate-fade-in-up">
          <div className={`rounded-lg px-4 py-3 text-sm ${bothCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"}`}>
            <p className="font-medium mb-1">
              {bothCorrect ? "Both correct!" : timeCorrect ? "Time correct, space wrong." : spaceCorrect ? "Space correct, time wrong." : "Both wrong."}
            </p>
            <p className="text-xs leading-relaxed opacity-80">{c.explanation}</p>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        {!revealed ? (
          <button onClick={handleReveal} disabled={!timeGuess || !spaceGuess} className="px-5 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Check
          </button>
        ) : (
          <button onClick={handleNext} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
            {idx < total - 1 ? "Next" : "Results"}
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
