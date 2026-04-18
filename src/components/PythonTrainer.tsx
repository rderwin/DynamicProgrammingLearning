import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface PythonLesson {
  id: string;
  title: string;
  category: string;
  description: string;
  keyPoints: string[];
  example: string;
  exampleExplanation: string;
  /** Task: what the user needs to implement */
  task: string;
  hints: string[];
  solution: string;
  testCases: TestCase[];
  functionName: string;
  starterPython: string;
  interviewTip: string;
}

const lessons: PythonLesson[] = [
  // ─── 1. List Comprehensions ───
  {
    id: "py-1",
    title: "List Comprehensions",
    category: "Core Syntax",
    description: "Python's list comprehensions let you write loops in one line. Essential for interviews — they signal you know idiomatic Python.",
    keyPoints: [
      "[expression for item in iterable] replaces simple for loops",
      "[expr for item in iter if condition] filters too",
      "Nested: [x for row in matrix for x in row] flattens a 2D list",
      "Also works for sets: {x for x in ...} and dicts: {k: v for k, v in ...}",
    ],
    example: `# Instead of:
squares = []
for x in range(10):
    squares.append(x * x)

# Write:
squares = [x * x for x in range(10)]

# With a filter:
evens = [x for x in range(20) if x % 2 == 0]`,
    exampleExplanation: "List comprehensions are faster than append loops AND more readable. Interviewers love them because they show Python fluency.",
    task: "Return a list of squares of all EVEN numbers from 0 to n-1.",
    functionName: "even_squares",
    starterPython: `def even_squares(n):\n    # Return squares of even numbers in range(n)\n    # Use a list comprehension!\n    pass`,
    hints: [
      "Start with [x*x for x in range(n)]",
      "Add a condition: [x*x for x in range(n) if x % 2 == 0]",
    ],
    solution: `def even_squares(n):\n    return [x * x for x in range(n) if x % 2 == 0]`,
    testCases: [
      { input: [5], expected: [0, 4, 16], label: "even_squares(5) = [0,4,16]" },
      { input: [10], expected: [0, 4, 16, 36, 64], label: "even_squares(10)" },
      { input: [1], expected: [0], label: "even_squares(1) = [0]" },
    ],
    interviewTip: "If an interviewer sees you write a for loop + append when a comprehension would work, they'll note it. Comprehensions are the Pythonic way.",
  },

  // ─── 2. enumerate() ───
  {
    id: "py-2",
    title: "enumerate() — Index + Value",
    category: "Core Syntax",
    description: "Need both index and value? Don't write range(len(arr)). Use enumerate.",
    keyPoints: [
      "enumerate(iter) gives (index, value) pairs",
      "enumerate(iter, start) lets you start from any number",
      "Works with any iterable, not just lists",
    ],
    example: `# Bad (un-Pythonic):
for i in range(len(arr)):
    print(i, arr[i])

# Good:
for i, val in enumerate(arr):
    print(i, val)

# Start from 1:
for i, val in enumerate(arr, 1):
    print(f"Item {i}: {val}")`,
    exampleExplanation: "enumerate is cleaner AND avoids bugs (what if arr changes during iteration?). It's the Python way to iterate with indices.",
    task: "Given a list of numbers, return a list of (index, value) tuples for only the values greater than threshold.",
    functionName: "enumerate_above",
    starterPython: `def enumerate_above(nums, threshold):\n    # Return [(i, val), ...] for values > threshold\n    # Use enumerate!\n    pass`,
    hints: [
      "Use enumerate to get (i, val) pairs",
      "Combine with a list comprehension: [(i, val) for i, val in enumerate(nums) if val > threshold]",
    ],
    solution: `def enumerate_above(nums, threshold):\n    return [(i, val) for i, val in enumerate(nums) if val > threshold]`,
    testCases: [
      { input: [[1, 5, 3, 8, 2, 9], 4], expected: [[1, 5], [3, 8], [5, 9]], label: "above 4" },
      { input: [[1, 2, 3], 5], expected: [], label: "none above" },
    ],
    interviewTip: "Using range(len(arr)) is a tell that you don't know Python well. Always prefer enumerate when you need the index.",
  },

  // ─── 3. collections.Counter ───
  {
    id: "py-3",
    title: "Counter — Frequency Maps",
    category: "collections",
    description: "Counter is Python's built-in frequency counter. It's a dict subclass with superpowers.",
    keyPoints: [
      "Counter(iterable) counts occurrences automatically",
      ".most_common(n) returns top n items",
      "Counter supports arithmetic: c1 - c2 removes counts",
      "Access missing keys returns 0, not KeyError",
    ],
    example: `from collections import Counter

freq = Counter("hello")
# Counter({'l': 2, 'h': 1, 'e': 1, 'o': 1})

freq.most_common(2)
# [('l', 2), ('h', 1)]

# Subtract counts (useful for anagrams!)
Counter("listen") - Counter("silent")
# Counter()  (all cancel out)`,
    exampleExplanation: "Counter makes frequency problems trivial. Anagrams, character counts, top-k elements — all one-liners.",
    task: "Return True if two strings are anagrams of each other.",
    functionName: "is_anagram",
    starterPython: `def is_anagram(s, t):\n    # Return True if s and t are anagrams\n    # Use Counter!\n    pass`,
    hints: [
      "Two strings are anagrams if they have the same character frequencies",
      "Counter(s) == Counter(t) — one line!",
    ],
    solution: `from collections import Counter\n\ndef is_anagram(s, t):\n    return Counter(s) == Counter(t)`,
    testCases: [
      { input: ["anagram", "nagaram"], expected: true, label: "anagram/nagaram = true" },
      { input: ["rat", "car"], expected: false, label: "rat/car = false" },
      { input: ["", ""], expected: true, label: "empty = true" },
    ],
    interviewTip: "When you see 'count characters/elements', reach for Counter. It's O(n) and one line.",
  },

  // ─── 4. defaultdict ───
  {
    id: "py-4",
    title: "defaultdict — No More KeyError",
    category: "collections",
    description: "defaultdict auto-creates missing keys with a default value. Essential for graph building.",
    keyPoints: [
      "defaultdict(list) creates [] for any new key",
      "defaultdict(int) creates 0 for any new key",
      "defaultdict(set) creates set() — useful for adjacency with no duplicates",
      "No more if key in dict: ... boilerplate",
    ],
    example: `from collections import defaultdict

# Build a graph without checking if key exists
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)  # undirected

# Count frequencies manually (Counter is better, but this works)
freq = defaultdict(int)
for c in "hello":
    freq[c] += 1`,
    exampleExplanation: "defaultdict saves you from 'if key not in dict: dict[key] = []' — a huge win for cleaner code.",
    task: "Given a list of edge pairs, build an adjacency list as a dict.",
    functionName: "build_graph",
    starterPython: `def build_graph(edges):\n    # Given [[u,v], ...], return {u: [v, ...]} undirected\n    # Use defaultdict(list)!\n    pass`,
    hints: [
      "defaultdict(list) auto-creates an empty list for new keys",
      "For each edge [u, v]: graph[u].append(v) AND graph[v].append(u) (undirected)",
    ],
    solution: `from collections import defaultdict\n\ndef build_graph(edges):\n    graph = defaultdict(list)\n    for u, v in edges:\n        graph[u].append(v)\n        graph[v].append(u)\n    return dict(graph)`,
    testCases: [
      { input: [[[1, 2], [2, 3], [1, 3]]], expected: { 1: [2, 3], 2: [1, 3], 3: [2, 1] }, label: "triangle" },
      { input: [[[1, 2]]], expected: { 1: [2], 2: [1] }, label: "one edge" },
    ],
    interviewTip: "Any time you'd write 'if key not in d: d[key] = []', use defaultdict(list) instead. Same for defaultdict(int) for counters.",
  },

  // ─── 5. heapq ───
  {
    id: "py-5",
    title: "heapq — Priority Queues",
    category: "Built-ins",
    description: "Python's heapq is a min-heap. For Top-K, Dijkstra, and scheduling problems, it's essential.",
    keyPoints: [
      "heappush(heap, item) adds in O(log n)",
      "heappop(heap) removes smallest in O(log n)",
      "heap[0] peeks at smallest in O(1)",
      "For max-heap: negate values (push -x, pop -x)",
      "heapify(list) converts a list in-place in O(n)",
    ],
    example: `import heapq

# Min-heap (default)
h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
heapq.heappush(h, 2)
heapq.heappop(h)  # 1

# Top K largest (use max-heap via negation)
nums = [3, 1, 4, 1, 5, 9, 2, 6]
heapq.nlargest(3, nums)   # [9, 6, 5]
heapq.nsmallest(3, nums)  # [1, 1, 2]

# For tuples: sorts by first element
heapq.heappush(h, (priority, task))`,
    exampleExplanation: "heapq is THE tool for Dijkstra, Top-K problems, merge K sorted lists, and scheduling. Memorize these 3 functions.",
    task: "Return the k smallest numbers from an array, sorted.",
    functionName: "k_smallest",
    starterPython: `def k_smallest(nums, k):\n    # Return k smallest numbers from nums, sorted ascending\n    # Use heapq.nsmallest!\n    pass`,
    hints: [
      "heapq.nsmallest(k, nums) does exactly this — one line",
      "If you're doing it manually: heapify then heappop k times",
    ],
    solution: `import heapq\n\ndef k_smallest(nums, k):\n    return heapq.nsmallest(k, nums)`,
    testCases: [
      { input: [[3, 1, 4, 1, 5, 9, 2, 6], 3], expected: [1, 1, 2], label: "k=3" },
      { input: [[5, 4, 3, 2, 1], 2], expected: [1, 2], label: "k=2" },
    ],
    interviewTip: "For max-heap problems: 'heapq has min-heap, so I'll negate values.' Interviewers expect this workaround.",
  },

  // ─── 6. zip and unpacking ───
  {
    id: "py-6",
    title: "zip() and Unpacking",
    category: "Core Syntax",
    description: "zip() pairs up multiple iterables. Combined with unpacking, it's powerful.",
    keyPoints: [
      "zip(a, b) gives [(a[0], b[0]), (a[1], b[1]), ...]",
      "Stops at the shortest iterable",
      "zip(*matrix) transposes a 2D matrix!",
      "dict(zip(keys, values)) creates a dict from parallel lists",
    ],
    example: `# Iterate two lists in parallel
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# Transpose a matrix:
matrix = [[1, 2, 3], [4, 5, 6]]
list(zip(*matrix))  # [(1,4), (2,5), (3,6)]

# Build dict from parallel lists
dict(zip(['a', 'b', 'c'], [1, 2, 3]))  # {'a': 1, 'b': 2, 'c': 3}`,
    exampleExplanation: "zip is a Swiss Army knife. Transpose, parallel iteration, dict-building — all trivial.",
    task: "Transpose a 2D matrix (rows become columns).",
    functionName: "transpose",
    starterPython: `def transpose(matrix):\n    # Return the transpose: rows become columns\n    # zip(*matrix) is the trick!\n    pass`,
    hints: [
      "zip(*matrix) unpacks each row as an argument to zip",
      "Wrap in list(): [list(row) for row in zip(*matrix)]",
    ],
    solution: `def transpose(matrix):\n    return [list(row) for row in zip(*matrix)]`,
    testCases: [
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]], label: "2x3 → 3x2" },
      { input: [[[1, 2], [3, 4]]], expected: [[1, 3], [2, 4]], label: "square" },
    ],
    interviewTip: "zip(*matrix) for transpose is a classic Python trick. Saves 10 lines of nested loops.",
  },

  // ─── 7. functools.lru_cache ───
  {
    id: "py-7",
    title: "@lru_cache — Automatic Memoization",
    category: "DP Essentials",
    description: "One decorator turns any recursive function into a memoized one. DP becomes trivial.",
    keyPoints: [
      "@lru_cache(maxsize=None) caches all calls forever",
      "Works on any function with hashable arguments",
      "Turns O(2^n) recursion into O(n) instantly",
      "Must clear cache between test runs if needed: fib.cache_clear()",
    ],
    example: `from functools import lru_cache

# Before: exponential time
def fib(n):
    if n <= 1: return n
    return fib(n - 1) + fib(n - 2)

# After: linear time (just added decorator!)
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n - 1) + fib(n - 2)

fib(100)  # Instant`,
    exampleExplanation: "This is the most Pythonic way to add memoization. One line turns brute-force recursion into DP.",
    task: "Write a memoized Fibonacci that handles n=50 instantly using @lru_cache.",
    functionName: "fib",
    starterPython: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    # Classic recursive fib — but now memoized!\n    pass`,
    hints: [
      "Base case: if n <= 1 return n",
      "Recursive case: fib(n-1) + fib(n-2)",
      "The @lru_cache decorator does all the memoization for you",
    ],
    solution: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n <= 1: return n\n    return fib(n - 1) + fib(n - 2)`,
    testCases: [
      { input: [10], expected: 55, label: "fib(10) = 55" },
      { input: [30], expected: 832040, label: "fib(30)" },
      { input: [50], expected: 12586269025, label: "fib(50) — must be instant!" },
    ],
    interviewTip: "In DP interviews, mention lru_cache. It shows you know the Pythonic way. But ALSO be able to write it manually with a dict — some interviewers will ask.",
  },

  // ─── 8. bisect ───
  {
    id: "py-8",
    title: "bisect — Binary Search Utilities",
    category: "Built-ins",
    description: "bisect gives you O(log n) binary search on sorted lists. Great for LIS, insertion points, range queries.",
    keyPoints: [
      "bisect_left(arr, x) finds leftmost insertion point for x",
      "bisect_right(arr, x) finds rightmost (after duplicates)",
      "insort(arr, x) inserts x keeping arr sorted",
      "Use for LIS in O(n log n) — classic trick",
    ],
    example: `import bisect

arr = [1, 3, 5, 7, 9]

bisect.bisect_left(arr, 5)   # 2 (index where 5 is)
bisect.bisect_right(arr, 5)  # 3 (index AFTER 5)
bisect.bisect_left(arr, 4)   # 2 (where 4 would go)

# Insert and keep sorted
bisect.insort(arr, 6)
# arr is now [1, 3, 5, 6, 7, 9]`,
    exampleExplanation: "Perfect for maintaining a sorted list efficiently, or for LIS-style problems where you binary-search on tails.",
    task: "Find the index where target should be inserted in a sorted array to keep it sorted (leftmost position).",
    functionName: "find_position",
    starterPython: `import bisect\n\ndef find_position(arr, target):\n    # Return leftmost index where target could be inserted\n    # Use bisect.bisect_left!\n    pass`,
    hints: [
      "bisect.bisect_left(arr, target) — one line",
    ],
    solution: `import bisect\n\ndef find_position(arr, target):\n    return bisect.bisect_left(arr, target)`,
    testCases: [
      { input: [[1, 3, 5, 7, 9], 5], expected: 2, label: "find 5" },
      { input: [[1, 3, 5, 7, 9], 4], expected: 2, label: "find 4 (insert point)" },
      { input: [[1, 3, 5, 7, 9], 0], expected: 0, label: "find 0 (before all)" },
      { input: [[1, 3, 5, 7, 9], 10], expected: 5, label: "find 10 (after all)" },
    ],
    interviewTip: "For Longest Increasing Subsequence in O(n log n), use bisect_left on a 'tails' array. Classic Python trick.",
  },
];

