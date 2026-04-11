import type { ModuleCompletionContent } from "../modules/types";

interface Props {
  content: ModuleCompletionContent;
  onPractice: () => void;
  onHome: () => void;
}

export default function CompletionScreen({ content: c, onPractice, onHome }: Props) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{c.title}</h2>
        <p className="text-slate-500 dark:text-slate-400">{c.subtitle}</p>
      </div>

      {/* Pattern summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-slate-900/50 mb-6 animate-fade-in-up">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Patterns you've learned</h3>
        <div className="space-y-3">
          {c.patterns.map((p) => (
            <div key={p.name} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {p.name[0]}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{p.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{p.problems}</p>
                <code className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">{p.recurrence}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recognition tips */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-6 animate-fade-in-up delay-100">
        <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3">How to recognize these in interviews</h3>
        <ul className="space-y-2">
          {c.recognition.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <span className="text-amber-400 mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up delay-200">
        <button
          onClick={onPractice}
          className="group inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Start practicing
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <button
          onClick={onHome}
          className="inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
        >
          Back to all modules
        </button>
      </div>
    </div>
  );
}
