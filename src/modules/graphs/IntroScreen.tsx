interface Props {
  onStart: () => void;
}

export default function GraphIntroScreen({ onStart }: Props) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Visual graph exploration
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-6">
          Graph Algorithms
          <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent gradient-animate">
            are just walking a map.
          </span>
        </h1>

        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12">
          Nodes. Edges. Neighbors. That's it.
          <br />
          Watch algorithms explore graphs step by step — then write them yourself.
        </p>
      </div>

      {/* Roadmap */}
      <div className="w-full mb-12 animate-fade-in-up delay-200">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20">BFS</span>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">DFS</span>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">Topological Sort</span>
          <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">Dijkstra</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="animate-fade-in-up delay-300 group relative inline-flex items-center gap-3 bg-emerald-700 dark:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-700/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      >
        Start with BFS
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}
