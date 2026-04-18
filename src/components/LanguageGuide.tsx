import { useState } from "react";

interface Language {
  id: string;
  name: string;
  icon: string;
  color: string;
  bestFor: string[];
  pros: string[];
  cons: string[];
  interviewScore: number; // out of 10
  speedScore: number; // verbosity / typing speed
  libraryScore: number; // built-in DSA support
  commonAt: string[]; // companies
  codeExample: { title: string; code: string };
  quickTips: string[];
}

const languages: Language[] = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "from-blue-500 to-yellow-500",
    bestFor: ["Most FAANG interviews", "Algorithm-heavy problems", "Clear, readable code", "Less typing"],
    pros: [
      "Most concise for DSA — less boilerplate",
      "Rich built-ins: heapq, collections, itertools, bisect",
      "Readable — interviewers can follow your thinking",
      "Slicing, list comprehensions make code short",
    ],
    cons: [
      "Slower runtime (rarely matters for interviews)",
      "No built-in ordered map/set (use sortedcontainers)",
      "GIL makes true parallelism hard",
    ],
    interviewScore: 10,
    speedScore: 10,
    libraryScore: 9,
    commonAt: ["Google", "Meta", "Netflix", "Dropbox", "Stripe"],
    codeExample: {
      title: "Two Sum — so clean",
      code: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`,
    },
    quickTips: [
      "Use collections.defaultdict for maps with default values",
      "Use heapq for priority queues (min-heap by default; negate for max-heap)",
      "Use bisect for binary search on sorted lists",
      "enumerate() gives both index and value in one line",
    ],
  },
  {
    id: "javascript",
    name: "JavaScript / TypeScript",
    icon: "📜",
    color: "from-yellow-400 to-amber-500",
    bestFor: ["Web/frontend roles", "Full-stack positions", "Quick iteration"],
    pros: [
      "Ubiquitous — runs everywhere",
      "Great for showing full-stack skills",
      "Object literal syntax is concise",
      "TypeScript shows attention to type safety",
    ],
    cons: [
      "No built-in heap, BST, or ordered set",
      "Array.sort() defaults to string sort — easy bug",
      "Integer overflow issues at 2^53",
      "Many ways to do things — can look inconsistent",
    ],
    interviewScore: 7,
    speedScore: 8,
    libraryScore: 5,
    commonAt: ["Meta (frontend)", "Netflix", "Airbnb", "LinkedIn"],
    codeExample: {
      title: "Two Sum — still clean",
      code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
}`,
    },
    quickTips: [
      "Always pass a comparator to .sort((a,b) => a-b) for numbers",
      "Use Map/Set instead of objects for key-value when keys aren't strings",
      "Implement your own heap or import one — not built in",
      "const [a, b] = [b, a] — JS has nice destructuring",
    ],
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    color: "from-orange-500 to-red-600",
    bestFor: ["Amazon, Big Tech backend", "Systems-heavy roles", "Enterprise interviews"],
    pros: [
      "Rich Collections framework (PriorityQueue, TreeMap, ArrayDeque)",
      "Strong typing catches bugs at compile time",
      "Most prepared courses use Java",
      "Explicit code — interviewers see exactly what you mean",
    ],
    cons: [
      "Verbose — lots of typing for boilerplate",
      "Need to import everything",
      "Generic type erasure can be confusing",
      "No tuples — need classes or arrays",
    ],
    interviewScore: 9,
    speedScore: 5,
    libraryScore: 10,
    commonAt: ["Amazon", "Google", "Oracle", "LinkedIn", "Uber"],
    codeExample: {
      title: "Two Sum — verbose but clear",
      code: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement))
            return new int[]{seen.get(complement), i};
        seen.put(nums[i], i);
    }
    return new int[]{};
}`,
    },
    quickTips: [
      "PriorityQueue is a min-heap; use (a,b) -> b-a for max-heap",
      "TreeMap gives O(log n) floor/ceiling operations",
      "ArrayDeque beats Stack/LinkedList for both stacks and queues",
      "Use Arrays.asList() for quick list creation",
    ],
  },
  {
    id: "cpp",
    name: "C++",
    icon: "⚡",
    color: "from-blue-600 to-indigo-700",
    bestFor: ["Competitive programming", "Systems / HFT roles", "Performance-critical interviews"],
    pros: [
      "Fastest runtime — never times out",
      "STL has everything: priority_queue, set, map, multiset",
      "iota, accumulate, upper_bound are powerful",
      "Competitive programming culture — interviewers respect it",
    ],
    cons: [
      "Memory management mistakes kill you",
      "Verbose templates",
      "Undefined behavior can silently give wrong answers",
      "Compile errors are cryptic",
    ],
    interviewScore: 7,
    speedScore: 6,
    libraryScore: 10,
    commonAt: ["Citadel", "Jane Street", "Google", "Two Sigma", "Bloomberg"],
    codeExample: {
      title: "Two Sum — verbose but fast",
      code: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement))
            return {seen[complement], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
    },
    quickTips: [
      "Use unordered_map/set for O(1); map/set are O(log n) (ordered)",
      "auto& in range-for loops avoids copies",
      "priority_queue is max-heap by default",
      "vector<int>(n) fills with 0; vector<int>(n, val) fills with val",
    ],
  },
  {
    id: "go",
    name: "Go",
    icon: "🐹",
    color: "from-cyan-500 to-blue-600",
    bestFor: ["Backend / systems roles", "Cloud / infrastructure", "Google interviews (optional)"],
    pros: [
      "Fast compilation and execution",
      "Simple, explicit syntax",
      "Great for systems design portions",
      "No tricky language features",
    ],
    cons: [
      "No generics historically (added in 1.18+)",
      "Verbose error handling",
      "Limited built-in DSA: no built-in heap or sorted set",
      "Unusual choice for algorithm interviews",
    ],
    interviewScore: 6,
    speedScore: 7,
    libraryScore: 6,
    commonAt: ["Google (infra)", "Uber", "Docker", "Kubernetes-focused companies"],
    codeExample: {
      title: "Two Sum",
      code: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, n := range nums {
        if j, ok := seen[target-n]; ok {
            return []int{j, i}
        }
        seen[n] = i
    }
    return nil
}`,
    },
    quickTips: [
      "Use container/heap for priority queues (requires interface implementation)",
      "sort.Slice with custom comparator works well",
      "range gives index, value — similar to Python enumerate",
      "Avoid map iteration order — it's randomized",
    ],
  },
];

