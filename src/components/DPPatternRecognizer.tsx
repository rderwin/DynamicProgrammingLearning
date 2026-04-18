import { useState } from "react";

interface Question {
  id: string;
  problem: string;
  examples?: string;
  options: { label: string; correct: boolean; explanation: string }[];
  bottomLine: string;
}

const questions: Question[] = [
  {
    id: "p1",
    problem:
      "You have n steps. You can climb 1 or 2 at a time. Count the number of distinct ways to reach the top.",
    examples: "n=3 → 3 ways: (1,1,1), (1,2), (2,1)",
    options: [
      { label: "1D DP on single index (like Fibonacci)", correct: true, explanation: "dp[n] = dp[n-1] + dp[n-2]. Each state depends on last two — classic 1D linear DP." },
      { label: "2D DP on (index, state)", correct: false, explanation: "No second dimension needed — only position matters." },
      { label: "Bitmask DP", correct: false, explanation: "n can be large; bitmask states would explode." },
      { label: "Interval DP", correct: false, explanation: "No subinterval structure — you're moving forward through steps, not splitting a range." },
    ],
    bottomLine: "1D linear DP. Signal: 'count ways' + 'position' + 'last few moves only'.",
  },
  {
    id: "p2",
    problem:
      "Given a grid of m×n with costs, find the min-cost path from top-left to bottom-right, moving only right or down.",
    examples: "Grid [[1,3,1],[1,5,1],[4,2,1]] → 7",
    options: [
      { label: "2D DP on (row, col)", correct: true, explanation: "dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). Two-dimensional grid = two-dimensional state." },
      { label: "BFS/Dijkstra", correct: false, explanation: "Works but overkill. With right/down-only moves and no negative edges, straight DP is simpler and faster." },
      { label: "1D DP on position encoded as i*n+j", correct: false, explanation: "Awkward — encoding 2D as 1D loses clarity. Just use 2D." },
      { label: "Backtracking with memo", correct: false, explanation: "Works but iterative 2D DP is cleaner." },
    ],
    bottomLine: "2D grid DP. Signal: 'grid + fixed direction moves' = dp[i][j] from neighbors.",
  },
  {
    id: "p3",
    problem:
      "You have n items with weights and values. You can pick each item ONCE. Find the max value that fits in a knapsack of capacity W.",
    examples: "items=[(w=1,v=1),(w=3,v=4),(w=4,v=5),(w=5,v=7)], W=7 → 9 (take items 3,4)",
    options: [
      { label: "2D DP on (item index, capacity)", correct: true, explanation: "dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i]). Classic 0/1 Knapsack." },
      { label: "Greedy — sort by value/weight", correct: false, explanation: "Greedy is for FRACTIONAL knapsack. 0/1 requires DP because partial items aren't allowed." },
      { label: "1D DP on capacity only", correct: false, explanation: "Actually works! You can space-optimize to 1D by iterating capacity in REVERSE. But the mental model is 2D first." },
      { label: "Bitmask DP on which items taken", correct: false, explanation: "Works for small n but explodes at n=30+." },
    ],
    bottomLine: "0/1 Knapsack — 2D DP on (items, capacity). Space-optimize to 1D with reverse iteration.",
  },
  {
    id: "p4",
    problem:
      "Given coins of different denominations and a target amount, return the FEWEST coins needed. Each coin has unlimited supply.",
    examples: "coins=[1,2,5], amount=11 → 3 (11=5+5+1)",
    options: [
      { label: "1D DP on amount, iterating coins inside", correct: true, explanation: "dp[a] = min(dp[a - c] + 1) for each coin c. Unbounded knapsack pattern. Outer amount, inner coins." },
      { label: "2D DP like 0/1 knapsack", correct: false, explanation: "Works but wasteful — coins are unbounded, so (coin_idx, amount) adds an unneeded dimension." },
      { label: "Greedy — biggest coin first", correct: false, explanation: "FAILS for [1,3,4] amount=6 (greedy gives 4+1+1=3, optimal is 3+3=2)." },
      { label: "BFS on amount", correct: false, explanation: "Works! BFS on 'remaining amount' gives fewest coins. But 1D DP is the expected answer." },
    ],
    bottomLine: "Unbounded knapsack (coin change). 1D DP on amount. Greedy fails here.",
  },
  {
    id: "p5",
    problem:
      "Given an array, find the length of the longest STRICTLY increasing subsequence.",
    examples: "[10,9,2,5,3,7,101,18] → 4 (e.g., [2,3,7,18])",
    options: [
      { label: "1D DP: dp[i] = LIS ending at i, O(n²)", correct: true, explanation: "Standard DP: dp[i] = max(dp[j]+1) for j<i where nums[j]<nums[i]. The most intuitive approach." },
      { label: "Binary search on a 'tails' array — O(n log n)", correct: true, explanation: "Also correct and faster. tails[i] = smallest value ending a subseq of length i+1. Use bisect_left." },
      { label: "Stack-based monotonic pattern", correct: false, explanation: "Monotonic stack solves 'next greater' style problems, not LIS directly." },
      { label: "Greedy — take each increase", correct: false, explanation: "Too simple — misses the 'subsequence can skip' nature." },
    ],
    bottomLine: "LIS — 1D DP O(n²) baseline, or O(n log n) with binary search on tails array.",
  },
  {
    id: "p6",
    problem:
      "Given two strings word1 and word2, find the min operations (insert/delete/replace) to transform word1 into word2.",
    examples: "\"horse\" → \"ros\" = 3 ops",
    options: [
      { label: "2D DP on (i, j) = prefix lengths", correct: true, explanation: "Edit Distance. dp[i][j] = min cost to transform word1[:i] to word2[:j]. Classic 2D string DP." },
      { label: "BFS on states", correct: false, explanation: "The state space is exponential; 2D DP is O(m·n)." },
      { label: "Interval DP", correct: false, explanation: "Not about splitting a single string — it's about aligning two strings." },
      { label: "Tree DP", correct: false, explanation: "No tree structure involved." },
    ],
    bottomLine: "Edit Distance — 2D string DP. Two sequences → 2D DP almost always.",
  },
  {
    id: "p7",
    problem:
      "Given an array of balloons, bursting balloon i gives you nums[i-1]*nums[i]*nums[i+1] coins. Find the MAX coins you can get bursting them all.",
    examples: "[3,1,5,8] → 167",
    options: [
      { label: "Interval DP — think about LAST balloon to burst", correct: true, explanation: "Burst Balloons. Split-based interval DP: for each interval, consider which balloon bursts LAST (not first). Its neighbors are then the interval boundaries." },
      { label: "Greedy — burst smallest first", correct: false, explanation: "Greedy fails — neighbors change dynamically." },
      { label: "Bitmask DP on which balloons burst", correct: false, explanation: "Works for small n but O(2ⁿ) is worse than interval DP's O(n³)." },
      { label: "1D DP on remaining balloons", correct: false, explanation: "The 'which balloons remain' isn't captured by a single dimension." },
    ],
    bottomLine: "Interval DP with 'last operation' framing. Split-based, fill by length, think BACKWARDS.",
  },
  {
    id: "p8",
    problem:
      "You're given N cities and a distance matrix. Find the shortest tour that visits every city exactly once and returns to the start.",
    examples: "4 cities with dist matrix → min tour cost",
    options: [
      { label: "Bitmask DP (Held-Karp)", correct: true, explanation: "dp[mask][i] = min cost visiting set 'mask' ending at i. O(n²·2ⁿ) — viable for n≤20. The textbook answer." },
      { label: "DFS with memoization on current city", correct: false, explanation: "Forgets which cities are visited — need to track the subset." },
      { label: "Greedy nearest neighbor", correct: false, explanation: "Heuristic, not optimal. OK for approximation but not guaranteed." },
      { label: "Plain Dijkstra", correct: false, explanation: "Dijkstra finds shortest path, not Hamiltonian cycle." },
    ],
    bottomLine: "TSP → Bitmask DP. State = (visited set, current city). Known as Held-Karp.",
  },
  {
    id: "p9",
    problem:
      "Given a binary tree, find the maximum path sum (connected path of nodes — can start and end anywhere).",
    examples: "[-10,9,20,null,null,15,7] → 42",
    options: [
      { label: "Tree DP — return depth/gain to parent, track answer globally", correct: true, explanation: "At each node, 'through me' path uses both children; returned 'gain' only uses one child. Global max tracks the best through-me path. Classic 'return one, track another'." },
      { label: "BFS for longest path", correct: false, explanation: "Path can contain negatives; BFS-by-edges doesn't capture value-weighted paths." },
      { label: "Two DFS from every node", correct: false, explanation: "O(n²) — unnecessary. Single post-order DFS suffices." },
      { label: "Floyd-Warshall", correct: false, explanation: "General graph algorithm; tree structure allows O(n) DP." },
    ],
    bottomLine: "Tree DP — post-order, clamp negatives with max(0, ...), track through-me path as answer.",
  },
  {
    id: "p10",
    problem:
      "Given a string, find the MIN number of cuts needed so each resulting substring is a palindrome.",
    examples: "\"aab\" → 1 cut (\"aa | b\")",
    options: [
      { label: "Two DPs combined: precompute isPalindrome, then 1D cuts DP", correct: true, explanation: "Phase 1: isPalin[i][j] in O(n²). Phase 2: cuts[i] = min cuts for s[:i+1]. Classic composition." },
      { label: "Single 2D DP", correct: false, explanation: "Works but less clean than the two-phase approach." },
      { label: "Greedy — cut at every char", correct: false, explanation: "Not minimal. Greedy fails." },
      { label: "Backtracking", correct: false, explanation: "Exponential without memo." },
    ],
    bottomLine: "Two-phase DP. When a problem seems to need 'is substring X a palindrome?' and 'min cuts', precompute separately.",
  },
  {
    id: "p11",
    problem:
      "Given n pairs of parentheses, generate all combinations of well-formed parentheses.",
    examples: "n=3 → [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
    options: [
      { label: "Backtracking (NOT a DP problem)", correct: true, explanation: "GENERATE ALL — backtracking. DP counts or optimizes; it doesn't enumerate. Count of valid strings = Catalan, but the generation is backtracking." },
      { label: "1D DP on n", correct: false, explanation: "DP can give the COUNT (Catalan number), but not the actual strings." },
      { label: "Bitmask DP", correct: false, explanation: "Not a subset selection problem." },
      { label: "BFS", correct: false, explanation: "Possible but unnatural; backtracking is cleaner for 'generate all'." },
    ],
    bottomLine: "'Generate all' → NOT DP usually. DP is for optimization / counting, not enumeration.",
  },
  {
    id: "p12",
    problem:
      "Given weights [w1..wn] and two jars, partition into two subsets with minimum absolute difference in sums.",
    examples: "[1,6,11,5] → 1 (partition: [1,5,6]=12 and [11], diff=1)",
    options: [
      { label: "0/1 Knapsack — pick items to get sum closest to total/2", correct: true, explanation: "dp[i][w] = can first i items sum to w? Find max w ≤ total/2 reachable. Answer = total - 2w." },
      { label: "Greedy — largest first into emptier bucket", correct: false, explanation: "Heuristic; fails optimally on some inputs." },
      { label: "Sorting + two pointers", correct: false, explanation: "Doesn't handle the subset structure." },
      { label: "DFS all 2ⁿ subsets", correct: false, explanation: "Works for tiny n but explodes. DP is the principled approach." },
    ],
    bottomLine: "Partition problems → 0/1 Knapsack on subset sums. 'Closest to total/2' is the key reframing.",
  },
];

