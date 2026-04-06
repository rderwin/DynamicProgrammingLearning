import { useState } from "react";
import IntroScreen from "./components/IntroScreen";
import TreeLesson from "./components/TreeLesson";
import TransitionLesson from "./components/TransitionLesson";
import CompletionScreen from "./components/CompletionScreen";
import { fibonacciConfig } from "./problems/configs/fibonacci";
import { climbingStairsConfig } from "./problems/configs/climbingStairs";
import { gridPathsConfig } from "./problems/configs/gridPaths";
import { coinChangeConfig } from "./problems/configs/coinChange";
import { knapsackConfig } from "./problems/configs/knapsack";
import { fibToStairs, stairsToGrid, gridToCoins, coinsToKnapsack } from "./content/transitions";
import type { TransitionContent } from "./components/TransitionLesson";

type View =
  | "intro"
  | "fibonacci" | "t-fib-stairs"
  | "stairs" | "t-stairs-grid"
  | "grid" | "t-grid-coins"
  | "coins" | "t-coins-knapsack"
  | "knapsack" | "complete";

interface ProblemEntry {
  id: View;
  label: string;
  config: typeof fibonacciConfig;
  transitionAfter?: { viewId: View; content: TransitionContent; nextView: View };
}

const problems: ProblemEntry[] = [
  { id: "fibonacci", label: "Fibonacci", config: fibonacciConfig, transitionAfter: { viewId: "t-fib-stairs", content: fibToStairs, nextView: "stairs" } },
  { id: "stairs", label: "Climbing Stairs", config: climbingStairsConfig, transitionAfter: { viewId: "t-stairs-grid", content: stairsToGrid, nextView: "grid" } },
  { id: "grid", label: "Grid Paths", config: gridPathsConfig, transitionAfter: { viewId: "t-grid-coins", content: gridToCoins, nextView: "coins" } },
  { id: "coins", label: "Coin Change", config: coinChangeConfig, transitionAfter: { viewId: "t-coins-knapsack", content: coinsToKnapsack, nextView: "knapsack" } },
  { id: "knapsack", label: "Knapsack", config: knapsackConfig },
];

function App() {
  const [view, setView] = useState<View>("intro");

  // Find current problem (transitions aren't in the problems list)
  const currentProblemIdx = problems.findIndex((p) => p.id === view);
  const currentProblem = currentProblemIdx >= 0 ? problems[currentProblemIdx] : null;
  const nextProblem = currentProblemIdx >= 0 && currentProblemIdx < problems.length - 1 ? problems[currentProblemIdx + 1] : null;

  // Find if we're in a transition
  const currentTransition = problems.find((p) => p.transitionAfter?.viewId === view)?.transitionAfter;

  // Is this a non-problem view?
  const isTransition = !!currentTransition;
  const isComplete = view === "complete";
  const isIntro = view === "intro";
  const showNav = !isIntro;

  // Figure out which nav tab to highlight during transitions
  const activeNavProblem = currentProblem?.id
    ?? (currentTransition ? problems.find((p) => p.transitionAfter?.viewId === view)?.id : null)
    ?? null;

  // "Next problem" from a lesson goes to transition (if exists) or completion
  function handleNextFromLesson() {
    if (currentProblem?.transitionAfter) {
      setView(currentProblem.transitionAfter.viewId);
    } else if (currentProblemIdx === problems.length - 1) {
      setView("complete");
    }
  }

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
                    p.id === activeNavProblem || p.id === view
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {isIntro && (
          <IntroScreen onStart={() => setView("fibonacci")} />
        )}

        {currentProblem && (
          <TreeLesson
            key={currentProblem.id}
            config={currentProblem.config}
            nextProblemLabel={
              currentProblem.transitionAfter
                ? currentProblem.transitionAfter.content.toLabel
                : currentProblemIdx === problems.length - 1
                  ? null
                  : nextProblem?.label ?? null
            }
            onNextProblem={handleNextFromLesson}
          />
        )}

        {isTransition && currentTransition && (
          <TransitionLesson
            key={view}
            content={currentTransition.content}
            onContinue={() => setView(currentTransition.nextView)}
          />
        )}

        {isComplete && <CompletionScreen />}
      </main>
    </div>
  );
}

export default App;
