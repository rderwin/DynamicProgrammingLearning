import { useState } from "react";

interface FlowNode {
  id: string;
  question?: string;
  options?: { label: string; next: string }[];
  result?: {
    pattern: string;
    description: string;
    examples: string[];
    template: string;
    complexity: string;
  };
}

const flowchart: Record<string, FlowNode> = {
  start: {
    id: "start",
    question: "What's the problem asking for?",
    options: [
      { label: "Find optimal (min/max)", next: "optimal" },
      { label: "Count ways to do X", next: "counting" },
      { label: "Find shortest path", next: "shortest" },
      { label: "Process sequentially (array/string)", next: "sequential" },
      { label: "Check if possible / exists", next: "exists" },
      { label: "Generate all combinations", next: "generate" },
      { label: "Sort or search", next: "sortsearch" },
    ],
  },

  // ─── OPTIMAL ───
  optimal: {
    id: "optimal",
    question: "Does the problem have choices at each step?",
    options: [
      { label: "Yes — take/skip or multiple options", next: "optimal-choices" },
      { label: "No — just find an answer in the data", next: "optimal-single" },
    ],
  },
  "optimal-choices": {
    id: "optimal-choices",
    question: "Can a greedy choice lead to a wrong answer?",
    options: [
      { label: "Yes — need to try all options", next: "dp-optimal" },
      { label: "No — greedy always works", next: "greedy" },
    ],
  },
  "optimal-single": {
    id: "optimal-single",
    question: "Can you use sorting + scan?",
    options: [
      { label: "Yes — sort and process", next: "sort-scan" },
      { label: "No — need a smart scan", next: "two-pointers" },
    ],
  },
  "dp-optimal": {
    id: "dp-optimal",
    result: {
      pattern: "Dynamic Programming (Optimization)",
      description: "Try all choices, memoize subproblems to avoid recomputation.",
      examples: ["Coin Change", "Knapsack", "Min Path Sum", "Min Cost Climbing Stairs"],
      template: "dp[state] = min/max(option1, option2, ...) over all choices",
      complexity: "O(states × choices)",
    },
  },
  greedy: {
    id: "greedy",
    result: {
      pattern: "Greedy",
      description: "Make the locally optimal choice at each step.",
      examples: ["Max Profit (Stocks)", "Jump Game", "Gas Station", "Interval Scheduling"],
      template: "Sort or scan, greedily pick best local option",
      complexity: "O(n log n) with sort, O(n) without",
    },
  },
  "sort-scan": {
    id: "sort-scan",
    result: {
      pattern: "Sort + Scan",
      description: "Sorting the input reveals structure that makes the solution easy.",
      examples: ["Meeting Rooms", "Merge Intervals", "K Closest Points"],
      template: "sort(arr); for each element, process with context",
      complexity: "O(n log n)",
    },
  },
  "two-pointers": {
    id: "two-pointers",
    result: {
      pattern: "Two Pointers",
      description: "Use two pointers that move based on conditions.",
      examples: ["Two Sum (sorted)", "Container With Most Water", "3Sum"],
      template: "let lo=0, hi=n-1; while(lo<hi) { ... move based on condition }",
      complexity: "O(n) or O(n²) with nested",
    },
  },

  // ─── COUNTING ───
  counting: {
    id: "counting",
    question: "Does the count depend on previous counts?",
    options: [
      { label: "Yes — count(n) uses count(n-1)", next: "dp-counting" },
      { label: "No — it's a direct formula or combinatorics", next: "math" },
    ],
  },
  "dp-counting": {
    id: "dp-counting",
    question: "Is the state 1D or 2D?",
    options: [
      { label: "1D (just n)", next: "dp-1d-counting" },
      { label: "2D (grid, two strings)", next: "dp-2d-counting" },
    ],
  },
  "dp-1d-counting": {
    id: "dp-1d-counting",
    result: {
      pattern: "1D DP (Counting)",
      description: "Build up count from smaller subproblems.",
      examples: ["Fibonacci", "Climbing Stairs", "Decode Ways", "Unique BSTs"],
      template: "dp[i] = dp[i-1] + dp[i-2]  (or similar recurrence)",
      complexity: "O(n) time, O(n) space (often O(1) with rolling variables)",
    },
  },
  "dp-2d-counting": {
    id: "dp-2d-counting",
    result: {
      pattern: "2D DP (Counting)",
      description: "Build up count from smaller 2D subproblems.",
      examples: ["Unique Paths", "Unique Paths II", "Count Paths in DAG"],
      template: "dp[i][j] = dp[i-1][j] + dp[i][j-1]",
      complexity: "O(m×n) time, O(m×n) space",
    },
  },
  math: {
    id: "math",
    result: {
      pattern: "Math / Combinatorics",
      description: "Direct formula, no DP needed.",
      examples: ["Pascal's Triangle", "N Choose K", "Fibonacci closed form"],
      template: "Use formula: C(n,k), factorials, or closed-form",
      complexity: "O(1) or O(n) depending on formula",
    },
  },

  // ─── SHORTEST PATH ───
  shortest: {
    id: "shortest",
    question: "Are edges weighted?",
    options: [
      { label: "No — all edges equal", next: "bfs" },
      { label: "Yes — non-negative weights", next: "dijkstra" },
      { label: "Yes — possibly negative", next: "bellman" },
    ],
  },
  bfs: {
    id: "bfs",
    result: {
      pattern: "BFS",
      description: "Queue-based level-order traversal.",
      examples: ["Shortest Path in Unweighted Graph", "Word Ladder", "Rotting Oranges"],
      template: "queue = [start]; while queue: node = queue.shift(); explore neighbors",
      complexity: "O(V + E)",
    },
  },
  dijkstra: {
    id: "dijkstra",
    result: {
      pattern: "Dijkstra's Algorithm",
      description: "Priority queue + greedy relaxation.",
      examples: ["Network Delay Time", "Path with Min Effort", "Cheapest Flights"],
      template: "pq = [(0, start)]; extract min; relax neighbors",
      complexity: "O((V+E) log V)",
    },
  },
  bellman: {
    id: "bellman",
    result: {
      pattern: "Bellman-Ford",
      description: "Relax all edges V-1 times. Handles negative weights.",
      examples: ["Currency arbitrage", "Negative cycle detection"],
      template: "for V-1 iterations: for each edge: relax",
      complexity: "O(V × E)",
    },
  },

  // ─── SEQUENTIAL ───
  sequential: {
    id: "sequential",
    question: "Are you looking at a contiguous subarray/substring?",
    options: [
      { label: "Yes — with some property", next: "sliding-window" },
      { label: "No — non-contiguous subsequence", next: "dp-subseq" },
      { label: "Looking at individual elements with context", next: "array-dp" },
    ],
  },
  "sliding-window": {
    id: "sliding-window",
    result: {
      pattern: "Sliding Window",
      description: "Expand/contract a window based on conditions.",
      examples: ["Longest Substring Without Repeating", "Min Window Substring", "Max Sum Subarray of Size K"],
      template: "let left=0; for right in 0..n: while invalid: left++; track result",
      complexity: "O(n)",
    },
  },
  "dp-subseq": {
    id: "dp-subseq",
    result: {
      pattern: "DP on Subsequences",
      description: "Decide include/exclude at each index.",
      examples: ["LIS", "LCS", "Edit Distance", "Longest Palindromic Subsequence"],
      template: "dp[i] (or dp[i][j]) = best considering first i (and j) chars",
      complexity: "O(n²) typical",
    },
  },
  "array-dp": {
    id: "array-dp",
    result: {
      pattern: "1D DP on Array",
      description: "State is position in array, often with extra info.",
      examples: ["House Robber", "Max Subarray (Kadane's)", "Jump Game"],
      template: "dp[i] = function of dp[i-1], dp[i-2], etc.",
      complexity: "O(n)",
    },
  },

  // ─── EXISTS ───
  exists: {
    id: "exists",
    question: "Are you checking graph connectivity?",
    options: [
      { label: "Yes — can A reach B?", next: "dfs-connect" },
      { label: "No — testing a property", next: "exists-dp" },
    ],
  },
  "dfs-connect": {
    id: "dfs-connect",
    result: {
      pattern: "DFS / Union-Find",
      description: "Traverse to check reachability.",
      examples: ["Number of Islands", "Graph Valid Tree", "Accounts Merge"],
      template: "DFS from source, check if target visited. Or Union-Find for components.",
      complexity: "O(V + E) DFS, O(α(n)) Union-Find amortized",
    },
  },
  "exists-dp": {
    id: "exists-dp",
    result: {
      pattern: "DP (Boolean)",
      description: "Can we achieve this state? dp[state] = true/false.",
      examples: ["Word Break", "Partition Equal Subset Sum", "Target Sum"],
      template: "dp[state] = true if any valid path leads here",
      complexity: "O(states)",
    },
  },

  // ─── GENERATE ───
  generate: {
    id: "generate",
    result: {
      pattern: "Backtracking",
      description: "Build solutions incrementally, undo when invalid.",
      examples: ["Permutations", "Subsets", "N-Queens", "Valid Parentheses"],
      template: "function backtrack(path): if done → add; for choice: make → recurse → undo",
      complexity: "O(2^n) or O(n!)",
    },
  },

  // ─── SORT/SEARCH ───
  sortsearch: {
    id: "sortsearch",
    question: "Is the input sorted (or can be sorted)?",
    options: [
      { label: "Yes — need to find a specific element", next: "binary-search" },
      { label: "Yes — need to find a boundary/condition", next: "binary-search-ans" },
      { label: "No — need to sort first", next: "sort-scan" },
    ],
  },
  "binary-search": {
    id: "binary-search",
    result: {
      pattern: "Binary Search",
      description: "Halve the search space each step.",
      examples: ["Search in Sorted Array", "Find First/Last Occurrence", "Search Rotated Sorted Array"],
      template: "let lo=0, hi=n-1; while(lo<=hi): mid=(lo+hi)/2; compare → adjust",
      complexity: "O(log n)",
    },
  },
  "binary-search-ans": {
    id: "binary-search-ans",
    result: {
      pattern: "Binary Search on Answer",
      description: "Binary search over the answer space using a monotonic predicate.",
      examples: ["Koko Eating Bananas", "Capacity to Ship Packages", "Split Array Largest Sum"],
      template: "binary search over answer range; predicate checks feasibility",
      complexity: "O(log(range) × n)",
    },
  },
};

