import { useState, useEffect, useRef } from "react";

export interface RaceScenario {
  id: string;
  title: string;
  description: string;
  inputSize: number;
  approaches: {
    name: string;
    complexity: string;
    color: string;
    /** Simulated operations count for this input size */
    operations: number;
  }[];
  question: string;
  correctIndex: number;
  explanation: string;
}

interface Props {
  scenarios: RaceScenario[];
  onComplete: (score: number, total: number) => void;
}

export default function AlgorithmRace({ scenarios, onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [racing, setRacing] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [raceComplete, setRaceComplete] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const s = scenarios[idx];
  const total = scenarios.length;
  const maxOps = Math.max(...(s?.approaches.map((a) => a.operations) ?? [1]));

  function startRace() {
    setRacing(true);
    setRaceComplete(false);
    setProgress(s.approaches.map(() => 0));

    const targets = s.approaches.map((a) => a.operations / maxOps);
    const speeds = targets.map((t) => t / 30); // 30 frames to finish slowest

    let frame = 0;
    animRef.current = setInterval(() => {
      frame++;
      setProgress(targets.map((t, i) => Math.min(1, speeds[i] * frame / t * t)));

      // Check if fastest finished
      const fastest = targets.indexOf(Math.min(...targets));
      if (speeds[fastest] * frame >= targets[fastest]) {
        // Race done after a short delay for the rest to catch up
        if (frame > 40) {
          clearInterval(animRef.current!);
          setProgress(targets);
          setRaceComplete(true);
          setRacing(false);
        }
      }
    }, 50);
  }

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  function handleAnswer() {
    if (selected === null) return;
    setAnswered(true);
    if (selected === s.correctIndex) setScore((sc) => sc + 1);
  }

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setRacing(false);
      setRaceComplete(false);
      setProgress([]);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
      onComplete(score + (selected === s.correctIndex ? 1 : 0), total);
    }
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center animate-fade-in">
        <span className="text-4xl">🏁</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">{score}/{total} correct ({pct}%)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pct >= 80 ? "You understand algorithm performance intuitively!" : "Review how different approaches scale with input size."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
      <div className="px-6 py-4 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">🏁 Algorithm Race</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400">{s.title}</p>
        </div>
        <span className="text-rose-500 font-mono text-xs">{idx + 1}/{total}</span>
      </div>

      <div className="px-6 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{s.description}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Input size: <strong className="text-slate-700 dark:text-slate-300 font-mono">n = {s.inputSize.toLocaleString()}</strong></p>

        {/* Race bars */}
        <div className="space-y-3 mb-6">
          {s.approaches.map((a, i) => (
            <div key={a.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{a.name}</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{a.complexity} → {a.operations.toLocaleString()} ops</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${racing ? "duration-100" : "duration-500"}`}
                  style={{
                    width: `${(progress[i] ?? 0) * 100}%`,
                    backgroundColor: a.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {!racing && !raceComplete && (
          <button onClick={startRace} className="px-5 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600 transition-all">
            🏁 Start Race
          </button>
        )}

        {/* Question after race */}
        {raceComplete && !answered && (
          <div className="animate-fade-in-up">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">{s.question}</p>
            <div className="space-y-2 mb-4">
              {s.approaches.map((a, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm ${selected === i ? "border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-400/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}
                >
                  {a.name} ({a.complexity})
                </button>
              ))}
            </div>
            <button onClick={handleAnswer} disabled={selected === null} className="px-5 py-2 bg-rose-500 text-white rounded-lg text-sm font-semibold hover:bg-rose-600 disabled:opacity-40 transition-all">
              Check
            </button>
          </div>
        )}

        {answered && (
          <div className="animate-fade-in-up">
            <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${selected === s.correctIndex ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"}`}>
              <p className="font-medium mb-1">{selected === s.correctIndex ? "Correct!" : "Not quite."}</p>
              <p className="text-xs opacity-80">{s.explanation}</p>
            </div>
            <button onClick={handleNext} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-all">
              {idx < total - 1 ? "Next Race" : "Results"}
              <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
