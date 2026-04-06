import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import RecursionTree from "./RecursionTree";
import MemoTable from "./MemoTable";
import CodePanel from "./CodePanel";
import CodeEditor from "./CodeEditor";
import ComplexityChart from "./ComplexityChart";
import type { TestCase } from "../engine/runCode";
import { computeStatsRange } from "../engine/computeStats";

export interface TreeNode {
  id: string;
  label: string;
  n: number;
  children: TreeNode[];
  result: number;
  duplicate: boolean;
}

type Phase = "brute" | "memo";

export interface ProblemConfig {
  title: string;
  problemNumber: number;
  totalProblems: number;
  difficulty: string;
  description: React.ReactNode;
  buildTree: (n: number) => TreeNode;
  resetIds: () => void;
  collectEvalOrder: (tree: TreeNode) => TreeNode[];
  countNodes: (tree: TreeNode) => number;
  nRange: [number, number];
  nDefault: number;
  nLabel?: string;
  codeBruteForce: CodeLine[];
  codeMemo: CodeLine[];
  getActiveLine: (phase: Phase, node: TreeNode | null, isCacheHit: boolean) => number | null;
  functionName: string;
  testCases: TestCase[];
  starterJS: string;
  starterPython: string;
  concepts: {
    optimalSubstructure: React.ReactNode;
    overlappingSubproblems: (duplicateCount: number, totalNodes: number, n: number) => React.ReactNode;
    tryMemo: React.ReactNode;
    memoWins: (totalNodes: number, uniqueCount: number) => React.ReactNode;
  };
}

export interface CodeLine {
  num: number;
  tokens: { text: string; type: "keyword" | "function" | "number" | "string" | "comment" | "operator" | "punctuation" | "param" | "plain" }[];
}

// ─── Wizard stages ───
type Stage =
  | "intro"          // Problem description only
  | "brute"          // Playing brute force
  | "brute-done"     // Brute force finished — show insight
  | "memo-intro"     // Transition prompt to memoization
  | "memo"           // Playing memoization
  | "memo-done"      // Memo finished — show comparison
  | "challenge";     // Code editor

interface LessonProps {
  config: ProblemConfig;
  nextProblemLabel: string | null;
  onNextProblem?: () => void;
}

