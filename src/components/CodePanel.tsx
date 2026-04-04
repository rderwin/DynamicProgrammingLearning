type Phase = "brute" | "memo";

// Generic tree node type (matches all problems)
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

function getLineHighlightClass(phase: Phase, lineNum: number, activeLine: number | null, isCacheHit: boolean): string {
  if (activeLine !== lineNum) return "";
  if (isCacheHit) return "code-line-active-green";
  if (phase === "brute") return "code-line-active";
  return "code-line-active";
}

export default function CodePanel({ phase, currentNode, isCacheHit, codeLines, getActiveLine }: Props) {
  const activeLine = getActiveLine(phase, currentNode, isCacheHit);

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
        <span className="ml-auto text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          {phase === "brute" ? "Brute Force" : "Memoized"}
        </span>
      </div>

      {/* Code */}
      <div className="p-4 font-mono text-sm leading-7 flex-1">
        {codeLines.map((line) => (
          <div
            key={line.num}
            className={`flex items-center rounded transition-all duration-200 ${getLineHighlightClass(phase, line.num, activeLine, isCacheHit)}`}
          >
            <span className="text-slate-600 w-8 text-right mr-4 text-xs select-none flex-shrink-0">
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
          </div>
        ))}
      </div>

      {/* Current call info */}
      {currentNode && (
        <div className="px-4 py-3 bg-[#181825] border-t border-slate-700/50 animate-fade-in">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Evaluating:</span>
            <span className="font-mono text-blue-400 font-semibold">{currentNode.label}</span>
            <span className="text-slate-600">=</span>
            <span className="font-mono text-amber-400 font-semibold">{currentNode.result}</span>
            {isCacheHit && (
              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                Cache Hit
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
