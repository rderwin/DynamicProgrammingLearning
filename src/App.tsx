import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import IntroScreen from "./components/IntroScreen";
import TreeLesson from "./components/TreeLesson";
import TransitionLesson from "./components/TransitionLesson";
import CompletionScreen from "./components/CompletionScreen";
import PracticeHub from "./components/PracticeHub";
import PracticeProblemView from "./components/PracticeProblemView";
import AccountPage from "./components/AccountPage";
import { fibonacciConfig } from "./problems/configs/fibonacci";
import { climbingStairsConfig } from "./problems/configs/climbingStairs";
import { gridPathsConfig } from "./problems/configs/gridPaths";
import { coinChangeConfig } from "./problems/configs/coinChange";
import { knapsackConfig } from "./problems/configs/knapsack";
import { fibToStairs, stairsToGrid, gridToCoins, coinsToKnapsack } from "./content/transitions";
import { practiceProblems } from "./practice/problems";
import {
  loadUserData,
  debouncedSave,
  flushPendingSave,
  loadLocalData,
  saveLocalData,
  type UserData,
  type LessonProgress,
} from "./services/userDataService";
import type { TransitionContent } from "./components/TransitionLesson";

type View = string;

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

const DEFAULT_DATA: UserData = {
  lessonProgress: {},
  practiceCompleted: [],
  practiceCode: {},
};

function AppInner() {
  const { user, loading, signIn } = useAuth();
  const [view, setView] = useState<View>("intro");
  const [userData, setUserData] = useState<UserData>(DEFAULT_DATA);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load data on auth change
  useEffect(() => {
    async function load() {
      if (user) {
        const data = await loadUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(loadLocalData());
      }
      setDataLoaded(true);
    }
    load();
  }, [user]);

  // Save whenever userData changes
  const persist = useCallback(
    (data: UserData) => {
      if (user) {
        debouncedSave(user.uid, data);
      } else {
        saveLocalData(data);
      }
    },
    [user]
  );

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => flushPendingSave();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ─── Data helpers ───

  const updateLessonProgress = useCallback(
    (problemId: string, update: Partial<LessonProgress>) => {
      setUserData((prev) => {
        const existing = prev.lessonProgress[problemId] || {
          stage: "intro",
          challengePassed: false,
          code: { js: "", py: "" },
        };
        const next = {
          ...prev,
          lessonProgress: {
            ...prev.lessonProgress,
            [problemId]: { ...existing, ...update },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markPracticeComplete = useCallback(
    (id: string) => {
      setUserData((prev) => {
        if (prev.practiceCompleted.includes(id)) return prev;
        const next = {
          ...prev,
          practiceCompleted: [...prev.practiceCompleted, id],
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const savePracticeCode = useCallback(
    (id: string, lang: "js" | "py", code: string) => {
      setUserData((prev) => {
        const existing = prev.practiceCode[id] || { js: "", py: "" };
        const next = {
          ...prev,
          practiceCode: {
            ...prev.practiceCode,
            [id]: { ...existing, [lang]: code },
          },
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetAllProgress = useCallback(() => {
    const fresh = { ...DEFAULT_DATA };
    setUserData(fresh);
    persist(fresh);
    setView("intro");
  }, [persist]);

  // ─── View routing ───

  const currentProblemIdx = problems.findIndex((p) => p.id === view);
  const currentProblem = currentProblemIdx >= 0 ? problems[currentProblemIdx] : null;
  const currentTransition = problems.find((p) => p.transitionAfter?.viewId === view)?.transitionAfter;

  const isPracticeHub = view === "practice";
  const practiceProblemId = view.startsWith("practice-") ? view.slice("practice-".length) : null;
  const practiceProblem = practiceProblemId ? practiceProblems.find((p) => p.id === practiceProblemId) : null;

  const isIntro = view === "intro";
  const isComplete = view === "complete";
  const isAccount = view === "account";
  const showNav = !isIntro;

  function handleNextFromLesson() {
    if (currentProblem?.transitionAfter) {
      setView(currentProblem.transitionAfter.viewId);
    } else if (currentProblemIdx === problems.length - 1) {
      setView("complete");
    }
  }

  const activeNavProblem = currentProblem?.id
    ?? (currentTransition ? problems.find((p) => p.transitionAfter?.viewId === view)?.id : null)
    ?? null;

  const completedPracticeCount = userData.practiceCompleted.length;
  const completedIds = new Set(userData.practiceCompleted);

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
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

          <div className="flex items-center gap-3">
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

            {/* Auth button */}
            {user ? (
              <button
                onClick={() => setView("account")}
                className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all hover:bg-slate-100 ${isAccount ? "bg-slate-100" : ""}`}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {user.displayName?.[0] || "?"}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in
              </button>
            )}
          </div>
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
              currentProblem.transitionAfter ? currentProblem.transitionAfter.content.toLabel : null
            }
            onNextProblem={handleNextFromLesson}
            savedProgress={userData.lessonProgress[currentProblem.id]}
            onProgressChange={(update) => updateLessonProgress(currentProblem.id, update)}
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
            onComplete={markPracticeComplete}
            isCompleted={completedIds.has(practiceProblem.id)}
            savedCode={userData.practiceCode[practiceProblem.id]}
            onCodeChange={(lang, code) => savePracticeCode(practiceProblem.id, lang, code)}
          />
        )}

        {isAccount && (
          <AccountPage
            userData={userData}
            onReset={resetAllProgress}
            totalLessons={problems.length}
            totalPractice={practiceProblems.length}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
