import { useState, useEffect, useCallback } from "react";
import IntroScreen from "./components/IntroScreen";
import TreeLesson from "./components/TreeLesson";
import TransitionLesson from "./components/TransitionLesson";
import CompletionScreen from "./components/CompletionScreen";
import PracticeHub from "./components/PracticeHub";
import PracticeProblemView from "./components/PracticeProblemView";
import { fibonacciConfig } from "./problems/configs/fibonacci";
import { climbingStairsConfig } from "./problems/configs/climbingStairs";
import { gridPathsConfig } from "./problems/configs/gridPaths";
import { coinChangeConfig } from "./problems/configs/coinChange";
import { knapsackConfig } from "./problems/configs/knapsack";
import { fibToStairs, stairsToGrid, gridToCoins, coinsToKnapsack } from "./content/transitions";
import { practiceProblems } from "./practice/problems";
import type { TransitionContent } from "./components/TransitionLesson";

type View = string; // flexible — includes problem IDs, transitions, practice, etc.

interface ProblemEntry {
  id: string;
  label: string;
  config: typeof fibonacciConfig;
  transitionAfter?: { viewId: string; content: TransitionContent; nextView: string };
}

const problems: ProblemEntry[] = [
  { id: "fibonacci", label: "Fibonacci", config: fibonacciConfig, transitionAfter: { viewId: "t-fib-stairs", content: fibToStairs, nextView: "stairs" } },
  { id: "stairs", label: "Climbing Stairs", config: climbingStairsConfig, transitionAfter: { viewId: "t-stairs-grid", content: stairsToGrid, nextView: "grid" } },
  { id: "grid", label: "Grid Paths", config: gridPathsConfig, transitionAfter: { viewId: "t-grid-coins", content: gridToCoins, nextView: "coins" } },
  { id: "coins", label: "Coin Change", config: coinChangeConfig, transitionAfter: { viewId: "t-coins-knapsack", content: coinsToKnapsack, nextView: "knapsack" } },
  { id: "knapsack", label: "Knapsack", config: knapsackConfig },
];

// localStorage for practice completion
function loadCompleted(): Set<string> {
  try {
    const saved = localStorage.getItem("dp-practice-completed");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function saveCompleted(ids: Set<string>) {
  localStorage.setItem("dp-practice-completed", JSON.stringify([...ids]));
}

function App() {
  const [view, setView] = useState<View>("intro");
  const [completedIds, setCompletedIds] = useState<Set<string>>(loadCompleted);

  // Persist completions
  useEffect(() => { saveCompleted(completedIds); }, [completedIds]);

  const markComplete = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Current problem / transition
  const currentProblemIdx = problems.findIndex((p) => p.id === view);
  const currentProblem = currentProblemIdx >= 0 ? problems[currentProblemIdx] : null;
  const currentTransition = problems.find((p) => p.transitionAfter?.viewId === view)?.transitionAfter;

  // Practice views
  const isPracticeHub = view === "practice";
  const practiceProblemId = view.startsWith("practice-") ? view.slice("practice-".length) : null;
  const practiceProblem = practiceProblemId ? practiceProblems.find((p) => p.id === practiceProblemId) : null;

  const isIntro = view === "intro";
  const isComplete = view === "complete";
  const showNav = !isIntro;

  function handleNextFromLesson() {
    if (currentProblem?.transitionAfter) {
      setView(currentProblem.transitionAfter.viewId);
    } else if (currentProblemIdx === problems.length - 1) {
      setView("complete");
    }
  }

  // Highlight the right nav tab
  const activeNavProblem = currentProblem?.id
    ?? (currentTransition ? problems.find((p) => p.transitionAfter?.viewId === view)?.id : null)
    ?? null;

  const completedPracticeCount = practiceProblems.filter((p) => completedIds.has(p.id)).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setView("intro")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">DP Learning Lab</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Zero to interview-ready</p>
            </div>
          </button>

          {showNav && (
            <nav className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs animate-fade-in">
              {problems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setView(p.id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                    p.id === activeNavProblem
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <div className="w-px bg-slate-300 mx-0.5" />
              <button
                onClick={() => setView("practice")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  isPracticeHub || practiceProblem
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                }`}
              >
                Practice
                {completedPracticeCount > 0 && (
                  <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                    {completedPracticeCount}/{practiceProblems.length}
                  </span>
                )}
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {isIntro && <IntroScreen onStart={() => setView("fibonacci")} />}

        {currentProblem && (
          <TreeLesson
            key={currentProblem.id}
            config={currentProblem.config}
            nextProblemLabel={
              currentProblem.transitionAfter
                ? currentProblem.transitionAfter.content.toLabel
                : currentProblemIdx === problems.length - 1
                  ? null
                  : null
            }
            onNextProblem={handleNextFromLesson}
          />
        )}

        {currentTransition && (
          <TransitionLesson
            key={view}
            content={currentTransition.content}
            onContinue={() => setView(currentTransition.nextView)}
          />
        )}

        {isComplete && <CompletionScreen onPractice={() => setView("practice")} />}

        {isPracticeHub && (
          <PracticeHub
            problems={practiceProblems}
            completedIds={completedIds}
            onSelectProblem={(id) => setView(`practice-${id}`)}
          />
        )}

        {practiceProblem && (
          <PracticeProblemView
            key={practiceProblem.id}
            problem={practiceProblem}
            onBack={() => setView("practice")}
            onComplete={markComplete}
            isCompleted={completedIds.has(practiceProblem.id)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
