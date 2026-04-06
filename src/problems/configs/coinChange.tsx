import type { ProblemConfig, CodeLine } from "../../components/TreeLesson";
import {
  buildCoinTree,
  resetNodeId,
  collectEvalOrder,
  countNodes,
} from "../coinChange";

const bruteCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "coinChange", type: "function" }, { text: "(", type: "punctuation" }, { text: "coins", type: "param" }, { text: ", ", type: "punctuation" }, { text: "amount", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (amount ", type: "plain" }, { text: "===", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ";", type: "plain" }, { text: "  // done", type: "comment" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " min ", type: "plain" }, { text: "=", type: "operator" }, { text: " Infinity;", type: "plain" }] },
  { num: 4, tokens: [] },
  { num: 5, tokens: [{ text: "  ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "let", type: "keyword" }, { text: " c ", type: "plain" }, { text: "of", type: "keyword" }, { text: " coins) {", type: "plain" }] },
  { num: 6, tokens: [{ text: "    ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (amount-c ", type: "plain" }, { text: ">=", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ") {", type: "plain" }] },
  { num: 7, tokens: [{ text: "      min ", type: "plain" }, { text: "=", type: "operator" }, { text: " Math.min(min, ", type: "plain" }, { text: "1", type: "number" }, { text: "+", type: "operator" }, { text: "coinChange", type: "function" }, { text: "(coins,amount-c));", type: "plain" }] },
  { num: 8, tokens: [{ text: "    }", type: "punctuation" }] },
  { num: 9, tokens: [{ text: "  }", type: "punctuation" }] },
  { num: 10, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " min;", type: "plain" }] },
  { num: 11, tokens: [{ text: "}", type: "punctuation" }] },
];

const memoCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "coinChange", type: "function" }, { text: "(", type: "punctuation" }, { text: "coins", type: "param" }, { text: ",", type: "punctuation" }, { text: "amt", type: "param" }, { text: ",", type: "punctuation" }, { text: "memo", type: "param" }, { text: "={}) {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (amt ", type: "plain" }, { text: "in", type: "keyword" }, { text: " memo) ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[amt];", type: "plain" }, { text: " // cache hit", type: "comment" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (amt ", type: "plain" }, { text: "===", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ";", type: "plain" }] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " min ", type: "plain" }, { text: "=", type: "operator" }, { text: " Infinity;", type: "plain" }] },
  { num: 5, tokens: [] },
  { num: 6, tokens: [{ text: "  ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "let", type: "keyword" }, { text: " c ", type: "plain" }, { text: "of", type: "keyword" }, { text: " coins) {", type: "plain" }] },
  { num: 7, tokens: [{ text: "    ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (amt-c ", type: "plain" }, { text: ">=", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ")", type: "plain" }] },
  { num: 8, tokens: [{ text: "      min ", type: "plain" }, { text: "=", type: "operator" }, { text: " Math.min(min, ", type: "plain" }, { text: "1", type: "number" }, { text: "+", type: "operator" }, { text: "coinChange", type: "function" }, { text: "(coins,amt-c,memo));", type: "plain" }] },
  { num: 9, tokens: [{ text: "  }", type: "punctuation" }] },
  { num: 10, tokens: [{ text: "  memo[amt] ", type: "plain" }, { text: "=", type: "operator" }, { text: " min;", type: "plain" }] },
  { num: 11, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " min;", type: "plain" }] },
  { num: 12, tokens: [{ text: "}", type: "punctuation" }] },
];

export const coinChangeConfig: ProblemConfig = {
  title: "Coin Change",
  problemNumber: 4,
  totalProblems: 5,
  difficulty: "Medium",
  description: (
    <p>
      Given coins <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">[1, 2, 5]</code> and an <strong>amount</strong>, return the minimum number of coins needed.
    </p>
  ),
  buildTree: buildCoinTree,
  resetIds: resetNodeId,
  collectEvalOrder,
  countNodes,
  nRange: [1, 7],
  nDefault: 5,
  nLabel: "amount",
  codeBruteForce: bruteCode,
  codeMemo: memoCode,
  getActiveLine: (phase, node, isCacheHit) => {
    if (!node) return null;
    if (phase === "brute") return node.n === 0 ? 2 : 7;
    if (isCacheHit) return 2;
    return node.n === 0 ? 3 : 8;
  },
  functionName: "coinChange",
  testCases: [
    { input: [[1, 2, 5], 0], expected: 0, label: "coinChange([1,2,5], 0) = 0" },
    { input: [[1, 2, 5], 1], expected: 1, label: "coinChange([1,2,5], 1) = 1" },
    { input: [[1, 2, 5], 11], expected: 3, label: "coinChange([1,2,5], 11) = 3" },
    { input: [[2], 3], expected: -1, label: "coinChange([2], 3) = -1 (impossible)" },
    { input: [[1, 5, 10, 25], 30], expected: 2, label: "coinChange([1,5,10,25], 30) = 2" },
    { input: [[1, 2, 5], 100], expected: 20, label: "coinChange([1,2,5], 100) — needs DP!" },
  ],
  starterJS: `function coinChange(coins, amount) {
  // Return minimum coins to make amount
  // Return -1 if impossible
  // coins = array of denominations
  //
  // This one branches more than 2 ways!

}`,
  starterPython: `def coinChange(coins, amount):
    # Return minimum coins to make amount
    # Return -1 if impossible
    # coins = list of denominations
    #
    # This one branches more than 2 ways!
    pass`,
  concepts: {
    optimalSubstructure: (
      <>For each coin <strong>c</strong>, the best solution for <strong>amount</strong> might be <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">1 + coinChange(amount - c)</code>. We try all coins and take the minimum. Each subproblem has optimal substructure — the best local choice leads to the global best.</>
    ),
    overlappingSubproblems: (dup, total) => (
      <>With 3 coin types, the tree branches 3 ways at each node — but many amounts get recomputed. <strong>{dup} duplicates</strong> out of {total} calls. The overlap is even worse than Fibonacci because there are more paths to the same subproblem.</>
    ),
    tryMemo: (<>The tree is wider here, but the fix is identical. Click <strong>"+ Memoization"</strong> — same pattern, bigger payoff.</>),
    memoWins: (total, unique) => (<>From {total} calls to at most {unique} unique amounts. <strong>O(amount × coins)</strong> instead of exponential. The recurrence is different but the memoization technique is identical.</>),
  },
};
