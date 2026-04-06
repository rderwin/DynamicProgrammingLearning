import type { ProblemConfig, CodeLine } from "../../components/TreeLesson";
import {
  buildFibTree,
  resetNodeId,
  collectEvalOrder,
  countNodes,
} from "../fibonacci";

const bruteCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "fib", type: "function" }, { text: "(", type: "punctuation" }, { text: "n", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (n ", type: "plain" }, { text: "<=", type: "operator" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " n;", type: "plain" }, { text: "  // base case", type: "comment" }] },
  { num: 3, tokens: [] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "fib", type: "function" }, { text: "(n-", type: "plain" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "fib", type: "function" }, { text: "(n-", type: "plain" }, { text: "2", type: "number" }, { text: ");", type: "plain" }] },
  { num: 5, tokens: [{ text: "}", type: "punctuation" }] },
];

const memoCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "fib", type: "function" }, { text: "(", type: "punctuation" }, { text: "n", type: "param" }, { text: ", ", type: "punctuation" }, { text: "memo", type: "param" }, { text: "={}) {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (n ", type: "plain" }, { text: "in", type: "keyword" }, { text: " memo) ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[n];", type: "plain" }, { text: " // cache hit", type: "comment" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (n ", type: "plain" }, { text: "<=", type: "operator" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " n;", type: "plain" }] },
  { num: 4, tokens: [] },
  { num: 5, tokens: [{ text: "  memo[n] ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "fib", type: "function" }, { text: "(n-", type: "plain" }, { text: "1", type: "number" }, { text: ",memo) ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "fib", type: "function" }, { text: "(n-", type: "plain" }, { text: "2", type: "number" }, { text: ",memo);", type: "plain" }] },
  { num: 6, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[n];", type: "plain" }] },
  { num: 7, tokens: [{ text: "}", type: "punctuation" }] },
];

export const fibonacciConfig: ProblemConfig = {
  title: "Fibonacci Numbers",
  problemNumber: 1,
  totalProblems: 5,
  difficulty: "Intro",
  description: (
    <p>
      <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">fib(n) = fib(n-1) + fib(n-2)</code>
      <span className="text-slate-400 mx-2">where</span>
      <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">fib(0)=0, fib(1)=1</code>
    </p>
  ),
  buildTree: buildFibTree,
  resetIds: resetNodeId,
  collectEvalOrder,
  countNodes,
  nRange: [2, 8],
  nDefault: 5,
  codeBruteForce: bruteCode,
  codeMemo: memoCode,
  getActiveLine: (phase, node, isCacheHit) => {
    if (!node) return null;
    if (phase === "brute") return node.n <= 1 ? 2 : 4;
    if (isCacheHit) return 2;
    return node.n <= 1 ? 3 : 5;
  },
  functionName: "fib",
  testCases: [
    { input: [0], expected: 0, label: "fib(0) = 0" },
    { input: [1], expected: 1, label: "fib(1) = 1" },
    { input: [5], expected: 5, label: "fib(5) = 5" },
    { input: [10], expected: 55, label: "fib(10) = 55" },
    { input: [30], expected: 832040, label: "fib(30) = 832040" },
    { input: [45], expected: 1134903170, label: "fib(45) — brute force will timeout!" },
  ],
  starterJS: `function fib(n) {
  // Return the nth Fibonacci number
  // fib(0) = 0, fib(1) = 1
  // Hint: brute force times out on large n — use DP!

}`,
  starterPython: `def fib(n):
    # Return the nth Fibonacci number
    # fib(0) = 0, fib(1) = 1
    # Hint: brute force times out on large n — use DP!
    pass`,
  concepts: {
    optimalSubstructure: (
      <>Each <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">fib(n)</code> is built from <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">fib(n-1)</code> and <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">fib(n-2)</code>. This is <strong>optimal substructure</strong>: the answer to the big problem comes from answers to smaller ones.</>
    ),
    overlappingSubproblems: (dup, total, n) => (
      <>The <span className="text-red-600 font-semibold">red nodes</span> are the same computation repeated. <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">fib({n})</code> has <strong>{dup} duplicates</strong> out of {total} calls. These are <strong>overlapping subproblems</strong> — why brute force is O(2^n).</>
    ),
    tryMemo: (<>What if we <em>remembered</em> each answer? Click <strong>"+ Memoization"</strong> and watch branches disappear.</>),
    memoWins: (total, unique) => (<>Each subproblem computed <strong>once</strong>. From {total} calls down to {unique} — <strong>O(n) instead of O(2^n)</strong>.</>),
  },
};
