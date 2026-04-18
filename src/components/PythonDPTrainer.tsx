import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface DPLesson {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  pattern: string;
  recurrence: string;
  pythonTricks: { title: string; code: string; explanation: string }[];
  visualExample: string;
  task: string;
  starter: string;
  functionName: string;
  testCases: TestCase[];
  hints: string[];
  solutionTopDown: string;
  solutionBottomUp: string;
  topDownExplanation: string;
  bottomUpExplanation: string;
  commonMistakes: string[];
  interviewWisdom: string;
}

const lessons: DPLesson[] = [
  // ─── 1. The Memoization Pattern ───
  {
    id: "py-dp-1",
    title: "The Memoization Pattern",
    subtitle: "The fundamental DP move, the Python way",
    concept: "Memoization is storing results of expensive function calls. In Python, @lru_cache turns any recursive function into a DP solution with ONE LINE of code.",
    pattern: "1D DP",
    recurrence: "f(n) = f(n-1) + f(n-2)",
    pythonTricks: [
      {
        title: "@lru_cache decorator",
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)`,
        explanation: "maxsize=None means unbounded cache. Python automatically hashes the arguments as the key.",
      },
      {
        title: "Manual dict memo",
        code: `def fib(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]`,
        explanation: "Default mutable arg is shared across calls! Beware in interviews — interviewers may ask about this gotcha.",
      },
    ],
    visualExample: "fib(5) without memo = 15 calls. With memo = 6 calls. Exponential → Linear.",
    task: "Write a MEMOIZED Fibonacci. Must handle n=50 in milliseconds.",
    functionName: "fib",
    starter: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    # Base case?\n    # Recursive case?\n    pass`,
    hints: [
      "Base case: if n <= 1 return n",
      "Recursive: return fib(n-1) + fib(n-2)",
      "The @lru_cache decorator handles all memoization automatically",
    ],
    solutionTopDown: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)`,
    solutionBottomUp: `def fib(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Or O(1) space:
def fib_compact(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    topDownExplanation: "Recursive with memoization. Python's @lru_cache makes this trivial. Use when the recursion tree has structure you want to preserve.",
    bottomUpExplanation: "Iterative. Fill a dp array from small to large. More space-efficient, no recursion depth limit. The O(1) space version uses rolling variables.",
    commonMistakes: [
      "Forgetting the base case → infinite recursion",
      "Mutable default arg `memo={}` shared across calls — use None then create inside",
      "Returning None when the recursion should return a value",
    ],
    interviewWisdom: "Interviewers often ask: 'Can you do this in O(1) space?' for Fibonacci. Know the rolling-variable trick.",
    testCases: [
      { input: [0], expected: 0, label: "fib(0) = 0" },
      { input: [10], expected: 55, label: "fib(10) = 55" },
      { input: [50], expected: 12586269025, label: "fib(50) — must be instant" },
    ],
  },

  // ─── 2. 1D DP on Arrays ───
  {
    id: "py-dp-2",
    title: "1D DP on Arrays",
    subtitle: "dp[i] depends on dp[i-1] — the core pattern",
    concept: "When the answer for index i depends on answers for earlier indices, you have 1D DP on arrays. Classic: House Robber, Climbing Stairs, Max Subarray.",
    pattern: "1D DP",
    recurrence: "dp[i] = function of dp[i-1], dp[i-2], ...",
    pythonTricks: [
      {
        title: "Pythonic dp array init",
        code: `n = len(nums)
dp = [0] * n  # Initialize all to 0
# or: dp = [-inf] * n for max problems
# or: dp = [inf] * n for min problems`,
        explanation: "List multiplication is the fastest way to create a fixed-size list in Python.",
      },
      {
        title: "Rolling variables (O(1) space)",
        code: `prev2, prev1 = 0, nums[0]
for i in range(1, len(nums)):
    curr = max(prev1, prev2 + nums[i])
    prev2, prev1 = prev1, curr
return prev1`,
        explanation: "Tuple unpacking `a, b = b, a + b` is idiomatic Python. Cleaner than temp variables.",
      },
    ],
    visualExample: "House Robber: [2,7,9,3,1] → dp=[2,7,11,11,12]. Each cell: max of 'skip' or 'rob + dp[i-2]'.",
    task: "House Robber: Max money you can rob from a street of houses, but you can't rob two adjacent houses.",
    functionName: "rob",
    starter: `def rob(nums):\n    # dp[i] = max money from houses 0..i\n    # Choice: rob house i (take nums[i] + dp[i-2]) or skip (dp[i-1])\n    pass`,
    hints: [
      "dp[0] = nums[0]. dp[1] = max(nums[0], nums[1])",
      "For i >= 2: dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
      "For O(1) space: keep only prev2 and prev1 variables",
    ],
    solutionTopDown: `from functools import lru_cache

def rob(nums):
    @lru_cache(maxsize=None)
    def helper(i):
        if i < 0: return 0
        return max(helper(i-1), helper(i-2) + nums[i])
    return helper(len(nums) - 1)`,
    solutionBottomUp: `def rob(nums):
    if not nums: return 0
    if len(nums) == 1: return nums[0]
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
    return prev1`,
    topDownExplanation: "Start from the last house, ask 'rob or skip?' recursively. Memoize on the index.",
    bottomUpExplanation: "Build dp from left to right. Each step: rob this house + dp[i-2], or skip this house and keep dp[i-1].",
    commonMistakes: [
      "Forgetting the edge cases: empty array, single house",
      "Using dp[i] = max(dp[i-1], nums[i] + dp[i-2]) without checking i >= 2",
      "Trying to be greedy — 'just take every other house' doesn't always work",
    ],
    interviewWisdom: "Always mention the O(1) space optimization. It's a common follow-up: 'Can you use constant space?'",
    testCases: [
      { input: [[1, 2, 3, 1]], expected: 4, label: "rob([1,2,3,1]) = 4" },
      { input: [[2, 7, 9, 3, 1]], expected: 12, label: "rob([2,7,9,3,1]) = 12" },
      { input: [[5]], expected: 5, label: "single house" },
      { input: [[]], expected: 0, label: "empty" },
    ],
  },

  // ─── 3. 2D DP on Grids ───
  {
    id: "py-dp-3",
    title: "2D DP on Grids",
    subtitle: "When your state has two dimensions",
    concept: "Grid problems or problems comparing two sequences. State: dp[i][j]. Classic: Unique Paths, Min Path Sum, Edit Distance, LCS.",
    pattern: "2D DP",
    recurrence: "dp[i][j] = function of dp[i-1][j], dp[i][j-1], dp[i-1][j-1]",
    pythonTricks: [
      {
        title: "2D array creation",
        code: `m, n = len(grid), len(grid[0])
dp = [[0] * n for _ in range(m)]

# WRONG — creates shared references!
dp = [[0] * n] * m`,
        explanation: "List comprehension creates independent rows. List multiplication shares references — modifying one row modifies all!",
      },
      {
        title: "In-place modification",
        code: `# Reuse the input grid as dp to save O(m*n) space:
for i in range(1, m):
    for j in range(1, n):
        grid[i][j] += min(grid[i-1][j], grid[i][j-1])
return grid[m-1][n-1]`,
        explanation: "For Min Path Sum and similar, you can modify the input grid in-place for O(1) extra space.",
      },
    ],
    visualExample: "Unique Paths 3x3: dp = [[1,1,1],[1,2,3],[1,3,6]] — each cell is sum of top + left.",
    task: "Unique Paths: How many ways to go from top-left to bottom-right of an m×n grid, moving only right or down?",
    functionName: "uniquePaths",
    starter: `def uniquePaths(m, n):\n    # dp[i][j] = number of paths to cell (i,j)\n    # Base: first row and column all have 1 path\n    pass`,
    hints: [
      "Create 2D dp array with m rows, n cols",
      "First row and first column: all 1s (only one way to reach)",
      "dp[i][j] = dp[i-1][j] + dp[i][j-1]",
    ],
    solutionTopDown: `from functools import lru_cache

def uniquePaths(m, n):
    @lru_cache(maxsize=None)
    def paths(i, j):
        if i == 0 or j == 0: return 1
        return paths(i-1, j) + paths(i, j-1)
    return paths(m-1, n-1)`,
    solutionBottomUp: `def uniquePaths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]

# O(n) space version:
def uniquePaths_compact(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j-1]
    return dp[n-1]`,
    topDownExplanation: "Recurse from destination. Base: any edge cell has 1 path. Memoize on (i, j).",
    bottomUpExplanation: "Fill grid row by row. Each cell is sum of cell above + cell to left.",
    commonMistakes: [
      "Using [[0] * n] * m which creates shared row references",
      "Forgetting to initialize first row/column with 1s",
      "Off-by-one in loop bounds (m vs m-1)",
    ],
    interviewWisdom: "For grid problems, ALWAYS mention you can reduce 2D DP to 1D DP space (just need the previous row). This impresses interviewers.",
    testCases: [
      { input: [3, 3], expected: 6, label: "3x3 = 6 paths" },
      { input: [3, 7], expected: 28, label: "3x7 = 28" },
      { input: [1, 1], expected: 1, label: "1x1 = 1" },
      { input: [7, 3], expected: 28, label: "symmetric" },
    ],
  },

  // ─── 4. Unbounded Knapsack ───
  {
    id: "py-dp-4",
    title: "Unbounded Knapsack (Coin Change)",
    subtitle: "When items can be used unlimited times",
    concept: "When the same 'item' can be reused — like coins in Coin Change. The inner loop goes LEFT to RIGHT (reusable), unlike 0/1 knapsack.",
    pattern: "Optimization DP",
    recurrence: "dp[amount] = min(dp[amount - coin] + 1 for each coin)",
    pythonTricks: [
      {
        title: "float('inf') for impossible states",
        code: `dp = [float('inf')] * (amount + 1)
dp[0] = 0
# ... fill dp ...
return dp[amount] if dp[amount] != float('inf') else -1`,
        explanation: "Use `float('inf')` as a sentinel for 'impossible'. Python's inf compares correctly with other numbers.",
      },
      {
        title: "Generator expression with min()",
        code: `dp[i] = min(
    (dp[i - coin] + 1 for coin in coins if i >= coin),
    default=float('inf')
)`,
        explanation: "`min()` with a generator + `default=` handles the 'no valid coins' case elegantly. No explicit loop needed.",
      },
    ],
    visualExample: "coinChange([1,2,5], 11) → dp=[0,1,1,2,2,1,2,2,3,3,2,3]. Each cell: min of (prev - coin) + 1.",
    task: "Coin Change: Given coins and amount, return minimum coins needed. Return -1 if impossible.",
    functionName: "coinChange",
    starter: `def coinChange(coins, amount):\n    # dp[i] = min coins to make amount i\n    # dp[0] = 0, rest = infinity\n    # For each amount, try each coin\n    pass`,
    hints: [
      "dp = [inf] * (amount + 1); dp[0] = 0",
      "For i from 1 to amount: for coin in coins: if i >= coin: dp[i] = min(dp[i], dp[i-coin] + 1)",
      "Return dp[amount] if not inf, else -1",
    ],
    solutionTopDown: `from functools import lru_cache

def coinChange(coins, amount):
    @lru_cache(maxsize=None)
    def helper(amt):
        if amt == 0: return 0
        if amt < 0: return float('inf')
        return min(helper(amt - c) + 1 for c in coins)
    result = helper(amount)
    return result if result != float('inf') else -1`,
    solutionBottomUp: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i >= coin:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
    topDownExplanation: "Recurse on remaining amount. Base: amount==0 → 0 coins. Invalid: amount<0 → infinity.",
    bottomUpExplanation: "Build dp from 0 to amount. For each amount, try every coin and keep the minimum.",
    commonMistakes: [
      "Forgetting to check `i >= coin` (array out of bounds)",
      "Returning dp[amount] directly when it's still infinity (should be -1)",
      "Using 0 as sentinel instead of infinity (breaks min)",
    ],
    interviewWisdom: "When interviewer says 'can you do unlimited of each', you're in Unbounded Knapsack territory. Inner loop goes forward. For 0/1 Knapsack, inner loop goes backward.",
    testCases: [
      { input: [[1, 2, 5], 11], expected: 3, label: "coinChange([1,2,5], 11) = 3" },
      { input: [[2], 3], expected: -1, label: "impossible = -1" },
      { input: [[1], 0], expected: 0, label: "amount 0 = 0 coins" },
    ],
  },

  // ─── 5. 0/1 Knapsack ───
  {
    id: "py-dp-5",
    title: "0/1 Knapsack",
    subtitle: "Each item used at most once — the include/exclude pattern",
    concept: "0/1 Knapsack: take or skip each item, each item used AT MOST ONCE. The include/exclude pattern. Inner loop goes RIGHT to LEFT to prevent reuse.",
    pattern: "Include/Exclude",
    recurrence: "dp[cap] = max(dp[cap], dp[cap - weight[i]] + value[i])",
    pythonTricks: [
      {
        title: "Reverse iteration",
        code: `# 0/1 Knapsack: iterate capacity RIGHT to LEFT
for i, (w, v) in enumerate(zip(weights, values)):
    for cap in range(W, w - 1, -1):  # reverse!
        dp[cap] = max(dp[cap], dp[cap - w] + v)`,
        explanation: "Reverse direction prevents using an item twice. If you went left to right, you'd read dp[cap-w] that was JUST updated with this item — reusing it.",
      },
      {
        title: "zip and enumerate together",
        code: `for i, (w, v) in enumerate(zip(weights, values)):
    ...`,
        explanation: "Idiomatic Python: iterate parallel lists with zip, get index with enumerate. Unpacks the tuple in one line.",
      },
    ],
    visualExample: "Items: (w:2,v:3), (w:3,v:4). Capacity 5. Take both: weight 5, value 7. Answer: 7.",
    task: "Return max value achievable with given capacity, where each item (weight, value) can be taken at most once.",
    functionName: "knapsack",
    starter: `def knapsack(weights, values, capacity):\n    # dp[c] = max value with capacity c\n    # For each item: iterate capacity RIGHT to LEFT\n    pass`,
    hints: [
      "dp = [0] * (capacity + 1)",
      "For each (w, v) in items: for cap from capacity down to w: dp[cap] = max(dp[cap], dp[cap-w] + v)",
      "Return dp[capacity]",
    ],
    solutionTopDown: `from functools import lru_cache

def knapsack(weights, values, capacity):
    @lru_cache(maxsize=None)
    def helper(i, cap):
        if i == len(weights) or cap == 0: return 0
        skip = helper(i + 1, cap)
        take = 0
        if weights[i] <= cap:
            take = values[i] + helper(i + 1, cap - weights[i])
        return max(skip, take)
    return helper(0, capacity)`,
    solutionBottomUp: `def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for cap in range(capacity, w - 1, -1):  # REVERSE!
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[capacity]`,
    topDownExplanation: "Recurse with state (item index, remaining capacity). At each item: take or skip.",
    bottomUpExplanation: "For each item, update dp from capacity down to weight. Reverse order is the KEY to 0/1 vs unbounded.",
    commonMistakes: [
      "Iterating left-to-right → becomes unbounded knapsack (items reused)",
      "Starting inner loop at 0 instead of w → index out of range or just wasteful",
      "Forgetting to check if item fits (cap >= w)",
    ],
    interviewWisdom: "The ONE LINE difference between 0/1 and unbounded Knapsack is the inner loop direction. Know this cold — it's a common interview gotcha.",
    testCases: [
      { input: [[2, 3, 4], [3, 4, 5], 5], expected: 7, label: "w=[2,3,4],v=[3,4,5],cap=5 = 7" },
      { input: [[1, 2, 3], [6, 10, 12], 5], expected: 22, label: "cap=5 = 22" },
      { input: [[5], [10], 4], expected: 0, label: "too heavy" },
    ],
  },

  // ─── 6. LIS with Binary Search ───
  {
    id: "py-dp-6",
    title: "LIS with bisect — O(n log n)",
    subtitle: "The trick that turns O(n²) into O(n log n)",
    concept: "Longest Increasing Subsequence. O(n²) DP is obvious. The trick: maintain a 'tails' array and use binary search (bisect) to achieve O(n log n).",
    pattern: "DP + Binary Search",
    recurrence: "tails[i] = smallest value that ends an increasing subsequence of length i+1",
    pythonTricks: [
      {
        title: "bisect_left for LIS",
        code: `from bisect import bisect_left

tails = []
for num in nums:
    idx = bisect_left(tails, num)
    if idx == len(tails):
        tails.append(num)
    else:
        tails[idx] = num
return len(tails)`,
        explanation: "bisect_left finds where num would be inserted. If it extends tails → new length. Otherwise → replaces a larger value with a smaller one (better for future).",
      },
      {
        title: "The tails array insight",
        code: `# nums = [10, 9, 2, 5, 3, 7, 101, 18]
# tails evolves:
# [10] → [9] → [2] → [2,5] → [2,3] → [2,3,7] → [2,3,7,101] → [2,3,7,18]
# Final length = 4
# NOTE: tails is NOT the actual LIS, just its length!`,
        explanation: "tails[i] is the smallest value ending an increasing subseq of length i+1. Smaller is better for extending.",
      },
    ],
    visualExample: "nums=[10,9,2,5,3,7,101,18] → LIS = [2,3,7,18] or [2,3,7,101], length 4.",
    task: "Return the length of the longest strictly increasing subsequence. Must be O(n log n).",
    functionName: "lengthOfLIS",
    starter: `from bisect import bisect_left\n\ndef lengthOfLIS(nums):\n    # Use bisect_left on a 'tails' array\n    # tails[i] = smallest value ending an increasing subseq of length i+1\n    pass`,
    hints: [
      "tails = []",
      "For each num: idx = bisect_left(tails, num)",
      "If idx == len(tails): tails.append(num) — extends LIS",
      "Else: tails[idx] = num — replaces larger with smaller",
    ],
    solutionTopDown: `# O(n^2) — simple DP (not the optimal solution)
def lengthOfLIS_n2(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    solutionBottomUp: `from bisect import bisect_left

def lengthOfLIS(nums):
    tails = []
    for num in nums:
        idx = bisect_left(tails, num)
        if idx == len(tails):
            tails.append(num)
        else:
            tails[idx] = num
    return len(tails)`,
    topDownExplanation: "O(n²) with DP: dp[i] = length of LIS ending at i. For each j < i with nums[j] < nums[i], update dp[i].",
    bottomUpExplanation: "O(n log n) with patience sort / tails array. Binary search for where each num fits. Classic Python trick using bisect.",
    commonMistakes: [
      "Using bisect_right instead of bisect_left (gives non-strict LIS — allows duplicates)",
      "Thinking tails IS the LIS — it's NOT. Only its length matches.",
      "Starting with O(n²) in the interview when O(n log n) is expected",
    ],
    interviewWisdom: "LIS is the canonical 'DP + binary search' problem. If you mention the O(n log n) approach using bisect, you'll stand out. The tails array is the trick that looks magical until you understand it.",
    testCases: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4, label: "LIS = 4" },
      { input: [[0, 1, 0, 3, 2, 3]], expected: 4, label: "another = 4" },
      { input: [[7, 7, 7, 7]], expected: 1, label: "all same = 1" },
    ],
  },
];

interface Props {
  onBack: () => void;
  onLessonComplete?: (lessonId: string) => void;
}

export default function PythonDPTrainer({ onBack, onLessonComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [showSolution, setShowSolution] = useState<"none" | "top-down" | "bottom-up">("none");
  const [solved, setSolved] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [awarded, setAwarded] = useState<Set<string>>(new Set());

  const lesson = lessons[idx];
  const total = lessons.length;

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setShowSolution("none");
      setSolved(false);
      setHintIdx(0);
    }
  }
  function handlePrev() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setShowSolution("none");
      setSolved(false);
      setHintIdx(0);
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-violet-500 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🐍</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Python DP Masterclass</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Write DP in Python the way interviewers want to see it</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Lesson {idx + 1} of {total}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold">{lesson.pattern}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div className="space-y-5" key={lesson.id}>
        {/* Title */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">{lesson.subtitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{lesson.concept}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recurrence</p>
            <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{lesson.recurrence}</code>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">{lesson.visualExample}</p>
        </div>

        {/* Python Tricks */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">🐍 Python Tricks for This Pattern</p>
          <div className="space-y-4">
            {lesson.pythonTricks.map((trick, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{trick.title}</p>
                <div className="bg-[#1e1e2e] rounded-lg p-3 mb-2">
                  <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap">{trick.code}</pre>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">{trick.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Task */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">✍️ Your Turn</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.task}</p>
        </div>

        {/* Hints */}
        {hintIdx > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 animate-fade-in">
            {lesson.hints.slice(0, hintIdx).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="bg-amber-100 text-amber-700 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Solutions */}
        {showSolution !== "none" && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="flex bg-emerald-100 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800">
              <button onClick={() => setShowSolution("top-down")} className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors ${showSolution === "top-down" ? "text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900" : "text-emerald-600 dark:text-emerald-400"}`}>Top-Down (Recursive)</button>
              <button onClick={() => setShowSolution("bottom-up")} className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors ${showSolution === "bottom-up" ? "text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900" : "text-emerald-600 dark:text-emerald-400"}`}>Bottom-Up (Iterative)</button>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-2">
                {showSolution === "top-down" ? lesson.topDownExplanation : lesson.bottomUpExplanation}
              </p>
              <div className="bg-[#1e1e2e] rounded-lg p-3">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">
                  {showSolution === "top-down" ? lesson.solutionTopDown : lesson.solutionBottomUp}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Code editor */}
        <CodeEditor
          functionName={lesson.functionName}
          testCases={lesson.testCases}
          starterJS=""
          starterPython={lesson.starter}
          onPass={() => {
            setSolved(true);
            if (!awarded.has(lesson.id)) {
              setAwarded((prev) => new Set(prev).add(lesson.id));
              onLessonComplete?.(lesson.id);
            }
          }}
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 text-xs">
          {!solved && (
            <>
              <button onClick={() => setHintIdx((h) => Math.min(h + 1, lesson.hints.length))} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {hintIdx === 0 ? "Get a hint" : hintIdx < lesson.hints.length ? `Next hint (${hintIdx + 1}/${lesson.hints.length})` : "All hints shown"}
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button onClick={() => setShowSolution(showSolution === "none" ? "top-down" : "none")} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {showSolution === "none" ? "Show solution" : "Hide solution"}
              </button>
            </>
          )}
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">⚠️ Common Mistakes</p>
          <ul className="space-y-1">
            {lesson.commonMistakes.map((m) => (
              <li key={m} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Wisdom */}
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2">💎 Interview Wisdom</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.interviewWisdom}</p>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between pt-4">
          <button onClick={handlePrev} disabled={idx === 0} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            ← Previous
          </button>
          <button onClick={handleNext} disabled={idx === total - 1} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next lesson
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