interface Props {
  onBack: () => void;
  /** Called once per correct answer. */
  onCorrectAnswer?: () => void;
}

export default function DPPatternRecognizer({ onBack, onCorrectAnswer }: Props) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];
  const total = questions.length;
  const correctIndices = q.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const multiCorrect = correctIndices.length > 1;

  function toggleOption(i: number) {
    if (revealed) return;
    if (multiCorrect) {
      setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
    } else {
      setSelected([i]);
    }
  }

  function check() {
    if (selected.length === 0) return;
    const selSet = new Set(selected);
    const corrSet = new Set(correctIndices);
    const isCorrect = selSet.size === corrSet.size && [...selSet].every((x) => corrSet.has(x));
    if (isCorrect) {
      setScore((s) => s + 1);
      onCorrectAnswer?.();
    }
    setRevealed(true);
  }

  function next() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setSelected([]);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  }

  function reset() {
    setIdx(0);
    setSelected([]);
    setRevealed(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct >= 85 ? "🏆" : pct >= 70 ? "💪" : pct >= 50 ? "📈" : "🎯";
    const msg = pct >= 85 ? "Pattern recognition mastery!" : pct >= 70 ? "Solid intuition — you know the patterns." : pct >= 50 ? "Getting there — review and try again." : "Worth revisiting — pattern recognition is a skill that builds.";
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Home
        </button>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {score} / {total}
          </h2>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-8">{msg}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all">
              Try again
            </button>
            <button onClick={onBack} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              Back home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -mx-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🎯</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">DP Pattern Recognizer</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">The hardest DP skill — knowing which pattern to reach for</p>
      </div>

      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="font-mono text-slate-400 dark:text-slate-500">Question {idx + 1} of {total}</span>
        <span className="font-mono text-slate-500 dark:text-slate-400">Score: {score}/{idx + (revealed ? 1 : 0)}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-red-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div key={q.id} className="space-y-5">
        {/* Problem */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3">📝 Problem</p>
          <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed mb-3">{q.problem}</p>
          {q.examples && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Example</p>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{q.examples}</code>
            </div>
          )}
          {multiCorrect && !revealed && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 italic">💡 Multiple correct — select all that apply</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isSelected = selected.includes(i);
            const showCorrect = revealed && opt.correct;
            const showWrong = revealed && isSelected && !opt.correct;
            return (
              <button
                key={i}
                onClick={() => toggleOption(i)}
                disabled={revealed}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  showCorrect
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                    : showWrong
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30"
                    : isSelected
                    ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/30"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                } ${revealed ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5"}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    showCorrect ? "bg-emerald-500 text-white"
                    : showWrong ? "bg-red-500 text-white"
                    : isSelected ? "bg-purple-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {showCorrect ? "✓" : showWrong ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 dark:text-slate-100">{opt.label}</p>
                    {revealed && (
                      <p className={`text-xs mt-2 italic ${opt.correct ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                        {opt.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom line after reveal */}
        {revealed && (
          <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4 animate-fade-in">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-1">📌 Bottom Line</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{q.bottomLine}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!revealed ? (
            <button
              onClick={check}
              disabled={selected.length === 0}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Check answer
            </button>
          ) : (
            <button
              onClick={next}
              className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all"
            >
              {idx < total - 1 ? "Next question" : "See results"}
              <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
