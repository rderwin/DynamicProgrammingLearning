import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import RecursionTree from "./RecursionTree";
import MemoTable from "./MemoTable";
import ConceptCallout from "./ConceptCallout";
import CodePanel from "./CodePanel";
import CodeEditor from "./CodeEditor";
import ComplexityChart from "./ComplexityChart";
import type { TestCase } from "../engine/runCode";
import { computeStatsRange } from "../engine/computeStats";

// Generic tree node shared by all problems
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
  /** Build the full recursion tree for value n */
  buildTree: (n: number) => TreeNode;
  /** Reset the internal node counter before building */
  resetIds: () => void;
  /** Collect post-order evaluation */
  collectEvalOrder: (tree: TreeNode) => TreeNode[];
  /** Count total nodes */
  countNodes: (tree: TreeNode) => number;
  /** Slider range [min, max] */
  nRange: [number, number];
  nDefault: number;
  nLabel?: string;
  /** Code panel config */
  codeBruteForce: CodeLine[];
  codeMemo: CodeLine[];
  /** Map a step node to a line number in the code */
  getActiveLine: (phase: Phase, node: TreeNode | null, isCacheHit: boolean) => number | null;
  /** User code challenge */
  functionName: string;
  testCases: TestCase[];
  starterJS: string;
  starterPython: string;
  /** Concept callout content — keyed by concept name */
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

