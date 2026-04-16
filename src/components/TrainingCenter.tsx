import { useState } from "react";
import PatternQuiz from "./PatternQuiz";
import BugHunt from "./BugHunt";
import SpeedDrill from "./SpeedDrill";
import { dpPatternQuiz, graphPatternQuiz, mixedPatternQuiz } from "../content/quizQuestions";
import { dpBugChallenges, graphBugChallenges } from "../content/bugChallenges";
import { speedDrillProblems } from "../content/speedDrills";
import ConceptCards from "./ConceptCards";
import ComplexityEstimator from "./ComplexityEstimator";
import InterviewSim from "./InterviewSim";
import { allConceptCards } from "../content/conceptCards";
import { complexityChallenges } from "../content/complexityChallenges";
import { interviewProblems } from "../content/interviewProblems";
interface Props {
  onBack: () => void;
  onXP: (amount: number) => void;
}

type Mode = "menu" | "quiz-dp" | "quiz-graphs" | "quiz-mixed" | "bugs-dp" | "bugs-graphs" | "speed" | "cards" | "complexity" | "interview";

const activities = [
  { id: "quiz-dp" as Mode, icon: "🎯", title: "DP Pattern Quiz", desc: "5 questions — identify the DP pattern", xp: 25, color: "from-blue-500 to-violet-600" },
  { id: "quiz-graphs" as Mode, icon: "🗺️", title: "Graph Pattern Quiz", desc: "5 questions — identify the graph algorithm", xp: 25, color: "from-emerald-500 to-teal-600" },
  { id: "quiz-mixed" as Mode, icon: "🧩", title: "Mixed Pattern Quiz", desc: "5 questions — any topic, any pattern", xp: 40, color: "from-amber-500 to-orange-600" },
  { id: "bugs-dp" as Mode, icon: "🔍", title: "DP Bug Hunt", desc: "5 buggy DP solutions — find the line", xp: 30, color: "from-violet-500 to-purple-600" },
  { id: "bugs-graphs" as Mode, icon: "🐛", title: "Graph Bug Hunt", desc: "3 buggy graph solutions — find the line", xp: 30, color: "from-pink-500 to-rose-600" },
  { id: "speed" as Mode, icon: "⏱️", title: "Speed Drill", desc: "8 timed coding challenges — build fluency under pressure", xp: 50, color: "from-red-500 to-orange-600" },
  { id: "cards" as Mode, icon: "🧠", title: "Concept Review", desc: "19 flashcards — test your recall of key concepts", xp: 20, color: "from-sky-500 to-blue-600" },
  { id: "complexity" as Mode, icon: "📊", title: "Complexity Estimator", desc: "8 code snippets — guess the Big O for time and space", xp: 35, color: "from-cyan-500 to-teal-600" },
  { id: "interview" as Mode, icon: "🎤", title: "Mock Interview", desc: "Full flow: read → identify → plan → code → analyze", xp: 75, color: "from-indigo-500 to-blue-600" },
];

export default function TrainingCenter({ onBack, onXP }: Props) {
  const [mode, setMode] = useState<Mode>("menu");

  function handleQuizComplete(score: number, total: number) {
    const pct = score / total;
    const activity = activities.find((a) => a.id === mode);
    const baseXP = activity?.xp ?? 20;
    const xp = Math.round(baseXP * pct);
    if (xp > 0) onXP(xp);
  }

  if (mode === "quiz-dp") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><PatternQuiz questions={dpPatternQuiz} onComplete={handleQuizComplete} title="DP Pattern Recognition" /></div>;
  if (mode === "quiz-graphs") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><PatternQuiz questions={graphPatternQuiz} onComplete={handleQuizComplete} title="Graph Pattern Recognition" /></div>;
  if (mode === "quiz-mixed") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><PatternQuiz questions={mixedPatternQuiz} onComplete={handleQuizComplete} title="Mixed Pattern Recognition" /></div>;
  if (mode === "bugs-dp") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><BugHunt challenges={dpBugChallenges} onComplete={handleQuizComplete} /></div>;
  if (mode === "bugs-graphs") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><BugHunt challenges={graphBugChallenges} onComplete={handleQuizComplete} /></div>;
  if (mode === "speed") return <div className="max-w-3xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><SpeedDrill problems={speedDrillProblems} onComplete={(results) => { const solved = results.filter(r => r.solved).length; handleQuizComplete(solved, results.length); }} /></div>;
  if (mode === "cards") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><ConceptCards cards={allConceptCards} onComplete={handleQuizComplete} /></div>;
  if (mode === "complexity") return <div className="max-w-2xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><ComplexityEstimator challenges={complexityChallenges} onComplete={handleQuizComplete} /></div>;
  if (mode === "interview") {
    const randomProblem = interviewProblems[Math.floor(Math.random() * interviewProblems.length)];
    return <div className="max-w-3xl mx-auto"><BackBtn onClick={() => setMode("menu")} /><InterviewSim problem={randomProblem} onComplete={(result) => { const score = [result.identifiedPattern, result.planWritten, result.codePassed, result.complexityCorrect].filter(Boolean).length; handleQuizComplete(score, 4); }} /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Training Center</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Sharpen your pattern recognition and debugging skills
        </p>
      </div>

      {/* Activities */}
      <div className="space-y-3">
        {activities.map((a) => (
          <button
            key={a.id}
            onClick={() => setMode(a.id)}
            className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                <span className="text-xl">{a.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{a.title}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{a.desc}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  up to +{a.xp} XP
                </span>
                <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      Training Center
    </button>
  );
}
