interface Props {
  onBack: () => void;
}

const sections = [
  {
    title: "Dynamic Programming",
    color: "blue",
    items: [
      { pattern: "1D DP (Counting)", when: "Count ways to reach a state", template: "dp[i] = dp[i-1] + dp[i-2]", examples: "Fibonacci, Climbing Stairs, Decode Ways" },
      { pattern: "1D DP (Optimization)", when: "Minimize/maximize over choices", template: "dp[i] = min/max(dp[i-1], dp[i-2] + cost)", examples: "Coin Change, Min Cost Stairs, House Robber" },
      { pattern: "2D DP", when: "State has 2 variables (grid, two strings)", template: "dp[i][j] = dp[i-1][j] + dp[i][j-1]", examples: "Grid Paths, Edit Distance, LCS" },
      { pattern: "Include/Exclude", when: "Take or skip each item", template: "dp = max(take + recurse, skip)", examples: "Knapsack, Partition Subset, Target Sum" },
    ],
  },
  {
    title: "Graph Algorithms",
    color: "emerald",
    items: [
      { pattern: "BFS", when: "Shortest unweighted path, level-order", template: "queue + visited set", examples: "Shortest path, Level order, Islands" },
      { pattern: "DFS", when: "Explore all paths, cycle detection", template: "stack (or recursion) + visited set", examples: "Connected components, Path finding" },
      { pattern: "Topological Sort", when: "Dependencies, ordering DAG", template: "DFS + post-order collection", examples: "Course Schedule, Build order" },
      { pattern: "Dijkstra", when: "Shortest weighted path (non-negative)", template: "priority queue + distance relaxation", examples: "Network delay, Cheapest flights" },
    ],
  },
  {
    title: "Common Patterns",
    color: "amber",
    items: [
      { pattern: "Two Pointers", when: "Sorted array, pairs, partitioning", template: "lo=0, hi=n-1, move based on condition", examples: "Two Sum (sorted), Container Water" },
      { pattern: "Sliding Window", when: "Contiguous subarray/substring", template: "expand right, shrink left when invalid", examples: "Max substring, Min window" },
      { pattern: "Binary Search", when: "Sorted/monotonic search space", template: "lo, hi, mid = (lo+hi)/2", examples: "Search sorted, Search answer space" },
      { pattern: "Backtracking", when: "Generate all combos/permutations", template: "choose → explore → unchoose", examples: "Permutations, N-Queens, Subsets" },
    ],
  },
  {
    title: "Complexity Quick Reference",
    color: "violet",
    items: [
      { pattern: "O(1)", when: "Hash lookup, array index", template: "—", examples: "HashMap.get, arr[i]" },
      { pattern: "O(log n)", when: "Halving search space", template: "Binary search, balanced BST", examples: "Binary search, heap operations" },
      { pattern: "O(n)", when: "Single pass", template: "One loop through data", examples: "Linear scan, hash map build" },
      { pattern: "O(n log n)", when: "Efficient sorting", template: "Merge sort, heap sort", examples: "Sort + scan patterns" },
      { pattern: "O(n²)", when: "Nested loops, compare all pairs", template: "Double loop", examples: "Brute force, DP with 2 vars" },
      { pattern: "O(2^n)", when: "All subsets, brute force recursion", template: "Branching factor 2, depth n", examples: "Subset generation, naive Fibonacci" },
    ],
  },
];

const colorMap: Record<string, { bg: string; border: string; title: string; badge: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", title: "text-blue-800 dark:text-blue-300", badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", title: "text-emerald-800 dark:text-emerald-300", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", title: "text-amber-800 dark:text-amber-300", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", title: "text-violet-800 dark:text-violet-300", badge: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400" },
};

export default function CheatSheet({ onBack }: Props) {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Interview Cheat Sheet</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Quick reference for patterns, templates, and complexity</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const c = colorMap[section.color];
          return (
            <div key={section.title} className={`${c.bg} border ${c.border} rounded-xl p-5`}>
              <h3 className={`text-sm font-bold ${c.title} mb-4`}>{section.title}</h3>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.pattern} className="bg-white/60 dark:bg-slate-900/40 rounded-lg px-4 py-3">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{item.pattern}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic flex-shrink-0">{item.when}</span>
                    </div>
                    <code className="text-xs font-mono text-slate-600 dark:text-slate-400 block mt-1">{item.template}</code>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Examples: {item.examples}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
