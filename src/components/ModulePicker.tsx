import type { ModuleConfig, ModuleId } from "../modules/types";

interface Props {
  modules: ModuleConfig[];
  onSelectModule: (id: ModuleId) => void;
  getProgress: (id: ModuleId) => { lessons: number; practice: number };
  onTraining?: () => void;
  onCheatSheet?: () => void;
  onFlowchart?: () => void;
  onLanguages?: () => void;
  onPython?: () => void;
  onComplexityViz?: () => void;
  onSandbox?: () => void;
  onPythonDP?: () => void;
  onStats?: () => void;
  onGotchas?: () => void;
}

export default function ModulePicker({ modules, onSelectModule, getProgress, onTraining, onCheatSheet, onFlowchart, onLanguages, onPython, onComplexityViz, onSandbox, onPythonDP, onStats, onGotchas }: Props) {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Interactive visual learning
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-4">
          Master the topics that
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent gradient-animate">
            actually come up in interviews.
          </span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Each module walks you through step by step — visualize the algorithm, understand why it works, then write the code yourself.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod, i) => {
          const progress = getProgress(mod.id);
          const totalProgress = mod.problemCount + mod.practiceCount;
          const completedProgress = progress.lessons + progress.practice;
          const progressPct = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
          const isAvailable = mod.status === "available";

          return (
            <button
              key={mod.id}
              onClick={() => isAvailable && onSelectModule(mod.id)}
              disabled={!isAvailable}
              className={`text-left rounded-2xl border p-6 transition-all duration-200 group ${
                isAvailable
                  ? `${mod.color.border} hover:shadow-lg hover:-translate-y-1 active:translate-y-0 cursor-pointer bg-white dark:bg-slate-900`
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 cursor-not-allowed"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Icon + badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color.gradient} flex items-center justify-center shadow-sm ${isAvailable ? "" : "opacity-40"}`}>
                  <span className="text-white text-lg font-bold">{mod.shortTitle[0]}</span>
                </div>
                {!isAvailable && (
                  <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
                {isAvailable && completedProgress > 0 && (
                  <span className={`text-[10px] font-semibold ${mod.color.bg} ${mod.color.text} px-2 py-0.5 rounded-full`}>
                    {completedProgress}/{totalProgress}
                  </span>
                )}
              </div>

              {/* Title + tagline */}
              <h3 className={`text-base font-bold mb-1 ${isAvailable ? `text-slate-900 dark:text-slate-100` : "text-slate-400 dark:text-slate-500"} transition-colors`}>
                {mod.title}
              </h3>
              <p className={`text-xs mb-4 leading-relaxed ${isAvailable ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                {mod.tagline}
              </p>

              {/* Topics */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mod.topics.map((t) => (
                  <span
                    key={t}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isAvailable ? `${mod.color.bg} ${mod.color.text}` : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              {isAvailable && totalProgress > 0 && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${mod.color.gradient}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}

              {/* Arrow for available */}
              {isAvailable && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  <span>{completedProgress > 0 ? "Continue" : "Start learning"}</span>
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Training Center card */}
      {onTraining && (
        <div className="mt-8 animate-fade-in-up delay-300">
          <button
            onClick={onTraining}
            className="w-full text-left bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-xl">⚡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Training Center</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pattern recognition quizzes, bug hunts, and skill drills — earn XP</p>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Interview Tools section */}
      {(onCheatSheet || onFlowchart || onLanguages || onPython) && (
        <div className="mt-8 animate-fade-in-up delay-400">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Interview Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {onPython && (
              <ToolCard onClick={onPython} icon="🐍" title="Python for Interviews" desc="Hands-on lessons for Python tricks" color="from-blue-500 to-yellow-500" />
            )}
            {onPythonDP && (
              <ToolCard onClick={onPythonDP} icon="🧮" title="Python DP Masterclass" desc="6 hands-on DP lessons in Python" color="from-violet-500 to-blue-600" />
            )}
            {onFlowchart && (
              <ToolCard onClick={onFlowchart} icon="🧭" title="Pattern Finder" desc="Identify the right algorithm for any problem" color="from-indigo-500 to-purple-600" />
            )}
            {onLanguages && (
              <ToolCard onClick={onLanguages} icon="💬" title="Language Guide" desc="Pick the best language for your interview" color="from-fuchsia-500 to-purple-600" />
            )}
            {onCheatSheet && (
              <ToolCard onClick={onCheatSheet} icon="📋" title="Cheat Sheet" desc="Patterns & complexity reference" color="from-slate-600 to-slate-800" />
            )}
            {onComplexityViz && (
              <ToolCard onClick={onComplexityViz} icon="📈" title="Complexity Visualizer" desc="See how Big O classes grow" color="from-cyan-500 to-blue-600" />
            )}
            {onSandbox && (
              <ToolCard onClick={onSandbox} icon="🎮" title="Data Structure Sandbox" desc="Play with stack, queue, heap, map, set" color="from-teal-500 to-cyan-600" />
            )}
            {onStats && (
              <ToolCard onClick={onStats} icon="📊" title="My Stats" desc="All your progress across the app" color="from-blue-500 to-violet-600" />
            )}
            {onGotchas && (
              <ToolCard onClick={onGotchas} icon="⚠️" title="Python Gotchas" desc="The weird behaviors that bite in interviews" color="from-red-500 to-orange-600" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({ onClick, icon, title, desc, color }: { onClick: () => void; icon: string; title: string; desc: string; color: string }) {
  return (
    <button onClick={onClick} className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{desc}</p>
        </div>
        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-all group-hover:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}
