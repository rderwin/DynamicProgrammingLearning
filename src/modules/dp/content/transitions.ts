import type { TransitionContent } from "../../../components/TransitionLesson";

export const fibToStairs: TransitionContent = {
  fromLabel: "Fibonacci",
  toLabel: "Climbing Stairs",
  recap: {
    title: "What you just learned",
    points: [
      "A recursive solution can have exponential time complexity because it recomputes the same subproblems over and over",
      "Memoization (storing results in a table) eliminates redundant work — turning O(2ⁿ) into O(n)",
      "The two ingredients: optimal substructure (answer built from smaller answers) + overlapping subproblems (same sub-answer needed multiple times)",
    ],
  },
  concept: {
    term: "Recurrence Relation",
    definition:
      "A recurrence relation is the equation that defines how a problem breaks down into subproblems. It's the mathematical heart of every DP solution — once you have it, the code writes itself.",
    example:
      "For Fibonacci, the recurrence is fib(n) = fib(n-1) + fib(n-2). For the next problem, you'll discover the recurrence looks almost identical — but the problem is completely different on the surface.",
  },
  spotIt: {
    title: "How do you know a problem is DP?",
    signs: [
      "\"How many ways...\" or \"What is the minimum/maximum...\" — these are classic DP signals",
      "The problem can be broken into smaller versions of itself (like fib(n) → fib(n-1) + fib(n-2))",
      "You notice the same computation happening more than once when you think through the recursion",
    ],
  },
  preview: {
    title: "Climbing Stairs",
    description:
      "You're climbing a staircase and can take 1 or 2 steps at a time. How many distinct ways to reach the top? Sounds totally different from Fibonacci... but is it?",
    whatsNew:
      "The recurrence is the same shape: ways(n) = ways(n-1) + ways(n-2). The lesson here is that DP problems are often the same pattern wearing different costumes. Recognizing the disguise is the real skill.",
  },
};

export const stairsToGrid: TransitionContent = {
  fromLabel: "Climbing Stairs",
  toLabel: "Grid Paths",
  recap: {
    title: "What you just learned",
    points: [
      "Climbing Stairs IS Fibonacci with different base cases — same recurrence, different story",
      "Once you see the recurrence relation, the DP solution is mechanical: memoize or build bottom-up",
      "The hardest part isn't coding the solution — it's recognizing which recurrence fits the problem",
    ],
  },
  concept: {
    term: "State Space",
    definition:
      "The state space is the set of all unique subproblems you might need to solve. In 1D problems like Fibonacci, the state is a single number n. But many problems need more dimensions to describe where you are.",
    example:
      "In Climbing Stairs, the state is just \"which step am I on?\" — one number. In the next problem, the state is \"which row and column am I at?\" — two numbers. This makes the memo table 2D instead of 1D.",
  },
  spotIt: {
    title: "1D vs 2D DP — how to tell",
    signs: [
      "If the problem has one changing variable (like n), it's 1D DP — your memo table is an array",
      "If the problem has two changing variables (like row and column, or index and capacity), it's 2D DP — your memo table is a grid",
      "The number of state variables = the number of dimensions in your DP table",
    ],
  },
  preview: {
    title: "Grid Paths",
    description:
      "Count paths from the top-left to the bottom-right of a grid, moving only right or down. This is your first 2D DP problem.",
    whatsNew:
      "The recurrence is paths(r,c) = paths(r-1,c) + paths(r,c-1) — still adding two subproblems, but now indexed by two variables. Your memo key becomes a (row, col) pair instead of just n.",
  },
};

