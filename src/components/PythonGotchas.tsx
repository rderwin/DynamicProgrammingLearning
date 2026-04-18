import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

export interface Gotcha {
  id: string;
  title: string;
  severity: "Common" | "Deep" | "Deadly";
  what: string;
  why: string;
  example: string;
  output: string;
  fix: string;
  task: string;
  starter: string;
  functionName: string;
  testCases: TestCase[];
  solution: string;
  hint: string;
}

const gotchas: Gotcha[] = [
  {
    id: "g1",
    title: "Mutable default arguments are SHARED",
    severity: "Deadly",
    what: "def f(x, memo={}): — that memo is shared across ALL calls to f. It's created ONCE when the function is defined.",
    why: "Python evaluates default args at function definition time, not call time. So {} becomes a single object that persists.",
    example: `def add_to_list(item, result=[]):
    result.append(item)
    return result

print(add_to_list(1))  # [1]
print(add_to_list(2))  # [1, 2]  !!!
print(add_to_list(3))  # [1, 2, 3]  !!!`,
    output: "Each call accumulates into the SAME list because result=[] is created once.",
    fix: `def add_to_list(item, result=None):
    if result is None:
        result = []
    result.append(item)
    return result`,
    task: "Write a memoized fibonacci that DOESN'T have the shared-default bug. Use result=None pattern or pass memo explicitly.",
    functionName: "fib",
    starter: `def fib(n, memo=None):\n    # Safely handle the memo — no shared state between calls\n    pass`,
    hint: "Check if memo is None at the top. If so, create memo = {}.",
    solution: `def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]`,
    testCases: [
      { input: [0], expected: 0, label: "fib(0) = 0" },
      { input: [10], expected: 55, label: "fib(10)" },
      { input: [30], expected: 832040, label: "fib(30)" },
    ],
  },
  {
    id: "g2",
    title: "Integer division vs float division",
    severity: "Common",
    what: "In Python 3: / is ALWAYS float division. // is integer division. In Python 2 they were both integer for ints.",
    why: "Binary search uses mid = (lo + hi) // 2 — if you use / you'll get a float and arr[mid] will fail.",
    example: `>>> 5 / 2
2.5
>>> 5 // 2
2
>>> -5 // 2
-3   # floor, not truncation!
>>> int(-5 / 2)
-2   # truncation`,
    output: "// is FLOOR division (rounds toward negative infinity), not truncation. Matters for negative numbers!",
    fix: "Use // for integer division in Python 3. For truncation with negatives, use int(a / b).",
    task: "Implement binary search. Use // for mid calculation.",
    functionName: "binarySearch",
    starter: `def binarySearch(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        # Compute mid carefully — use //\n        pass`,
    hint: "mid = (lo + hi) // 2 — use double slash!",
    solution: `def binarySearch(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1`,
    testCases: [
      { input: [[1, 3, 5, 7, 9], 5], expected: 2, label: "found" },
      { input: [[1, 3, 5, 7, 9], 4], expected: -1, label: "not found" },
      { input: [[1], 1], expected: 0, label: "single" },
    ],
  },
  {
    id: "g3",
    title: "Late binding in closures",
    severity: "Deep",
    what: "Lambdas in a loop capture the VARIABLE, not the value. All captured lambdas see the final value.",
    why: "Python closures look up variables by name at call time, not capture time. So the loop variable has its final value when lambdas run.",
    example: `funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])
# Expected: [0, 1, 2]
# Actual:   [2, 2, 2]   !!!`,
    output: "All lambdas return 2 because they all reference the same i, which ends at 2.",
    fix: `# Fix: use default arg to capture value
funcs = [lambda i=i: i for i in range(3)]
# Or: functools.partial
from functools import partial
funcs = [partial(lambda x: x, i) for i in range(3)]`,
    task: "Given n, return a list of n lambdas where the i-th lambda returns i when called. Avoid the late-binding trap!",
    functionName: "make_lambdas",
    starter: `def make_lambdas(n):\n    # Return [lambda, lambda, ...] where lambda at index i returns i\n    # Avoid late binding!\n    pass`,
    hint: "Default argument values are evaluated at function creation. Use lambda i=i: i inside the comprehension.",
    solution: `def make_lambdas(n):
    return [lambda i=i: i for i in range(n)]`,
    testCases: [
      { input: [3], expected: [0, 1, 2], label: "3 lambdas" },
      { input: [5], expected: [0, 1, 2, 3, 4], label: "5 lambdas" },
    ],
  },
  {
    id: "g4",
    title: "List slicing creates COPIES",
    severity: "Common",
    what: "arr[:] or arr[0:n] creates a new list. For large arrays, this is O(n) each time.",
    why: "Slicing copies references to elements. The list itself is new memory. In recursive algorithms, slicing on every call = O(n²) or worse.",
    example: `def bad_reverse(arr):
    if not arr: return []
    return bad_reverse(arr[1:]) + [arr[0]]  # O(n²)!

def good_reverse(arr):
    return arr[::-1]  # O(n), built-in`,
    output: "arr[1:] creates a new list each recursion. n calls × O(n) slice = O(n²) total.",
    fix: "Pass indices (lo, hi) instead of slicing. Or use built-ins like arr[::-1] which are optimized.",
    task: "Write an O(n) function to count how many times each character appears in a string. Don't use nested loops or repeated slicing.",
    functionName: "char_count",
    starter: `def char_count(s):\n    # Return {char: count, ...}\n    # Must be O(n), no slicing or nested loops\n    pass`,
    hint: "Use collections.Counter(s) — one line, O(n).",
    solution: `from collections import Counter

def char_count(s):
    return dict(Counter(s))`,
    testCases: [
      { input: ["hello"], expected: { h: 1, e: 1, l: 2, o: 1 }, label: "hello" },
      { input: [""], expected: {}, label: "empty" },
      { input: ["aaa"], expected: { a: 3 }, label: "all same" },
    ],
  },
  {
    id: "g5",
    title: "Sorting with .sort() returns None",
    severity: "Common",
    what: "list.sort() sorts IN PLACE and returns None. sorted(list) returns a new sorted list.",
    why: "Common mistake: `result = arr.sort()` — result is None, not the sorted array.",
    example: `arr = [3, 1, 2]
result = arr.sort()       # None!
print(result)             # None
print(arr)                # [1, 2, 3]  (mutated)

# What you want:
result = sorted(arr)      # [1, 2, 3]
# or: arr.sort(); then use arr`,
    output: "`.sort()` mutates and returns None. `sorted()` returns a new list.",
    fix: "Use sorted(arr) when you want to chain or assign. Use arr.sort() when you want in-place.",
    task: "Return the 3 smallest numbers from a list, sorted ascending. Don't mutate the input.",
    functionName: "three_smallest",
    starter: `def three_smallest(nums):\n    # Return the 3 smallest numbers, sorted\n    # Don't mutate nums!\n    pass`,
    hint: "sorted(nums)[:3] returns a new sorted list, preserving the original.",
    solution: `def three_smallest(nums):\n    return sorted(nums)[:3]`,
    testCases: [
      { input: [[5, 2, 8, 1, 9, 3]], expected: [1, 2, 3], label: "mixed" },
      { input: [[1, 2, 3]], expected: [1, 2, 3], label: "already sorted" },
    ],
  },
  {
    id: "g6",
    title: "== vs `is` — value vs identity",
    severity: "Deep",
    what: "== compares values. `is` compares object identity (same memory). Never use `is` for values!",
    why: "Small integers and short strings are cached, so `is` sometimes works by accident. Then breaks mysteriously.",
    example: `a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)   # True (same values)
print(a is b)   # False (different objects)

a = 256
b = 256
print(a is b)   # True (cached!)

a = 257
b = 257
print(a is b)   # False on some systems!`,
    output: "Python caches -5 to 256, so `is` looks like it works. Outside that range, it breaks.",
    fix: "Use == for value comparison. Use `is` only for None, True, False checks: `if x is None`.",
    task: "Return True if a list contains None (use `is` correctly).",
    functionName: "has_none",
    starter: `def has_none(lst):\n    # Return True if any element is None\n    # Use 'is' correctly!\n    pass`,
    hint: "any(x is None for x in lst) — `is None` is the idiomatic check.",
    solution: `def has_none(lst):\n    return any(x is None for x in lst)`,
    testCases: [
      { input: [[1, 2, null, 3]], expected: true, label: "has None" },
      { input: [[1, 2, 3]], expected: false, label: "no None" },
      { input: [[]], expected: false, label: "empty" },
    ],
  },
  {
    id: "g7",
    title: "dict.get() avoids KeyError",
    severity: "Common",
    what: "dict[key] raises KeyError if missing. dict.get(key, default) returns default instead.",
    why: "Common interview pattern: counting frequencies. Without .get() you need an if-check, with .get() it's one line.",
    example: `freq = {}
for c in "hello":
    # Without .get():
    if c in freq:
        freq[c] += 1
    else:
        freq[c] = 1

# With .get():
for c in "hello":
    freq[c] = freq.get(c, 0) + 1

# With defaultdict (better for DP):
from collections import defaultdict
freq = defaultdict(int)
for c in "hello":
    freq[c] += 1`,
    output: ".get(key, default) is the concise way to avoid KeyError and provide a default.",
    fix: "Use .get(key, default) for reads. Use defaultdict when you repeatedly increment. Use Counter for frequency counting.",
    task: "Given a dict and a key, return the value if present, else 0. Use .get()!",
    functionName: "safe_lookup",
    starter: `def safe_lookup(d, key):\n    # Return d[key] if present, else 0\n    # Use .get()!\n    pass`,
    hint: "d.get(key, 0) — one line.",
    solution: `def safe_lookup(d, key):\n    return d.get(key, 0)`,
    testCases: [
      { input: [{ a: 1, b: 2 }, "a"], expected: 1, label: "present" },
      { input: [{ a: 1 }, "z"], expected: 0, label: "missing" },
      { input: [{}, "x"], expected: 0, label: "empty" },
    ],
  },
];

