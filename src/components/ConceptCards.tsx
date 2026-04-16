import { useState, useCallback } from "react";

export interface ConceptCard {
  id: string;
  front: string;
  back: string;
  category: string;
}

interface Props {
  cards: ConceptCard[];
  onComplete: (knewCount: number, total: number) => void;
}

export default function ConceptCards({ cards, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knew, setKnew] = useState(0);
  const [didntKnow, setDidntKnow] = useState(0);
  const [done, setDone] = useState(false);

  const card = cards[currentIdx];
  const total = cards.length;

  const handleRate = useCallback((known: boolean) => {
    if (known) setKnew((k) => k + 1);
    else setDidntKnow((d) => d + 1);

    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
      setFlipped(false);
    } else {
      setDone(true);
      onComplete(knew + (known ? 1 : 0), total);
    }
  }, [currentIdx, total, knew, onComplete]);

  if (done) {
    const finalKnew = knew;
    const pct = Math.round((finalKnew / total) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-100 dark:bg-blue-900/40">
          <span className="text-3xl">🧠</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{finalKnew}/{total} remembered ({pct}%)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {pct >= 80 ? "Strong recall! These concepts are locked in." :
           pct >= 50 ? "Good foundation. Review the ones you missed." :
           "Keep reviewing — spaced repetition is how these stick."}
        </p>
        {didntKnow > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
            💡 Come back tomorrow to review the {didntKnow} you missed — that's when spaced repetition works best.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400 dark:text-slate-500">
        <span className="font-mono">{currentIdx + 1}/{total}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{card.category}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6">
        <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300" style={{ width: `${(currentIdx / total) * 100}%` }} />
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={`relative min-h-[200px] rounded-2xl border-2 p-8 flex items-center justify-center text-center cursor-pointer transition-all duration-300 ${
          flipped
            ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg"
        }`}
      >
        {!flipped ? (
          <div className="animate-fade-in">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{card.front}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Tap to reveal answer</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">{card.back}</p>
          </div>
        )}
      </div>

      {/* Rating buttons (after flip) */}
      {flipped && (
        <div className="flex gap-3 mt-4 animate-fade-in-up">
          <button
            onClick={() => handleRate(false)}
            className="flex-1 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            Didn't know ✗
          </button>
          <button
            onClick={() => handleRate(true)}
            className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
          >
            Knew it ✓
          </button>
        </div>
      )}
    </div>
  );
}