interface Props {
  onBack: () => void;
}

type View = "main" | "compare" | "quiz";

export default function LanguageGuide({ onBack }: Props) {
  const [view, setView] = useState<View>("main");
  const [selectedLang, setSelectedLang] = useState<string>("python");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const lang = languages.find((l) => l.id === selectedLang)!;

  const quizQuestions = [
    { id: "q1", label: "What kind of role are you interviewing for?", options: [
      { value: "backend", label: "Backend / Systems" },
      { value: "frontend", label: "Frontend / Web" },
      { value: "data", label: "Data / ML" },
      { value: "quant", label: "Quant / HFT" },
    ]},
    { id: "q2", label: "What's most important to you?", options: [
      { value: "speed", label: "Writing less code (faster to type)" },
      { value: "clarity", label: "Clear, explicit code" },
      { value: "runtime", label: "Runtime performance" },
      { value: "libraries", label: "Built-in data structures" },
    ]},
    { id: "q3", label: "Prior experience?", options: [
      { value: "python", label: "I know Python best" },
      { value: "java", label: "I know Java best" },
      { value: "js", label: "I know JS/TS best" },
      { value: "cpp", label: "I know C++ best" },
      { value: "new", label: "I'm new to this" },
    ]},
  ];

  function submitQuiz() {
    const { q1, q2, q3 } = quizAnswers;
    // If they already know a language, use that unless the role requires otherwise
    if (q1 === "quant" || q2 === "runtime") { setQuizResult("cpp"); return; }
    if (q1 === "frontend" || q3 === "js") { setQuizResult("javascript"); return; }
    if (q3 === "java" || q1 === "backend" && q2 === "libraries") { setQuizResult("java"); return; }
    if (q3 === "cpp") { setQuizResult("cpp"); return; }
    setQuizResult("python"); // default — best for most interviews
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/20">
          <span className="text-2xl">💬</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Language Guide</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Pick the right language for your interview</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 justify-center">
        <button onClick={() => { setView("main"); setQuizResult(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "main" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
          Explore Languages
        </button>
        <button onClick={() => { setView("compare"); setQuizResult(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "compare" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
          Side-by-Side Compare
        </button>
        <button onClick={() => { setView("quiz"); setQuizResult(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "quiz" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
          Help Me Choose
        </button>
      </div>

      {view === "main" && (
        <>
          {/* Language selector */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLang(l.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${selectedLang === l.id ? `bg-gradient-to-br ${l.color} text-white shadow-md` : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                <span className="mr-1.5">{l.icon}</span>
                {l.name}
              </button>
            ))}
          </div>

          {/* Language detail */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in" key={lang.id}>
            {/* Header */}
            <div className={`bg-gradient-to-br ${lang.color} p-6 text-white`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{lang.icon}</span>
                <h3 className="text-2xl font-bold">{lang.name}</h3>
              </div>
              <p className="text-sm opacity-90">Best for: {lang.bestFor.join(", ")}</p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
              <ScoreBar label="Interview Fit" score={lang.interviewScore} />
              <ScoreBar label="Code Speed" score={lang.speedScore} />
              <ScoreBar label="Built-in DS" score={lang.libraryScore} />
            </div>

            {/* Pros/Cons */}
            <div className="grid md:grid-cols-2 gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">✓ Pros</p>
                <ul className="space-y-1">
                  {lang.pros.map((p) => <li key={p} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{p}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">✗ Cons</p>
                <ul className="space-y-1">
                  {lang.cons.map((c) => <li key={c} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>{c}</li>)}
                </ul>
              </div>
            </div>

            {/* Code example */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Example: {lang.codeExample.title}</p>
              <div className="bg-[#1e1e2e] rounded-lg p-4">
                <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{lang.codeExample.code}</pre>
              </div>
            </div>

            {/* Quick tips */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Interview Tips</p>
              <ul className="space-y-1">
                {lang.quickTips.map((t) => <li key={t} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2"><span className="text-blue-500 mt-0.5">💡</span>{t}</li>)}
              </ul>
            </div>

            {/* Common at */}
            <div className="p-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Popular at</p>
              <div className="flex flex-wrap gap-1.5">
                {lang.commonAt.map((c) => <span key={c} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">{c}</span>)}
              </div>
            </div>
          </div>
        </>
      )}

      {view === "compare" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Feature</th>
                  {languages.map((l) => (
                    <th key={l.id} className="text-center px-4 py-3">
                      <div className="text-xl">{l.icon}</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{l.name.split(" ")[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Interview Fit</td>
                  {languages.map((l) => <td key={l.id} className="text-center px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{l.interviewScore}/10</td>)}
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Code Speed</td>
                  {languages.map((l) => <td key={l.id} className="text-center px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{l.speedScore}/10</td>)}
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Built-in DS</td>
                  {languages.map((l) => <td key={l.id} className="text-center px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{l.libraryScore}/10</td>)}
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Priority Queue</td>
                  <td className="text-center px-4 py-3 text-emerald-600">✓ heapq</td>
                  <td className="text-center px-4 py-3 text-amber-600">✗ manual</td>
                  <td className="text-center px-4 py-3 text-emerald-600">✓ PriorityQueue</td>
                  <td className="text-center px-4 py-3 text-emerald-600">✓ priority_queue</td>
                  <td className="text-center px-4 py-3 text-amber-600">~ container/heap</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Sorted Map</td>
                  <td className="text-center px-4 py-3 text-amber-600">~ sortedcontainers</td>
                  <td className="text-center px-4 py-3 text-red-500">✗</td>
                  <td className="text-center px-4 py-3 text-emerald-600">✓ TreeMap</td>
                  <td className="text-center px-4 py-3 text-emerald-600">✓ map</td>
                  <td className="text-center px-4 py-3 text-red-500">✗</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Typing Speed</td>
                  <td className="text-center px-4 py-3 text-emerald-600">Fast</td>
                  <td className="text-center px-4 py-3 text-emerald-600">Fast</td>
                  <td className="text-center px-4 py-3 text-amber-600">Verbose</td>
                  <td className="text-center px-4 py-3 text-amber-600">Verbose</td>
                  <td className="text-center px-4 py-3 text-amber-600">Medium</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Runtime Speed</td>
                  <td className="text-center px-4 py-3 text-amber-600">Slow</td>
                  <td className="text-center px-4 py-3 text-amber-600">Medium</td>
                  <td className="text-center px-4 py-3 text-emerald-600">Fast</td>
                  <td className="text-center px-4 py-3 text-emerald-600">Fastest</td>
                  <td className="text-center px-4 py-3 text-emerald-600">Fast</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "quiz" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 animate-fade-in">
          {!quizResult ? (
            <>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Answer 3 questions to find your language</h3>
              <div className="space-y-4">
                {quizQuestions.map((q) => (
                  <div key={q.id}>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{q.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setQuizAnswers((a) => ({ ...a, [q.id]: opt.value }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${quizAnswers[q.id] === opt.value ? "bg-fuchsia-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={submitQuiz}
                disabled={Object.keys(quizAnswers).length < 3}
                className="mt-6 px-5 py-2 bg-fuchsia-500 text-white rounded-lg text-sm font-semibold hover:bg-fuchsia-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Get Recommendation
              </button>
            </>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Recommended for you:</p>
              <div className="text-5xl mb-2">{languages.find((l) => l.id === quizResult)?.icon}</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{languages.find((l) => l.id === quizResult)?.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{languages.find((l) => l.id === quizResult)?.bestFor[0]}</p>
              <button
                onClick={() => { setView("main"); setSelectedLang(quizResult); setQuizResult(null); }}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all"
              >
                Learn more →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{score}/10</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${score * 10}%` }} />
      </div>
    </div>
  );
}
