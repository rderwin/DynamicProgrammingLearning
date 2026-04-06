import type { ProblemConfig, CodeLine } from "../../components/TreeLesson";
import {
  buildKnapsackTree,
  resetNodeId,
  collectEvalOrder,
  countNodes,
} from "../knapsack";

const bruteCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "knapsack", type: "function" }, { text: "(", type: "punctuation" }, { text: "W", type: "param" }, { text: ",", type: "punctuation" }, { text: "wt", type: "param" }, { text: ",", type: "punctuation" }, { text: "val", type: "param" }, { text: ",", type: "punctuation" }, { text: "i", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (i ", type: "plain" }, { text: ">=", type: "operator" }, { text: " wt.length ", type: "plain" }, { text: "||", type: "operator" }, { text: " W ", type: "plain" }, { text: "<=", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ")", type: "plain" }] },
  { num: 3, tokens: [{ text: "    ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ";", type: "plain" }, { text: "  // base case", type: "comment" }] },
  { num: 4, tokens: [] },
  { num: 5, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " skip ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "knapsack", type: "function" }, { text: "(W, wt, val, i+", type: "plain" }, { text: "1", type: "number" }, { text: ");", type: "plain" }] },
  { num: 6, tokens: [] },
  { num: 7, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (wt[i] ", type: "plain" }, { text: "<=", type: "operator" }, { text: " W) {", type: "plain" }] },
  { num: 8, tokens: [{ text: "    ", type: "plain" }, { text: "let", type: "keyword" }, { text: " take ", type: "plain" }, { text: "=", type: "operator" }, { text: " val[i] ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "knapsack", type: "function" }, { text: "(W-wt[i],wt,val,i+", type: "plain" }, { text: "1", type: "number" }, { text: ");", type: "plain" }] },
  { num: 9, tokens: [{ text: "    ", type: "plain" }, { text: "return", type: "keyword" }, { text: " Math.max(skip, take);", type: "plain" }] },
  { num: 10, tokens: [{ text: "  }", type: "punctuation" }] },
  { num: 11, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " skip;", type: "plain" }] },
  { num: 12, tokens: [{ text: "}", type: "punctuation" }] },
];

const memoCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "knapsack", type: "function" }, { text: "(", type: "punctuation" }, { text: "W", type: "param" }, { text: ",", type: "punctuation" }, { text: "wt", type: "param" }, { text: ",", type: "punctuation" }, { text: "val", type: "param" }, { text: ",", type: "punctuation" }, { text: "i", type: "param" }, { text: ",", type: "punctuation" }, { text: "memo", type: "param" }, { text: "={}) {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " key ", type: "plain" }, { text: "=", type: "operator" }, { text: " i+", type: "plain" }, { text: "','", type: "string" }, { text: "+W;", type: "plain" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (key ", type: "plain" }, { text: "in", type: "keyword" }, { text: " memo) ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[key];", type: "plain" }, { text: " // hit", type: "comment" }] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (i ", type: "plain" }, { text: ">=", type: "operator" }, { text: " wt.length ", type: "plain" }, { text: "||", type: "operator" }, { text: " W ", type: "plain" }, { text: "<=", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ";", type: "plain" }] },
  { num: 5, tokens: [] },
  { num: 6, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " skip ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "knapsack", type: "function" }, { text: "(W,wt,val,i+", type: "plain" }, { text: "1", type: "number" }, { text: ",memo);", type: "plain" }] },
  { num: 7, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " res ", type: "plain" }, { text: "=", type: "operator" }, { text: " skip;", type: "plain" }] },
  { num: 8, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (wt[i]", type: "plain" }, { text: "<=", type: "operator" }, { text: "W)", type: "plain" }] },
  { num: 9, tokens: [{ text: "    res ", type: "plain" }, { text: "=", type: "operator" }, { text: " Math.max(skip, val[i]+", type: "plain" }, { text: "knapsack", type: "function" }, { text: "(W-wt[i],wt,val,i+", type: "plain" }, { text: "1", type: "number" }, { text: ",memo));", type: "plain" }] },
  { num: 10, tokens: [{ text: "  memo[key] ", type: "plain" }, { text: "=", type: "operator" }, { text: " res;", type: "plain" }] },
  { num: 11, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " res;", type: "plain" }] },
  { num: 12, tokens: [{ text: "}", type: "punctuation" }] },
];

export const knapsackConfig: ProblemConfig = {
  title: "0/1 Knapsack",
  problemNumber: 5,
  totalProblems: 5,
  difficulty: "Medium",
  description: (
    <p>
      Items: <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">[(w:1,v:1), (w:2,v:6), (w:3,v:10), (w:5,v:15)]</code>. Maximize total value within a weight capacity. Each item used at most once.
    </p>
  ),
  buildTree: buildKnapsackTree,
  resetIds: resetNodeId,
  collectEvalOrder,
  countNodes,
  nRange: [3, 8],
  nDefault: 5,
  nLabel: "capacity",
  codeBruteForce: bruteCode,
  codeMemo: memoCode,
  getActiveLine: (phase, node, isCacheHit) => {
    if (!node) return null;
    const isBase = node.children.length === 0;
    if (phase === "brute") return isBase ? 2 : 8;
    if (isCacheHit) return 3;
    return isBase ? 4 : 9;
  },
  functionName: "knapsack",
  testCases: [
    { input: [5, [1,2,3,5], [1,6,10,15], 0], expected: 16, label: "knapsack(cap=5) = 16" },
    { input: [3, [1,2,3,5], [1,6,10,15], 0], expected: 11, label: "knapsack(cap=3) = 11" },
    { input: [0, [1,2,3], [10,20,30], 0], expected: 0, label: "knapsack(cap=0) = 0" },
    { input: [10, [5,4,6,3], [10,40,30,50], 0], expected: 90, label: "knapsack(cap=10) = 90" },
    { input: [50, [10,20,30,40,50,15,25,35,5,45], [60,100,120,140,160,90,110,130,50,150], 0], expected: 530, label: "knapsack(cap=50, 10 items) — needs DP!" },
  ],
  starterJS: `function knapsack(capacity, weights, values, i) {
  // Return max value that fits in capacity
  // starting from item index i
  // Each item can be taken or skipped (0/1)
  //
  // Two choices at each step: take or skip

}`,
  starterPython: `def knapsack(capacity, weights, values, i):
    # Return max value that fits in capacity
    # starting from item index i
    # Each item can be taken or skipped (0/1)
    #
    # Two choices at each step: take or skip
    pass`,
  concepts: {
    optimalSubstructure: (
      <>For each item you have two choices: <strong>take it</strong> (add its value, reduce capacity) or <strong>skip it</strong>. The optimal answer is the max of both. This <strong>include/exclude pattern</strong> is the most fundamental DP pattern — it shows up everywhere.</>
    ),
    overlappingSubproblems: (dup, total) => (
      <>Different combinations of take/skip can arrive at the same <strong>(item index, remaining capacity)</strong> state. <strong>{dup} duplicates</strong> out of {total} calls. The 2D state space (item × capacity) means lots of overlap.</>
    ),
    tryMemo: (<>Cache by <strong>(index, capacity)</strong>. Same technique — the state is just 2D now. Click <strong>"+ Memoization"</strong>.</>),
    memoWins: (total, _unique) => (<>From {total} calls to at most <strong>items × capacity</strong> states. <strong>O(n × W)</strong> — pseudo-polynomial time. You've now seen the full progression from 1D → 2D → multi-choice DP.</>),
  },
};
