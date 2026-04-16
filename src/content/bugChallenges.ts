import type { BugChallenge } from "../components/BugHunt";

export const dpBugChallenges: BugChallenge[] = [
  {
    id: "bug-dp-1",
    title: "Fibonacci memoization",
    description: "This memoized Fibonacci function returns wrong results",
    buggyCode: `function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = fib(n - 1) + fib(n - 2);
  return memo[n];
}`,
    bugLine: 4,
    bugDescription: "The recursive calls don't pass memo! Each call creates a new empty memo object, so memoization never works. Fix: fib(n-1, memo) + fib(n-2, memo).",
    fixedCode: `memo[n] = fib(n - 1, memo) + fib(n - 2, memo);`,
    hint: "Look at what arguments the recursive calls are passing.",
    difficulty: "Easy",
  },
  {
    id: "bug-dp-2",
    title: "Coin Change minimum",
    description: "This coin change function returns incorrect results for some inputs",
    buggyCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i >= coin) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount];
}`,
    bugLine: 11,
    bugDescription: "When it's impossible to make the amount, dp[amount] stays as Infinity but should return -1. Fix: return dp[amount] === Infinity ? -1 : dp[amount].",
    fixedCode: `return dp[amount] === Infinity ? -1 : dp[amount];`,
    hint: "What happens when no combination of coins can make the target amount?",
    difficulty: "Easy",
  },
  {
    id: "bug-dp-3",
    title: "0/1 Knapsack",
    description: "This knapsack solution allows using the same item multiple times",
    buggyCode: `function knapsack(W, wt, val) {
  const dp = new Array(W + 1).fill(0);
  for (const i in wt) {
    for (let w = wt[i]; w <= W; w++) {
      dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
    }
  }
  return dp[W];
}`,
    bugLine: 4,
    bugDescription: "The inner loop goes LEFT to RIGHT, which lets us reuse the same item! For 0/1 knapsack, iterate RIGHT to LEFT: for (let w = W; w >= wt[i]; w--). Left-to-right is correct for unbounded knapsack.",
    fixedCode: `for (let w = W; w >= wt[i]; w--)`,
    hint: "Think about whether each item is being used once or multiple times. Which direction should the inner loop go?",
    difficulty: "Medium",
  },
  {
    id: "bug-dp-4",
    title: "Longest Increasing Subsequence",
    description: "This LIS function returns the wrong length",
    buggyCode: `function lengthOfLIS(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}`,
    bugLine: 3,
    bugDescription: "dp array is initialized with 0 instead of 1. Every element by itself is a subsequence of length 1. Fix: fill(1) instead of fill(0).",
    fixedCode: `const dp = new Array(n).fill(1);`,
    hint: "What's the minimum LIS length for any single element?",
    difficulty: "Easy",
  },
  {
    id: "bug-dp-5",
    title: "Grid Paths with obstacles",
    description: "This function miscounts paths when obstacles are on the edges",
    buggyCode: `function uniquePaths(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = Array.from({length: m}, () => Array(n).fill(0));
  dp[0][0] = 1;
  for (let i = 1; i < m; i++) dp[i][0] = 1;
  for (let j = 1; j < n; j++) dp[0][j] = 1;
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = grid[i][j] === 1 ? 0 : dp[i-1][j] + dp[i][j-1];
  return dp[m-1][n-1];
}`,
    bugLine: 5,
    bugDescription: "First row and column are filled with 1 regardless of obstacles! Once an obstacle blocks the edge, everything after it should be 0. Fix: dp[i][0] = grid[i][0] === 1 ? 0 : dp[i-1][0].",
    fixedCode: `for (let i = 1; i < m; i++) dp[i][0] = grid[i][0] === 1 ? 0 : dp[i-1][0];
for (let j = 1; j < n; j++) dp[0][j] = grid[0][j] === 1 ? 0 : dp[0][j-1];`,
    hint: "What happens when an obstacle is in the first row or first column? Can anything past it be reached?",
    difficulty: "Medium",
  },
];

export const graphBugChallenges: BugChallenge[] = [
  {
    id: "bug-graph-1",
    title: "BFS traversal",
    description: "This BFS visits some nodes multiple times",
    buggyCode: `function bfs(graph, start) {
  const queue = [start];
  const result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    for (const nb of graph[node]) {
      queue.push(nb);
    }
  }
  return result;
}`,
    bugLine: 7,
    bugDescription: "No visited check! Neighbors are enqueued even if already visited, causing infinite loops on graphs with cycles and duplicate visits. Fix: add a visited Set and check before enqueuing.",
    fixedCode: `const visited = new Set([start]);
// ... in the loop:
if (!visited.has(nb)) {
  visited.add(nb);
  queue.push(nb);
}`,
    hint: "What prevents a node from being added to the queue again after it's already been processed?",
    difficulty: "Easy",
  },
  {
    id: "bug-graph-2",
    title: "Dijkstra's algorithm",
    description: "This Dijkstra returns wrong shortest distances",
    buggyCode: `function dijkstra(graph, start) {
  const dist = {};
  for (const n of Object.keys(graph)) dist[n] = Infinity;
  dist[start] = 0;
  const pq = [[0, start]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, node] = pq.shift();
    for (const [nb, w] of graph[node]) {
      const newD = d + w;
      if (newD < dist[nb]) {
        dist[nb] = newD;
        pq.push([newD, nb]);
      }
    }
  }
  return dist;
}`,
    bugLine: 9,
    bugDescription: "No check for stale entries! After extracting from the PQ, if d > dist[node], this is an outdated entry and should be skipped. Without this check, you process already-finalized nodes with worse distances.",
    fixedCode: `const [d, node] = pq.shift();
if (d > dist[node]) continue;  // skip stale entry`,
    hint: "What happens when a node's distance is updated after it's already been added to the priority queue?",
    difficulty: "Medium",
  },
  {
    id: "bug-graph-3",
    title: "Topological sort cycle detection",
    description: "This topo sort doesn't detect cycles — it just returns wrong results silently",
    buggyCode: `function topoSort(graph) {
  const visited = new Set();
  const sorted = [];
  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    for (const nb of graph[node]) dfs(nb);
    sorted.unshift(node);
  }
  for (const n of Object.keys(graph)) dfs(n);
  return sorted;
}`,
    bugLine: 4,
    bugDescription: "Only checks 'visited' but doesn't distinguish between 'currently being processed' (in the recursion stack) and 'fully done'. If a node is in the current DFS path, that's a cycle! Need a separate 'inStack' set.",
    fixedCode: `const inStack = new Set();
function dfs(node) {
  if (inStack.has(node)) throw new Error("Cycle!");
  if (visited.has(node)) return;
  visited.add(node);
  inStack.add(node);
  for (const nb of graph[node]) dfs(nb);
  inStack.delete(node);
  sorted.unshift(node);
}`,
    hint: "There are two kinds of 'already seen': fully processed, and currently being processed (still in the recursion). What does it mean if you encounter a node that's currently being processed?",
    difficulty: "Hard",
  },
];
