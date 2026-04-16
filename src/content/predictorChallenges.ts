import type { PredictorChallenge } from "../components/StepPredictor";

export const predictorChallenges: PredictorChallenge[] = [
  {
    id: "pred-1",
    title: "BFS on a graph",
    algorithmName: "BFS",
    context: `Graph: A→[B,C], B→[A,D], C→[A,D], D→[B,C]
Start: A

Queue: [B, C]     (A already dequeued and visited)
Visited: {A}
Just dequeued: B`,
    question: "After visiting B, what does the queue look like?",
    options: ["[C]", "[C, D]", "[C, A, D]", "[D, C]"],
    correctIndex: 1,
    explanation: "B's neighbors are A and D. A is already visited, so only D is enqueued. Queue becomes [C, D] — C was already there from before.",
    difficulty: "Easy",
  },
  {
    id: "pred-2",
    title: "DFS backtracking",
    algorithmName: "DFS",
    context: `Graph: A→[B,C], B→[D,E], C→[F], D→[], E→[], F→[]
Stack-based DFS from A.

Visit order so far: A, C, F
Stack: [B]
Just popped and visited: F (no unvisited neighbors)`,
    question: "What node is visited next?",
    options: ["B", "D", "E", "C"],
    correctIndex: 0,
    explanation: "F has no unvisited neighbors, so we pop the next from the stack: B. DFS backtracks by popping the stack.",
    difficulty: "Easy",
  },
  {
    id: "pred-3",
    title: "Dijkstra distance update",
    algorithmName: "Dijkstra",
    context: `Nodes: S, A, B, C
Edges: S→A(4), S→B(2), A→C(3), B→A(1), B→C(6)

Distances: S=0, A=4, B=2, C=∞
Finalized: {S, B}
Just finalized B (dist=2).

B's neighbors: A(weight 1), C(weight 6)`,
    question: "What happens to A's distance?",
    options: [
      "Stays 4 (already finalized)",
      "Updates to 3 (via B: 2+1)",
      "Updates to 2 (same as B)",
      "Stays 4 (4 < 2+1 is false but A not finalized)",
    ],
    correctIndex: 1,
    explanation: "A is NOT finalized yet. Path through B: dist[B] + weight(B→A) = 2 + 1 = 3 < 4 (current). So dist[A] updates to 3. This is 'relaxation'.",
    difficulty: "Medium",
  },
  {
    id: "pred-4",
    title: "Topological sort ordering",
    algorithmName: "Topological Sort",
    context: `DAG edges: A→C, B→C, B→D, C→E, D→E
DFS post-order topo sort.

DFS from A: visits A → C → E
Post-order so far: [E, C, A]  (built right-to-left)

Now starting DFS from B (not yet visited)...
B's neighbors: C (visited), D (not visited)`,
    question: "After DFS from B completes, what's the full sorted order?",
    options: [
      "[B, D, A, C, E]",
      "[A, B, C, D, E]",
      "[B, D, E, C, A]",
      "[B, A, D, C, E]",
    ],
    correctIndex: 0,
    explanation: "DFS from B: visit B → D (C already visited). Post-order: D added, then B. Full post-order: [E, C, A, D, B]. Reversed = [B, D, A, C, E]. B and D come before their dependents.",
    difficulty: "Medium",
  },
  {
    id: "pred-5",
    title: "DP table filling",
    algorithmName: "Fibonacci DP",
    context: `Bottom-up Fibonacci:
dp[0] = 0
dp[1] = 1
dp[2] = dp[1] + dp[0] = 1
dp[3] = dp[2] + dp[1] = 2
dp[4] = ?`,
    question: "What is dp[4]?",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
    explanation: "dp[4] = dp[3] + dp[2] = 2 + 1 = 3. The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8...",
    difficulty: "Easy",
  },
  {
    id: "pred-6",
    title: "Coin Change DP",
    algorithmName: "Coin Change",
    context: `Coins: [1, 3, 4], Amount: 6
dp[0] = 0
dp[1] = 1  (one 1-coin)
dp[2] = 2  (two 1-coins)
dp[3] = 1  (one 3-coin)
dp[4] = 1  (one 4-coin)
dp[5] = 2  (3+1+1? No: 4+1 = 2 coins)
dp[6] = ?`,
    question: "What is dp[6] (min coins for amount 6)?",
    options: ["2", "3", "6", "1"],
    correctIndex: 0,
    explanation: "dp[6] = min(dp[6-1]+1, dp[6-3]+1, dp[6-4]+1) = min(dp[5]+1, dp[3]+1, dp[2]+1) = min(3, 2, 3) = 2. The optimal is 3+3 = 2 coins.",
    difficulty: "Medium",
  },
  {
    id: "pred-7",
    title: "Knapsack decision",
    algorithmName: "0/1 Knapsack",
    context: `Items: [(w:2,v:3), (w:3,v:4), (w:4,v:5)]
Capacity: 5

Considering item 0 (w:2, v:3):
  Skip: best value with remaining items at capacity 5
  Take: 3 + best value with remaining items at capacity 3

If we know: best(items[1:], cap=5) = 5, best(items[1:], cap=3) = 4`,
    question: "Should we take or skip item 0?",
    options: [
      "Take (3 + 4 = 7 > 5)",
      "Skip (5 > 3 + 4 = 7 is wrong, so take)",
      "Take (7 > 5)",
      "Skip (we should always try the heaviest first)",
    ],
    correctIndex: 2,
    explanation: "Take: value = 3 + best(cap=3) = 3 + 4 = 7. Skip: value = best(cap=5) = 5. Since 7 > 5, we take item 0. The include/exclude pattern: always try both and pick the better one.",
    difficulty: "Medium",
  },
  {
    id: "pred-8",
    title: "Binary search convergence",
    algorithmName: "Binary Search",
    context: `Array: [1, 3, 5, 7, 9, 11, 13]
Target: 7

Step 1: lo=0, hi=6, mid=3 → arr[3]=7`,
    question: "What happens next?",
    options: [
      "lo = 4 (search right half)",
      "Return 3 (found the target!)",
      "hi = 2 (search left half)",
      "lo = 3, hi = 3 (narrow to one element)",
    ],
    correctIndex: 1,
    explanation: "arr[mid] === target! Binary search returns immediately when the target is found at the mid index. No need to continue narrowing.",
    difficulty: "Easy",
  },
];
