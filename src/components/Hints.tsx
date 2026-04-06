import { useState } from "react";

interface Props {
  hints: string[];
}

export default function Hints({ hints }: Props) {
  const [revealed, setRevealed] = useState(0);
  const allRevealed = revealed >= hints.length;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
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
              <p className="text-sm text-slate-700 leading-relaxed">{hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Button */}
      <div className={`px-4 py-3 ${revealed > 0 ? "border-t border-slate-200 bg-white" : ""}`}>
        {!allRevealed ? (
          <button
            onClick={() => setRevealed((r) => r + 1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <svg className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
            {revealed === 0
              ? "Stuck? Get a hint"
              : `Show hint ${revealed + 1} of ${hints.length} (more specific)`
            }
          </button>
        ) : (
          <p className="text-xs text-slate-400 italic">No more hints — you've got everything you need!</p>
        )}
      </div>
    </div>
  );
}
