import type { QuizQuestion } from "../components/PatternQuiz";

// ─── DP Pattern Recognition ───

export const dpPatternQuiz: QuizQuestion[] = [
  {
    id: "dp-q1",
    problem: "You're climbing a staircase. Each step costs energy. You can take 1, 2, or 3 steps at a time. What's the minimum energy to reach the top?",
    options: [
      { label: "Greedy", description: "Always take the cheapest next step" },
      { label: "1D DP (Optimization)", description: "dp[i] = min cost to reach step i" },
      { label: "BFS", description: "Shortest path through a graph of steps" },
      { label: "Binary Search", description: "Search for the optimal energy value" },
    ],
    correctIndex: 1,
    explanation: "This is 1D DP: dp[i] = cost[i] + min(dp[i-1], dp[i-2], dp[i-3]). Greedy fails because a cheap next step might lead to expensive ones later. BFS works but is overkill for a linear problem.",
    difficulty: "Easy",
  },
  {
    id: "dp-q2",
    problem: "Given a string and a dictionary of words, can the string be segmented into dictionary words? Example: 'leetcode' → 'leet' + 'code'.",
    options: [
      { label: "Two Pointers", description: "Scan from both ends" },
      { label: "1D DP (Counting)", description: "dp[i] = can we segment the first i characters?" },
      { label: "Sorting + Binary Search", description: "Sort the dictionary and search" },
      { label: "Backtracking", description: "Try all possible word placements" },
    ],
    correctIndex: 1,
    explanation: "dp[i] = true if there exists some j < i where dp[j] is true AND s[j..i] is in the dictionary. It's 1D DP because we build up from substrings. Backtracking works but is exponential without memoization (which makes it DP).",
    difficulty: "Medium",
  },
  {
    id: "dp-q3",
    problem: "You have a knapsack with weight capacity W and n items, each with weight and value. Maximize the total value without exceeding W. Each item can only be used once.",
    options: [
      { label: "Greedy (best value/weight ratio)", description: "Pick items with highest value-to-weight" },
      { label: "Include/Exclude DP", description: "For each item: take it or leave it" },
      { label: "Sorting", description: "Sort by value and take from top" },
      { label: "BFS", description: "Search all possible item combinations" },
    ],
    correctIndex: 1,
    explanation: "0/1 Knapsack is the classic include/exclude DP. Greedy by ratio fails because you can't take fractions. State: (item index, remaining capacity). Decision: take or skip each item.",
    difficulty: "Easy",
  },
  {
    id: "dp-q4",
    problem: "Given two strings, find the length of their longest common subsequence. A subsequence doesn't need to be contiguous.",
    options: [
      { label: "2D DP", description: "dp[i][j] = LCS of first i chars and first j chars" },
      { label: "Sliding Window", description: "Window over one string matching against the other" },
      { label: "Sorting", description: "Sort characters and compare" },
      { label: "Hashing", description: "Hash substrings and compare" },
    ],
    correctIndex: 0,
    explanation: "LCS is classic 2D DP. If characters match: dp[i][j] = dp[i-1][j-1] + 1. If not: dp[i][j] = max(dp[i-1][j], dp[i][j-1]). The 2D table represents all pairs of prefixes.",
    difficulty: "Medium",
  },
  {
    id: "dp-q5",
    problem: "A robot starts at the top-left of a grid and can only move right or down. Some cells are blocked. How many unique paths exist to the bottom-right?",
    options: [
      { label: "BFS", description: "Breadth-first search from start to end" },
      { label: "DFS + Backtracking", description: "Explore all paths recursively" },
      { label: "2D DP (Counting)", description: "dp[i][j] = number of paths to cell (i,j)" },
      { label: "Greedy", description: "Always move toward the destination" },
    ],
    correctIndex: 2,
    explanation: "2D counting DP: dp[i][j] = dp[i-1][j] + dp[i][j-1], with blocked cells = 0. BFS/DFS work but are slower. This is a counting problem, not shortest path, so DP is natural.",
    difficulty: "Easy",
  },
];

// ─── Graph Pattern Recognition ───

