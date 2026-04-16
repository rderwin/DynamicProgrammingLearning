import { useState, useCallback } from "react";

export interface QuizQuestion {
  id: string;
  problem: string;
  options: { label: string; description: string }[];
  correctIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Props {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  title?: string;
}

export default function PatternQuiz({ questions, onComplete, title = "Pattern Recognition" }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const q = questions[currentIdx];
  const isCorrect = selectedIdx === q?.correctIndex;
  const total = questions.length;

  const handleSelect = useCallback((idx: number) => {
    if (revealed) return;
    setSelectedIdx(idx);
  }, [revealed]);

  const handleReveal = useCallback(() => {
    if (selectedIdx === null) return;
    setRevealed(true);
    if (selectedIdx === q.correctIndex) {
      setScore((s) => s + 1);
    }
    setAnswers((a) => [...a, selectedIdx]);
  }, [selectedIdx, q]);

  const handleNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
      setRevealed(false);
    } else {
      setDone(true);
      onComplete(score + (isCorrect ? 0 : 0), total); // score already updated
    }
  }, [currentIdx, total, score, isCorrect, onComplete]);

  if (done) {
    const finalScore = answers.reduce((s: number, a, i) => s + (a === questions[i].correctIndex ? 1 : 0), 0);
    const pct = Math.round((finalScore / total) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${pct >= 80 ? "bg-emerald-100 dark:bg-emerald-900/40" : pct >= 50 ? "bg-amber-100 dark:bg-amber-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
          <span className="text-3xl">{pct >= 80 ? "🎯" : pct >= 50 ? "💪" : "📚"}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          {finalScore}/{total} correct ({pct}%)
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {pct >= 80
            ? "Excellent pattern recognition! You're interview-ready."
            : pct >= 50
              ? "Good progress — review the patterns you missed and try again."
              : "Keep practicing — pattern recognition is a muscle that gets stronger with reps."}
        </p>

        {/* Review wrong answers */}
        {answers.some((a, i) => a !== questions[i].correctIndex) && (
          <div className="text-left space-y-3 mb-6">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Review</h4>
            {questions.map((q, i) => {
              if (answers[i] === q.correctIndex) return null;
              return (
                <div key={q.id} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-medium mb-1 line-clamp-2">{q.problem}</p>
                  <p className="text-red-600 dark:text-red-400 text-xs">
                    You picked: <strong>{q.options[answers[i]!]?.label}</strong> →
                    Correct: <strong>{q.options[q.correctIndex].label}</strong>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Read the problem. What pattern would you use?</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={`font-semibold px-2 py-0.5 rounded-full ${q.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : q.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.difficulty}</span>
          <span className="text-slate-400 dark:text-slate-500 font-mono">{currentIdx + 1}/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300" style={{ width: `${((currentIdx + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      {/* Problem description */}
      <div className="px-6 py-5">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{q.problem}</p>
      </div>

      {/* Options */}
      <div className="px-6 pb-4 space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selectedIdx === i;
          const isAnswer = q.correctIndex === i;
          let optClass = "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600";

          if (revealed) {
            if (isAnswer) optClass = "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40";
            else if (isSelected) optClass = "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40";
            else optClass = "border-slate-200 dark:border-slate-700 opacity-50";
          } else if (isSelected) {
            optClass = "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-400/30";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${optClass}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                  revealed && isAnswer ? "bg-emerald-500 text-white" :
                  revealed && isSelected ? "bg-red-500 text-white" :
                  isSelected ? "bg-blue-500 text-white" :
                  "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}>
                  {revealed && isAnswer ? "✓" : revealed && isSelected ? "✗" : String.fromCharCode(65 + i)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (after reveal) */}
      {revealed && (
        <div className="px-6 pb-4 animate-fade-in-up">
          <div className={`rounded-lg px-4 py-3 text-sm ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"}`}>
            <p className="font-medium mb-1">{isCorrect ? "Correct!" : "Not quite."}</p>
            <p className="text-xs leading-relaxed opacity-80">{q.explanation}</p>
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selectedIdx === null}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all"
          >
            {currentIdx < total - 1 ? "Next Question" : "See Results"}
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
