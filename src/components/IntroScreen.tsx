interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
      {/* Hero */}
      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Interactive visual learning
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Dynamic Programming
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            is not that hard.
          </span>
        </h1>

        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-12">
          Seriously. It's just remembering answers you already figured out.
          <br />
          We'll prove it to you — visually, step by step.
        </p>
      </div>

      {/* The demystification */}
      <div className="grid sm:grid-cols-3 gap-6 w-full mb-14 animate-fade-in-up delay-200">
        <MythCard
          myth="DP requires genius-level thinking"
          reality="It's pattern matching. Once you see the pattern in 2-3 problems, you see it everywhere."
          icon="brain"
        />
        <MythCard
          myth="You need to memorize solutions"
          reality="You need to understand WHY it works. Then the solution writes itself."
          icon="book"
        />
        <MythCard
          myth="Start with the table, figure out transitions"
          reality="Start with brute force recursion. DP is just adding a cache."
          icon="table"
        />
      </div>

      {/* How it works */}
      <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-12 text-left animate-fade-in-up delay-300">
        <h2 className="text-lg font-bold text-slate-800 mb-4">How this works</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <Step num={1} title="See brute force" desc="Watch the recursion tree grow and spot the wasted work yourself" />
          <Step num={2} title="Turn on memoization" desc="One click — watch branches vanish and a table fill up in real time" />
          <Step num={3} title="Learn the vocabulary" desc="Now terms like 'overlapping subproblems' actually mean something to you" />
          <Step num={4} title="Write the code" desc="See exactly which lines map to which part of the visualization" />
        </div>
      </div>

      {/* Problem roadmap */}
      <div className="w-full mb-12 animate-fade-in-up delay-400">
        <h2 className="text-lg font-bold text-slate-800 mb-4">The roadmap</h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <RoadmapItem label="Fibonacci" active />
          <Arrow />
          <RoadmapItem label="Climbing Stairs" />
          <Arrow />
          <RoadmapItem label="Grid Paths" />
          <Arrow />
          <RoadmapItem label="Coin Change" />
          <Arrow />
          <RoadmapItem label="Knapsack" />
        </div>
        <p className="text-sm text-slate-400 mt-3">
          Each problem builds on the same core pattern but adds complexity.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="animate-fade-in-up delay-500 group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/25 hover:-translate-y-0.5 active:translate-y-0"
      >
        Start with Fibonacci
        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}

function MythCard({ myth, reality, icon }: { myth: string; reality: string; icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    brain: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13a18 18 0 01-5.487.131l-2.382-.477a6 6 0 00-2.922.066l-2.04.51a1.5 1.5 0 01-1.785-1.974l.634-2.537" />
      </svg>
    ),
    book: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    table: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <div className="text-slate-400 mb-3">{icons[icon]}</div>
      <p className="text-sm text-slate-400 line-through decoration-slate-300 mb-2">{myth}</p>
      <p className="text-sm text-slate-700 font-medium leading-snug">{reality}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
        {num}
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function RoadmapItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-100 text-blue-800 ring-2 ring-blue-500/20"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
