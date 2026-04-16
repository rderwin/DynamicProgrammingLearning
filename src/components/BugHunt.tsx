import { useState } from "react";

export interface BugChallenge {
  id: string;
  title: string;
  description: string;
  buggyCode: string;
  bugLine: number;
  bugDescription: string;
  fixedCode: string;
  hint: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Props {
  challenges: BugChallenge[];
  onComplete: (score: number, total: number) => void;
}

export default function BugHunt({ challenges, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const c = challenges[currentIdx];
  const lines = c?.buggyCode.split("\n") ?? [];
  const isCorrect = selectedLine === c?.bugLine;
  const total = challenges.length;

  function handleReveal() {
    if (selectedLine === null) return;
    setRevealed(true);
    if (isCorrect) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedLine(null);
      setRevealed(false);
      setShowHint(false);
    } else {
      setDone(true);
      onComplete(score + (isCorrect ? 1 : 0), total);
    }
  }

  if (done) {
    const finalScore = score;
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-violet-100 dark:bg-violet-900/40">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{finalScore}/{total} bugs found ({pct}%)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pct >= 80 ? "Sharp eye! You can spot bugs in code reviews." :
           pct >= 50 ? "Good instinct — practice reading code more carefully." :
           "Keep at it — reading code critically is a skill that improves with practice."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-violet-50 dark:bg-violet-950/30 border-b border-violet-200 dark:border-violet-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-violet-800 dark:text-violet-300 flex items-center gap-2">
            🔍 Bug Hunt
          </h3>
          <p className="text-xs text-violet-600 dark:text-violet-400">{c.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${c.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : c.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.difficulty}</span>
          <span className="text-violet-500 dark:text-violet-400 font-mono">{currentIdx + 1}/{total}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300" style={{ width: `${((currentIdx + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {/* Instructions */}
      <div className="px-6 py-3 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
        <strong className="text-slate-700 dark:text-slate-300">{c.title}</strong> — Click the line with the bug
      </div>

      {/* Code */}
      <div className="bg-[#1e1e2e] p-4 font-mono text-sm leading-7">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isSelected = selectedLine === lineNum;
          const isBug = c.bugLine === lineNum;

          let lineClass = "hover:bg-white/5 cursor-pointer";
          if (revealed) {
            if (isBug) lineClass = "bg-red-500/15 border-l-3 border-red-500 ml-[-3px]";
            else if (isSelected) lineClass = "bg-amber-500/10";
            else lineClass = "opacity-50";
          } else if (isSelected) {
            lineClass = "bg-blue-500/15 border-l-3 border-blue-500 ml-[-3px]";
          }

          return (
            <div
              key={i}
              onClick={() => !revealed && setSelectedLine(lineNum)}
              className={`flex items-center rounded transition-all duration-150 ${lineClass}`}
            >
              <span className="text-slate-600 w-8 text-right mr-4 text-xs select-none flex-shrink-0">{lineNum}</span>
              <span className="text-slate-200 whitespace-pre">{line || " "}</span>
              {revealed && isBug && <span className="ml-auto text-red-400 text-xs animate-fade-in pl-2">← BUG</span>}
            </div>
          );
        })}
      </div>

      {/* Fixed code (after reveal) */}
      {revealed && (
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-950/30 border-t border-emerald-200 dark:border-emerald-800 animate-fade-in-up">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            {isCorrect ? "✓ You found it!" : "✗ The bug was on line " + c.bugLine}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">{c.bugDescription}</p>
          <div className="bg-[#1e1e2e] rounded-lg p-3">
            <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{c.fixedCode}</pre>
          </div>
        </div>
      )}

      {/* Hint */}
      {!revealed && showHint && (
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 animate-fade-in">
          <p className="text-xs text-amber-700 dark:text-amber-400">💡 {c.hint}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {!revealed && !showHint && (
          <button onClick={() => setShowHint(true)} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Need a hint?</button>
        )}
        {!revealed && showHint && <div />}
        {revealed && <div />}

        {!revealed ? (
          <button onClick={handleReveal} disabled={selectedLine === null} className="px-5 py-2 bg-violet-500 text-white rounded-lg text-sm font-semibold hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Check
          </button>
        ) : (
          <button onClick={handleNext} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
            {currentIdx < total - 1 ? "Next Bug" : "See Results"}
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
