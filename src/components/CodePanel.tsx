import type { TreeNode } from "../problems/fibonacci";

type Phase = "brute" | "memo";

interface Props {
  phase: Phase;
  currentNode: TreeNode | null;
  isCacheHit: boolean;
}

// Each line: [lineNumber, code, tokenTypes[]]
// tokenTypes map to syntax highlighting classes
interface CodeLine {
  num: number;
  tokens: Token[];
}

interface Token {
  text: string;
  type: "keyword" | "function" | "number" | "string" | "comment" | "operator" | "punctuation" | "param" | "plain";
}

const bruteForceCode: CodeLine[] = [
  {
    num: 1,
    tokens: [
      { text: "function ", type: "keyword" },
      { text: "fib", type: "function" },
      { text: "(", type: "punctuation" },
      { text: "n", type: "param" },
      { text: ") {", type: "punctuation" },
    ],
  },
  {
    num: 2,
    tokens: [
      { text: "  ", type: "plain" },
      { text: "if", type: "keyword" },
      { text: " (n ", type: "plain" },
      { text: "<=", type: "operator" },
      { text: " ", type: "plain" },
      { text: "1", type: "number" },
      { text: ") ", type: "plain" },
      { text: "return", type: "keyword" },
      { text: " n;", type: "plain" },
      { text: "  // base case", type: "comment" },
    ],
  },
  { num: 3, tokens: [] }, // empty line
  {
    num: 4,
    tokens: [
      { text: "  ", type: "plain" },
      { text: "return", type: "keyword" },
      { text: " ", type: "plain" },
      { text: "fib", type: "function" },
      { text: "(n ", type: "plain" },
      { text: "-", type: "operator" },
      { text: " ", type: "plain" },
      { text: "1", type: "number" },
      { text: ") ", type: "plain" },
      { text: "+", type: "operator" },
      { text: " ", type: "plain" },
      { text: "fib", type: "function" },
      { text: "(n ", type: "plain" },
      { text: "-", type: "operator" },
      { text: " ", type: "plain" },
      { text: "2", type: "number" },
      { text: ");", type: "plain" },
    ],
  },
  {
    num: 5,
    tokens: [{ text: "}", type: "punctuation" }],
  },
];

const memoCode: CodeLine[] = [
  {
    num: 1,
    tokens: [
      { text: "function ", type: "keyword" },
      { text: "fib", type: "function" },
      { text: "(", type: "punctuation" },
      { text: "n", type: "param" },
      { text: ", ", type: "punctuation" },
      { text: "memo", type: "param" },
      { text: " = {}) {", type: "punctuation" },
    ],
  },
  {
    num: 2,
    tokens: [
      { text: "  ", type: "plain" },
      { text: "if", type: "keyword" },
      { text: " (n ", type: "plain" },
      { text: "in", type: "keyword" },
      { text: " memo) ", type: "plain" },
      { text: "return", type: "keyword" },
      { text: " memo[n];", type: "plain" },
      { text: "  // cache hit!", type: "comment" },
    ],
  },
  {
    num: 3,
    tokens: [
      { text: "  ", type: "plain" },
      { text: "if", type: "keyword" },
      { text: " (n ", type: "plain" },
      { text: "<=", type: "operator" },
      { text: " ", type: "plain" },
      { text: "1", type: "number" },
      { text: ") ", type: "plain" },
      { text: "return", type: "keyword" },
      { text: " n;", type: "plain" },
      { text: "  // base case", type: "comment" },
    ],
  },
  { num: 4, tokens: [] },
  {
    num: 5,
    tokens: [
      { text: "  memo[n] ", type: "plain" },
      { text: "=", type: "operator" },
      { text: " ", type: "plain" },
      { text: "fib", type: "function" },
      { text: "(n ", type: "plain" },
      { text: "-", type: "operator" },
      { text: " ", type: "plain" },
      { text: "1", type: "number" },
      { text: ") ", type: "plain" },
      { text: "+", type: "operator" },
      { text: " ", type: "plain" },
      { text: "fib", type: "function" },
      { text: "(n ", type: "plain" },
      { text: "-", type: "operator" },
      { text: " ", type: "plain" },
      { text: "2", type: "number" },
      { text: ");", type: "plain" },
    ],
  },
  {
    num: 6,
    tokens: [
      { text: "  ", type: "plain" },
      { text: "return", type: "keyword" },
      { text: " memo[n];", type: "plain" },
    ],
  },
  {
    num: 7,
    tokens: [{ text: "}", type: "punctuation" }],
  },
];

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

function getActiveLine(phase: Phase, currentNode: TreeNode | null, isCacheHit: boolean): number | null {
  if (!currentNode) return null;

  if (phase === "brute") {
    if (currentNode.n <= 1) return 2; // base case
    return 4; // recursive return
  } else {
    if (isCacheHit) return 2; // cache hit
    if (currentNode.n <= 1) return 3; // base case
    return 5; // memo[n] = fib(n-1) + fib(n-2)
  }
}

function getLineHighlightClass(phase: Phase, lineNum: number, activeLine: number | null): string {
  if (activeLine !== lineNum) return "";
  if (phase === "memo" && lineNum === 2) return "code-line-active-green"; // cache hit = green
  if (lineNum === 2 || lineNum === 3) return "code-line-active-amber"; // base case = amber
  return "code-line-active"; // recursive = blue
}

export default function CodePanel({ phase, currentNode, isCacheHit }: Props) {
  const code = phase === "brute" ? bruteForceCode : memoCode;
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
        <span className="text-xs text-slate-400 ml-2 font-mono">
          fibonacci.js
        </span>
        <span className="ml-auto text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          {phase === "brute" ? "Brute Force" : "Memoized"}
        </span>
      </div>

      {/* Code */}
      <div className="p-4 font-mono text-sm leading-7 flex-1">
        {code.map((line) => (
          <div
            key={line.num}
            className={`flex items-center rounded transition-all duration-200 ${getLineHighlightClass(phase, line.num, activeLine)}`}
          >
            <span className="text-slate-600 w-8 text-right mr-4 text-xs select-none flex-shrink-0">
              {line.num}
            </span>
            <span className="whitespace-pre">
              {line.tokens.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                line.tokens.map((token, i) => (
                  <span key={i} className={tokenColors[token.type]}>
                    {token.text}
                  </span>
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
            <span className="text-slate-500">Currently evaluating:</span>
            <span className="font-mono text-blue-400 font-semibold">
              fib({currentNode.n})
            </span>
            <span className="text-slate-600">=</span>
            <span className="font-mono text-amber-400 font-semibold">
              {currentNode.result}
            </span>
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
