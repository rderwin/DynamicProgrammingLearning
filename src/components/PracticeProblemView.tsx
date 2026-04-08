import { useState } from "react";
import type { PracticeProblem } from "../practice/types";
import CodeEditor from "./CodeEditor";
import Hints from "./Hints";

interface Props {
  problem: PracticeProblem;
  onBack: () => void;
  onComplete: (id: string) => void;
  isCompleted: boolean;
  savedCode?: { js: string; py: string };
  onCodeChange?: (lang: "js" | "py", code: string) => void;
}

const difficultyColors = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const patternColors = {
  "1D Counting": "bg-blue-100 text-blue-700",
  "2D Counting": "bg-violet-100 text-violet-700",
  "1D Optimization": "bg-cyan-100 text-cyan-700",
  "2D Optimization": "bg-pink-100 text-pink-700",
  "Include/Exclude": "bg-orange-100 text-orange-700",
};

export default function PracticeProblemView({ problem: p, onBack, onComplete, isCompleted, savedCode, onCodeChange }: Props) {
  const [passed, setPassed] = useState(isCompleted);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        All problems
      </button>

      {/* Problem description */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-bold text-slate-900">{p.title}</h2>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyColors[p.difficulty]}`}>
            {p.difficulty}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${patternColors[p.pattern]}`}>
            {p.pattern}
          </span>
          {passed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ml-auto">
              ✓ Solved
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">{p.description}</p>

        {/* Examples */}
        <div className="space-y-2 mb-4">
          {p.examples.map((ex, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-4 py-2.5">
              <code className="text-xs font-mono text-slate-700">{ex}</code>
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div className="flex flex-wrap gap-2">
          {p.constraints.map((c, i) => (
            <span key={i} className="text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md font-mono">
              {c}
            </span>
          ))}
        </div>

        {/* Complexity (shown after solving) */}
        {passed && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-xs text-slate-500 animate-fade-in">
            <span>Time: <strong className="text-slate-700">{p.timeComplexity}</strong></span>
            <span>Space: <strong className="text-slate-700">{p.spaceComplexity}</strong></span>
          </div>
        )}
      </div>

      {/* Hints */}
      {!passed && (
        <div className="mb-6">
          <Hints hints={p.hints} solution={p.solutionJS} solutionPython={p.solutionPython} />
        </div>
      )}

      {/* Code editor */}
      <CodeEditor
        functionName={p.functionName}
        testCases={p.testCases}
        starterJS={savedCode?.js || p.starterJS}
        starterPython={savedCode?.py || p.starterPython}
        onPass={(code, language) => {
          setPassed(true);
          onComplete(p.id);
          onCodeChange?.(language === "python" ? "py" : "js", code);
        }}
        onCodeChange={onCodeChange}
      />

      {/* Success prompt */}
      {passed && !isCompleted && (
        <div className="mt-6 text-center animate-fade-in-up">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Back to problem list
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
