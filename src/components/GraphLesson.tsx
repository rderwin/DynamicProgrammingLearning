import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import GraphView from "./GraphView";
import DataStructurePanel from "./DataStructurePanel";
import GraphCodePanel from "./GraphCodePanel";
import CodeEditor from "./CodeEditor";
import Hints from "./Hints";
import ExplainBack from "./ExplainBack";
import type { AlgorithmStep } from "../modules/graphs/graphs/types";
import type { GraphCodeLine } from "./GraphCodePanel";
import type { TestCase } from "../engine/runCode";

// ─── GraphProblemConfig ───

export interface GraphProblemConfig {
  title: string;
  problemNumber: number;
  totalProblems: number;
  difficulty: string;
  description: React.ReactNode;

  graph: import("../modules/graphs/graphs/types").GraphData;
  generateSteps: (graph: import("../modules/graphs/graphs/types").GraphData) => AlgorithmStep[];
  algorithmName: string;

  codeLines: GraphCodeLine[];
  getActiveLine: (step: AlgorithmStep | null) => number | null;

  functionName: string;
  testCases: TestCase[];
  starterJS: string;
  starterPython: string;
  hints: string[];
  solutionJS: string;

  dataStructureType: "queue" | "stack" | "priority-queue";
  dataStructureLabel: string;

  insights: {
    exploreTitle: string;
    exploreBody: (stats: { totalSteps: number; nodesVisited: number }) => React.ReactNode;
    complexity: React.ReactNode;
  };
}

// ─── Stages ───

type Stage = "intro" | "explore" | "explore-done" | "challenge";

const STAGE_ORDER: Stage[] = ["intro", "explore", "explore-done", "challenge"];
const STAGE_NAV = [
  { stage: "intro" as Stage, label: "Setup", short: "1" },
  { stage: "explore" as Stage, label: "Explore", short: "2" },
  { stage: "explore-done" as Stage, label: "Insight", short: "3" },
  { stage: "challenge" as Stage, label: "Code", short: "4" },
];
function stageIdx(s: Stage) { return STAGE_ORDER.indexOf(s); }

interface SavedProgress {
  stage: string;
  challengePassed: boolean;
  code: { js: string; py: string };
}

interface Props {
  config: GraphProblemConfig;
  nextProblemLabel: string | null;
  onNextProblem?: () => void;
  savedProgress?: SavedProgress;
  onProgressChange?: (update: Partial<SavedProgress>) => void;
}