interface Props {
  onBack: () => void;
}

const severityColors: Record<string, string> = {
  Common: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  Deep: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400",
  Deadly: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
};

export default function PythonGotchas({ onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);

  const g = gotchas[idx];
  const total = gotchas.length;

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setShowHint(false);
      setShowSolution(false);
      setSolved(false);
    }
  }

  function handlePrev() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setShowHint(false);
      setShowSolution(false);
      setSolved(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -mx-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Python Gotchas</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">The weird Python behaviors that bite in interviews — know them cold</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Gotcha {idx + 1} of {total}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${severityColors[g.severity]}`}>{g.severity}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div className="space-y-5" key={g.id}>
        {/* What */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{g.title}</h3>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">⚠️ What happens</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{g.what}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Why</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{g.why}</p>
          </div>

          <div className="bg-[#1e1e2e] rounded-lg p-4 mb-3">
            <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{g.example}</pre>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">{g.output}</p>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">✓ Fix</p>
            <div className="bg-[#1e1e2e] rounded mt-2 p-3">
              <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{g.fix}</pre>
            </div>
          </div>
        </div>

        {/* Task */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">✍️ Your Turn</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{g.task}</p>
        </div>

        {/* Hint */}
        {showHint && !solved && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 animate-fade-in">
            <p className="text-sm text-slate-700 dark:text-slate-300">💡 {g.hint}</p>
          </div>
        )}

        {showSolution && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 animate-fade-in">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wider">Solution</p>
            <div className="bg-[#1e1e2e] rounded p-3">
              <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{g.solution}</pre>
            </div>
          </div>
        )}

        <CodeEditor
          functionName={g.functionName}
          testCases={g.testCases}
          starterJS=""
          starterPython={g.starter}
          onPass={() => setSolved(true)}
        />

        <div className="flex items-center justify-center gap-3 text-xs">
          {!solved && (
            <>
              <button onClick={() => setShowHint(true)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {showHint ? "Hint shown" : "Get a hint"}
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button onClick={() => setShowSolution(true)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {showSolution ? "Solution shown" : "Show solution"}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <button onClick={handlePrev} disabled={idx === 0} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            ← Previous
          </button>
          <button onClick={handleNext} disabled={idx === total - 1} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next gotcha
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
