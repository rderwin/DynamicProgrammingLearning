import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

interface BitmaskLesson {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  pattern: string;
  recurrence: string;
  bitTricks: { trick: string; code: string; explanation: string }[];
  walkthrough: { step: string; description: string }[];
  task: string;
  starter: string;
  functionName: string;
  testCases: TestCase[];
  hints: string[];
  solution: string;
  explanation: string;
  commonMistakes: string[];
  interviewWisdom: string;
  difficulty: "Medium" | "Hard";
}

const lessons: BitmaskLesson[] = [
  // ─── 1. Bit fundamentals & Counting Subsets ───
  {
    id: "b1",
    title: "The Bitmask Mental Model",
    subtitle: "Before DP: learn to think in bits",
    difficulty: "Medium",
    concept:
      "A bitmask is an integer whose binary bits represent a SET. For n items, mask ranges from 0 (empty set) to 2^n-1 (full set). Each bit represents 'is element i included?'. This replaces tuple-keyed memoization with an integer, making DP over subsets FAST. Essential for problems where the state is 'which subset have we seen / used'.",
    pattern: "Bitmask basics",
    recurrence: "No recurrence yet — this is about building intuition for bit operations",
    bitTricks: [
      { trick: "Check if bit i is set", code: "(mask >> i) & 1", explanation: "Shift right i places, AND with 1. Returns 1 if set, 0 otherwise." },
      { trick: "Set bit i", code: "mask | (1 << i)", explanation: "OR with 1 shifted i places. Sets that bit; leaves others unchanged." },
      { trick: "Unset bit i", code: "mask & ~(1 << i)", explanation: "AND with the complement. Clears that bit." },
      { trick: "Toggle bit i", code: "mask ^ (1 << i)", explanation: "XOR flips. Useful for 'add/remove' interchangeably." },
      { trick: "Count set bits", code: "bin(mask).count('1')\n# or in Python 3.10+:\nmask.bit_count()", explanation: "Number of elements in the subset." },
      { trick: "Iterate set bits", code: "while mask:\n    i = (mask & -mask).bit_length() - 1\n    # process i\n    mask &= mask - 1", explanation: "mask & -mask isolates the lowest set bit. mask &= mask-1 clears it." },
      { trick: "Iterate all subsets of mask", code: "sub = mask\nwhile sub:\n    # process sub\n    sub = (sub - 1) & mask", explanation: "Classic submask enumeration. O(3^n) total across all masks, not O(4^n)." },
    ],
    walkthrough: [
      { step: "Count bits", description: "Write a function that returns the number of 1 bits in mask" },
      { step: "Test", description: "countBits(0) = 0, countBits(7) = 3, countBits(8) = 1" },
      { step: "One approach", description: "Brian Kernighan: while mask: count += 1; mask &= mask - 1" },
      { step: "Python cheat", description: "bin(mask).count('1') — clear and fast for small masks" },
    ],
    task: "Given an integer n, return a list of length n+1 where result[i] = number of 1-bits in i.",
    functionName: "countBits",
    starter: `def countBits(n):
    # For each i from 0 to n, count set bits.
    # Option A: bin(i).count('1')
    # Option B: DP — result[i] = result[i >> 1] + (i & 1)
    pass`,
    hints: [
      "Brute: for each i, use bin(i).count('1') or Kernighan's trick",
      "DP trick: result[i] = result[i >> 1] + (i & 1). Right-shift drops the last bit, then add it back if set",
      "This DP makes it O(n) instead of O(n log n)",
      "Return a list of length n+1",
    ],
    solution: `def countBits(n):
    result = [0] * (n + 1)
    for i in range(1, n + 1):
        result[i] = result[i >> 1] + (i & 1)
    return result

# Alternative using Kernighan
def countBits_kernighan(n):
    def popcount(x):
        count = 0
        while x:
            count += 1
            x &= x - 1
        return count
    return [popcount(i) for i in range(n + 1)]`,
    explanation:
      "The DP insight: binary of i is (binary of i>>1) with one extra bit (i & 1) appended. So popcount(i) = popcount(i>>1) + (i & 1). This turns O(n log n) into O(n). Critical warmup for DP-over-subsets — you'll need fluent bit manipulation.",
    commonMistakes: [
      "Confusing & with && and | with || — bitwise vs logical in many languages (Python allows both, but semantics differ)",
      "Off-by-one on bit position — bit 0 is the LEAST significant",
      "Using i / 2 instead of i >> 1 — works but >> is idiomatic and explicit about intent",
      "Forgetting parentheses around shifts when mixing with + or & (operator precedence traps)",
    ],
    interviewWisdom:
      "Being fluent with bit tricks is a superpower for mid-level interviews and table stakes for senior. Before jumping into bitmask DP, make sure you can mentally execute '(mask >> 2) & 3' without thinking. Practice these primitives until they're second nature — they're the vocabulary of bitmask DP.",
    testCases: [
      { input: [2], expected: [0, 1, 1], label: "n=2" },
      { input: [5], expected: [0, 1, 1, 2, 1, 2], label: "n=5" },
      { input: [0], expected: [0], label: "n=0" },
    ],
  },

  // ─── 2. Partition Equal Subset (classic bitmask DP warmup) ───
  {
    id: "b2",
    title: "Can I Win (Game with Bitmask State)",
    subtitle: "The classic 'subset as state' DP",
    difficulty: "Medium",
    concept:
      "Two players take turns picking from numbers 1..maxChoosableInteger. No repeats. First to push cumulative total to >= desiredTotal wins. Can Player 1 force a win? State = WHICH numbers have been used (bitmask) + current total. Memoize on the mask (total is derivable from mask).",
    pattern: "Bitmask DP (game theory)",
    recurrence:
      "win(mask) = True if ANY unused i: (i + total reaches target) OR NOT win(mask | (1<<(i-1)))\nwhere total = sum of used numbers",
    bitTricks: [
      { trick: "State key", code: "# Just use the mask.\n# total = sum(i+1 for i in range(n) if mask >> i & 1)\n# Or pass total along — either works.", explanation: "For n=20, mask fits in int. 2^20 ≈ 1M states. Very fast." },
      { trick: "Try each unused number", code: "for i in range(1, maxChoosable + 1):\n    bit = 1 << (i - 1)\n    if mask & bit: continue  # already used\n    # use i", explanation: "Loop through 1..maxChoosable, skip bits already set." },
    ],
    walkthrough: [
      { step: "State", description: "win(mask) = can current player force a win given numbers used in mask?" },
      { step: "For each unused i", description: "If taking i pushes total to >= target, current player wins. Else, recurse: can opponent win from new state?" },
      { step: "Lose condition for opp", description: "If opponent CAN'T win from new state, we force a win" },
      { step: "Memoize", description: "On mask (2^n states)" },
      { step: "Edge cases", description: "If sum(1..max) < target: impossible → False. If max >= target: Player 1 picks it → True" },
    ],
    task: "Return True if Player 1 can guarantee a win.",
    functionName: "canIWin",
    starter: `from functools import lru_cache

def canIWin(maxChoosableInteger, desiredTotal):
    # Edge cases: desired <= 0, sum < desired
    # State = mask of used numbers
    # @lru_cache on mask
    # For each unused i: check if current player wins by taking i
    pass`,
    hints: [
      "If maxChoosableInteger >= desiredTotal: Player 1 picks it, wins",
      "If total sum of 1..max < desiredTotal: nobody can reach it → False",
      "Use @lru_cache on (mask, remaining_total)",
      "For each i not used: if i >= remaining → win; else if NOT opponent_wins(new_mask) → win",
      "If no winning move → False",
    ],
    solution: `from functools import lru_cache

def canIWin(maxChoosableInteger, desiredTotal):
    if desiredTotal <= 0:
        return True
    if maxChoosableInteger * (maxChoosableInteger + 1) // 2 < desiredTotal:
        return False

    @lru_cache(maxsize=None)
    def dp(mask, remaining):
        for i in range(1, maxChoosableInteger + 1):
            bit = 1 << (i - 1)
            if mask & bit:
                continue
            if i >= remaining or not dp(mask | bit, remaining - i):
                return True
        return False

    return dp(0, desiredTotal)`,
    explanation:
      "Game theory + bitmask. For each candidate pick i (not already used), either i alone pushes us to the target (immediate win) or we recurse to see if the opponent can win from the new state. If the opponent CAN'T win, we've forced our win. Memoize on (mask, remaining). O(2^n · n) total work.",
    commonMistakes: [
      "Forgetting the edge case: if sum of all numbers < target, return False (impossible)",
      "Using a dict instead of @lru_cache — slower; lru_cache is much faster for hashable inputs",
      "Tracking both players' accumulations separately — unnecessary, just use 'remaining'",
      "Iterating over used numbers instead of skipping them — costs correctness",
    ],
    interviewWisdom:
      "'Can I Win' is the prototype for game-theory bitmask DP. The pattern 'for each move, if opponent can't win afterward, I can' generalizes to Nim, Stone Game II, Predict the Winner. Mention the state space size (2^n) up front to show complexity awareness.",
    testCases: [
      { input: [10, 11], expected: false, label: "10, 11 = False" },
      { input: [10, 0], expected: true, label: "10, 0 = True" },
      { input: [10, 1], expected: true, label: "10, 1 = True" },
      { input: [5, 50], expected: false, label: "5, 50 = False" },
    ],
  },

  // ─── 3. Traveling Salesman (the canonical bitmask DP) ───
  {
    id: "b3",
    title: "Traveling Salesman (Held-Karp)",
    subtitle: "The canonical bitmask DP — O(n²·2ⁿ) instead of O(n!)",
    difficulty: "Hard",
    concept:
      "Given n cities and distance matrix, find min-cost Hamiltonian cycle (visit every city exactly once, return to start). Naively O(n!) (all permutations). Bitmask DP gets it to O(n²·2ⁿ) — for n=20 that's 400M ops (feasible), vs 2.4e18 naively. This is the gold-standard interview problem for bitmask DP.",
    pattern: "Bitmask DP (Held-Karp)",
    recurrence:
      "dp[mask][i] = min over j in mask \\ {i}: dp[mask \\ {i}][j] + dist[j][i]\n# mask = set of visited cities; i = currently at city i\n# base: dp[{0}][0] = 0",
    bitTricks: [
      { trick: "Mask includes bit i", code: "(mask >> i) & 1", explanation: "Standard check." },
      { trick: "Remove bit i from mask", code: "mask ^ (1 << i)  # or mask & ~(1 << i)", explanation: "XOR flips only if set; in context we KNOW it's set, so XOR works." },
      { trick: "Full mask (all visited)", code: "full = (1 << n) - 1", explanation: "Binary: n ones. Represents 'all cities visited'." },
    ],
    walkthrough: [
      { step: "State", description: "dp[mask][i] = min cost of path starting at city 0, visiting exactly cities in mask, ending at city i" },
      { step: "Base", description: "dp[1][0] = 0 — we've visited only city 0, ending at 0, cost 0" },
      { step: "Transition", description: "To compute dp[mask][i], try every j in mask \\ {i}: came-from j, cost = dp[mask^bit_i][j] + dist[j][i]" },
      { step: "Iterate", description: "Outer loop over masks (small to large), inner over ending cities i" },
      { step: "Answer", description: "min over i: dp[full_mask][i] + dist[i][0] — close the cycle" },
    ],
    task: "Given n×n distance matrix dist (0-indexed, city 0 is start), return min TSP tour cost.",
    functionName: "tsp",
    starter: `def tsp(dist):
    n = len(dist)
    INF = float('inf')
    full = (1 << n) - 1
    # dp[mask][i] = min cost to visit set 'mask' ending at city i
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # visited only city 0, ending at 0
    # Iterate masks in increasing order
    # For each mask, for each ending city i:
    #   For each j in mask that isn't i:
    #     Update dp[mask][i]
    pass`,
    hints: [
      "dp[mask][i] = min cost of path through cities in mask, ending at city i",
      "Base: dp[1][0] = 0 (start at city 0)",
      "For each mask, each i IN mask, each j IN mask \\ {i}: dp[mask][i] = min(dp[mask][i], dp[mask ^ (1<<i)][j] + dist[j][i])",
      "Only consider masks that include bit 0 (we started there)",
      "Final answer: min over i != 0 of dp[full][i] + dist[i][0]",
    ],
    solution: `def tsp(dist):
    n = len(dist)
    INF = float('inf')
    full = (1 << n) - 1
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0

    for mask in range(1, 1 << n):
        if not (mask & 1):  # must include city 0
            continue
        for i in range(n):
            if not (mask >> i) & 1:
                continue
            if dp[mask][i] == INF:
                continue
            # Extend to city j not yet in mask
            for j in range(n):
                if (mask >> j) & 1:
                    continue
                new_mask = mask | (1 << j)
                if dp[mask][i] + dist[i][j] < dp[new_mask][j]:
                    dp[new_mask][j] = dp[mask][i] + dist[i][j]

    # Close the cycle
    return min(dp[full][i] + dist[i][0] for i in range(1, n))`,
    explanation:
      "Held-Karp algorithm. dp[mask][i] = shortest path that starts at city 0, visits exactly the cities in mask, and ends at city i. We build up from mask = {0} (just city 0) and extend by adding one new city at a time. After filling all dp values, the answer is min over i of dp[full_mask][i] + dist[i][0] (closing the loop back to 0). O(n²·2ⁿ) time, O(n·2ⁿ) space. Beats O(n!) dramatically for n up to ~20.",
    commonMistakes: [
      "Not ensuring mask includes bit 0 — waste work on impossible states",
      "Iterating over masks out of order — small-to-large is required",
      "Confusing 'ending at i' with 'starting at i' — the direction matters",
      "Forgetting to add dist[i][0] at the end — we need to RETURN to start",
    ],
    interviewWisdom:
      "TSP is classic 'intractable' — NP-hard in general — but Held-Karp gives exponential/polynomial tradeoff that works for small n (≤20). If interviewer mentions TSP, start with 'it's NP-hard, but for small n we can use bitmask DP — O(n²·2ⁿ).' That phrase alone earns significant credit. Follow-up: any heuristic like nearest-neighbor or 2-opt for larger n.",
    testCases: [
      { input: [[[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]], expected: 80, label: "4 cities = 80" },
      { input: [[[0, 1], [1, 0]]], expected: 2, label: "2 cities = 2" },
      { input: [[[0, 10, 20], [10, 0, 15], [20, 15, 0]]], expected: 45, label: "3 cities = 45" },
    ],
  },

  // ─── 4. Assignment Problem ───
  {
    id: "b4",
    title: "Assignment Problem (Min Cost)",
    subtitle: "N workers, N jobs — assign optimally",
    difficulty: "Hard",
    concept:
      "N workers and N jobs. cost[i][j] = cost of worker i doing job j. Each worker does exactly one job and each job is done by exactly one worker. Minimize total cost. The state: 'which jobs are assigned?' (bitmask). By position in the mask bits, you can derive which worker is next in line.",
    pattern: "Bitmask DP (Assignment)",
    recurrence:
      "dp[mask] = min over j in unassigned(mask): dp[mask | (1<<j)] + cost[i][j]\nwhere i = popcount(mask) — the next worker to assign",
    bitTricks: [
      { trick: "Next worker index", code: "i = bin(mask).count('1')  # or popcount", explanation: "Number of already-assigned jobs = index of next worker. Clever: the mask's popcount IS the worker number." },
      { trick: "Iterate unassigned jobs", code: "for j in range(n):\n    if (mask >> j) & 1: continue\n    # j is unassigned", explanation: "Bits not set = jobs still available." },
    ],
    walkthrough: [
      { step: "State", description: "dp[mask] = min cost to assign all workers with popcount(mask) already assigned and their jobs in mask" },
      { step: "Worker = popcount", description: "Subtle trick: worker index = how many bits are set. Worker 0 assigned first, then worker 1, etc." },
      { step: "Transition", description: "For worker i (= popcount(mask)), try every unassigned job j: dp[mask | (1<<j)] = dp[mask] + cost[i][j]" },
      { step: "Base", description: "dp[0] = 0 (no assignments yet, cost 0)" },
      { step: "Answer", description: "dp[(1<<n) - 1] (all jobs assigned)" },
    ],
    task: "Given n×n cost matrix, return min total cost to assign each worker to exactly one job.",
    functionName: "minCostAssign",
    starter: `def minCostAssign(cost):
    n = len(cost)
    INF = float('inf')
    dp = [INF] * (1 << n)
    dp[0] = 0
    # For each mask, worker index = popcount(mask)
    # For each unassigned job j, update dp[mask | (1<<j)]
    pass`,
    hints: [
      "dp[mask] = min cost to reach state where jobs in 'mask' are assigned",
      "Worker index is popcount(mask) — the next worker in line",
      "Base: dp[0] = 0",
      "For each mask, for each unset bit j: dp[mask | (1<<j)] = min(..., dp[mask] + cost[i][j])",
      "Answer is dp[(1<<n) - 1]",
    ],
    solution: `def minCostAssign(cost):
    n = len(cost)
    INF = float('inf')
    dp = [INF] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] == INF:
            continue
        i = bin(mask).count('1')  # next worker
        if i == n:
            continue
        for j in range(n):
            if (mask >> j) & 1:
                continue
            new_mask = mask | (1 << j)
            new_cost = dp[mask] + cost[i][j]
            if new_cost < dp[new_mask]:
                dp[new_mask] = new_cost
    return dp[(1 << n) - 1]`,
    explanation:
      "The clever part: worker index = popcount(mask). This exploits the fact that we assign workers in order 0, 1, 2, ..., n-1. When popcount(mask) = 3, that means workers 0, 1, 2 are already assigned (their jobs are in mask), and worker 3 is next. For worker 3, we try every unassigned job j. O(2ⁿ · n) time, O(2ⁿ) space. Classic bipartite matching problem — the Hungarian algorithm is O(n³) but bitmask DP is simpler to code.",
    commonMistakes: [
      "Tracking both worker and mask as state — redundant since popcount(mask) = worker index",
      "Forgetting popcount(mask) = n means all assigned — skip those masks",
      "Confusing 'mask = jobs assigned' with 'mask = workers assigned' (both work if consistent)",
      "Not checking dp[mask] != INF before extending — spreads infinity",
    ],
    interviewWisdom:
      "The Assignment problem is bipartite matching's DP form. Hungarian algorithm is O(n³) and optimal, but for small n (<=20), the bitmask DP is clean and easier to derive in an interview. Show you know Hungarian exists as a follow-up. The popcount-as-worker-index trick is widely reusable — remember it for any 'assign N things in order' bitmask DP.",
    testCases: [
      { input: [[[10, 19, 8, 15], [10, 18, 7, 17], [13, 16, 9, 14], [12, 19, 8, 18]]], expected: 50, label: "4×4 = 50" },
      { input: [[[1, 2], [3, 4]]], expected: 5, label: "2×2 = 5" },
      { input: [[[5, 1], [1, 5]]], expected: 2, label: "2×2 = 2" },
    ],
  },

  // ─── 5. Submask enumeration ───
  {
    id: "b5",
    title: "Submask Enumeration — Partition Into K Subsets",
    subtitle: "The elegant 'iterate all submasks' trick",
    difficulty: "Hard",
    concept:
      "Given nums and k, can we partition nums into k subsets with equal sums? The state: 'which elements have been used' (mask). The elegant trick: submask enumeration lets us try every possible first-subset efficiently. Total complexity O(3ⁿ) across all masks — better than O(4ⁿ).",
    pattern: "Bitmask DP (Submask enum)",
    recurrence:
      "dp[mask] = True if any submask sub of mask: sub is a valid subset AND dp[mask ^ sub]\nwhere 'valid subset' means sum(sub) equals target",
    bitTricks: [
      { trick: "Iterate all submasks", code: "sub = mask\nwhile sub > 0:\n    # process sub\n    sub = (sub - 1) & mask", explanation: "Enumerates all non-empty submasks. Total work across ALL masks is O(3^n)." },
      { trick: "Include empty submask", code: "sub = mask\nwhile True:\n    # process sub\n    if sub == 0: break\n    sub = (sub - 1) & mask", explanation: "If you need to include the empty set too." },
      { trick: "Sum of submask", code: "# Precompute:\ntotal[mask] = sum(nums[i] for i in range(n) if mask & (1<<i))\n# O(2^n * n) to fill, O(1) lookups", explanation: "Avoid recomputing sums — precompute once." },
    ],
    walkthrough: [
      { step: "Check feasibility", description: "total_sum % k != 0 → impossible. target = total // k" },
      { step: "Precompute sums", description: "sums[mask] = sum of nums at bits set in mask. O(2ⁿ · n)" },
      { step: "State", description: "dp[mask] = True if elements in mask can be split into valid groups (each summing to target)" },
      { step: "Transition", description: "dp[mask] = True if ANY submask sub of mask where sums[sub] == target AND dp[mask ^ sub]" },
      { step: "Base", description: "dp[0] = True (empty set is trivially partitioned)" },
      { step: "Answer", description: "dp[(1<<n) - 1]" },
    ],
    task: "Return True if nums can be partitioned into k non-empty subsets with equal sums.",
    functionName: "canPartitionKSubsets",
    starter: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k: return False
    target = total // k
    n = len(nums)
    # Precompute sum for each mask
    sums = [0] * (1 << n)
    for mask in range(1 << n):
        for i in range(n):
            if mask & (1 << i):
                sums[mask] += nums[i]
    # dp[mask] = True if mask can be split into valid groups
    # Use submask enum
    pass`,
    hints: [
      "Check divisibility first: total % k == 0",
      "Precompute sums[mask] for all masks",
      "dp[0] = True. For each mask, iterate submasks sub using (sub - 1) & mask trick",
      "dp[mask] = True if any submask has sums[sub] == target AND dp[mask ^ sub]",
      "Return dp[(1 << n) - 1]",
    ],
    solution: `def canPartitionKSubsets(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    n = len(nums)
    if any(x > target for x in nums):
        return False

    sums = [0] * (1 << n)
    for mask in range(1 << n):
        for i in range(n):
            if mask & (1 << i):
                sums[mask] += nums[i]

    dp = [False] * (1 << n)
    dp[0] = True
    for mask in range(1 << n):
        if not dp[mask]:
            continue
        # Try to add one more valid subset
        remaining = ((1 << n) - 1) ^ mask
        sub = remaining
        while sub > 0:
            if sums[sub] == target:
                dp[mask | sub] = True
            sub = (sub - 1) & remaining
    return dp[(1 << n) - 1]`,
    explanation:
      "Forward DP: dp[mask] = True means 'elements in mask can be partitioned into valid groups'. Start from dp[0] = True. For each reached mask, enumerate submasks of the REMAINING (not-yet-used) elements, looking for one that sums to target. If found, mark dp[mask | sub] = True. The submask enumeration (sub-1) & remaining is the crown jewel — O(3ⁿ) total across all masks. For n=16 that's ~43M ops, fast enough.",
    commonMistakes: [
      "Not checking divisibility first — wastes time",
      "Not pruning nums[i] > target — if any element exceeds target, impossible",
      "Iterating all 2ⁿ submasks for each mask — O(4ⁿ) instead of the proper O(3ⁿ) enum",
      "Recomputing sums inside the loop — must precompute",
    ],
    interviewWisdom:
      "Submask enumeration is the 'secret weapon' of bitmask DP. The `(sub-1) & mask` idiom is one of the most beautiful in algorithms — understand why O(3ⁿ) total: each element (bit) is either 'in mask but not sub', 'in sub' (which implies in mask), or 'not in mask'. 3 choices per element × n elements = 3ⁿ. Mention this complexity insight in interviews to stand out.",
    testCases: [
      { input: [[4, 3, 2, 3, 5, 2, 1], 4], expected: true, label: "4 subsets = T" },
      { input: [[1, 2, 3, 4], 3], expected: false, label: "k=3 = F" },
      { input: [[2, 2, 2, 2, 3, 4, 5], 4], expected: false, label: "k=4 = F" },
    ],
  },
];

interface Props {
  onBack: () => void;
  onLessonComplete?: (lessonId: string) => void;
}

export default function BitmaskDPTrainer({ onBack, onLessonComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [awarded, setAwarded] = useState<Set<string>>(new Set());

  const lesson = lessons[idx];
  const total = lessons.length;

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setShowSolution(false);
      setSolved(false);
      setHintIdx(0);
    }
  }
  function handlePrev() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setShowSolution(false);
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
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🎛️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Bitmask DP Masterclass</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Subset as state — 5 lessons on the most mind-bending DP technique</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Lesson {idx + 1} of {total}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lesson.difficulty === "Hard" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}`}>
            {lesson.difficulty}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 font-semibold">{lesson.pattern}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div className="space-y-5" key={lesson.id}>
        {/* Title + Concept */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">{lesson.subtitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{lesson.concept}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recurrence / Core Idea</p>
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lesson.recurrence}</pre>
          </div>
        </div>

        {/* Bit Tricks */}
        <div className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-3">🔧 Bit Tricks for This Pattern</p>
          <div className="space-y-3">
            {lesson.bitTricks.map((bt, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{bt.trick}</p>
                <div className="bg-[#1e1e2e] rounded-lg p-3 mb-2">
                  <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">{bt.code}</pre>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">{bt.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Walkthrough */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">📋 How to Derive It</p>
          <ol className="space-y-2">
            {lesson.walkthrough.map((w, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{w.step}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{w.description}</p>
                </div>
              </li>
            ))}
          </ol>
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

        {/* Solution */}
        {showSolution && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">✅ Solution</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-2">{lesson.explanation}</p>
              <div className="bg-[#1e1e2e] rounded-lg p-3">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{lesson.solution}</pre>
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
              <button onClick={() => setShowSolution(!showSolution)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {showSolution ? "Hide solution" : "Show solution"}
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
        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2">💎 Interview Wisdom</p>
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
