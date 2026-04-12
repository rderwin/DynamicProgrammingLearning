import type { AlgorithmStep } from "../modules/graphs/graphs/types";

export interface GraphCodeLine {
  num: number;
  tokens: { text: string; type: "keyword" | "function" | "number" | "string" | "comment" | "operator" | "punctuation" | "param" | "plain" }[];
}

interface Props {
  algorithmName: string;
  codeLines: GraphCodeLine[];
  currentStep: AlgorithmStep | null;
  getActiveLine: (step: AlgorithmStep | null) => number | null;
}

const tokenColors: Record<string, string> = {
  keyword: "text-purple-400",
  function: "text-emerald-400",
  number: "text-amber-400",
  string: "text-green-400",
  comment: "text-slate-500 italic",
  operator: "text-sky-300",
  punctuation: "text-slate-300",
  param: "text-orange-300",
  plain: "text-slate-200",
};

export default function GraphCodePanel({ algorithmName, codeLines, currentStep, getActiveLine }: Props) {
  const activeLine = getActiveLine(currentStep);

  return (
    <div className="bg-[#1e1e2e] rounded-xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-slate-700/50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#f38ba8]/80" />
          <span className="w-3 h-3 rounded-full bg-[#f9e2af]/80" />
          <span className="w-3 h-3 rounded-full bg-[#a6e3a1]/80" />
        </div>
        <span className="text-xs text-slate-400 ml-2 font-mono">algorithm.js</span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
          {algorithmName}
        </span>
      </div>

      {/* Code */}
      <div className="p-4 font-mono text-sm leading-7 flex-1 overflow-auto">
        {codeLines.map((line) => {
          const isActive = activeLine === line.num;
          return (
            <div
              key={line.num}
              className={`flex items-center rounded-md transition-all duration-200 ${isActive ? "code-line-active-green" : ""}`}
            >
              <span className={`w-8 text-right mr-4 text-xs select-none flex-shrink-0 transition-colors duration-200 ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                {line.num}
              </span>
              <span className="whitespace-pre">
                {line.tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.tokens.map((token, i) => (
                    <span key={i} className={tokenColors[token.type]}>{token.text}</span>
                  ))
                )}
              </span>
              {isActive && <span className="ml-auto text-emerald-400 text-xs animate-fade-in flex-shrink-0 pl-2">◀</span>}
            </div>
          );
        })}
      </div>

      {/* Current step description */}
      <div className="px-4 py-3 bg-[#181825] border-t border-slate-700/50">
        {currentStep ? (
          <div className="flex items-center gap-3 text-xs animate-fade-in" key={currentStep.description}>
            <span className="text-slate-500">Step:</span>
            <span className="text-emerald-400 font-medium">{currentStep.description}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-600 italic">Waiting for first step...</div>
        )}
      </div>
    </div>
  );
}
