import type { ModuleConfig, ModuleId } from "../modules/types";

interface Props {
  modules: ModuleConfig[];
  onSelectModule: (id: ModuleId) => void;
  getProgress: (id: ModuleId) => { lessons: number; practice: number };
}

export default function ModulePicker({ modules, onSelectModule, getProgress }: Props) {
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
              <h3 className={`text-base font-bold mb-1 ${isAvailable ? "text-slate-900 dark:text-slate-100 group-hover:" + mod.color.text : "text-slate-400 dark:text-slate-500"} transition-colors`}>
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
    </div>
  );
}
