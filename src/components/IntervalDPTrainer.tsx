import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

interface IntervalLesson {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  pattern: string;
  recurrence: string;
  keyInsight: string;
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

const lessons: IntervalLesson[] = [
  // ─── 1. The Fundamental Pattern: Matrix Chain ───
  {
    id: "iv1",
    title: "Matrix Chain Multiplication",
    subtitle: "The gateway to interval DP — pick a split point",
    difficulty: "Hard",
    concept:
      "Given dimensions of n matrices, find the min multiplications to multiply them. Matrix mult is associative but NOT commutative — the ORDER of pairings matters. ((AB)C) might cost less than (A(BC)). This is the canonical interval DP: for each subarray, try every possible split point.",
    pattern: "Interval DP (split-based)",
    recurrence: "dp[i][j] = min over k in [i, j): dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]",
    keyInsight:
      "The CORE of interval DP: for an interval [i, j], you're asking 'where do I split?'. Try every k in between. The split divides the problem into dp[i][k] and dp[k+1][j] — two smaller intervals whose solutions you already have. Fill by INTERVAL LENGTH (not row/col order), so smaller intervals are ready when you need them.",
    walkthrough: [
      { step: "Step 1", description: "Define dp[i][j] = min cost to multiply matrices i through j" },
      { step: "Step 2", description: "Single matrix (i == j) has cost 0 — nothing to multiply" },
      { step: "Step 3", description: "For [i, j], try every split k. Cost = dp[i][k] + dp[k+1][j] + (cost to multiply the two resulting matrices)" },
      { step: "Step 4", description: "Matrix i has dims p[i-1] × p[i]. Multiplying the left result (p[i-1] × p[k]) by right (p[k] × p[j]) costs p[i-1] * p[k] * p[j]" },
      { step: "Step 5", description: "Fill by increasing interval length: length 2, then 3, ... up to n" },
    ],
    task: "Given array p of length n+1 where matrix i has dimensions p[i-1] × p[i], return min scalar multiplications. Matrices are indexed 1..n.",
    functionName: "matrixChainOrder",
    starter: `def matrixChainOrder(p):
    n = len(p) - 1  # number of matrices
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    # Fill by length: 2, 3, ..., n
    # For each interval [i, j], try every split k in [i, j):
    #   cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]
    pass`,
    hints: [
      "Matrices are 1-indexed. Matrix i has dims p[i-1] × p[i]",
      "Base case: dp[i][i] = 0 (single matrix, no multiplication needed)",
      "Fill by length: for length in range(2, n+1), for i in range(1, n-length+2), j = i+length-1",
      "Inner loop: try every split k from i to j-1, track minimum",
      "Cost formula: dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j]",
    ],
    solution: `def matrixChainOrder(p):
    n = len(p) - 1
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j]
                if cost < dp[i][j]:
                    dp[i][j] = cost
    return dp[1][n]`,
    explanation:
      "Classic interval DP. dp[i][j] is the min cost to multiply matrices i..j. We try every possible 'last multiplication' — the split at k means we first compute (i..k) and (k+1..j) then multiply the results. The multiplication of those two intermediate matrices has dims p[i-1] × p[k] and p[k] × p[j], costing p[i-1] * p[k] * p[j]. Fill by LENGTH so smaller intervals are ready. O(n³) time, O(n²) space.",
    commonMistakes: [
      "Filling in row-col order instead of by length — dp[i][k] and dp[k+1][j] won't be ready",
      "Confusing the 'split at k' with 'split after k' — both work but be consistent",
      "Forgetting that p has n+1 elements for n matrices",
      "Off-by-one on the cost formula — it's p[i-1] * p[k] * p[j], all three",
    ],
    interviewWisdom:
      "Matrix Chain is the template for all split-based interval DP. Once you have this, Burst Balloons, Optimal BST, and Palindrome Partitioning follow the same structure. The pattern: 'For interval [i,j], pick what happens LAST and where.' Interviewers rarely ask MCM directly, but it's the foundation for the ones they DO ask.",
    testCases: [
      { input: [[40, 20, 30, 10, 30]], expected: 26000, label: "4 matrices = 26000" },
      { input: [[10, 20, 30]], expected: 6000, label: "2 matrices = 6000" },
      { input: [[5, 4, 6, 2, 7]], expected: 158, label: "4 matrices = 158" },
    ],
  },

  // ─── 2. Burst Balloons ───
  {
    id: "iv2",
    title: "Burst Balloons",
    subtitle: "Think about the LAST balloon, not the first",
    difficulty: "Hard",
    concept:
      "You have n balloons with values. Bursting balloon i gives you nums[i-1] * nums[i] * nums[i+1] coins (out-of-range = 1). Balloons shift after bursting. Find max coins. The classic trap: try to think about which balloon to burst FIRST. Doesn't work — you lose track of neighbors. The fix: think about which balloon to burst LAST.",
    pattern: "Interval DP (last-to-remove)",
    recurrence: "dp[i][j] = max over k in (i, j): dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j]",
    keyInsight:
      "Genius move: ADD virtual 1s at both ends. Then define dp[i][j] = max coins from bursting balloons STRICTLY BETWEEN i and j (exclusive). If k is the LAST balloon to burst in (i,j), its neighbors ARE nums[i] and nums[j] (because everything else in between is already gone). This neat framing makes the recurrence clean.",
    walkthrough: [
      { step: "Setup", description: "Pad nums with 1 on each end: [1, *nums, 1]" },
      { step: "Define", description: "dp[i][j] = max coins from bursting all balloons in (i, j) — STRICTLY between, not including endpoints" },
      { step: "Transition", description: "If k is the LAST to burst in (i,j): its neighbors are nums[i] and nums[j] (everything else is gone). Gain = nums[i]*nums[k]*nums[j]" },
      { step: "Recursion", description: "Before bursting k, we already burst everything in (i,k) and (k,j). Total: dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j]" },
      { step: "Answer", description: "dp[0][n-1] of the padded array. Fill by length." },
    ],
    task: "Given nums, return max coins from bursting all balloons.",
    functionName: "maxCoins",
    starter: `def maxCoins(nums):
    # Pad with 1s on both ends
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0] * n for _ in range(n)]
    # Fill by interval length (gap between i and j)
    # For each (i, j) with j - i >= 2:
    #   dp[i][j] = max over k in (i, j) of:
    #     dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j]
    pass`,
    hints: [
      "Pad nums with 1 on both sides — simulates the 'out of range = 1' rule",
      "dp[i][j] = max coins from bursting balloons STRICTLY between i and j",
      "Think about which balloon is the LAST to burst in the interval (i, j)",
      "If k bursts last, its neighbors at that moment are nums[i] and nums[j]",
      "Fill by gap size: for gap in range(2, n), for i in range(n-gap), j = i+gap",
    ],
    solution: `def maxCoins(nums):
    nums = [1] + nums + [1]
    n = len(nums)
    dp = [[0] * n for _ in range(n)]
    for gap in range(2, n):
        for i in range(n - gap):
            j = i + gap
            for k in range(i + 1, j):
                coins = nums[i] * nums[k] * nums[j]
                dp[i][j] = max(dp[i][j], dp[i][k] + dp[k][j] + coins)
    return dp[0][n-1]`,
    explanation:
      "The trick is defining dp correctly. If dp[i][j] represents bursting (i,j) with k last, then AT THE MOMENT k bursts, all other balloons in (i,j) are gone — so k's left neighbor is i and right neighbor is j. This lets us compute the coin gain without tracking the rest of the array. Fill smaller intervals first. O(n³) time, O(n²) space.",
    commonMistakes: [
      "Thinking about FIRST balloon to burst — impossible to track shifting neighbors",
      "Forgetting to pad with 1s — essential for the boundary condition",
      "Using dp[i+1][k-1] and dp[k+1][j-1] — wrong because k's neighbors must be i and j",
      "Filling in wrong order — must fill smaller intervals first",
    ],
    interviewWisdom:
      "If the 'first operation' framing doesn't work, try 'last operation'. This is a crucial pattern for interval DP. Candidates who derive the 'last balloon' insight impress interviewers because it shows DP thinking — restructuring the problem until subproblems don't depend on each other. This is a FAANG Hard tier problem.",
    testCases: [
      { input: [[3, 1, 5, 8]], expected: 167, label: "[3,1,5,8] = 167" },
      { input: [[1, 5]], expected: 10, label: "[1,5] = 10" },
      { input: [[5]], expected: 5, label: "single = 5" },
      { input: [[7, 9, 8, 0, 7, 1, 3, 5, 5, 2]], expected: 1654, label: "long = 1654" },
    ],
  },

  // ─── 3. Palindrome Partitioning II ───
  {
    id: "iv3",
    title: "Palindrome Partitioning II",
    subtitle: "Min cuts to split a string into palindromes",
    difficulty: "Hard",
    concept:
      "Given a string, find the minimum cuts needed so that every substring after cutting is a palindrome. \"aab\" → 1 cut (\"aa | b\"). Combines two DPs: an interval DP to identify palindromes + a 1D DP over cut positions. Appears in text-processing interviews.",
    pattern: "Interval DP + 1D Cuts DP",
    recurrence:
      "isPalin[i][j] = (s[i]==s[j]) AND (j-i<2 OR isPalin[i+1][j-1])\ncuts[i] = 0 if s[..i] is palindrome, else min over j: cuts[j-1] + 1 where s[j..i] is palindrome",
    keyInsight:
      "Two-phase DP. Phase 1: precompute isPalin[i][j] for all (i,j) using an interval DP. Phase 2: compute cuts[i] = min cuts for s[..i]. If s[..i] is a palindrome, 0 cuts. Else, try every start j where s[j..i] is a palindrome — then cuts[i] = cuts[j-1] + 1. Combining them keeps overall complexity O(n²).",
    walkthrough: [
      { step: "Phase 1", description: "Build isPalin[i][j]: s[i..j] is a palindrome iff s[i]==s[j] AND (length<=2 OR s[i+1..j-1] is palindrome)" },
      { step: "Fill order", description: "Since isPalin[i][j] depends on isPalin[i+1][j-1], iterate i from n-1 down to 0, j from i up to n-1" },
      { step: "Phase 2", description: "cuts[i] = min cuts for s[0..i]. If the whole s[0..i] is a palindrome, cuts[i] = 0" },
      { step: "Else", description: "Try every j where s[j..i] is a palindrome (use isPalin). Then cuts[i] = min(cuts[i], cuts[j-1] + 1)" },
      { step: "Answer", description: "Return cuts[n-1]" },
    ],
    task: "Return the minimum number of cuts needed for a palindrome partitioning of s.",
    functionName: "minCut",
    starter: `def minCut(s):
    n = len(s)
    # Phase 1: isPalin[i][j] — is s[i..j] a palindrome?
    isPalin = [[False] * n for _ in range(n)]
    # Fill in the right order: i decreasing, j increasing
    # Phase 2: cuts[i] — min cuts for s[:i+1]
    # cuts[i] = 0 if isPalin[0][i] else min over j<=i of cuts[j-1]+1 where isPalin[j][i]
    pass`,
    hints: [
      "Start with isPalin[i][i] = True (single char)",
      "Iterate i from n-1 down to 0, j from i to n-1",
      "isPalin[i][j] = s[i]==s[j] and (j-i<=2 or isPalin[i+1][j-1])",
      "For cuts: if isPalin[0][i], cuts[i] = 0. Else cuts[i] = min(cuts[j-1]+1) for valid j",
      "Return cuts[n-1]",
    ],
    solution: `def minCut(s):
    n = len(s)
    # Phase 1: which substrings are palindromes
    isPalin = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            if s[i] == s[j] and (j - i <= 2 or isPalin[i+1][j-1]):
                isPalin[i][j] = True

    # Phase 2: min cuts
    cuts = [0] * n
    for i in range(n):
        if isPalin[0][i]:
            cuts[i] = 0
        else:
            cuts[i] = i  # upper bound: cut between every char
            for j in range(1, i + 1):
                if isPalin[j][i]:
                    cuts[i] = min(cuts[i], cuts[j-1] + 1)
    return cuts[n-1]`,
    explanation:
      "Phase 1 precomputes all palindrome info in O(n²). Phase 2 is a 1D DP: cuts[i] = fewest cuts for prefix s[..i]. If whole prefix is palindrome, 0 cuts. Otherwise, try every 'last palindrome' starting at position j. The key insight: the last piece must be a palindrome, so use isPalin to check. Total O(n²) time and space.",
    commonMistakes: [
      "Only doing the 1D DP and checking palindromes with a helper — makes it O(n³)",
      "Filling isPalin in wrong order — i must go from n-1 down",
      "Off-by-one in cuts[j-1] when j = 0 — need to handle prefix being palindrome separately",
      "Trying to do it with just expand-around-center — harder to combine with the cuts DP",
    ],
    interviewWisdom:
      "This is a 'combine two DPs' problem. The two-phase approach is the key insight. If you only see one DP, you'll struggle. In interviews, announce 'I'll precompute a palindrome table, then use it to drive a 1D cuts DP.' That framing alone earns partial credit before you write code.",
    testCases: [
      { input: ["aab"], expected: 1, label: "aab = 1" },
      { input: ["a"], expected: 0, label: "a = 0" },
      { input: ["ab"], expected: 1, label: "ab = 1" },
      { input: ["abab"], expected: 1, label: "abab = 1 (a|bab)" },
      { input: ["abcbm"], expected: 2, label: "abcbm = 2" },
    ],
  },

  // ─── 4. Minimum Cost Tree From Leaf Values ───
  {
    id: "iv4",
    title: "Min Cost Tree From Leaf Values",
    subtitle: "Interval DP with a twist — the non-leaf values are maxes",
    difficulty: "Medium",
    concept:
      "Given an array representing leaf values, build a binary tree where each non-leaf equals product of max-of-left-leaves and max-of-right-leaves. Minimize sum of non-leaf values. The split-based interval DP applies: for each subarray, try every split, and account for the root cost at that split.",
    pattern: "Interval DP (split + precompute maxes)",
    recurrence:
      "dp[i][j] = min over k in [i, j): dp[i][k] + dp[k+1][j] + max(arr[i..k]) * max(arr[k+1..j])\nmaxIn[i][j] = precomputed max of arr[i..j]",
    keyInsight:
      "Same split pattern as Matrix Chain, but the 'merge cost' at a split is max(left) * max(right). Precompute maxIn[i][j] so the lookup is O(1). O(n³) total. There's also a monotonic stack O(n) solution but the interval DP is what interviewers expect first.",
    walkthrough: [
      { step: "Precompute", description: "maxIn[i][j] = max of arr[i..j]. Fill by length: maxIn[i][i] = arr[i], maxIn[i][j] = max(maxIn[i][j-1], arr[j])" },
      { step: "Base", description: "dp[i][i] = 0 (leaf, no non-leaf)" },
      { step: "Transition", description: "dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + maxIn[i][k] * maxIn[k+1][j]" },
      { step: "Fill", description: "By length, from 2 to n" },
      { step: "Answer", description: "dp[0][n-1]" },
    ],
    task: "Given array arr, build a tree as described and return the min sum of non-leaf values.",
    functionName: "mctFromLeafValues",
    starter: `def mctFromLeafValues(arr):
    n = len(arr)
    # Precompute max in each range
    maxIn = [[0] * n for _ in range(n)]
    for i in range(n):
        maxIn[i][i] = arr[i]
        for j in range(i+1, n):
            maxIn[i][j] = max(maxIn[i][j-1], arr[j])
    # DP
    dp = [[0] * n for _ in range(n)]
    # Fill by length
    pass`,
    hints: [
      "Precompute maxIn[i][j] so max lookups are O(1)",
      "dp[i][j] = min cost for the subtree over arr[i..j]",
      "Base: dp[i][i] = 0 (single leaf, no internal node)",
      "Try every split k: dp[i][j] = min(dp[i][k] + dp[k+1][j] + maxIn[i][k] * maxIn[k+1][j])",
      "Fill by length, from 2 to n",
    ],
    solution: `def mctFromLeafValues(arr):
    n = len(arr)
    maxIn = [[0] * n for _ in range(n)]
    for i in range(n):
        maxIn[i][i] = arr[i]
        for j in range(i + 1, n):
            maxIn[i][j] = max(maxIn[i][j-1], arr[j])

    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j] + maxIn[i][k] * maxIn[k+1][j])
    return dp[0][n-1]`,
    explanation:
      "Same skeleton as Matrix Chain. The only twist is computing the 'merge cost' at each split: max of the left subarray's leaves times max of the right. Precomputing max tables makes each split O(1). O(n³) time. The monotonic stack solution exploits a greedy observation: small values should be paired with their smallest larger neighbor — but it's not obvious without significant insight.",
    commonMistakes: [
      "Computing max inline in the loop — makes it O(n⁴)",
      "Using min of the subarrays instead of max (read the problem)",
      "Forgetting dp[i][i] = 0 (leaves contribute nothing)",
      "Off-by-one in the split range",
    ],
    interviewWisdom:
      "This problem looks like tree construction but it's pure interval DP. Recognize the 'split into left and right' structure. Mention the O(n) monotonic stack optimization even if you don't implement it — shows you see beyond the obvious solution.",
    testCases: [
      { input: [[6, 2, 4]], expected: 32, label: "[6,2,4] = 32" },
      { input: [[4, 11]], expected: 44, label: "[4,11] = 44" },
      { input: [[15, 13, 5, 3, 15]], expected: 500, label: "5 leaves = 500" },
    ],
  },

  // ─── 5. Stone Game / Optimal Strategy ───
  {
    id: "iv5",
    title: "Optimal Strategy (Stone Game)",
    subtitle: "Min-max interval DP — two-player adversarial",
    difficulty: "Medium",
    concept:
      "Given piles of stones, two players take turns picking the leftmost or rightmost pile. Both play optimally. Can Player 1 win? Alternative: What's the max score difference (P1 - P2)? This introduces MINIMAX reasoning: you maximize, your opponent minimizes. The interval DP pattern handles it cleanly.",
    pattern: "Min-Max Interval DP",
    recurrence:
      "dp[i][j] = max(\n  piles[i] - dp[i+1][j],  // take left, opponent plays optimally on rest\n  piles[j] - dp[i][j-1]   // take right\n)",
    keyInsight:
      "dp[i][j] represents 'max net score the CURRENT player can achieve in interval [i,j]'. After I take, the opponent is the 'current player' — so I subtract their optimal play. piles[i] - dp[i+1][j] means: I gain piles[i], opponent will optimize on [i+1, j], yielding dp[i+1][j] to THEM (so -dp[i+1][j] to me). Beautifully recursive.",
    walkthrough: [
      { step: "State", description: "dp[i][j] = max (my score - opponent's score) over interval [i, j], if it's my turn" },
      { step: "Base", description: "dp[i][i] = piles[i] (single pile, I take it, diff = +piles[i])" },
      { step: "Transition", description: "Two choices: take piles[i] (gain) − dp[i+1][j] (opp best) OR piles[j] − dp[i][j-1]" },
      { step: "Why subtract", description: "Opponent faces [i+1, j] and their dp[i+1][j] is THEIR best net score. From my perspective, their gain is my loss" },
      { step: "Answer", description: "dp[0][n-1] > 0 means I win (Player 1 wins). Fill by length." },
    ],
    task: "Return True if Player 1 wins (gets strictly more stones), False otherwise.",
    functionName: "stoneGame",
    starter: `def stoneGame(piles):
    n = len(piles)
    # dp[i][j] = best score difference (current player - opponent) on piles[i..j]
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = piles[i]
    # Fill by length
    # dp[i][j] = max(piles[i] - dp[i+1][j], piles[j] - dp[i][j-1])
    pass`,
    hints: [
      "dp[i][j] = max score difference current player can achieve on piles[i..j]",
      "Base: dp[i][i] = piles[i]",
      "Fill by increasing length",
      "Two options each turn: take left or take right, opponent then plays optimally on the remainder",
      "Return dp[0][n-1] > 0 (Player 1 has positive score diff → wins)",
    ],
    solution: `def stoneGame(piles):
    n = len(piles)
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        dp[i][i] = piles[i]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = max(
                piles[i] - dp[i+1][j],
                piles[j] - dp[i][j-1]
            )
    return dp[0][n-1] > 0`,
    explanation:
      "The key insight: encode the two-player game as a single DP where dp[i][j] represents the NET SCORE (current player - opponent) assuming both play optimally from [i,j]. When I take piles[i], I gain +piles[i], then face the subgame [i+1, j] where the OPPONENT is now the 'current player'. Their best score on [i+1,j] is dp[i+1][j] — but it's their gain, so it's my loss (hence the minus). This MINIMAX-via-subtraction trick is elegant and generalizes.",
    commonMistakes: [
      "Tracking Player 1 and Player 2 scores separately — unnecessary, just use the difference",
      "Forgetting to subtract the recursive call — that's the whole trick",
      "Trying to handle whose turn it is explicitly — the subtraction implicitly flips it",
      "Taking max of (piles[i] + dp[i+1][j]) which is wrong — you gain your pile, opp gains theirs on the rest",
    ],
    interviewWisdom:
      "This pattern shows up in many game-theory interview questions: Predict the Winner, Can I Win, Stone Game variants. The key insight — encoding two players as a net-difference DP — is a huge 'aha' moment. Interviewers love candidates who derive it. Fun fact: in the original Stone Game problem with even-length arrays, Player 1 always wins because they can force taking all even or all odd indices.",
    testCases: [
      { input: [[5, 3, 4, 5]], expected: true, label: "[5,3,4,5] = True" },
      { input: [[3, 7, 2, 3]], expected: true, label: "[3,7,2,3] = True" },
      { input: [[1, 100, 2, 4]], expected: true, label: "[1,100,2,4] = True" },
    ],
  },
];

interface Props {
  onBack: () => void;
  onLessonComplete?: (lessonId: string) => void;
}

export default function IntervalDPTrainer({ onBack, onLessonComplete }: Props) {
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
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -mx-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">⏏️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Interval DP Masterclass</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">The "split an interval" pattern — 5 Hard DP problems made tractable</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Lesson {idx + 1} of {total}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lesson.difficulty === "Hard" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}`}>
            {lesson.difficulty}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-semibold">{lesson.pattern}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div className="space-y-5" key={lesson.id}>
        {/* Title + Concept */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">{lesson.subtitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{lesson.concept}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recurrence</p>
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lesson.recurrence}</pre>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2">💡 Key Insight</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{lesson.keyInsight}</p>
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
        <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200 dark:border-fuchsia-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-400 uppercase tracking-wider mb-2">💎 Interview Wisdom</p>
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
