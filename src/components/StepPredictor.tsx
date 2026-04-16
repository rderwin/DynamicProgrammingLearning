import { useState } from "react";

export interface PredictorChallenge {
  id: string;
  title: string;
  algorithmName: string;
  /** The state shown to the user (what's happened so far) */
  context: string;
  /** The question: what happens next? */
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Props {
  challenges: PredictorChallenge[];
  onComplete: (score: number, total: number) => void;
}

export default function StepPredictor({ challenges, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const c = challenges[idx];
  const total = challenges.length;
  const isCorrect = selected === c?.correctIndex;

  function handleReveal() {
    if (selected === null) return;
    setRevealed(true);
    if (isCorrect) setScore((s) => s + 1);
  }

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setDone(true);
      onComplete(score + (isCorrect ? 1 : 0), total);
    }
  }

  if (done) {
    const pct = Math.round(((score) / total) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <span className="text-4xl">{pct >= 80 ? "🔮" : pct >= 50 ? "🤔" : "📖"}</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">{score}/{total} predicted correctly ({pct}%)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pct >= 80 ? "You can trace algorithms in your head — that's interview-level fluency." :
           pct >= 50 ? "Getting there. Practice stepping through algorithms on paper." :
           "Review how each algorithm processes data step by step."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-6 py-4 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300">🔮 What Comes Next?</h3>
          <p className="text-xs text-purple-600 dark:text-purple-400">{c.algorithmName} — predict the next step</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${c.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : c.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.difficulty}</span>
          <span className="text-purple-500 font-mono">{idx + 1}/{total}</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style={{ width: `${((idx + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {/* Context */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{c.title}</h4>
        <div className="bg-[#1e1e2e] rounded-lg p-4 mb-4">
          <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{c.context}</pre>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">{c.question}</p>
      </div>

      {/* Options */}
      <div className="px-6 pb-4 space-y-2">
        {c.options.map((opt, i) => {
          let cls = "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600";
          if (revealed) {
            if (i === c.correctIndex) cls = "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40";
            else if (i === selected) cls = "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40";
            else cls = "border-slate-200 dark:border-slate-700 opacity-50";
          } else if (i === selected) {
            cls = "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/40 ring-1 ring-purple-400/30";
          }
          return (
            <button key={i} onClick={() => !revealed && setSelected(i)} disabled={revealed}
              className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm font-mono ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="px-6 pb-4 animate-fade-in-up">
          <div className={`rounded-lg px-4 py-3 text-sm ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"}`}>
            <p className="font-medium mb-1">{isCorrect ? "Correct!" : "Not quite."}</p>
            <p className="text-xs leading-relaxed opacity-80">{c.explanation}</p>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        {!revealed ? (
          <button onClick={handleReveal} disabled={selected === null} className="px-5 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Check</button>
        ) : (
          <button onClick={handleNext} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-all">
            {idx < total - 1 ? "Next" : "Results"}
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
