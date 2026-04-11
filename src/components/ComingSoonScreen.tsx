import type { ModuleConfig } from "../modules/types";

interface Props {
  module: ModuleConfig;
  onBack: () => void;
}

export default function ComingSoonScreen({ module: mod, onBack }: Props) {
  return (
    <div className="max-w-lg mx-auto text-center animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8 mx-auto"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        All modules
      </button>

      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mod.color.gradient} flex items-center justify-center mx-auto mb-6 shadow-lg opacity-60`}>
        <span className="text-white text-3xl font-bold">{mod.shortTitle[0]}</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">{mod.title}</h2>
      <p className="text-slate-500 mb-6">{mod.description}</p>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {mod.topics.map((t) => (
          <span key={t} className={`text-xs px-3 py-1 rounded-full font-medium ${mod.color.bg} ${mod.color.text}`}>
            {t}
          </span>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-1.42-.88a1.13 1.13 0 01-.42-.95V9.34c0-.39.19-.74.5-.96l1.34-.84a1.13 1.13 0 011.16 0l1.34.84c.31.22.5.57.5.96v4l-.42.95-1.42.88a1.13 1.13 0 01-1.16 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500">
          This module is under development. Check back soon — we're building the same
          interactive, visual experience you know from the DP module.
        </p>
      </div>
    </div>
  );
}
