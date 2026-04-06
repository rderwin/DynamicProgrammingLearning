import { completionContent } from "../content/transitions";

interface Props {
  onPractice: () => void;
}

export default function CompletionScreen({ onPractice }: Props) {
  const c = completionContent;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{c.title}</h2>
        <p className="text-lg text-slate-500">{c.subtitle}</p>
      </div>

      {/* Pattern summary table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8 shadow-sm animate-fade-in-up">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-700">The four DP patterns you've mastered</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {c.patterns.map((p, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-4">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-400">{p.problems}</p>
              </div>
              <code className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 flex-shrink-0">
                {p.recurrence}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Recognition cheat sheet */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 mb-8 animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-amber-800">Pattern recognition cheat sheet</h3>
        </div>
        <div className="space-y-2">
          {c.recognition.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-amber-700">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What's next */}
      <div className="bg-gradient-to-br from-blue-50 to-violet-50/50 border border-blue-200 rounded-xl p-8 text-center animate-fade-in-up delay-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to practice?</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
          10 real interview-style problems — from Easy to Hard — covering every pattern you just learned.
          Hints, solutions, and instant feedback included.
        </p>
        <button
          onClick={onPractice}
          className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          Start practicing
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