interface Props {
  onBack: () => void;
}

export default function PatternFlowchart({ onBack }: Props) {
  const [nodeId, setNodeId] = useState("start");
  const [history, setHistory] = useState<string[]>([]);

  const node = flowchart[nodeId];

  function choose(next: string) {
    setHistory((h) => [...h, nodeId]);
    setNodeId(next);
  }

  function back() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setNodeId(prev);
  }

  function restart() {
    setHistory([]);
    setNodeId("start");
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
          <span className="text-2xl">🧭</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Pattern Finder</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Answer a few questions to find the right algorithm for your problem</p>
      </div>

      {/* Breadcrumbs */}
      {history.length > 0 && (
        <div className="flex items-center justify-between mb-4 text-xs text-slate-400 dark:text-slate-500">
          <span>Step {history.length + 1}</span>
          <button onClick={restart} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Start over</button>
        </div>
      )}

      {/* Question or result */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {node.question && node.options && (
          <div className="p-6 animate-fade-in" key={node.id}>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">{node.question}</h3>
            <div className="space-y-2">
              {node.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => choose(opt.next)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-sm text-slate-700 dark:text-slate-300 group"
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {node.result && (
          <div className="animate-fade-in" key={node.id}>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-b border-emerald-200 dark:border-emerald-800 px-6 py-4">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">Pattern Identified</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{node.result.pattern}</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">{node.result.description}</p>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Code template</p>
                <code className="block bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">{node.result.template}</code>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Complexity</p>
                <span className="inline-block bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full text-xs font-mono font-semibold">{node.result.complexity}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Classic examples</p>
                <div className="flex flex-wrap gap-1.5">
                  {node.result.examples.map((ex) => (
                    <span key={ex} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">{ex}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back / restart */}
      {history.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button onClick={back} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            ← Back one step
          </button>
        </div>
      )}
    </div>
  );
}
