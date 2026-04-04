import type { ProblemConfig, CodeLine } from "../../components/TreeLesson";
import {
  buildStairsTree,
  resetNodeId,
  collectEvalOrder,
  countNodes,
} from "../climbingStairs";

const bruteCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "climbStairs", type: "function" }, { text: "(", type: "punctuation" }, { text: "n", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (n ", type: "plain" }, { text: "<=", type: "operator" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ";", type: "plain" }, { text: "  // base case", type: "comment" }] },
  { num: 3, tokens: [] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "climbStairs", type: "function" }, { text: "(n-", type: "plain" }, { text: "1", type: "number" }, { text: ")", type: "plain" }] },
  { num: 5, tokens: [{ text: "       ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "climbStairs", type: "function" }, { text: "(n-", type: "plain" }, { text: "2", type: "number" }, { text: ");", type: "plain" }] },
  { num: 6, tokens: [{ text: "}", type: "punctuation" }] },
];

const memoCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "climbStairs", type: "function" }, { text: "(", type: "punctuation" }, { text: "n", type: "param" }, { text: ", ", type: "punctuation" }, { text: "memo", type: "param" }, { text: "={}) {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (n ", type: "plain" }, { text: "in", type: "keyword" }, { text: " memo) ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[n];", type: "plain" }, { text: " // cache hit", type: "comment" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (n ", type: "plain" }, { text: "<=", type: "operator" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ";", type: "plain" }] },
  { num: 4, tokens: [] },
  { num: 5, tokens: [{ text: "  memo[n] ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "climbStairs", type: "function" }, { text: "(n-", type: "plain" }, { text: "1", type: "number" }, { text: ",memo)", type: "plain" }] },
  { num: 6, tokens: [{ text: "           ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "climbStairs", type: "function" }, { text: "(n-", type: "plain" }, { text: "2", type: "number" }, { text: ",memo);", type: "plain" }] },
  { num: 7, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[n];", type: "plain" }] },
  { num: 8, tokens: [{ text: "}", type: "punctuation" }] },
];

export const climbingStairsConfig: ProblemConfig = {
  title: "Climbing Stairs",
  problemNumber: 2,
  totalProblems: 5,
  difficulty: "Easy",
  description: (
    <p>
      You're climbing a staircase with <strong>n</strong> steps. Each time you can climb <strong>1 or 2</strong> steps. How many distinct ways can you reach the top?
    </p>
  ),
  buildTree: buildStairsTree,
  resetIds: resetNodeId,
  collectEvalOrder,
  countNodes,
  nRange: [2, 8],
  nDefault: 5,
  nLabel: "steps",
  codeBruteForce: bruteCode,
  codeMemo: memoCode,
  getActiveLine: (phase, node, isCacheHit) => {
    if (!node) return null;
    if (phase === "brute") return node.n <= 1 ? 2 : 4;
    if (isCacheHit) return 2;
    return node.n <= 1 ? 3 : 5;
  },
  functionName: "climbStairs",
  testCases: [
    { input: [1], expected: 1, label: "climbStairs(1) = 1" },
    { input: [2], expected: 2, label: "climbStairs(2) = 2" },
    { input: [3], expected: 3, label: "climbStairs(3) = 3" },
    { input: [5], expected: 8, label: "climbStairs(5) = 8" },
    { input: [10], expected: 89, label: "climbStairs(10) = 89" },
    { input: [30], expected: 1346269, label: "climbStairs(30) = 1346269" },
  ],
  starterJS: `function climbStairs(n) {
  // Return the number of distinct ways to climb n steps
  // You can take 1 or 2 steps at a time
  // Hint: this is basically Fibonacci in disguise!

}`,
  starterPython: `def climbStairs(n):
    # Return the number of distinct ways to climb n steps
    # You can take 1 or 2 steps at a time
    # Hint: this is basically Fibonacci in disguise!
    pass`,
  concepts: {
    optimalSubstructure: (
      <>To reach step <strong>n</strong>, you came from step <strong>n-1</strong> (took 1 step) or step <strong>n-2</strong> (took 2 steps). So <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">ways(n) = ways(n-1) + ways(n-2)</code>. Sound familiar? It's the same structure as Fibonacci!</>
    ),
    overlappingSubproblems: (dup, total) => (
      <>Same pattern as Fibonacci — <strong>{dup} duplicate calls</strong> out of {total}. The tree blows up exponentially even though there are only <strong>n</strong> unique subproblems.</>
    ),
    tryMemo: (<>Click <strong>"+ Memoization"</strong> — this is the exact same fix as Fibonacci. Once you see the pattern, it's automatic.</>),
    memoWins: (total, unique) => (<>From {total} calls to {unique}. Same O(n) fix. The key insight: <strong>Climbing Stairs IS Fibonacci</strong> with different base cases. DP problems often disguise the same recurrence.</>),
  },
};
