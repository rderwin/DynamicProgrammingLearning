import { useRef, useEffect } from "react";

type Phase = "brute" | "memo";

interface TreeNode {
  id: string;
  label: string;
  n: number;
  children: TreeNode[];
  result: number;
  duplicate: boolean;
}

export interface CodeLine {
  num: number;
  tokens: Token[];
}

interface Token {
  text: string;
  type: "keyword" | "function" | "number" | "string" | "comment" | "operator" | "punctuation" | "param" | "plain";
}

interface Props {
  phase: Phase;
  currentNode: TreeNode | null;
  isCacheHit: boolean;
  codeLines: CodeLine[];
  getActiveLine: (phase: Phase, node: TreeNode | null, isCacheHit: boolean) => number | null;
}

const tokenColors: Record<Token["type"], string> = {
  keyword: "text-purple-400",
  function: "text-blue-400",
  number: "text-amber-400",
  string: "text-green-400",
  comment: "text-slate-500 italic",
  operator: "text-sky-300",
  punctuation: "text-slate-300",
  param: "text-orange-300",
  plain: "text-slate-200",
};

function getLineHighlightClass(lineNum: number, activeLine: number | null, isCacheHit: boolean): string {
  if (activeLine !== lineNum) return "";
  if (isCacheHit) return "code-line-active-green";
  return "code-line-active";
}

export default function CodePanel({ phase, currentNode, isCacheHit, codeLines, getActiveLine }: Props) {
  const activeLine = getActiveLine(phase, currentNode, isCacheHit);
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active line
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLine]);

  return (
    <div className="bg-[#1e1e2e] rounded-xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-slate-700/50">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#f38ba8]/80" />
          <span className="w-3 h-3 rounded-full bg-[#f9e2af]/80" />
          <span className="w-3 h-3 rounded-full bg-[#a6e3a1]/80" />
        </div>
        <span className="text-xs text-slate-400 ml-2 font-mono">solution.js</span>
        <span className={`ml-auto text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
          phase === "brute"
            ? "bg-red-500/10 text-red-400"
            : "bg-green-500/10 text-green-400"
        }`}>
          {phase === "brute" ? "Brute Force" : "Memoized"}
        </span>
      </div>

      {/* Code */}
      <div className="p-4 font-mono text-sm leading-7 flex-1 overflow-auto">
        {codeLines.map((line) => {
          const isActive = activeLine === line.num;
          return (
            <div
              key={line.num}
              ref={isActive ? activeRef : undefined}
              className={`flex items-center rounded-md transition-all duration-200 ${getLineHighlightClass(line.num, activeLine, isCacheHit)}`}
              style={isActive ? { transition: "background 0.15s ease-out, border-color 0.15s ease-out" } : undefined}
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
              {/* Active line arrow indicator */}
              {isActive && (
                <span className="ml-auto text-blue-400 text-xs animate-fade-in flex-shrink-0 pl-2">
                  ◀
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current call info — enhanced */}
      <div className={`px-4 py-3 border-t border-slate-700/50 transition-all duration-300 ${
        currentNode ? "bg-[#181825]" : "bg-[#181825]/50"
      }`}>
        {currentNode ? (
          <div className="flex items-center gap-3 text-xs animate-fade-in" key={currentNode.id}>
            <span className="text-slate-500">Evaluating:</span>
            <span className="font-mono text-blue-400 font-semibold">{currentNode.label}</span>
            <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            <span className="font-mono text-amber-400 font-bold text-sm">{currentNode.result === Infinity ? "∞" : currentNode.result}</span>
            {isCacheHit && (
              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider animate-scale-in">
                Cache Hit
              </span>
            )}
            {currentNode.duplicate && !isCacheHit && (
              <span className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider animate-scale-in">
                Duplicate
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-600 italic">
            Waiting for first step...
          </div>
        )}
      </div>
    </div>
  );
}
