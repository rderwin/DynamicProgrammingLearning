import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface RefactorChallenge {
  id: string;
  title: string;
  description: string;
  originalCode: string;
  originalComplexity: string;
  targetComplexity: string;
  testCases: TestCase[];
  functionName: string;
  starterJS: string;
  hint: string;
  solutionJS: string;
  difficulty: "Medium" | "Hard";
}

interface Props {
  challenges: RefactorChallenge[];
  onComplete: (score: number, total: number) => void;
}

export default function CodeRefactor({ challenges, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const c = challenges[idx];
  const total = challenges.length;

  function handlePass() {
    setSolved(true);
    setScore((s) => s + 1);
  }

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setSolved(false);
      setShowHint(false);
      setShowSolution(false);
    } else {
      setDone(true);
      onComplete(score + (solved ? 1 : 0), total);
    }
  }

  if (done) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <span className="text-4xl">🔧</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">{score}/{total} optimized</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {score === total ? "Perfect! You can optimize any solution." : "Keep practicing — recognizing optimization opportunities is key."}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-t-2xl px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300">🔧 Optimize This</h3>
          <p className="text-xs text-teal-600 dark:text-teal-400">{c.title}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${c.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.difficulty}</span>
          <span className="text-teal-500 font-mono">{idx + 1}/{total}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-x border-b border-slate-200 dark:border-slate-700 rounded-b-2xl overflow-hidden">
        {/* Description */}
        <div className="px-6 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{c.description}</p>
          <div className="flex items-center gap-4 text-xs mb-4">
            <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full font-mono font-semibold">Current: {c.originalComplexity}</span>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-mono font-semibold">Target: {c.targetComplexity}</span>
          </div>

          {/* Original code */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Slow version:</p>
            <div className="bg-[#1e1e2e] rounded-lg p-4">
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{c.originalCode}</pre>
            </div>
          </div>

          {showHint && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 mb-4 text-xs text-amber-700 dark:text-amber-400 animate-fade-in">
              💡 {c.hint}
            </div>
          )}
          {!showHint && !solved && (
            <button onClick={() => setShowHint(true)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-4 block">Need a hint?</button>
          )}

          {showSolution && (
            <div className="mb-4 animate-fade-in">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Optimized solution:</p>
              <div className="bg-[#1e1e2e] rounded-lg p-4">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">{c.solutionJS}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        {!solved ? (
          <div className="px-4 pb-4">
            <CodeEditor
              functionName={c.functionName}
              testCases={c.testCases}
              starterJS={c.starterJS}
              starterPython=""
              onPass={handlePass}
            />
            <div className="mt-2 flex justify-between">
              <button onClick={() => setShowSolution(true)} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Show solution</button>
              <button onClick={handleNext} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Skip →</button>
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6 text-center animate-fade-in">
            <span className="text-3xl">⚡</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">Optimized! {c.originalComplexity} → {c.targetComplexity}</p>
            <button onClick={handleNext} className="mt-4 group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-all">
              {idx < total - 1 ? "Next Challenge" : "Results"}
              <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
