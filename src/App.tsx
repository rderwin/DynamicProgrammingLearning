import { useState } from "react";
import FibonacciLesson from "./components/FibonacciLesson";
import IntroScreen from "./components/IntroScreen";

type View = "intro" | "fibonacci";

const problems = [
  { id: "fibonacci", label: "Fibonacci", available: true },
  { id: "stairs", label: "Climbing Stairs", available: false },
  { id: "grid", label: "Grid Paths", available: false },
  { id: "coins", label: "Coin Change", available: false },
  { id: "knapsack", label: "Knapsack", available: false },
];

function App() {
  const [view, setView] = useState<View>("intro");

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
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                DP Learning Lab
              </h1>
              <p className="text-[11px] text-slate-400 leading-tight">
                Zero to interview-ready
              </p>
            </div>
          </button>

          {view !== "intro" && (
            <nav className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs animate-fade-in">
              {problems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => p.available && setView(p.id as View)}
                  disabled={!p.available}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                    view === p.id
                      ? "bg-white text-slate-800 shadow-sm"
                      : p.available
                        ? "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        : "text-slate-300 cursor-not-allowed"
                  }`}
                >
                  {p.label}
                  {!p.available && (
                    <span className="ml-1 text-[9px] text-slate-300">
                      soon
                    </span>
                  )}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === "intro" && (
          <IntroScreen onStart={() => setView("fibonacci")} />
        )}
        {view === "fibonacci" && <FibonacciLesson />}
      </main>
    </div>
  );
}

export default App;