export default function TreeLesson({ config, nextProblemLabel, onNextProblem }: LessonProps) {
  const [n, setN] = useState(config.nDefault);
  const [stage, setStage] = useState<Stage>("intro");
  const [challengePassed, setChallengePassed] = useState(false);
  const phase: Phase = (stage === "memo" || stage === "memo-done") ? "memo" : "brute";

  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(250);
  const playRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const [tree, setTree] = useState<TreeNode | null>(null);
  const [evalOrder, setEvalOrder] = useState<TreeNode[]>([]);

  // Rebuild tree when n or phase changes
  useEffect(() => {
    config.resetIds();
    const t = config.buildTree(n);
    setTree(t);
    setEvalOrder(config.collectEvalOrder(t));
    setStepIndex(-1);
    setIsPlaying(false);
    playRef.current = false;
  }, [n, phase, config]);

  // ─── Compute visualization state ───
  const revealedIds = new Set<string>();
  const memoizedNs = new Set<number>();
  const prunedIds = new Set<string>();
  const memo = new Map<number, number>();
  let lastWritten: number | null = null;
  let lastRead: number | null = null;
  let currentNode: TreeNode | null = null;
  let isCacheHit = false;

  if (tree && stepIndex >= 0) {
    const stepsToShow = evalOrder.slice(0, stepIndex + 1);
    currentNode = stepsToShow[stepsToShow.length - 1];

    if (phase === "brute") {
      const revealedNodeSet = new Set<TreeNode>(stepsToShow);
      function markRevealed(node: TreeNode): boolean {
        let childRevealed = false;
        for (const child of node.children) { if (markRevealed(child)) childRevealed = true; }
        if (revealedNodeSet.has(node) || childRevealed) { revealedIds.add(node.id); return true; }
        return false;
      }
      markRevealed(tree);
    } else {
      const memoCache = new Map<number, number>();
      const prunedSet = new Set<string>();
      const revealedNodeSet = new Set<TreeNode>(stepsToShow);

      for (const node of stepsToShow) {
        if (memoCache.has(node.n) && node.duplicate) { prunedSet.add(node.id); lastRead = node.n; }
        else { memoCache.set(node.n, node.result); lastWritten = node.n; }
      }
      if (currentNode && currentNode.duplicate) {
        const cache = new Map<number, number>();
        for (const node of stepsToShow.slice(0, -1)) {
          if (!(cache.has(node.n) && node.duplicate)) cache.set(node.n, node.result);
        }
        isCacheHit = cache.has(currentNode.n);
      }
      for (const [k, v] of memoCache) { memo.set(k, v); memoizedNs.add(k); }

      function markPruned(node: TreeNode) {
        if (prunedSet.has(node.id)) {
          prunedIds.add(node.id);
          function pruneAll(n: TreeNode) { for (const c of n.children) { prunedIds.add(c.id); pruneAll(c); } }
          pruneAll(node);
        }
        node.children.forEach(markPruned);
      }
      markPruned(tree);

      function markRevealed(node: TreeNode): boolean {
        let childRevealed = false;
        for (const child of node.children) { if (markRevealed(child)) childRevealed = true; }
        if (revealedNodeSet.has(node) || childRevealed) { revealedIds.add(node.id); return true; }
        return false;
      }
      markRevealed(tree);
    }
    if (stepIndex === evalOrder.length - 1) { lastWritten = null; lastRead = null; }
  }

  const totalSteps = evalOrder.length;
  const totalNodes = tree ? config.countNodes(tree) : 0;
  const duplicateCount = tree ? evalOrder.filter((nd) => nd.duplicate).length : 0;
  const hasStarted = stepIndex >= 0;
  const isComplete = stepIndex === totalSteps - 1;

  // Auto-advance to "done" stage when animation completes
  useEffect(() => {
    if (isComplete && stage === "brute") setStage("brute-done");
    if (isComplete && stage === "memo") setStage("memo-done");
  }, [isComplete, stage]);

  // ─── Playback controls ───
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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.closest?.(".cm-editor")) return;
      if (stage !== "brute" && stage !== "memo") return;

      if (e.code === "Space") { e.preventDefault(); if (isComplete) return; if (isPlaying) pause(); else play(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); if (!isPlaying && !isComplete) step(); }
      else if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); resetAnim(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying, isComplete, play, pause, step, stage]);

  const chartStats = useMemo(
    () => (stage === "memo-done" || stage === "challenge") ? computeStatsRange(config, n, config.nRange) : [],
    [stage, config, n, config.nRange]
  );
  const progressPercent = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const speedLabel = speed <= 80 ? "Fast" : speed <= 200 ? "Normal" : speed <= 400 ? "Slow" : "Very Slow";

  // ─── Stage transitions ───
  function startBrute() {
    setStage("brute");
    resetAnim();
  }
  function goToMemoIntro() {
    setStage("memo-intro");
  }
  function startMemo() {
    setStage("memo");
    resetAnim();
  }
  function goToChallenge() {
    setStage("challenge");
  }
  function restart() {
    setStage("intro");
    resetAnim();
  }

  // ─── Visibility helpers ───
  const showTree = stage !== "intro" && stage !== "challenge";
  const showControls = stage === "brute" || stage === "memo";
  const showMemoTable = phase === "memo" && hasStarted;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ─── Problem header (always visible) ─── */}
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Problem {config.problemNumber} of {config.totalProblems}
          </span>
          <span className="text-xs text-slate-400">Difficulty: {config.difficulty}</span>
          {stage !== "intro" && (
            <button onClick={restart} className="ml-auto text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Start over
            </button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
        <div className="text-slate-500 mt-1">{config.description}</div>
      </div>

      {/* ═══ STAGE: intro ═══ */}
      {stage === "intro" && (
        <div className="animate-fade-in-up">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 rounded-2xl p-10 text-center">
            <div className="max-w-lg mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Let's see what happens</h3>
              <p className="text-sm text-slate-500 mb-2">
                We'll start with the brute force approach — watch the recursion tree build up
                and see if you can spot the problem.
              </p>
              <label className="flex items-center gap-3 text-sm text-slate-600 justify-center my-6">
                <span className="font-medium">{config.nLabel ?? "n"} =</span>
                <input type="range" min={config.nRange[0]} max={config.nRange[1]} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-28 accent-blue-500" />
                <span className="bg-white font-mono font-bold text-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-slate-200">{n}</span>
              </label>
              <button
                onClick={startBrute}
                className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Watch the brute force
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Controls bar (brute/memo play stages only) ═══ */}
      {showControls && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm animate-slide-down">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button onClick={step} disabled={isPlaying || isComplete} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-blue-500/20" title="Step (→)">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z" /></svg>
                Step
              </button>
              <button onClick={isPlaying ? pause : play} disabled={isComplete} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${isPlaying ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"}`} title="Play/Pause (Space)">
                {isPlaying ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button onClick={resetAnim} className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200" title="Reset (R)">Reset</button>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              <input type="range" min={50} max={600} step={10} value={650 - speed} onChange={(e) => setSpeed(650 - Number(e.target.value))} className="w-16 accent-violet-500" />
              <span className="text-[10px] font-medium text-slate-400 w-12">{speedLabel}</span>
            </label>
            {!hasStarted && (
              <>
                <div className="w-px h-8 bg-slate-200" />
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
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 ease-out progress-bar-glow" style={{ width: `${progressPercent}%`, background: isComplete ? "linear-gradient(90deg, #22c55e, #10b981)" : "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />
              </div>
              <span className="text-xs text-slate-500">
                <span className="font-mono font-bold text-slate-700 tabular-nums">{stepIndex + 1}</span>
                <span className="text-slate-300">/{totalSteps}</span>
                {phase === "brute" && duplicateCount > 0 && (
                  <span className="ml-3">🔴 <span className="font-mono font-bold text-red-500 tabular-nums">{duplicateCount}</span> duplicates</span>
                )}
                {phase === "memo" && (
                  <span className="ml-3">🟢 <span className="font-mono font-bold text-green-600 tabular-nums">
                    {evalOrder.slice(0, stepIndex + 1).filter((nd) => nd.duplicate && memo.has(nd.n)).length}
                  </span> cache hits</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tree + Code panel (visible during play stages) ═══ */}
      {showTree && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 animate-fade-in-up">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 min-h-[350px] flex items-center justify-center shadow-sm">
            {tree && hasStarted ? (
              <RecursionTree tree={tree} revealedIds={revealedIds} memoizedNs={memoizedNs} prunedIds={prunedIds} currentNodeId={currentNode?.id ?? null} />
            ) : tree && (stage === "brute-done" || stage === "memo-intro" || stage === "memo-done") ? (
              // Show completed tree
              <RecursionTree tree={tree} revealedIds={revealedIds} memoizedNs={memoizedNs} prunedIds={prunedIds} currentNodeId={null} />
            ) : (
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <div className="empty-state-icon">
                  <svg className="w-16 h-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <p className="text-sm">Press <kbd className="kbd-hint">Space</kbd> or click <strong className="text-slate-500">Play</strong></p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <CodePanel phase={phase} currentNode={hasStarted ? currentNode : null} isCacheHit={isCacheHit} codeLines={phase === "brute" ? config.codeBruteForce : config.codeMemo} getActiveLine={config.getActiveLine} />
          </div>
        </div>
      )}

      {/* Memo table (during memo play) */}
      {showMemoTable && (
        <div className="animate-fade-in-up">
          <MemoTable n={n} memo={memo} lastWritten={lastWritten} lastRead={lastRead} />
        </div>
      )}

      {/* Legend (during play) */}
      {showControls && hasStarted && (
        <div className="flex flex-wrap gap-5 justify-center text-xs text-slate-500 animate-fade-in">
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-500 inline-block" />Unique call</span>
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-red-100 border-2 border-red-500 inline-block" />Duplicate</span>
          {phase === "memo" && (
            <>
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-green-100 border-2 border-green-500 inline-block" />Cache hit</span>
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-gray-100 border-2 border-gray-400 inline-block" />Pruned</span>
            </>
          )}
        </div>
      )}

      {/* ═══ STAGE: brute-done ═══ */}
      {stage === "brute-done" && (
        <div className="animate-fade-in-up">
          {/* Insight card */}
          <div className="bg-gradient-to-br from-red-50 to-amber-50/50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">See the problem?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-1">
                  That took <strong className="text-slate-800">{totalNodes} calls</strong>, and{" "}
                  <strong className="text-red-600">{duplicateCount} of them were duplicates</strong> — the same
                  computation done over and over. That's{" "}
                  <strong>{Math.round((duplicateCount / totalNodes) * 100)}% wasted work</strong>.
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  {config.concepts.overlappingSubproblems(duplicateCount, totalNodes, n)}
                </p>
                <button
                  onClick={goToMemoIntro}
                  className="group inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  What if we remembered the answers?
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STAGE: memo-intro ═══ */}
      {stage === "memo-intro" && (
        <div className="animate-fade-in-up">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="max-w-lg mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Memoization</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Same recursion, but now every time we compute a value, we <strong className="text-slate-700">store it in a table</strong>.
                Before computing anything, we check: "Have I seen this before?"
                If yes, we just look it up. Watch how many branches disappear.
              </p>
              <button
                onClick={startMemo}
                className="group inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg shadow-green-700/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Watch it with memoization
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STAGE: memo-done ═══ */}
      {stage === "memo-done" && (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          {/* Memo table stays visible */}
          {phase === "memo" && (
            <MemoTable n={n} memo={memo} lastWritten={null} lastRead={null} />
          )}

          {/* Comparison insight */}
          <div className="bg-gradient-to-br from-violet-50 to-blue-50/50 border border-violet-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">That's the power of DP</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {config.concepts.memoWins(totalNodes, n + 1)}
                </p>
              </div>
            </div>
          </div>

          {/* Complexity chart in context */}
          {chartStats.length > 0 && (
            <div className="animate-fade-in-up delay-200">
              <ComplexityChart stats={chartStats} currentN={n} />
            </div>
          )}

          <div className="text-center animate-fade-in-up delay-300">
            <button
              onClick={goToChallenge}
              className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Now write it yourself
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ STAGE: challenge ═══ */}
      {stage === "challenge" && (
        <div className="flex flex-col gap-6 animate-fade-in-up">
          {!challengePassed && (
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Your turn</h3>
              </div>
              <p className="text-sm text-slate-500">
                You've seen how it works visually. Now implement it — use memoization or bottom-up DP.
                <br />
                <span className="text-slate-400 text-xs">The last test case is large enough that brute force will timeout.</span>
              </p>
            </div>
          )}

          <CodeEditor
            functionName={config.functionName}
            testCases={config.testCases}
            starterJS={config.starterJS}
            starterPython={config.starterPython}
            onPass={() => setChallengePassed(true)}
          />

          {/* ── Success: next problem prompt ── */}
          {challengePassed && (
            <div className="animate-fade-in-up">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {config.title} — complete!
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {nextProblemLabel
                    ? `You've got the pattern. Ready for ${nextProblemLabel}?`
                    : "You've completed all the problems. You're interview-ready for DP!"
                  }
                </p>
                {onNextProblem && nextProblemLabel ? (
                  <button
                    onClick={onNextProblem}
                    className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Continue to {nextProblemLabel}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-5 py-2.5 rounded-xl text-sm font-semibold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
                    </svg>
                    All problems complete!
                  </div>
                )}
              </div>
            </div>
          )}

          {chartStats.length > 0 && (
            <ComplexityChart stats={chartStats} currentN={n} />
          )}
        </div>
      )}
    </div>
  );
}