export default function TreeLesson({ config }: { config: ProblemConfig }) {
  const [n, setN] = useState(config.nDefault);
  const [phase, setPhase] = useState<Phase>("brute");
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef(false);

  const [tree, setTree] = useState<TreeNode | null>(null);
  const [evalOrder, setEvalOrder] = useState<TreeNode[]>([]);

  useEffect(() => {
    config.resetIds();
    const t = config.buildTree(n);
    setTree(t);
    setEvalOrder(config.collectEvalOrder(t));
    setStepIndex(-1);
    setIsPlaying(false);
    playRef.current = false;
  }, [n, phase, config]);

  // Compute visualization state from current step
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
        for (const child of node.children) {
          if (markRevealed(child)) childRevealed = true;
        }
        if (revealedNodeSet.has(node) || childRevealed) {
          revealedIds.add(node.id);
          return true;
        }
        return false;
      }
      markRevealed(tree);
    } else {
      const memoCache = new Map<number, number>();
      const prunedSet = new Set<string>();
      const revealedNodeSet = new Set<TreeNode>(stepsToShow);

      for (const node of stepsToShow) {
        if (memoCache.has(node.n) && node.duplicate) {
          prunedSet.add(node.id);
          lastRead = node.n;
        } else {
          memoCache.set(node.n, node.result);
          lastWritten = node.n;
        }
      }

      if (currentNode && currentNode.duplicate) {
        const cacheBeforeCurrent = new Map<number, number>();
        for (const node of stepsToShow.slice(0, -1)) {
          if (!(cacheBeforeCurrent.has(node.n) && node.duplicate)) {
            cacheBeforeCurrent.set(node.n, node.result);
          }
        }
        isCacheHit = cacheBeforeCurrent.has(currentNode.n);
      }

      for (const [k, v] of memoCache) {
        memo.set(k, v);
        memoizedNs.add(k);
      }

      function markPruned(node: TreeNode) {
        if (prunedSet.has(node.id)) {
          prunedIds.add(node.id);
          function pruneChildren(n: TreeNode) {
            for (const c of n.children) { prunedIds.add(c.id); pruneChildren(c); }
          }
          pruneChildren(node);
        }
        node.children.forEach(markPruned);
      }
      markPruned(tree);

      function markRevealed(node: TreeNode): boolean {
        let childRevealed = false;
        for (const child of node.children) {
          if (markRevealed(child)) childRevealed = true;
        }
        if (revealedNodeSet.has(node) || childRevealed) {
          revealedIds.add(node.id);
          return true;
        }
        return false;
      }
      markRevealed(tree);
    }

    if (stepIndex === evalOrder.length - 1) {
      lastWritten = null;
      lastRead = null;
    }
  }

  const totalSteps = evalOrder.length;
  const totalNodes = tree ? config.countNodes(tree) : 0;
  const duplicateCount = tree ? evalOrder.filter((nd) => nd.duplicate).length : 0;

  const step = useCallback(() => {
    setStepIndex((prev) => {
      if (prev < totalSteps - 1) return prev + 1;
      setIsPlaying(false); playRef.current = false;
      return prev;
    });
  }, [totalSteps]);

  const play = useCallback(() => {
    setIsPlaying(true);
    playRef.current = true;
    function tick() {
      if (!playRef.current) return;
      setStepIndex((prev) => {
        if (prev < totalSteps - 1) { setTimeout(tick, 250); return prev + 1; }
        setIsPlaying(false); playRef.current = false; return prev;
      });
    }
    tick();
  }, [totalSteps]);

  const reset = () => { setStepIndex(-1); setIsPlaying(false); playRef.current = false; };
  const showAll = () => { setStepIndex(totalSteps - 1); setIsPlaying(false); playRef.current = false; };

  const hasStarted = stepIndex >= 0;
  const isComplete = stepIndex === totalSteps - 1;

  // Track if user has ever completed a run (latch — stays true)
  const [hasEverCompleted, setHasEverCompleted] = useState(false);
  useEffect(() => {
    if (isComplete) setHasEverCompleted(true);
  }, [isComplete]);

  // Compute stats for complexity chart (only when needed)
  const chartStats = useMemo(
    () => hasEverCompleted ? computeStatsRange(config, n, config.nRange) : [],
    [hasEverCompleted, config, n, config.nRange]
  );
  const progressPercent = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Problem header */}
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Problem {config.problemNumber} of {config.totalProblems}
          </span>
          <span className="text-xs text-slate-400">Difficulty: {config.difficulty}</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{config.title}</h2>
        <div className="text-slate-500 mt-1">{config.description}</div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <span className="font-medium">{config.nLabel ?? "n"}</span>
            <input type="range" min={config.nRange[0]} max={config.nRange[1]} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-24 accent-blue-500" />
            <span className="bg-slate-100 font-mono font-bold text-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">{n}</span>
          </label>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => { setPhase("brute"); reset(); }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${phase === "brute" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Brute Force</button>
            <button onClick={() => { setPhase("memo"); reset(); }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${phase === "memo" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>+ Memoization</button>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex gap-2">
            <button onClick={step} disabled={isPlaying || isComplete} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-blue-500/20">Step</button>
            <button onClick={isPlaying ? () => { setIsPlaying(false); playRef.current = false; } : play} disabled={isComplete} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${isPlaying ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"}`}>
              {isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={showAll} disabled={isComplete} className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200">Show All</button>
            <button onClick={reset} className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200">Reset</button>
          </div>
        </div>
        {hasStarted && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex gap-4 text-xs text-slate-500 flex-shrink-0">
              <span>Step <span className="font-mono font-bold text-slate-700">{stepIndex + 1}</span>/{totalSteps}</span>
              {phase === "brute" && duplicateCount > 0 && <span>Duplicates: <span className="font-mono font-bold text-red-500">{duplicateCount}</span></span>}
              {phase === "memo" && <span>Cache hits: <span className="font-mono font-bold text-green-600">{evalOrder.slice(0, stepIndex + 1).filter((nd) => nd.duplicate && memo.has(nd.n)).length}</span></span>}
            </div>
          </div>
        )}
      </div>

      {/* Tree + Code */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 min-h-[350px] flex items-center justify-center shadow-sm">
          {tree && stepIndex >= 0 ? (
            <RecursionTree tree={tree} revealedIds={revealedIds} memoizedNs={memoizedNs} prunedIds={prunedIds} currentNodeId={currentNode?.id ?? null} />
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <svg className="w-16 h-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-300">Ready to visualize</p>
                <p className="text-sm mt-1">Press <strong className="text-slate-500">Play</strong> or <strong className="text-slate-500">Step</strong> to begin</p>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <CodePanel phase={phase} currentNode={hasStarted ? currentNode : null} isCacheHit={isCacheHit} codeLines={phase === "brute" ? config.codeBruteForce : config.codeMemo} getActiveLine={config.getActiveLine} />
        </div>
      </div>

      {phase === "memo" && hasStarted && (
        <div className="animate-fade-in-up">
          <MemoTable n={n} memo={memo} lastWritten={lastWritten} lastRead={lastRead} />
        </div>
      )}

      {hasStarted && (
        <div className="flex flex-wrap gap-5 justify-center text-xs text-slate-500 animate-fade-in">
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-500 inline-block" />Unique call</span>
          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-red-100 border-2 border-red-500 inline-block" />Duplicate (wasted)</span>
          {phase === "memo" && (
            <>
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-green-100 border-2 border-green-500 inline-block" />Cache hit</span>
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-gray-100 border-2 border-gray-400 inline-block" />Pruned</span>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <ConceptCallout title="Optimal Substructure" color="blue" visible={phase === "brute" && hasStarted}>
          {config.concepts.optimalSubstructure}
        </ConceptCallout>
        <ConceptCallout title="Overlapping Subproblems" color="amber" visible={phase === "brute" && isComplete && duplicateCount > 0}>
          {config.concepts.overlappingSubproblems(duplicateCount, totalNodes, n)}
        </ConceptCallout>
        <ConceptCallout title="Try Memoization" color="green" visible={phase === "brute" && isComplete}>
          {config.concepts.tryMemo}
        </ConceptCallout>
        <ConceptCallout title="Memoization Wins" color="purple" visible={phase === "memo" && isComplete}>
          {config.concepts.memoWins(totalNodes, n + 1)}
        </ConceptCallout>
      </div>

      {/* Complexity comparison chart */}
      {hasEverCompleted && chartStats.length > 0 && (
        <ComplexityChart stats={chartStats} currentN={n} />
      )}

      <CodeEditor functionName={config.functionName} testCases={config.testCases} starterJS={config.starterJS} starterPython={config.starterPython} />
    </div>
  );
}
