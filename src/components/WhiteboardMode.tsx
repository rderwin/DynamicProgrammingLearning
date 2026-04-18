import { useState } from "react";

interface WhiteboardStep {
  question: string;
  hint: string;
  expectedAnswer: string;
  keyPoints: string[];
}

interface WhiteboardProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  problem: string;
  example: string;
  steps: WhiteboardStep[];
  finalCode: string;
  wrapUp: string;
}

const problems: WhiteboardProblem[] = [
  {
    id: "wb-climb",
    title: "Climbing Stairs",
    difficulty: "Easy",
    problem: "You can climb 1 or 2 steps at a time. Given n stairs, how many distinct ways can you reach the top?",
    example: "n=3 → 3 ways: (1,1,1), (1,2), (2,1)",
    steps: [
      {
        question: "1. Brute force approach. What's the naive recursion?",
        hint: "At each step, you have 2 choices: climb 1 or climb 2. Recurse on remaining.",
        expectedAnswer: "f(n) = f(n-1) + f(n-2), base: f(0) = 1, f(1) = 1. Tree of recursive calls has exponential size.",
        keyPoints: ["Recursion branches on each step", "Overlapping subproblems (f(5) computes f(3) many times)", "Time: O(2^n)"],
      },
      {
        question: "2. What's the state? What does dp[i] represent?",
        hint: "In DP, 'state' is the minimum info you need to solve a subproblem.",
        expectedAnswer: "dp[i] = number of distinct ways to reach step i. State is just the current step index.",
        keyPoints: ["1D state (just the step)", "Why 1D? At step i, past doesn't matter — only the counts"],
      },
      {
        question: "3. Base cases?",
        hint: "What are the smallest inputs you can answer directly?",
        expectedAnswer: "dp[0] = 1 (one way to stay put) or dp[1] = 1. Or depending on how you define: dp[1]=1, dp[2]=2.",
        keyPoints: ["dp[1] = 1: one way to reach step 1 (single step of 1)", "dp[2] = 2: either (1,1) or (2)"],
      },
      {
        question: "4. Recurrence?",
        hint: "From step i, you could have arrived from i-1 or i-2. Sum their counts.",
        expectedAnswer: "dp[i] = dp[i-1] + dp[i-2]",
        keyPoints: ["From i-1: add one step of 1", "From i-2: add one step of 2", "Paths are DISJOINT, so we SUM"],
      },
      {
        question: "5. Time & space complexity of the DP?",
        hint: "How many states? How many transitions per state?",
        expectedAnswer: "Time: O(n) — each dp[i] filled in O(1). Space: O(n) — can be O(1) with two variables.",
        keyPoints: ["O(n) states, O(1) work each", "Space-optimizable to O(1) since only last 2 values matter"],
      },
    ],
    finalCode: `def climbStairs(n):
    if n <= 2: return n
    a, b = 1, 2  # dp[1], dp[2]
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
    wrapUp: "This is Fibonacci in disguise. The O(1)-space version is the interview-preferred form. Always mention space optimization after the basic DP.",
  },
  {
    id: "wb-lis",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    problem: "Find the length of the longest strictly increasing subsequence. (Subsequence: pick elements keeping order, don't need to be contiguous.)",
    example: "[10,9,2,5,3,7,101,18] → 4 (e.g., [2,3,7,18])",
    steps: [
      {
        question: "1. Brute force. What's the most naive approach?",
        hint: "Try every subset of the array. Check if increasing. Track max length.",
        expectedAnswer: "Generate all 2^n subsets. For each, check if increasing. Track max length. O(2^n · n).",
        keyPoints: ["Exponential", "Would time out for n > 20", "Good warmup — shows the problem space"],
      },
      {
        question: "2. State for the DP?",
        hint: "What's the minimum info needed? Think: 'what's the LIS ending at index i?'",
        expectedAnswer: "dp[i] = length of LIS ending AT index i (with nums[i] as the last element).",
        keyPoints: ["Anchoring on 'ending at i' makes states independent", "Answer is max of dp[i], not dp[n-1]"],
      },
      {
        question: "3. Base case?",
        hint: "Every single element is an LIS of length 1.",
        expectedAnswer: "dp[i] = 1 for all i, initially.",
        keyPoints: ["Every element starts as a length-1 subsequence of itself"],
      },
      {
        question: "4. Recurrence?",
        hint: "To extend LIS ending at i, look at all j < i. If nums[j] < nums[i], we can extend dp[j] by adding nums[i].",
        expectedAnswer: "dp[i] = max(dp[j] + 1) for all j < i where nums[j] < nums[i]. Default 1 if no such j.",
        keyPoints: ["Inner loop over j < i", "Only update when increasing order respected", "Track overall max"],
      },
      {
        question: "5. Complexity?",
        hint: "Outer loop × inner loop.",
        expectedAnswer: "Time: O(n²). Space: O(n).",
        keyPoints: ["O(n²) is acceptable for n up to ~10,000", "For faster: O(n log n) with bisect on tails array"],
      },
      {
        question: "6. Can we do better?",
        hint: "There's a clever O(n log n) approach using binary search.",
        expectedAnswer: "Maintain a 'tails' array where tails[i] = smallest ending value of any increasing subseq of length i+1. For each num, bisect_left to find where it fits. Extend or replace.",
        keyPoints: ["tails is NOT the LIS — just its length is correct", "bisect_left is critical (bisect_right allows duplicates)", "O(n log n) overall"],
      },
    ],
    finalCode: `# O(n^2)
def lengthOfLIS(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

# O(n log n)
from bisect import bisect_left
def lengthOfLIS_fast(nums):
    tails = []
    for num in nums:
        idx = bisect_left(tails, num)
        if idx == len(tails):
            tails.append(num)
        else:
            tails[idx] = num
    return len(tails)`,
    wrapUp: "Start with O(n²) — it shows you understand DP. Then mention O(n log n) using bisect as a follow-up. THAT sequence is what interviewers want to see.",
  },
  {
    id: "wb-coin",
    title: "Coin Change (Fewest Coins)",
    difficulty: "Medium",
    problem: "Given coins of different denominations and a target amount, return the FEWEST coins needed to make that amount. -1 if impossible. Each coin has unlimited supply.",
    example: "coins=[1,2,5], amount=11 → 3 (5+5+1)",
    steps: [
      {
        question: "1. Is greedy going to work?",
        hint: "Always taking the largest coin?",
        expectedAnswer: "NO. Counter-example: coins=[1,3,4], amount=6. Greedy: 4+1+1 = 3 coins. Optimal: 3+3 = 2 coins.",
        keyPoints: ["Greedy fails when denominations aren't 'canonical'", "Always test your greedy intuition with adversarial examples"],
      },
      {
        question: "2. State?",
        hint: "What's the minimum info needed to solve a subproblem?",
        expectedAnswer: "dp[a] = fewest coins to make amount a.",
        keyPoints: ["1D state (the amount)", "Coin index isn't needed since coins are unbounded"],
      },
      {
        question: "3. Base case?",
        hint: "What's the answer for the smallest input?",
        expectedAnswer: "dp[0] = 0 (zero coins needed to make 0).",
        keyPoints: ["dp[0] = 0 is the anchor", "Initialize rest to infinity (or some large sentinel)"],
      },
      {
        question: "4. Recurrence?",
        hint: "To make amount a, consider each coin c. If I use it, I still need amount a-c.",
        expectedAnswer: "dp[a] = 1 + min(dp[a - c]) for each coin c where c <= a.",
        keyPoints: ["For each amount, try every coin", "1 + min of the remaining amounts", "If no valid coin, dp[a] stays infinity"],
      },
      {
        question: "5. Complexity?",
        hint: "Two nested loops: amount and coins.",
        expectedAnswer: "Time: O(amount · len(coins)). Space: O(amount).",
        keyPoints: ["Pseudo-polynomial — depends on the VALUE, not just input size"],
      },
    ],
    finalCode: `def coinChange(coins, amount):
    INF = float('inf')
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1`,
    wrapUp: "Coin Change is UNBOUNDED knapsack. Compare to 0/1 knapsack where you iterate coins in outer loop, amount in REVERSE. Here, amount outer, coins inner — both forward.",
  },
  {
    id: "wb-edit",
    title: "Edit Distance",
    difficulty: "Hard",
    problem: "Given two words, find min operations to transform word1 into word2. Allowed ops: insert, delete, replace.",
    example: "\"horse\" → \"ros\" = 3 ops",
    steps: [
      {
        question: "1. State?",
        hint: "Two strings → often 2D state.",
        expectedAnswer: "dp[i][j] = min ops to transform word1[:i] into word2[:j].",
        keyPoints: ["2D: one dimension per string", "Prefixes are cleaner than suffixes here"],
      },
      {
        question: "2. Base cases?",
        hint: "What if one string is empty?",
        expectedAnswer: "dp[i][0] = i (delete all i chars). dp[0][j] = j (insert all j chars).",
        keyPoints: ["Base row/col are the 'degenerate' case", "CRITICAL — missing this breaks everything"],
      },
      {
        question: "3. Recurrence when characters match?",
        hint: "If word1[i-1] == word2[j-1], the last char is 'free'.",
        expectedAnswer: "dp[i][j] = dp[i-1][j-1] when chars match. No op needed for this position.",
        keyPoints: ["Matching chars = free move", "Reduces to the prefix-without-this-char problem"],
      },
      {
        question: "4. Recurrence when chars DON'T match?",
        hint: "Three operations to consider.",
        expectedAnswer: "dp[i][j] = 1 + min(dp[i-1][j-1] REPLACE, dp[i-1][j] DELETE, dp[i][j-1] INSERT).",
        keyPoints: ["+1 for the op we just did", "DELETE from word1: skip a char in word1 (dp[i-1][j])", "INSERT into word1: pretend we added word2[j-1] (dp[i][j-1])", "REPLACE: match word1[i-1] to word2[j-1] (dp[i-1][j-1])"],
      },
      {
        question: "5. Complexity?",
        hint: "Grid of states, O(1) per cell.",
        expectedAnswer: "Time: O(m·n). Space: O(m·n), reducible to O(min(m,n)).",
        keyPoints: ["Two-row rolling array is the typical optimization"],
      },
    ],
    finalCode: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j-1],  # replace
                    dp[i-1][j],    # delete
                    dp[i][j-1]     # insert
                )
    return dp[m][n]`,
    wrapUp: "Edit Distance is probably the hardest 'beginner 2D DP' you'll get in an interview. The 3-operation recurrence requires clear thinking. Practice drawing the table for small inputs.",
  },
  {
    id: "wb-rob",
    title: "House Robber",
    difficulty: "Medium",
    problem: "Houses in a row. You can't rob two adjacent houses. Maximize the total amount robbed.",
    example: "[2,7,9,3,1] → 12 (rob 2,9,1)",
    steps: [
      {
        question: "1. What's the decision at each house?",
        hint: "Two options per house.",
        expectedAnswer: "Rob it (can't take i-1, must add i-2's answer) OR skip it (take i-1's answer).",
        keyPoints: ["Binary decision per house", "Taking/not taking creates two recursion branches"],
      },
      {
        question: "2. State?",
        hint: "What info about past decisions matters for future choices?",
        expectedAnswer: "dp[i] = max amount robbable from first i+1 houses.",
        keyPoints: ["1D state on house index", "Past beyond (i-2) doesn't matter"],
      },
      {
        question: "3. Base cases?",
        hint: "Smallest inputs.",
        expectedAnswer: "dp[0] = nums[0]. dp[1] = max(nums[0], nums[1]).",
        keyPoints: ["With 1 house, rob it", "With 2 houses, rob the richer one"],
      },
      {
        question: "4. Recurrence?",
        hint: "For each house, the two options.",
        expectedAnswer: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Skip or rob-with-penalty.",
        keyPoints: ["Skip: dp[i-1]", "Rob: dp[i-2] + nums[i] — can't add to i-1"],
      },
      {
        question: "5. Space optimization?",
        hint: "What do you actually need to remember?",
        expectedAnswer: "Only last two values. Use two variables, prev2 and prev1.",
        keyPoints: ["O(1) space", "Classic 'rolling window' DP"],
      },
    ],
    finalCode: `def rob(nums):
    if not nums: return 0
    if len(nums) == 1: return nums[0]
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
    return prev1`,
    wrapUp: "House Robber's 1D pattern generalizes to: adjacency-constrained subset max. Variants: House Robber II (circular), Delete & Earn, Decode Ways.",
  },
];

interface Props {
  onBack: () => void;
}

export default function WhiteboardMode({ onBack }: Props) {
  const [problemIdx, setProblemIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const problem = problems[problemIdx];
  const step = problem.steps[stepIdx];

  function reveal() {
    const updated = [...revealed];
    updated[stepIdx] = true;
    setRevealed(updated);
  }

  function next() {
    if (stepIdx < problem.steps.length - 1) {
      setStepIdx((i) => i + 1);
      setUserAnswer("");
      setHintShown(false);
    } else {
      setFinished(true);
    }
  }

  function selectProblem(i: number) {
    setProblemIdx(i);
    setStepIdx(0);
    setUserAnswer("");
    setRevealed([]);
    setFinished(false);
    setHintShown(false);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Whiteboard Mode</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Sketch your approach before coding — the interview discipline that wins</p>
      </div>

      {/* Problem selector */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Choose a problem</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {problems.map((p, i) => {
            const diffColor =
              p.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : p.difficulty === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
            return (
              <button
                key={p.id}
                onClick={() => selectProblem(i)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  problemIdx === i
                    ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${diffColor}`}>{p.difficulty}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.problem}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem display */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{problem.title}</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{problem.problem}</p>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Example</p>
          <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{problem.example}</code>
        </div>
      </div>

      {!finished ? (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Step {stepIdx + 1} of {problem.steps.length}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-slate-600 to-slate-800 rounded-full transition-all duration-500" style={{ width: `${((stepIdx + 1) / problem.steps.length) * 100}%` }} />
          </div>

          {/* Question */}
          <div key={`${problem.id}-${stepIdx}`} className="space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">🖊 Step {stepIdx + 1}</p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{step.question}</h4>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here… Think it through before revealing."
                rows={4}
                disabled={revealed[stepIdx]}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
              />
            </div>

            {/* Hint toggle */}
            {!hintShown && !revealed[stepIdx] && (
              <div className="text-center">
                <button onClick={() => setHintShown(true)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  💡 Need a hint?
                </button>
              </div>
            )}
            {hintShown && !revealed[stepIdx] && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 animate-fade-in">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">💡 Hint</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{step.hint}</p>
              </div>
            )}

            {/* Reveal */}
            {revealed[stepIdx] && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 animate-fade-in">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">✅ Expected Answer</p>
                <p className="text-sm text-slate-800 dark:text-slate-100 font-medium mb-3">{step.expectedAnswer}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Key points</p>
                <ul className="space-y-1">
                  {step.keyPoints.map((kp) => (
                    <li key={kp} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              {!revealed[stepIdx] ? (
                <button onClick={reveal} className="px-5 py-2 bg-slate-600 dark:bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all">
                  Reveal answer
                </button>
              ) : (
                <button onClick={next} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
                  {stepIdx < problem.steps.length - 1 ? "Next step" : "See the code"}
                  <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">Whiteboard complete!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Now that you've sketched the whole approach, the code is trivial.</p>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400 ml-2">solution.py</span>
            </div>
            <pre className="text-xs text-emerald-300 font-mono p-5 overflow-x-auto whitespace-pre-wrap">{problem.finalCode}</pre>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-2">💎 Wrap-up</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{problem.wrapUp}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => selectProblem(problemIdx)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              Try again
            </button>
            {problemIdx < problems.length - 1 && (
              <button onClick={() => selectProblem(problemIdx + 1)} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
                Next problem
                <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