interface Props {
  onBack: () => void;
  onLessonComplete?: (lessonId: string) => void;
}

export default function PythonTrainer({ onBack, onLessonComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [awarded, setAwarded] = useState<Set<string>>(new Set());

  const lesson = lessons[idx];
  const total = lessons.length;

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setShowHints(false);
      setHintIdx(0);
      setShowSolution(false);
      setSolved(false);
    }
  }

  function handlePrev() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setShowHints(false);
      setHintIdx(0);
      setShowSolution(false);
      setSolved(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🐍</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Python for Interviews</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Hands-on Python tricks that make interviews easier</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Lesson {idx + 1} of {total}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold">{lesson.category}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      {/* Lesson content */}
      <div className="space-y-5" key={lesson.id}>
        {/* Title + description */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{lesson.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{lesson.description}</p>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider">Key Points</p>
            <ul className="space-y-1">
              {lesson.keyPoints.map((kp) => (
                <li key={kp} className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">▸</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1e1e2e] rounded-lg p-4 mb-3">
            <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{lesson.example}</pre>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">{lesson.exampleExplanation}</p>
        </div>

        {/* Task */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wider">✍️ Your Turn</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.task}</p>
        </div>

        {/* Hints */}
        {showHints && hintIdx > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 animate-fade-in">
            {lesson.hints.slice(0, hintIdx).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="bg-amber-100 text-amber-700 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Show solution */}
        {showSolution && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 animate-fade-in">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider">Solution</p>
            <div className="bg-[#1e1e2e] rounded-lg p-3">
              <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{lesson.solution}</pre>
            </div>
          </div>
        )}

        {/* Code editor */}
        <CodeEditor
          functionName={lesson.functionName}
          testCases={lesson.testCases}
          starterJS=""
          starterPython={lesson.starterPython}
          onPass={() => {
            setSolved(true);
            if (!awarded.has(lesson.id)) {
              setAwarded((prev) => new Set(prev).add(lesson.id));
              onLessonComplete?.(lesson.id);
            }
          }}
        />

        {/* Hint/solution buttons */}
        <div className="flex items-center gap-3 justify-center text-xs">
          {!solved && (
            <>
              <button onClick={() => { setShowHints(true); setHintIdx((h) => Math.min(h + 1, lesson.hints.length)); }} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {hintIdx === 0 ? "Get a hint" : hintIdx < lesson.hints.length ? `Next hint (${hintIdx + 1}/${lesson.hints.length})` : "All hints shown"}
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button onClick={() => setShowSolution(true)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Show solution
              </button>
            </>
          )}
        </div>

        {/* Interview tip */}
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-2 uppercase tracking-wider">💡 Interview Tip</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.interviewTip}</p>
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
