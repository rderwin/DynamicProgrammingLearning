import { useState, useEffect, useRef, useCallback } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface DrillProblem {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // seconds
  testCases: TestCase[];
  starterJS: string;
  functionName: string;
  difficulty: "Easy" | "Medium";
}

interface Props {
  problems: DrillProblem[];
  onComplete: (results: DrillResult[]) => void;
}

interface DrillResult {
  problemId: string;
  solved: boolean;
  timeUsed: number; // seconds
  timedOut: boolean;
}

export default function SpeedDrill({ problems, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<"ready" | "coding" | "result">("ready");
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [solved, setSolved] = useState(false);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const p = problems[currentIdx];
  const done = currentIdx >= problems.length;

  // Timer
  useEffect(() => {
    if (phase !== "coding") return;
    startTimeRef.current = Date.now();
    setTimeLeft(p.timeLimit);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = p.timeLimit - elapsed;
      setTimeLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        // Time's up
        clearInterval(timerRef.current!);
        setResults((prev) => [...prev, { problemId: p.id, solved: false, timeUsed: p.timeLimit, timedOut: true }]);
        setPhase("result");
      }
    }, 200);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, p]);

  const handlePass = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setSolved(true);
    setResults((prev) => [...prev, { problemId: p.id, solved: true, timeUsed: elapsed, timedOut: false }]);
    setPhase("result");
  }, [p]);

  function handleNext() {
    if (currentIdx < problems.length - 1) {
      setCurrentIdx((i) => i + 1);
      setPhase("ready");
      setSolved(false);
    } else {
      onComplete(results);
    }
  }

  function handleSkip() {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setResults((prev) => [...prev, { problemId: p.id, solved: false, timeUsed: elapsed, timedOut: false }]);
    setPhase("result");
  }

  // Done screen
  if (done || (currentIdx >= problems.length - 1 && phase === "result" && results.length >= problems.length)) {
    const solvedCount = results.filter((r) => r.solved).length;
    const totalTime = results.reduce((s, r) => s + r.timeUsed, 0);
    const avgTime = Math.round(totalTime / results.length);

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-amber-100 dark:bg-amber-900/40">
          <span className="text-3xl">⏱️</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {solvedCount}/{problems.length} solved
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Average time: {avgTime}s per problem
        </p>
        <div className="space-y-2 text-left max-w-sm mx-auto">
          {results.map((r, i) => (
            <div key={r.problemId} className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${r.solved ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}>
              <span className="font-medium">{problems[i].title}</span>
              <span className="font-mono text-xs">
                {r.solved ? `✓ ${r.timeUsed}s` : r.timedOut ? "⏰ time up" : "✗ skipped"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Ready screen
  if (phase === "ready") {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-mono">{currentIdx + 1}/{problems.length}</div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{p.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{p.description}</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl font-bold text-amber-500 font-mono">{p.timeLimit}s</span>
          <span className="text-sm text-slate-400">time limit</span>
        </div>
        <button
          onClick={() => setPhase("coding")}
          className="group inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Start
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    );
  }

  // Coding phase
  const pct = (timeLeft / p.timeLimit) * 100;
  const urgent = timeLeft <= 10;

  return (
    <div className="animate-fade-in">
      {/* Timer bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.title}</span>
          <span className={`text-lg font-bold font-mono tabular-nums ${urgent ? "text-red-500 animate-pulse" : "text-amber-500"}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${urgent ? "bg-red-500" : "bg-amber-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {phase === "result" ? (
        <div className={`rounded-2xl p-6 text-center mb-4 animate-fade-in ${solved ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"}`}>
          <span className="text-3xl">{solved ? "🎉" : "⏰"}</span>
          <h3 className="text-lg font-bold mt-2 text-slate-800 dark:text-slate-100">
            {solved ? `Solved in ${results[results.length - 1]?.timeUsed}s!` : "Time's up!"}
          </h3>
          <button onClick={handleNext} className="mt-4 group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
            {currentIdx < problems.length - 1 ? "Next Problem" : "See Results"}
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      ) : (
        <>
          <CodeEditor
            functionName={p.functionName}
            testCases={p.testCases}
            starterJS={p.starterJS}
            starterPython=""
            onPass={handlePass}
          />
          <div className="mt-3 text-right">
            <button onClick={handleSkip} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Skip this one →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