export default function GraphLesson({ config, nextProblemLabel, onNextProblem, savedProgress, onProgressChange }: Props) {
  const rawStage = savedProgress?.stage as string | undefined;
  const initialStage: Stage = rawStage && STAGE_ORDER.includes(rawStage as Stage) ? (rawStage as Stage) : "intro";
  const initialMax = STAGE_ORDER.indexOf(initialStage);

  const [stage, setStage] = useState<Stage>(initialStage);
  const [maxReached, setMaxReached] = useState(initialMax);
  const [challengePassed, setChallengePassed] = useState(savedProgress?.challengePassed ?? false);

  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const playRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Generate steps
  const steps = useMemo(() => config.generateSteps(config.graph), [config]);

  // Track progress
  useEffect(() => {
    setMaxReached((prev) => Math.max(prev, stageIdx(stage)));
    onProgressChange?.({ stage });
  }, [stage]);

  // Auto-advance
  const totalSteps = steps.length;
  const hasStarted = stepIndex >= 0;
  const isComplete = stepIndex === totalSteps - 1;

  useEffect(() => {
    if (isComplete && stage === "explore") setStage("explore-done");
  }, [isComplete, stage]);

  // ─── Compute visualization state ───
  const visitedNodes = new Set<string>();
  const exploredEdges = new Set<string>();
  const frontierNodes = new Set<string>();
  let activeNode: string | null = null;
  let activeEdge: string | null = null;
  let currentDS: string[] = [];
  let lastAdded: string | null = null;
  let lastRemoved: string | null = null;
  let currentStep: AlgorithmStep | null = null;
  const finalizedNodes = new Set<string>();
  const distances: Record<string, number> = {};
  const sortedOutput: string[] = [];

  if (stepIndex >= 0) {
    const stepsToShow = steps.slice(0, stepIndex + 1);
    currentStep = stepsToShow[stepsToShow.length - 1];
    const dsTracker: string[] = [];

    for (const s of stepsToShow) {
      if (s.action === "visit") { visitedNodes.add(s.nodeId!); frontierNodes.delete(s.nodeId!); }
      if (s.action === "explore-edge" && s.edgeId) exploredEdges.add(s.edgeId);
      if (s.action === "enqueue" || s.action === "push") { frontierNodes.add(s.nodeId!); dsTracker.push(s.nodeId!); }
      if (s.action === "dequeue") { const item = dsTracker.shift(); if (item) frontierNodes.delete(item); }
      if (s.action === "pop") { const item = dsTracker.pop(); if (item) frontierNodes.delete(item); }
      if (s.action === "finalize") finalizedNodes.add(s.nodeId!);
      if (s.action === "add-to-order" && s.nodeId) sortedOutput.push(s.nodeId);
      if (s.distances) Object.assign(distances, s.distances);
    }

    currentDS = currentStep.dataStructure;
    activeNode = currentStep.nodeId ?? null;
    activeEdge = currentStep.edgeId ?? null;

    if (currentStep.action === "enqueue" || currentStep.action === "push") lastAdded = currentStep.nodeId ?? null;
    if (currentStep.action === "dequeue" || currentStep.action === "pop") lastRemoved = currentStep.nodeId ?? null;
  }

  const nodesVisited = visitedNodes.size;

  // ─── Playback ───
  const step = useCallback(() => {
    setStepIndex((prev) => {
      if (prev < totalSteps - 1) return prev + 1;
      setIsPlaying(false); playRef.current = false; return prev;
    });
  }, [totalSteps]);

  const play = useCallback(() => {
    setIsPlaying(true); playRef.current = true;
    function tick() {
      if (!playRef.current) return;
      setStepIndex((prev) => {
        if (prev < totalSteps - 1) { setTimeout(tick, speedRef.current); return prev + 1; }
        setIsPlaying(false); playRef.current = false; return prev;
      });
    }
    tick();
  }, [totalSteps]);

  const pause = useCallback(() => { setIsPlaying(false); playRef.current = false; }, []);
  const resetAnim = () => { setStepIndex(-1); setIsPlaying(false); playRef.current = false; };

  // Keyboard
  useEffect(() => {
    if (stage !== "explore") return;
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.closest?.(".cm-editor")) return;
      if (e.code === "Space") { e.preventDefault(); if (isComplete) return; if (isPlaying) pause(); else play(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); if (!isPlaying && !isComplete) step(); }
      else if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); resetAnim(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stage, isPlaying, isComplete, play, pause, step]);

  const progressPercent = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const speedLabel = speed <= 100 ? "Fast" : speed <= 250 ? "Normal" : speed <= 450 ? "Slow" : "Very Slow";

  // Stage navigation
  function goToStage(target: Stage) {
    const targetIdx = stageIdx(target);
    if (targetIdx > maxReached) return;
    if (target === "explore" && maxReached >= stageIdx("explore-done")) { setStage("explore-done"); return; }
    setStage(target);
    if (target === "explore") resetAnim();
  }

  function restart() {
    setStage("intro");
    setMaxReached(0);
    setChallengePassed(false);
    resetAnim();
  }

  const showGraph = stage !== "intro" && stage !== "challenge";

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            Problem {config.problemNumber} of {config.totalProblems}
          </span>
          <span className="text-xs text-slate-400">Difficulty: {config.difficulty}</span>
          {stage !== "intro" && (
            <button onClick={restart} className="ml-auto text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">← Start over</button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{config.title}</h2>
        <div className="text-slate-500 dark:text-slate-400 mt-1">{config.description}</div>
      </div>

      {/* Stage nav */}
      {stage !== "intro" && (
        <div className="flex items-center gap-1 animate-fade-in">
          {STAGE_NAV.map((nav, i) => {
            const isActive = nav.stage === stage;
            const reached = i <= maxReached;
            return (
              <div key={nav.stage} className="flex items-center">
                {i > 0 && <div className={`w-6 h-px mx-0.5 ${i <= maxReached ? "bg-emerald-300 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-700"}`} />}
                <button
                  onClick={() => reached && goToStage(nav.stage)}
                  disabled={!reached}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                    isActive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700"
                    : reached ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isActive && <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 align-middle" />}
                  <span className="hidden sm:inline">{nav.label}</span>
                  <span className="sm:hidden">{nav.short}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ INTRO ═══ */}
      {stage === "intro" && (
        <div className="animate-fade-in-up">
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/30 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">
            <div className="max-w-lg mx-auto">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Watch {config.algorithmName} in action</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{config.description}</p>
              <button
                onClick={() => setStage("explore")}
                className="group inline-flex items-center gap-2 bg-emerald-700 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-700/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Start exploring
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXPLORE CONTROLS ═══ */}
      {stage === "explore" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-4 shadow-sm animate-slide-down">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button onClick={step} disabled={isPlaying || isComplete} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm" title="Step (→)">Step</button>
              <button onClick={isPlaying ? pause : play} disabled={isComplete} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${isPlaying ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-emerald-500 text-white hover:bg-emerald-600"}`} title="Play/Pause (Space)">
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button onClick={resetAnim} className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200" title="Reset (R)">Reset</button>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              <input type="range" min={50} max={600} step={10} value={650 - speed} onChange={(e) => setSpeed(650 - Number(e.target.value))} className="w-16 accent-emerald-500" />
              <span className="text-[10px] font-medium text-slate-400 w-12">{speedLabel}</span>
            </label>
            {!hasStarted && (
              <>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                <div className="flex gap-3 text-[10px] text-slate-400">
                  <span><kbd className="kbd-hint">Space</kbd> play</span>
                  <span><kbd className="kbd-hint">→</kbd> step</span>
                  <span><kbd className="kbd-hint">R</kbd> reset</span>
                </div>
              </>
            )}
          </div>
          {hasStarted && (
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-xs text-slate-500">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">{stepIndex + 1}</span>
                <span className="text-slate-300 dark:text-slate-600">/{totalSteps}</span>
                <span className="ml-3">Visited: <span className="font-mono font-bold text-emerald-600 tabular-nums">{nodesVisited}</span>/{config.graph.nodes.length}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ═══ GRAPH + CODE ═══ */}
      {showGraph && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-in-up">
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 min-h-[350px] flex items-center justify-center shadow-sm">
            {hasStarted || stage === "explore-done" ? (
              <GraphView
                graph={config.graph}
                visitedNodes={visitedNodes}
                activeNode={stage === "explore" ? activeNode : null}
                exploredEdges={exploredEdges}
                activeEdge={stage === "explore" ? activeEdge : null}
                frontierNodes={frontierNodes}
                finalizedNodes={finalizedNodes.size > 0 ? finalizedNodes : undefined}
                distances={Object.keys(distances).length > 0 ? distances : undefined}
                sortedOutput={sortedOutput.length > 0 ? sortedOutput : undefined}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="empty-state-icon">
                  <svg className="w-16 h-16 text-slate-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <p className="text-sm">Press <kbd className="kbd-hint">Space</kbd> or click <strong className="text-slate-500">Play</strong></p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <GraphCodePanel
              algorithmName={config.algorithmName}
              codeLines={config.codeLines}
              currentStep={hasStarted ? currentStep : null}
              getActiveLine={config.getActiveLine}
            />
          </div>
        </div>
      )}

      {/* Data structure panel */}
      {stage === "explore" && hasStarted && (
        <div className="animate-fade-in-up">
          <DataStructurePanel
            type={config.dataStructureType}
            label={config.dataStructureLabel}
            items={currentDS}
            lastAdded={lastAdded}
            lastRemoved={lastRemoved}
          />
        </div>
      )}

      {/* ═══ EXPLORE DONE ═══ */}
      {stage === "explore-done" && (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          <DataStructurePanel
            type={config.dataStructureType}
            label={config.dataStructureLabel}
            items={[]}
            lastAdded={null}
            lastRemoved={null}
          />

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{config.insights.exploreTitle}</h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {config.insights.exploreBody({ totalSteps: steps.length, nodesVisited: config.graph.nodes.length })}
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  {config.insights.complexity}
                </div>
              </div>
            </div>
          </div>

          <ExplainBack
            prompt={`In your own words: how does ${config.algorithmName} work? What data structure does it use and why?`}
            onSubmit={() => {}}
          />

          <div className="text-center">
            <button
              onClick={() => setStage("challenge")}
              className="group inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all duration-200 shadow-lg shadow-slate-900/20 dark:shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Now write it yourself
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ CHALLENGE ═══ */}
      {stage === "challenge" && (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          {!challengePassed && (
            <>
              <div className="bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your turn</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Implement {config.algorithmName}. The last test case is large enough that an incorrect approach will timeout.
                </p>
              </div>
              {config.hints.length > 0 && <Hints hints={config.hints} solution={config.solutionJS} />}
            </>
          )}

          <CodeEditor
            functionName={config.functionName}
            testCases={config.testCases}
            starterJS={config.starterJS}
            starterPython={config.starterPython}
            onPass={(code, lang) => {
              setChallengePassed(true);
              const langKey = lang === "python" ? "py" : "js";
              onProgressChange?.({ challengePassed: true, code: { [langKey]: code, [langKey === "js" ? "py" : "js"]: "" } as { js: string; py: string } });
            }}
          />

          {challengePassed && (
            <div className="animate-fade-in-up">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{config.title} — complete!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  {nextProblemLabel ? `Ready for ${nextProblemLabel}?` : "You've completed all the graph lessons!"}
                </p>
                {onNextProblem && nextProblemLabel ? (
                  <button
                    onClick={onNextProblem}
                    className="group inline-flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all duration-200 shadow-lg"
                  >
                    Continue to {nextProblemLabel}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : !nextProblemLabel ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-5 py-2.5 rounded-xl text-sm font-semibold">
                    All graph lessons complete!
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