export const gridToCoins: TransitionContent = {
  fromLabel: "Grid Paths",
  toLabel: "Coin Change",
  recap: {
    title: "What you just learned",
    points: [
      "2D DP works exactly like 1D — same memoization technique, just with a 2D key",
      "The state space for Grid Paths is all (row, col) pairs — the memo table is literally a grid",
      "You've now seen the \"add two subproblems\" pattern three times: fib, stairs, and grid. Time for something different.",
    ],
  },
  concept: {
    term: "Minimization / Optimization DP",
    definition:
      "So far every problem asked \"how many ways?\" — you added up subproblems. But DP also solves \"what's the minimum?\" problems. Instead of adding, you take the min (or max) across choices.",
    example:
      "\"Minimum coins to make change\" → at each step, try every coin denomination and pick whichever gives the smallest total. The recurrence uses min() instead of +.",
  },
  spotIt: {
    title: "Counting vs optimization — two flavors of DP",
    signs: [
      "\"How many ways\" → add subproblems together (like Fibonacci, Stairs, Grid)",
      "\"What's the minimum/maximum\" → take min/max across choices (like Coin Change, Knapsack)",
      "Both flavors have the same structure: optimal substructure + overlapping subproblems. Only the combining step differs.",
    ],
  },
  preview: {
    title: "Coin Change",
    description:
      "Given coin denominations [1, 2, 5] and an amount, find the minimum number of coins needed. This introduces the multi-way branching pattern.",
    whatsNew:
      "Instead of exactly 2 children per node (like fib), each node branches once per coin — 3 coins means 3 children. And instead of adding results, you take the minimum. The tree is wider, but the DP fix is identical.",
  },
};

export const coinsToKnapsack: TransitionContent = {
  fromLabel: "Coin Change",
  toLabel: "0/1 Knapsack",
  recap: {
    title: "What you just learned",
    points: [
      "DP works for optimization (min/max), not just counting — the recurrence uses min() instead of +",
      "Multi-way branching (one branch per coin) creates wider trees but the memoization fix is the same",
      "The state for Coin Change is just the remaining amount — still 1D, even with multiple coin types",
    ],
  },
  concept: {
    term: "Include/Exclude Pattern",
    definition:
      "The most fundamental DP decision pattern: for each item, you either include it or exclude it. This binary choice creates a binary tree. Combined with a capacity constraint, it gives you 2D state: (item index, remaining capacity).",
    example:
      "Should I pack this item in my knapsack? If I include it, I get its value but lose capacity. If I exclude it, I keep the capacity for later items. Try both, take the max.",
  },
  spotIt: {
    title: "The DP pattern family tree",
    signs: [
      "1D counting: fib(n) = fib(n-1) + fib(n-2) — Fibonacci, Stairs",
      "2D counting: paths(r,c) = paths(r-1,c) + paths(r,c-1) — Grid Paths",
      "1D optimization with choices: min(1 + solve(amt-c) for each coin c) — Coin Change",
      "2D optimization with include/exclude: max(skip, take) where state is (item, capacity) — Knapsack. This is the capstone pattern.",
    ],
  },
  preview: {
    title: "0/1 Knapsack",
    description:
      "Given items with weights and values, maximize total value within a weight limit. Each item can be taken or skipped — hence \"0/1\".",
    whatsNew:
      "Two state variables (item index + remaining capacity) = 2D DP. Binary branching (take or skip) = include/exclude pattern. This combines everything: 2D state, optimization, and binary choice. It's the final boss.",
  },
};

/** Completion screen content — shown after knapsack */
export const completionContent = {
  title: "You did it.",
  subtitle: "Here's what you now know",
  patterns: [
    { name: "1D Counting", problems: "Fibonacci, Climbing Stairs", recurrence: "f(n) = f(n-1) + f(n-2)" },
    { name: "2D Counting", problems: "Grid Paths", recurrence: "f(r,c) = f(r-1,c) + f(r,c-1)" },
    { name: "1D Optimization", problems: "Coin Change", recurrence: "f(amt) = min(1 + f(amt-c))" },
    { name: "2D Include/Exclude", problems: "Knapsack", recurrence: "f(i,w) = max(skip, take)" },
  ],
  recognition: [
    "\"How many ways\" → counting DP, add subproblems",
    "\"Minimum/maximum\" → optimization DP, min/max over choices",
    "One changing variable → 1D table",
    "Two changing variables → 2D table",
    "\"Use each item at most once\" → include/exclude pattern",
  ],
};
