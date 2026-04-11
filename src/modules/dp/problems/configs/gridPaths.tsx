import type { ProblemConfig, CodeLine } from "../../../../components/TreeLesson";
import {
  buildGridTree,
  resetNodeId,
  collectEvalOrder,
  countNodes,
} from "../../trees/gridPaths";

const bruteCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "gridPaths", type: "function" }, { text: "(", type: "punctuation" }, { text: "m", type: "param" }, { text: ", ", type: "punctuation" }, { text: "n", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (m ", type: "plain" }, { text: "===", type: "operator" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: " ", type: "plain" }, { text: "||", type: "operator" }, { text: " n ", type: "plain" }, { text: "===", type: "operator" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ";", type: "plain" }, { text: " // edge", type: "comment" }] },
  { num: 3, tokens: [] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "gridPaths", type: "function" }, { text: "(m-", type: "plain" }, { text: "1", type: "number" }, { text: ", n)", type: "plain" }] },
  { num: 5, tokens: [{ text: "       ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "gridPaths", type: "function" }, { text: "(m, n-", type: "plain" }, { text: "1", type: "number" }, { text: ");", type: "plain" }] },
  { num: 6, tokens: [{ text: "}", type: "punctuation" }] },
];

const memoCode: CodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "gridPaths", type: "function" }, { text: "(", type: "punctuation" }, { text: "m", type: "param" }, { text: ",", type: "punctuation" }, { text: "n", type: "param" }, { text: ",", type: "punctuation" }, { text: "memo", type: "param" }, { text: "={}) {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "let", type: "keyword" }, { text: " key ", type: "plain" }, { text: "=", type: "operator" }, { text: " m ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "','", type: "string" }, { text: " ", type: "plain" }, { text: "+", type: "operator" }, { text: " n;", type: "plain" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (key ", type: "plain" }, { text: "in", type: "keyword" }, { text: " memo) ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[key];", type: "plain" }, { text: " // hit", type: "comment" }] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (m", type: "plain" }, { text: "===", type: "operator" }, { text: "1", type: "number" }, { text: " ", type: "plain" }, { text: "||", type: "operator" }, { text: " n", type: "plain" }, { text: "===", type: "operator" }, { text: "1", type: "number" }, { text: ") ", type: "plain" }, { text: "return", type: "keyword" }, { text: " ", type: "plain" }, { text: "1", type: "number" }, { text: ";", type: "plain" }] },
  { num: 5, tokens: [] },
  { num: 6, tokens: [{ text: "  memo[key] ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "gridPaths", type: "function" }, { text: "(m-", type: "plain" }, { text: "1", type: "number" }, { text: ",n,memo)", type: "plain" }] },
  { num: 7, tokens: [{ text: "              ", type: "plain" }, { text: "+", type: "operator" }, { text: " ", type: "plain" }, { text: "gridPaths", type: "function" }, { text: "(m,n-", type: "plain" }, { text: "1", type: "number" }, { text: ",memo);", type: "plain" }] },
  { num: 8, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " memo[key];", type: "plain" }] },
  { num: 9, tokens: [{ text: "}", type: "punctuation" }] },
];

// The tree uses (row,col) encoded as row*100+col
// Grid size n maps to an n×n grid; tree uses 0-indexed rows/cols
// Base case: row===n-1 && col===n-1 (bottom-right corner)
// In the tree, base nodes are edges (one dimension is at max)

export const gridPathsConfig: ProblemConfig = {
  title: "Grid Paths",
  problemNumber: 3,
  totalProblems: 5,
  difficulty: "Easy-Medium",
  description: (
    <p>
      Count the number of paths from the <strong>top-left</strong> to the <strong>bottom-right</strong> of an n×n grid, moving only <strong>right</strong> or <strong>down</strong>.
    </p>
  ),
  buildTree: buildGridTree,
  resetIds: resetNodeId,
  collectEvalOrder,
  countNodes,
  nRange: [2, 5],
  nDefault: 3,
  nLabel: "grid size",
  codeBruteForce: bruteCode,
  codeMemo: memoCode,
  getActiveLine: (phase, node, isCacheHit) => {
    if (!node) return null;
    const isBase = node.children.length === 0;
    if (phase === "brute") return isBase ? 2 : 4;
    if (isCacheHit) return 3;
    return isBase ? 4 : 6;
  },
  functionName: "gridPaths",
  testCases: [
    { input: [1, 1], expected: 1, label: "gridPaths(1,1) = 1" },
    { input: [2, 2], expected: 2, label: "gridPaths(2,2) = 2" },
    { input: [3, 3], expected: 6, label: "gridPaths(3,3) = 6" },
    { input: [3, 7], expected: 28, label: "gridPaths(3,7) = 28" },
    { input: [10, 10], expected: 48620, label: "gridPaths(10,10) = 48620" },
    { input: [18, 18], expected: 2333606220, label: "gridPaths(18,18) — needs DP!" },
  ],
  starterJS: `function gridPaths(m, n) {
  // Count paths from top-left to bottom-right
  // of an m x n grid (only move right or down)
  //
  // This is the first 2D DP problem!

}`,
  hints: [
    "To reach cell (m,n), you must have come from either (m-1,n) or (m,n-1). So paths(m,n) = paths(m-1,n) + paths(m,n-1).",
    "Base cases: if m === 1 or n === 1, there's only 1 path (straight line).",
    "This is 2D — your memo key needs both dimensions. Try a string key like m+','+n.",
  ],
  solutionJS: `function gridPaths(m, n, memo = {}) {
  let key = m + ',' + n;
  if (key in memo) return memo[key];
  if (m === 1 || n === 1) return 1;
  memo[key] = gridPaths(m - 1, n, memo) + gridPaths(m, n - 1, memo);
  return memo[key];
}`,
  traceInput: [3, 3],
  traceInputLabel: "gridPaths(3,3)",
  starterPython: `def gridPaths(m, n):
    # Count paths from top-left to bottom-right
    # of an m x n grid (only move right or down)
    #
    # This is the first 2D DP problem!
    pass`,
  insights: {
    bruteTitle: "Same pattern, new dimension",
    bruteBody: ({ totalNodes, duplicateCount, wastedPct }) => (
      <p>
        {totalNodes} calls, {duplicateCount} duplicates ({wastedPct}% wasted). By now you should be able to spot overlapping subproblems at a glance —
        different paths through the grid land on the same cell and recompute from scratch.
        <br /><br />
        The new wrinkle: this is <strong>2D</strong>. The state is <strong>(row, col)</strong> instead of just <strong>n</strong>. But the fix is the same.
      </p>
    ),
    memoTransition: "Memoize — now in 2D →",
    memoTransitionBody: (
      <p>
        Same technique, but the memo key is now a <strong>pair: (row, col)</strong>.
        In code, that means <code className="bg-green-100 px-1 rounded text-xs">memo[row + "," + col]</code>.
        Watch the 2D table fill up.
      </p>
    ),
    memoTitle: "2D works the same way",
    memoBody: ({ totalNodes, uniqueCount }) => (
      <p>
        From {totalNodes} to {uniqueCount} — the grid has at most <strong>n²</strong> unique cells.
        You now know that DP isn't limited to 1D problems. The dimension of your state space just determines the shape of your memo table.
      </p>
    ),
  },
  concepts: {
    optimalSubstructure: (
      <>To reach cell <strong>(r, c)</strong>, you came from <strong>(r-1, c)</strong> (down) or <strong>(r, c-1)</strong> (right). So <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">paths(r,c) = paths(r-1,c) + paths(r,c-1)</code>. Same "add two subproblems" structure — but now in <strong>2 dimensions</strong>.</>
    ),
    overlappingSubproblems: (dup, total) => (
      <>Multiple routes lead to the same cell, so the same <strong>(row, col)</strong> subproblem gets recomputed. <strong>{dup} duplicates</strong> out of {total} calls. 2D problems have even more overlap than 1D ones.</>
    ),
    tryMemo: (<>Same fix: cache by <strong>(row, col)</strong> key. Click <strong>"+ Memoization"</strong> — notice how the 2D key is the only real difference from Fibonacci.</>),
    memoWins: (total, _unique) => (<>From {total} calls to at most <strong>n²</strong> unique cells. The 2D memo table (or grid) is what you'd build in a bottom-up solution. Same pattern, new dimension.</>),
  },
};
