import { useState } from "react";

interface StateChallenge {
  id: string;
  problem: string;
  question: string;
  options: { label: string; description: string }[];
  correctIndex: number;
  explanation: string;
  bonusInsight: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const challenges: StateChallenge[] = [
  {
    id: "s1",
    problem: "Climbing Stairs: You can climb 1 or 2 steps at a time. How many ways to reach step n?",
    question: "What's the state?",
    options: [
      { label: "dp[n] = number of ways to reach step n", description: "1D state indexed by step" },
      { label: "dp[i][j] = number of ways with i 1-steps and j 2-steps", description: "2D: track both step types" },
      { label: "dp[n][k] = ways to reach n using at most k total steps", description: "2D with step limit" },
      { label: "dp[n] = total steps taken to reach n", description: "Counts steps, not ways" },
    ],
    correctIndex: 0,
    explanation: "dp[n] captures everything you need: the number of ways to reach step n. The transitions: dp[n] = dp[n-1] + dp[n-2] (came from 1 step back or 2 steps back).",
    bonusInsight: "The state is 1D because 'where you are' (step n) is the only thing that matters. How you got there doesn't affect future choices.",
    difficulty: "Easy",
  },
  {
    id: "s2",
    problem: "Coin Change: Given coins = [1, 2, 5], find the min coins to make amount. Each coin can be used unlimited times.",
    question: "What's the state?",
    options: [
      { label: "dp[amount] = min coins to make amount", description: "1D, just the remaining amount" },
      { label: "dp[i][amount] = min coins using first i coins", description: "2D, coin index + amount" },
      { label: "dp[coin][amount] = ways using this specific coin", description: "2D, specific coin tracked" },
      { label: "dp[amount][remaining coins] = ways", description: "2D with coin supply" },
    ],
    correctIndex: 0,
    explanation: "1D state: dp[amount] = min coins. Transition: dp[amount] = min(dp[amount - coin] + 1) over all coins. Since coins are unlimited, we don't need to track which we've used.",
    bonusInsight: "If coins were LIMITED to one of each (0/1 knapsack style), you'd need 2D: dp[i][amount] to track which coins are still available.",
    difficulty: "Easy",
  },
  {
    id: "s3",
    problem: "0/1 Knapsack: Given items with weights and values, and a capacity W. Each item used at most ONCE. Max value?",
    question: "What's the state?",
    options: [
      { label: "dp[capacity] = max value at this capacity", description: "1D only, no item tracking" },
      { label: "dp[i][w] = max value using first i items with capacity w", description: "2D: item index + capacity" },
      { label: "dp[item] = max value if we take this item", description: "1D, one per item" },
      { label: "dp[value] = min capacity needed", description: "Reversed: value → capacity" },
    ],
    correctIndex: 1,
    explanation: "2D state: dp[i][w] tracks both which items are available AND remaining capacity. Transition: either take item i (if it fits) or skip it.",
    bonusInsight: "You CAN compress this to 1D with reverse iteration (the classic trick) — but conceptually, it IS 2D. In interviews, start with 2D, then optimize space.",
    difficulty: "Medium",
  },
  {
    id: "s4",
    problem: "Edit Distance: Convert string s1 to s2 using insert/delete/replace. Min operations?",
    question: "What's the state?",
    options: [
      { label: "dp[i] = min edits using first i chars of s1", description: "1D on s1 only" },
      { label: "dp[i][j] = min edits between s1[0..i] and s2[0..j]", description: "2D: both string prefixes" },
      { label: "dp[i] = min edits to get s2 matching s1[i]", description: "1D, s1 indexed" },
      { label: "dp[op] = min ops of type op needed", description: "Indexed by operation type" },
    ],
    correctIndex: 1,
    explanation: "2D state: dp[i][j] = min edits to turn first i chars of s1 into first j chars of s2. Transitions handle insert/delete/replace cases.",
    bonusInsight: "Whenever you have TWO sequences to process together (strings, arrays), you almost always need 2D state — one index per sequence.",
    difficulty: "Medium",
  },
  {
    id: "s5",
    problem: "House Robber II: Houses in a CIRCLE (last and first are adjacent). Can't rob adjacent. Max money?",
    question: "What's the state?",
    options: [
      { label: "dp[i] = max from house 0..i (like House Robber I)", description: "Simple 1D, ignores circle" },
      { label: "dp[i][robbed_first] = max with/without robbing first", description: "2D, tracks first-house decision" },
      { label: "Max of two runs: rob houses 0..n-2 OR 1..n-1", description: "Two separate 1D DPs" },
      { label: "dp[i][j] = max from window i..j", description: "2D window" },
    ],
    correctIndex: 2,
    explanation: "Trick: the circle constraint means you can't rob BOTH house 0 AND house n-1. So run House Robber I on [0..n-2] and [1..n-1] separately, take the max.",
    bonusInsight: "When a problem has a 'special constraint' on boundary elements, consider splitting into subproblems that handle each case cleanly.",
    difficulty: "Hard",
  },
  {
    id: "s6",
    problem: "Unique Paths: m×n grid, move only right or down. How many paths from top-left to bottom-right?",
    question: "What's the state?",
    options: [
      { label: "dp[i][j] = number of paths to cell (i,j)", description: "2D grid state" },
      { label: "dp[i+j] = paths after i+j moves", description: "1D by total moves" },
      { label: "dp[direction] = paths ending with that direction", description: "2 states for R/D" },
      { label: "dp[i] = paths ending at row i", description: "1D by row" },
    ],
    correctIndex: 0,
    explanation: "2D grid problems → 2D state. dp[i][j] = dp[i-1][j] + dp[i][j-1] (came from above or from left).",
    bonusInsight: "Can optimize to O(n) space using 1D dp — only need previous row. But state is still fundamentally 2D.",
    difficulty: "Easy",
  },
  {
    id: "s7",
    problem: "Longest Palindromic Subsequence: Longest subseq that reads same forwards/backwards.",
    question: "What's the state?",
    options: [
      { label: "dp[i] = longest palindrome ending at i", description: "1D ending position" },
      { label: "dp[i][j] = longest palindromic subseq in s[i..j]", description: "2D: range (start, end)" },
      { label: "dp[len] = longest palindrome of length len", description: "1D by length" },
      { label: "dp[left][right] = whether s[left..right] is palindrome", description: "Boolean 2D" },
    ],
    correctIndex: 1,
    explanation: "2D range DP: dp[i][j] = LPS in substring s[i..j]. If s[i] == s[j]: dp[i][j] = dp[i+1][j-1] + 2. Else: max(dp[i+1][j], dp[i][j-1]).",
    bonusInsight: "Palindrome problems almost always need 2D state over RANGES (i, j), not indices. Key insight: inner subproblems depend on outer.",
    difficulty: "Medium",
  },
  {
    id: "s8",
    problem: "Best Time to Buy/Sell Stock with Cooldown: After selling, must wait 1 day before buying again. Max profit?",
    question: "What's the state?",
    options: [
      { label: "dp[i] = max profit on day i", description: "1D, just the day" },
      { label: "dp[i][holding] = max profit on day i if holding/not holding", description: "2D: day + position" },
      { label: "dp[i][day_since_sell] = max profit", description: "2D: day + cooldown tracker" },
      { label: "dp[buy][sell] = max over buy/sell pair", description: "2D: specific day pair" },
    ],
    correctIndex: 1,
    explanation: "2D: dp[i][0] = max profit on day i NOT holding, dp[i][1] = max profit on day i HOLDING. Transitions encode the cooldown.",
    bonusInsight: "When you have STATES beyond 'position' (holding stock? in cooldown? number of transactions left?), add them as extra dimensions.",
    difficulty: "Hard",
  },
  {
    id: "s9",
    problem: "Partition Equal Subset Sum: Can array be split into two subsets with equal sum?",
    question: "What's the state?",
    options: [
      { label: "dp[i] = sum of first i elements", description: "Just accumulates sum" },
      { label: "dp[target] = can we achieve exactly this sum?", description: "Boolean 1D by target sum" },
      { label: "dp[i][target] = can first i elements sum to target?", description: "2D: item index + target" },
      { label: "dp[i] = true if subset ending at i has target sum", description: "1D with ending constraint" },
    ],
    correctIndex: 2,
    explanation: "2D boolean DP. Target is total/2. dp[i][j] = can we make sum j using first i elements? For each element: include or exclude.",
    bonusInsight: "This is 0/1 Knapsack in disguise! Items → numbers, capacity → target sum, booleans → 'achievable'. Spot the pattern, reuse the technique.",
    difficulty: "Medium",
  },
];

interface Props {
  onBack: () => void;
}

export default function DPStateFinder({ onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const c = challenges[idx];
  const total = challenges.length;
  const isCorrect = selected === c?.correctIndex;

  function handleReveal() {
    if (selected === null) return;
    setRevealed(true);
    if (isCorrect) setScore((s) => s + 1);
  }

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Home
        </button>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
          <span className="text-4xl">{pct >= 80 ? "🧠" : pct >= 50 ? "💭" : "📖"}</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">{score}/{total} ({pct}%)</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pct >= 80 ? "You can identify DP state like a pro. This is THE hardest skill in DP." :
             pct >= 50 ? "Good — keep practicing. State identification gets easier with reps." :
             "State identification is the hardest part of DP. Review the explanations and try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🧠</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">DP State Finder</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Identifying the state is the HARDEST part of DP. Practice here.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Problem {idx + 1} of {total}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : c.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.difficulty}</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300" style={{ width: `${((idx + (revealed ? 1 : 0)) / total) * 100}%` }} />
        </div>

        <div className="px-6 py-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">The Problem</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{c.problem}</p>
          </div>

          <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3">{c.question}</p>

          <div className="space-y-2 mb-4">
            {c.options.map((opt, i) => {
              let cls = "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600";
              if (revealed) {
                if (i === c.correctIndex) cls = "border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40";
                else if (i === selected) cls = "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40";
                else cls = "border-slate-200 dark:border-slate-700 opacity-50";
              } else if (i === selected) {
                cls = "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/40 ring-1 ring-violet-400/30";
              }

              return (
                <button key={i} onClick={() => !revealed && setSelected(i)} disabled={revealed}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${cls}`}
                >
                  <p className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-100">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="space-y-3 animate-fade-in-up">
              <div className={`rounded-lg px-4 py-3 text-sm ${isCorrect ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"}`}>
                <p className="font-semibold mb-1">{isCorrect ? "✓ Correct!" : "Not quite."}</p>
                <p className="text-xs leading-relaxed opacity-90">{c.explanation}</p>
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-1">💎 Bonus insight</p>
                <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">{c.bonusInsight}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          {!revealed ? (
            <button onClick={handleReveal} disabled={selected === null} className="px-5 py-2 bg-violet-500 text-white rounded-lg text-sm font-semibold hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Check
            </button>
          ) : (
            <button onClick={handleNext} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-all">
              {idx < total - 1 ? "Next" : "Results"}
              <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
