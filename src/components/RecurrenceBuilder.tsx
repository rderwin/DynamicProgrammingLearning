import { useState } from "react";

interface Step {
  question: string;
  hint?: string;
  options: { label: string; correct: boolean; explanation: string }[];
}

interface Problem {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  finalRecurrence: string;
  code: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const problems: Problem[] = [
  {
    id: "r1",
    title: "Climbing Stairs",
    description: "You can climb 1 or 2 steps at a time. Count ways to reach step n.",
    difficulty: "Easy",
    steps: [
      {
        question: "Step 1: What's the BASE case?",
        hint: "How many ways to reach step 0? Step 1?",
        options: [
          { label: "dp[0] = 0, dp[1] = 0", correct: false, explanation: "If there's 0 ways to start, there's 0 ways to everything. We need a non-zero base." },
          { label: "dp[0] = 1, dp[1] = 1", correct: true, explanation: "1 way to 'be' at step 0 (do nothing). 1 way to reach step 1 (one 1-step). Both are 'starting point' semantics." },
          { label: "dp[0] = 0, dp[1] = 1", correct: false, explanation: "If dp[0]=0, then dp[2] = dp[1] + dp[0] = 1, but there are actually 2 ways to reach step 2 (1+1 or 2)." },
          { label: "dp[0] = 1, dp[1] = 2", correct: false, explanation: "There's only 1 way to reach step 1: take one 1-step. You can't do '2 steps' when you haven't even started." },
        ],
      },
      {
        question: "Step 2: For step n ≥ 2, where could you have COME FROM?",
        hint: "You can take 1 or 2 steps. What was your previous position?",
        options: [
          { label: "Only from step n-1 (always take 1 step)", correct: false, explanation: "That ignores the 2-step option. You can also arrive by jumping 2 steps." },
          { label: "Either from step n-1 (took 1) or step n-2 (took 2)", correct: true, explanation: "Exactly — the two choices define the two predecessor states." },
          { label: "From step 0, taking n steps at once", correct: false, explanation: "You can only take 1 or 2 steps at a time, not n." },
          { label: "From every earlier step", correct: false, explanation: "Only the two immediately previous steps, since jumps are at most 2." },
        ],
      },
      {
        question: "Step 3: How do you combine the predecessors?",
        hint: "Total ways to reach n = ways via one path + ways via another path.",
        options: [
          { label: "dp[n] = max(dp[n-1], dp[n-2])", correct: false, explanation: "max is for optimization problems. This is a COUNTING problem — we sum." },
          { label: "dp[n] = dp[n-1] + dp[n-2]", correct: true, explanation: "Sum! Every way to reach n-1 gives a distinct way to reach n (then +1 step). Same for n-2." },
          { label: "dp[n] = dp[n-1] × dp[n-2]", correct: false, explanation: "Multiplication would double-count. The paths are disjoint (different last step), so we add." },
          { label: "dp[n] = dp[n-1] - dp[n-2]", correct: false, explanation: "Subtraction makes no sense for counting. Each previous state contributes NEW ways, we add them." },
        ],
      },
    ],
    finalRecurrence: "dp[n] = dp[n-1] + dp[n-2]   for n ≥ 2\ndp[0] = 1, dp[1] = 1",
    code: `def climbStairs(n):
    if n <= 1: return 1
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
  },
  {
    id: "r2",
    title: "Coin Change (Minimum Coins)",
    description: "Given coins [1, 3, 4] and amount, find min coins to make amount.",
    difficulty: "Medium",
    steps: [
      {
        question: "Step 1: What should dp[amount] represent?",
        hint: "We want the 'best' answer for each sub-amount.",
        options: [
          { label: "Number of ways to make the amount", correct: false, explanation: "That's Coin Change II. This problem asks for MINIMUM coins." },
          { label: "Minimum coins to make exactly this amount", correct: true, explanation: "Yes — dp[amount] = min coins. This matches what we ultimately want to return: dp[target]." },
          { label: "Whether the amount is achievable", correct: false, explanation: "Boolean is for 'partition' problems. Here we want a NUMBER (min coins)." },
          { label: "The largest coin used", correct: false, explanation: "Track coin usage is the wrong metric — we care about the count." },
        ],
      },
      {
        question: "Step 2: What's the BASE case?",
        hint: "How many coins to make amount 0?",
        options: [
          { label: "dp[0] = 0", correct: true, explanation: "Zero coins needed to make zero. This is the foundation everything builds on." },
          { label: "dp[0] = 1", correct: false, explanation: "That would say 'need 1 coin to make 0', which is nonsensical." },
          { label: "dp[0] = infinity", correct: false, explanation: "infinity means 'impossible' — but amount 0 is achievable with 0 coins." },
          { label: "dp[0] = 1 (for every coin option)", correct: false, explanation: "Overcomplicated — 0 needs 0 coins regardless of which coins you have." },
        ],
      },
      {
        question: "Step 3: For amount > 0, what's the transition?",
        hint: "If you use coin c as your LAST coin, what's left to make?",
        options: [
          { label: "dp[amount] = min(dp[amount - c] + 1) for each coin c where amount >= c", correct: true, explanation: "Exactly. For each coin we could use last, the remaining subproblem is dp[amount-c], plus 1 (for the coin we just used). Take min over all coin choices." },
          { label: "dp[amount] = sum(dp[amount - c]) for each coin c", correct: false, explanation: "Sum gives total ways (Coin Change II). We want the min count." },
          { label: "dp[amount] = min(dp[amount - c]) for each coin", correct: false, explanation: "Close — but missing the +1 for the coin you just used!" },
          { label: "dp[amount] = dp[amount - 1] + 1", correct: false, explanation: "Only considers using the smallest coin. We need to try ALL coins and pick the best." },
        ],
      },
      {
        question: "Step 4: What if no combination works?",
        hint: "What should dp[amount] be if amount is unreachable?",
        options: [
          { label: "Return 0", correct: false, explanation: "0 means 'solved with 0 coins', which is wrong. Amount>0 can't be made with 0 coins." },
          { label: "Initialize to infinity, check at the end, return -1 if still infinity", correct: true, explanation: "Use float('inf') as sentinel. After filling dp, if dp[target] is still infinity, return -1." },
          { label: "Initialize to -1, skip if -1", correct: false, explanation: "Then min(dp[amount-c]+1) would give weird results when dp[amount-c] = -1." },
          { label: "Throw an error", correct: false, explanation: "The problem specifies returning -1 for unreachable." },
        ],
      },
    ],
    finalRecurrence: "dp[amount] = min(dp[amount - c] + 1) for each coin c\ndp[0] = 0\nReturn dp[target] if not infinity, else -1",
    code: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for c in coins:
            if i >= c:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
  },
  {
    id: "r3",
    title: "House Robber",
    description: "Houses in a row. Can't rob adjacent houses. Max money?",
    difficulty: "Medium",
    steps: [
      {
        question: "Step 1: For house i, what are your choices?",
        hint: "You're deciding about THIS house.",
        options: [
          { label: "Always rob it", correct: false, explanation: "Greedy fails here. Sometimes skipping is better (e.g., rob a later, bigger house)." },
          { label: "Rob it or skip it", correct: true, explanation: "Classic include/exclude. Two choices at each house." },
          { label: "Rob it, or rob the next one", correct: false, explanation: "Not quite — you're not forced to rob the next one either." },
          { label: "Rob every other house", correct: false, explanation: "[1, 100, 1, 100] shows this fails. Sometimes consecutive skips are optimal." },
        ],
      },
      {
        question: "Step 2: If you ROB house i, what's your max?",
        hint: "If you rob i, you can't rob i-1. So what CAN you add?",
        options: [
          { label: "dp[i] = nums[i] + dp[i-1]", correct: false, explanation: "Violates the constraint! Can't rob adjacent houses (i and i-1)." },
          { label: "dp[i] = nums[i] + dp[i-2]", correct: true, explanation: "Take nums[i], plus the best you could do with houses up to i-2 (skipping i-1)." },
          { label: "dp[i] = nums[i] only", correct: false, explanation: "Misses the earlier houses you could still include." },
          { label: "dp[i] = nums[i] + max of all earlier dp", correct: false, explanation: "Overcomplicated. dp[i-2] already handles the best of all earlier options because it was itself a max." },
        ],
      },
      {
        question: "Step 3: What's the full recurrence?",
        hint: "Combine 'rob' and 'skip' choices.",
        options: [
          { label: "dp[i] = max(dp[i-1], nums[i] + dp[i-2])", correct: true, explanation: "max of SKIP (dp[i-1] — best up to previous house) and ROB (nums[i] + dp[i-2]). This is the core House Robber recurrence." },
          { label: "dp[i] = dp[i-1] + nums[i]", correct: false, explanation: "Always robs — violates the adjacency rule." },
          { label: "dp[i] = min(dp[i-1], nums[i] + dp[i-2])", correct: false, explanation: "We want MAX money, not min." },
          { label: "dp[i] = dp[i-1] + dp[i-2]", correct: false, explanation: "Ignores nums[i] entirely. We need to consider the value of the current house." },
        ],
      },
    ],
    finalRecurrence: "dp[i] = max(dp[i-1], nums[i] + dp[i-2])\ndp[0] = nums[0]\ndp[1] = max(nums[0], nums[1])",
    code: `def rob(nums):
    if not nums: return 0
    if len(nums) == 1: return nums[0]
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    for i in range(2, len(nums)):
        prev2, prev1 = prev1, max(prev1, nums[i] + prev2)
    return prev1`,
  },
];

interface Props {
  onBack: () => void;
}

export default function RecurrenceBuilder({ onBack }: Props) {
  const [problemIdx, setProblemIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const problem = problems[problemIdx];
  const step = problem.steps[stepIdx];
  const totalSteps = problem.steps.length;

  function checkAnswer() {
    if (selected === null) return;
    setRevealed(true);
  }

  function nextStep() {
    if (stepIdx < totalSteps - 1) {
      setStepIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  }

  function nextProblem() {
    if (problemIdx < problems.length - 1) {
      setProblemIdx((i) => i + 1);
      setStepIdx(0);
      setSelected(null);
      setRevealed(false);
      setFinished(false);
    }
  }

  function previousProblem() {
    if (problemIdx > 0) {
      setProblemIdx((i) => i - 1);
      setStepIdx(0);
      setSelected(null);
      setRevealed(false);
      setFinished(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🔬</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Recurrence Builder</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Derive DP recurrences step by step — the second-hardest DP skill</p>
      </div>

      {/* Problem nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={previousProblem} disabled={problemIdx === 0} className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">← Previous problem</button>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Problem {problemIdx + 1} of {problems.length}</span>
        <button onClick={nextProblem} disabled={problemIdx === problems.length - 1} className="text-xs text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed">Next problem →</button>
      </div>

      {/* Problem context */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{problem.title}</h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${problem.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : problem.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{problem.difficulty}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{problem.description}</p>
      </div>

      {!finished ? (
        <>
          {/* Step progress */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all" style={{ width: `${((stepIdx + (revealed ? 1 : 0)) / totalSteps) * 100}%` }} />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6" key={`${problem.id}-${stepIdx}`}>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{step.question}</p>
            {step.hint && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-4">💡 {step.hint}</p>
            )}

            <div className="space-y-2">
              {step.options.map((opt, i) => {
                let cls = "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600";
                if (revealed) {
                  if (opt.correct) cls = "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40";
                  else if (i === selected) cls = "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40";
                  else cls = "border-slate-200 dark:border-slate-700 opacity-50";
                } else if (i === selected) {
                  cls = "border-pink-400 dark:border-pink-600 bg-pink-50 dark:bg-pink-950/40 ring-1 ring-pink-400/30";
                }
                return (
                  <button key={i} onClick={() => !revealed && setSelected(i)} disabled={revealed}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${cls}`}
                  >
                    <p className="text-sm font-mono text-slate-700 dark:text-slate-300">{opt.label}</p>
                    {revealed && (i === selected || opt.correct) && (
                      <p className={`text-xs mt-1 ${opt.correct ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {opt.explanation}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-4">
              {!revealed ? (
                <button onClick={checkAnswer} disabled={selected === null} className="px-5 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Check</button>
              ) : (
                <button onClick={nextStep} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-all">
                  {stepIdx < totalSteps - 1 ? "Next step" : "See recurrence"}
                  <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
            <span className="text-3xl">🎉</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 mb-3">You derived the recurrence!</h3>
            <div className="bg-[#1e1e2e] rounded-lg p-4 mb-4">
              <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap">{problem.finalRecurrence}</pre>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full implementation</p>
            <div className="bg-[#1e1e2e] rounded-lg p-4">
              <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{problem.code}</pre>
            </div>
          </div>
          {problemIdx < problems.length - 1 && (
            <div className="text-center">
              <button onClick={nextProblem} className="group px-5 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 transition-all">
                Try next problem
                <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