export const graphPatternQuiz: QuizQuestion[] = [
  {
    id: "graph-q1",
    problem: "Given a grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.",
    options: [
      { label: "BFS/DFS flood fill", description: "Start from each '1', mark all connected '1's as visited" },
      { label: "Union-Find", description: "Merge connected components" },
      { label: "Dynamic Programming", description: "dp[i][j] = number of islands including cell (i,j)" },
      { label: "Sorting", description: "Sort cells by position" },
    ],
    correctIndex: 0,
    explanation: "Classic BFS/DFS problem. For each unvisited '1', start a BFS/DFS to mark all connected land as visited. Each new BFS/DFS = one island. Union-Find also works but is more complex to implement.",
    difficulty: "Easy",
  },
  {
    id: "graph-q2",
    problem: "You're given a list of courses and their prerequisites. Determine if it's possible to finish all courses (no circular dependencies).",
    options: [
      { label: "Topological Sort", description: "Check if a valid ordering exists (no cycles)" },
      { label: "BFS shortest path", description: "Find shortest path through courses" },
      { label: "Binary Search", description: "Search for a valid course order" },
      { label: "Greedy", description: "Take courses with fewest prerequisites first" },
    ],
    correctIndex: 0,
    explanation: "This is cycle detection in a directed graph — exactly what topological sort does. If you can produce a valid topological order, there are no cycles and all courses can be completed.",
    difficulty: "Easy",
  },
  {
    id: "graph-q3",
    problem: "Find the cheapest flight from city A to city B with at most K stops. Flights have different prices.",
    options: [
      { label: "Regular Dijkstra", description: "Shortest weighted path" },
      { label: "BFS with K-level limit", description: "BFS but stop after K+1 levels" },
      { label: "Modified BFS/Dijkstra with state (city, stops)", description: "Track both position AND remaining stops" },
      { label: "DFS", description: "Explore all possible routes" },
    ],
    correctIndex: 2,
    explanation: "Standard Dijkstra doesn't track stops. The trick: your state is (city, stops_remaining). Process states by cost using a priority queue. This is a common interview twist on shortest path.",
    difficulty: "Hard",
  },
  {
    id: "graph-q4",
    problem: "Given a network of servers with connection times, how long until all servers receive a signal from a source server?",
    options: [
      { label: "BFS", description: "Level-order traversal from source" },
      { label: "Dijkstra's Algorithm", description: "Shortest weighted path from source to all nodes" },
      { label: "DFS", description: "Deep traversal from source" },
      { label: "Topological Sort", description: "Order servers by dependency" },
    ],
    correctIndex: 1,
    explanation: "The answer is the maximum shortest path from source to any server — classic Dijkstra. BFS only works for unweighted graphs. The answer is max(dist[v]) for all reachable v.",
    difficulty: "Medium",
  },
  {
    id: "graph-q5",
    problem: "Clone a graph. Given a reference to a node, return a deep copy of the entire connected graph.",
    options: [
      { label: "BFS + HashMap", description: "BFS traversal, map old nodes to new clones" },
      { label: "Sorting", description: "Sort nodes and copy in order" },
      { label: "Dynamic Programming", description: "Build clone bottom-up" },
      { label: "Binary Search", description: "Search for each node to clone" },
    ],
    correctIndex: 0,
    explanation: "BFS (or DFS) + a HashMap from old→new nodes. For each node you visit, create a clone and map it. For each neighbor, either get the existing clone or create one. The map prevents infinite loops on cycles.",
    difficulty: "Medium",
  },
];

// ─── Mixed pattern quiz (tests cross-topic recognition) ───

export const mixedPatternQuiz: QuizQuestion[] = [
  {
    id: "mixed-q1",
    problem: "Given a sorted array, find if a target value exists. Return its index or -1.",
    options: [
      { label: "Binary Search", description: "Halve the search space each step" },
      { label: "Linear Scan", description: "Check every element" },
      { label: "Hash Set", description: "Put elements in a set and check" },
      { label: "Two Pointers", description: "Pointers from both ends" },
    ],
    correctIndex: 0,
    explanation: "Sorted array + search = binary search. O(log n) vs O(n) linear scan. The sorted property is the key signal.",
    difficulty: "Easy",
  },
  {
    id: "mixed-q2",
    problem: "Find the longest substring without repeating characters in a string.",
    options: [
      { label: "Dynamic Programming", description: "dp[i] = longest ending at index i" },
      { label: "Sliding Window", description: "Expand window until duplicate, then shrink from left" },
      { label: "Sorting", description: "Sort characters and scan" },
      { label: "BFS", description: "Graph of character transitions" },
    ],
    correctIndex: 1,
    explanation: "Classic sliding window: maintain a window of unique characters. When a duplicate enters, shrink from the left until unique again. Track max window size. O(n) time.",
    difficulty: "Easy",
  },
  {
    id: "mixed-q3",
    problem: "Given an array of meeting intervals [start, end], find the minimum number of conference rooms required.",
    options: [
      { label: "Greedy + Heap", description: "Sort by start, use min-heap for end times" },
      { label: "Dynamic Programming", description: "dp[i] = min rooms for first i meetings" },
      { label: "BFS", description: "Graph of overlapping meetings" },
      { label: "Binary Search", description: "Search for the optimal number of rooms" },
    ],
    correctIndex: 0,
    explanation: "Sort meetings by start time. Use a min-heap tracking when rooms free up. If the earliest room frees up before the next meeting starts, reuse it. Otherwise add a room. Classic heap + greedy.",
    difficulty: "Medium",
  },
  {
    id: "mixed-q4",
    problem: "Given an array of integers and a target sum, find all unique pairs that sum to the target.",
    options: [
      { label: "Two Pointers", description: "Sort array, pointers from both ends" },
      { label: "Dynamic Programming", description: "Build up from subsets" },
      { label: "BFS", description: "Graph of number transitions" },
      { label: "Backtracking", description: "Try all combinations" },
    ],
    correctIndex: 0,
    explanation: "Sort the array, then use two pointers from both ends. If sum < target, move left pointer right. If sum > target, move right pointer left. Skip duplicates. O(n log n) sort + O(n) scan.",
    difficulty: "Easy",
  },
  {
    id: "mixed-q5",
    problem: "Generate all valid combinations of n pairs of parentheses. Example: n=2 → ['(())', '()()'].",
    options: [
      { label: "Dynamic Programming", description: "Build combinations from smaller n" },
      { label: "Backtracking", description: "Build string character by character, prune invalid states" },
      { label: "BFS", description: "Level-order generation" },
      { label: "Greedy", description: "Always place parentheses optimally" },
    ],
    correctIndex: 1,
    explanation: "Classic backtracking: at each step, you can add '(' if open < n, or ')' if close < open. This naturally prunes invalid combinations. The decision tree explores all valid placements.",
    difficulty: "Medium",
  },
];
