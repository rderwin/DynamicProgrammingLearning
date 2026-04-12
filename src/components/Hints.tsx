import { useState } from "react";

interface Props {
  hints: string[];
  solution: string;
  solutionPython?: string;
}

export default function Hints({ hints, solution, solutionPython }: Props) {
  const [revealed, setRevealed] = useState(0);
  const [showSolutionGate, setShowSolutionGate] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [solutionLang, setSolutionLang] = useState<"js" | "py">("js");
  const allHintsRevealed = revealed >= hints.length;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Revealed hints */}
      {revealed > 0 && (
        <div className="p-4 space-y-3">
          {hints.slice(0, revealed).map((hint, i) => (
            <div
              key={i}
              className="flex items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                i === 0
                  ? "bg-blue-100 text-blue-700"
                  : i === 1
                    ? "bg-amber-100 text-amber-700"
                    : i === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
              }`}>
                {i + 1}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Solution (behind gate) */}
      {solutionRevealed && (
        <div className="mx-4 mb-4 animate-fade-in-up">
          <div className="bg-[#1e1e2e] rounded-lg border border-slate-700/50 overflow-hidden">
            {/* Language tabs */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-2">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Solution</span>
              {solutionPython && (
                <div className="flex gap-0.5 bg-[#11111b] rounded-md p-0.5 text-[10px] ml-auto">
                  <button
                    onClick={() => setSolutionLang("js")}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${solutionLang === "js" ? "bg-[#313244] text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
                  >JS</button>
                  <button
                    onClick={() => setSolutionLang("py")}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${solutionLang === "py" ? "bg-[#313244] text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
                  >Python</button>
                </div>
              )}
            </div>
            <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed px-4 pb-4">
              {solutionLang === "py" && solutionPython ? solutionPython : solution}
            </pre>
          </div>
        </div>
      )}

      {/* Button area */}
      <div className={`px-4 py-3 ${revealed > 0 || solutionRevealed ? "border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" : ""}`}>
        {!allHintsRevealed ? (
          <button
            onClick={() => setRevealed((r) => r + 1)}
            className={`flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group ${revealed === 0 ? "animate-pulse-hint rounded-lg px-2 py-1 -mx-2 -my-1" : ""}`}
          >
            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            {revealed === 0
              ? "Stuck? Get a hint"
              : `Show hint ${revealed + 1} of ${hints.length} (more specific)`
            }
          </button>
        ) : !solutionRevealed && !showSolutionGate ? (
          <button
            onClick={() => setShowSolutionGate(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors group"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            Show me the full solution...
          </button>
        ) : showSolutionGate && !solutionRevealed ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-sm text-red-500 font-medium">Are you sure? You'll learn more by trying first.</span>
            <button
              onClick={() => { setSolutionRevealed(true); setShowSolutionGate(false); }}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
            >
              Yes, show me
            </button>
            <button
              onClick={() => setShowSolutionGate(false)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              I'll keep trying
            </button>
          </div>
        ) : solutionRevealed ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">Try typing it out yourself — understanding comes from writing, not reading.</p>
        ) : null}
      </div>
    </div>
  );
}
