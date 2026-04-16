import { useState, useRef, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface InterviewProblem {
  id: string;
  title: string;
  description: string;
  constraints: string[];
  patterns: string[];
  correctPattern: string;
  testCases: TestCase[];
  functionName: string;
  starterJS: string;
  solutionJS: string;
  optimalTime: string;
  optimalSpace: string;
  timeLimit: number; // minutes
  difficulty: "Medium" | "Hard";
}

type Phase = "read" | "identify" | "plan" | "code" | "analyze" | "result";

interface Props {
  problem: InterviewProblem;
  onComplete: (result: InterviewResult) => void;
}

interface InterviewResult {
  identifiedPattern: boolean;
  planWritten: boolean;
  codePassed: boolean;
  complexityCorrect: boolean;
  totalTime: number;
}

const TIME_OPTIONS = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"];

export default function InterviewSim({ problem: p, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("read");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [plan, setPlan] = useState("");
  const [codePassed, setCodePassed] = useState(false);
  const [timeGuess, setTimeGuess] = useState<string | null>(null);
  const [spaceGuess, setSpaceGuess] = useState<string | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const startRef = useRef(Date.now());

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const overTime = totalSeconds > p.timeLimit * 60;

  function handleComplete() {
    onComplete({
      identifiedPattern: selectedPattern === p.correctPattern,
      planWritten: plan.trim().length >= 20,
      codePassed,
      complexityCorrect: timeGuess === p.optimalTime && spaceGuess === p.optimalSpace,
      totalTime: totalSeconds,
    });
    setPhase("result");
  }

  const result: InterviewResult = {
    identifiedPattern: selectedPattern === p.correctPattern,
    planWritten: plan.trim().length >= 20,
    codePassed,
    complexityCorrect: timeGuess === p.optimalTime && spaceGuess === p.optimalSpace,
    totalTime: totalSeconds,
  };

  if (phase === "result") {
    const scoreItems = [
      { label: "Pattern identified", pass: result.identifiedPattern },
      { label: "Plan written", pass: result.planWritten },
      { label: "Code passes tests", pass: result.codePassed },
      { label: "Complexity correct", pass: result.complexityCorrect },
    ];
    const passed = scoreItems.filter((s) => s.pass).length;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 animate-fade-in">
        <div className="text-center mb-6">
          <span className="text-4xl">{passed >= 3 ? "🎉" : passed >= 2 ? "💪" : "📚"}</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3">
            {passed >= 3 ? "Strong interview performance!" : passed >= 2 ? "Decent — keep practicing." : "Needs work — review the fundamentals."}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Completed in {Math.floor(result.totalTime / 60)} min {result.totalTime % 60}s</p>
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          {scoreItems.map((s) => (
            <div key={s.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${s.pass ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"}`}>
              <span>{s.pass ? "✓" : "✗"}</span>
              <span className="font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Timer + phase indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(["read", "identify", "plan", "code", "analyze"] as Phase[]).map((ph) => (
            <span key={ph} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${phase === ph ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
              {ph}
            </span>
          ))}
        </div>
        <span className={`font-mono text-sm font-bold ${overTime ? "text-red-500 animate-pulse" : "text-slate-600 dark:text-slate-400"}`}>
          {timeStr}
        </span>
      </div>

      {/* Phase content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {phase === "read" && (
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{p.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{p.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {p.constraints.map((c, i) => (
                <span key={i} className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md">{c}</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 italic">Read carefully, then identify the pattern.</p>
            <button onClick={() => setPhase("identify")} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all">
              I've read it →
            </button>
          </div>
        )}

        {phase === "identify" && (
          <div className="p-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">What pattern would you use?</h4>
            <div className="space-y-2 mb-6">
              {p.patterns.map((pat) => (
                <button
                  key={pat}
                  onClick={() => setSelectedPattern(pat)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${selectedPattern === pat ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-400/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"}`}
                >
                  {pat}
                </button>
              ))}
            </div>
            <button onClick={() => setPhase("plan")} disabled={!selectedPattern} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Next: plan your approach →
            </button>
          </div>
        )}

        {phase === "plan" && (
          <div className="p-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Explain your approach</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Before coding, write out your plan. What data structures? What's the recurrence/logic?</p>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="My approach: first I would... then I'd use a... the key insight is..."
              className="w-full h-28 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
            <div className="flex justify-between items-center mt-3">
              <span className={`text-[10px] ${plan.trim().length < 20 ? "text-slate-400" : "text-emerald-500"}`}>
                {plan.trim().length < 20 ? `${20 - plan.trim().length} more chars` : "✓ Good plan"}
              </span>
              <button onClick={() => setPhase("code")} className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all">
                Start coding →
              </button>
            </div>
          </div>
        )}

        {phase === "code" && (
          <div className="p-4">
            <CodeEditor
              functionName={p.functionName}
              testCases={p.testCases}
              starterJS={p.starterJS}
              starterPython=""
              onPass={() => { setCodePassed(true); setPhase("analyze"); }}
            />
            <div className="mt-3 flex justify-between">
              <p className="text-xs text-slate-400 dark:text-slate-500">Pass all tests to continue</p>
              <button onClick={() => setPhase("analyze")} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Skip to analysis →
              </button>
            </div>
          </div>
        )}

        {phase === "analyze" && (
          <div className="p-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">What's the complexity of your solution?</h4>
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Time</label>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => setTimeGuess(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${timeGuess === opt ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 ring-2 ring-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Space</label>
                <div className="flex flex-wrap gap-1.5">
                  {["O(1)", "O(n)", "O(n²)"].map((opt) => (
                    <button key={opt} onClick={() => setSpaceGuess(opt)} className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${spaceGuess === opt ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 ring-2 ring-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={handleComplete} className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
              Submit Interview →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
