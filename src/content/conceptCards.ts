import type { ConceptCard } from "../components/ConceptCards";

export const allConceptCards: ConceptCard[] = [
  // DP Concepts
  { id: "dp-1", front: "What are overlapping subproblems?", back: "When a recursive algorithm solves the same subproblem multiple times. This is the signal that DP can help — store results so you compute each subproblem only once.", category: "DP" },
  { id: "dp-2", front: "What is optimal substructure?", back: "The optimal solution to a problem can be built from optimal solutions to its subproblems. If this holds, you can use DP. If not (e.g., longest simple path), you can't.", category: "DP" },
  { id: "dp-3", front: "Top-down vs bottom-up DP?", back: "Top-down: recursion + memoization (start from the big problem, cache as you go). Bottom-up: fill a table iteratively (start from base cases, build up). Same result, different style.", category: "DP" },
  { id: "dp-4", front: "What's the time complexity of memoized Fibonacci?", back: "O(n). Without memoization it's O(2^n). Each of the n subproblems is computed exactly once, and each takes O(1) work.", category: "DP" },
  { id: "dp-5", front: "How do you identify the state in a DP problem?", back: "Ask: what information do I need to make the next decision? For Fibonacci: just n. For Knapsack: (item index, remaining capacity). The state variables become your memo key.", category: "DP" },
  { id: "dp-6", front: "What's the include/exclude pattern?", back: "For each item/option: either take it (include) or skip it (exclude). Try both, pick the best. Examples: 0/1 Knapsack, Partition Subset Sum, Target Sum.", category: "DP" },
  { id: "dp-7", front: "When do you need 2D DP?", back: "When your state has 2 variables — like (row, col) for grid problems, or (i, j) for comparing two strings. Your memo table becomes a 2D array.", category: "DP" },

  // Graph Concepts
  { id: "graph-1", front: "BFS vs DFS: when to use which?", back: "BFS: shortest path in unweighted graphs, level-order traversal. DFS: explore all paths, detect cycles, topological sort. Both are O(V+E).", category: "Graphs" },
  { id: "graph-2", front: "What data structure does BFS use?", back: "A queue (FIFO). Process nodes in the order they were discovered. This ensures level-by-level traversal.", category: "Graphs" },
  { id: "graph-3", front: "What data structure does DFS use?", back: "A stack (LIFO) — or the call stack via recursion. Process the most recently discovered node first, diving deep before backtracking.", category: "Graphs" },
  { id: "graph-4", front: "What is topological sort?", back: "A linear ordering of nodes in a DAG where every node appears after all its dependencies. Use DFS + post-order: add node to result AFTER all its children are processed.", category: "Graphs" },
  { id: "graph-5", front: "When does Dijkstra fail?", back: "Negative edge weights. Dijkstra assumes finalizing a node's distance is permanent — a negative edge later could make a shorter path. Use Bellman-Ford instead.", category: "Graphs" },
  { id: "graph-6", front: "Time complexity of BFS/DFS?", back: "O(V + E) where V = vertices, E = edges. Every node is visited once, every edge is examined once.", category: "Graphs" },
  { id: "graph-7", front: "How do you detect a cycle in a directed graph?", back: "DFS with a 'currently visiting' set (in addition to 'visited'). If you encounter a node that's currently being visited (in the recursion stack), that's a cycle.", category: "Graphs" },

  // General Algorithm Concepts
  { id: "gen-1", front: "What's the difference between O(n log n) and O(n²)?", back: "At n=1000: O(n log n) ≈ 10,000 operations. O(n²) = 1,000,000. At n=1M: O(n log n) ≈ 20M, O(n²) = 1 trillion. The difference is the difference between milliseconds and hours.", category: "Complexity" },
  { id: "gen-2", front: "What does 'greedy' mean in algorithms?", back: "Make the locally optimal choice at each step, hoping it leads to a global optimum. Works for some problems (interval scheduling, Dijkstra) but not others (Knapsack, shortest path with negative weights).", category: "General" },
  { id: "gen-3", front: "What is amortized O(1)?", back: "An operation that's usually O(1) but occasionally O(n). Example: dynamic array push — usually O(1), but when the array needs to resize, it's O(n). Averaged over n operations, it's still O(1) each.", category: "Complexity" },
  { id: "gen-4", front: "What's the sliding window pattern?", back: "Maintain a 'window' (subarray) that expands and contracts as you scan. Used for: longest/shortest subarray with a property, fixed-size window max/min, substring problems.", category: "General" },
  { id: "gen-5", front: "Binary search: what's the key requirement?", back: "The search space must be monotonic — there's a clear boundary where the answer switches from false to true (or vice versa). Sorted array is the classic case, but it works on any monotonic predicate.", category: "General" },
];
