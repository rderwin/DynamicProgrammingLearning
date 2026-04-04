import { useState, useEffect, useCallback, useRef } from "react";
import {
  buildFibTree,
  resetNodeId,
  collectEvalOrder,
  countNodes,
  type TreeNode,
} from "../problems/fibonacci";
import RecursionTree from "./RecursionTree";
import MemoTable from "./MemoTable";
import ConceptCallout from "./ConceptCallout";
import CodePanel from "./CodePanel";

type Phase = "brute" | "memo";

export default function FibonacciLesson() {
  const [n, setN] = useState(5);
  const [phase, setPhase] = useState<Phase>("brute");
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playRef = useRef(false);

  // Build tree
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [evalOrder, setEvalOrder] = useState<TreeNode[]>([]);

  useEffect(() => {
    resetNodeId();
    const t = buildFibTree(n);
    setTree(t);
    setEvalOrder(collectEvalOrder(t));
    setStepIndex(-1);
    setIsPlaying(false);
    playRef.current = false;
  }, [n, phase]);

  // Compute revealed nodes, memo state, pruned nodes based on step
  const revealedIds = new Set<string>();
  const memoizedNs = new Set<number>();
  const prunedIds = new Set<string>();
  const memo = new Map<number, number>();
  let lastWritten: number | null = null;
  let lastRead: number | null = null;

  // Track current node for code panel
  let currentNode: TreeNode | null = null;
  let isCacheHit = false;

  if (tree && stepIndex >= 0) {
    const stepsToShow = evalOrder.slice(0, stepIndex + 1);
    currentNode = stepsToShow[stepsToShow.length - 1];

    if (phase === "brute") {
      const revealedNodeSet = new Set<TreeNode>();
      for (const node of stepsToShow) {
        revealedNodeSet.add(node);
      }
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
      const revealedNodeSet = new Set<TreeNode>();

      for (const node of stepsToShow) {
        revealedNodeSet.add(node);
        if (memoCache.has(node.n) && node.duplicate) {
          prunedSet.add(node.id);
          lastRead = node.n;
        } else {
          memoCache.set(node.n, node.result);
          lastWritten = node.n;
        }
      }

      // Check if current node is a cache hit
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
            for (const c of n.children) {
              prunedIds.add(c.id);
              pruneChildren(c);
            }
          }
          pruneChildren(node);
        }
        node.children.forEach(markPruned);
      }
      if (tree) markPruned(tree);

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
  const totalNodes = tree ? countNodes(tree) : 0;
  const duplicateCount = tree
    ? evalOrder.filter((nd) => nd.duplicate).length
    : 0;

  const step = useCallback(() => {
    setStepIndex((prev) => {
      if (prev < totalSteps - 1) return prev + 1;
      setIsPlaying(false);
      playRef.current = false;
      return prev;
    });
  }, [totalSteps]);

  const play = useCallback(() => {
    setIsPlaying(true);
    playRef.current = true;

    function tick() {
      if (!playRef.current) return;
      setStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          setTimeout(tick, 250);
          return prev + 1;
        }
        setIsPlaying(false);
        playRef.current = false;
        return prev;
      });
    }
    tick();
  }, [totalSteps]);

  const reset = () => {
    setStepIndex(-1);
    setIsPlaying(false);
    playRef.current = false;
  };

  const showAll = () => {
    setStepIndex(totalSteps - 1);
    setIsPlaying(false);
    playRef.current = false;
  };

  // Concept visibility
  const hasStarted = stepIndex >= 0;
  const isComplete = stepIndex === totalSteps - 1;
  const showOverlapping = phase === "brute" && isComplete && duplicateCount > 0;
  const showOptimalSubstructure = phase === "brute" && hasStarted;
  const showMemoIntro = phase === "brute" && isComplete;
  const showMemoSavings = phase === "memo" && isComplete;

  const progressPercent = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Problem header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Problem 1 of 5
            </span>
            <span className="text-xs text-slate-400">Difficulty: Intro</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Fibonacci Numbers
          </h2>
          <p className="text-slate-500 mt-1">
            <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">
              fib(n) = fib(n-1) + fib(n-2)
            </code>
            <span className="text-slate-400 mx-2">where</span>
            <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">
              fib(0)=0, fib(1)=1
            </code>
          </p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          {/* N slider */}
          <label className="flex items-center gap-3 text-sm text-slate-600">
            <span className="font-medium">n</span>
            <input
              type="range"
              min={2}
              max={8}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-24 accent-blue-500"
            />
            <span className="bg-slate-100 font-mono font-bold text-slate-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              {n}
            </span>
          </label>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Phase toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => { setPhase("brute"); reset(); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                phase === "brute"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Brute Force
            </button>
            <button
              onClick={() => { setPhase("memo"); reset(); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                phase === "memo"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              + Memoization
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* Playback controls */}
          <div className="flex gap-2">
            <button
              onClick={step}
              disabled={isPlaying || isComplete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-blue-500/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Step
            </button>
            <button
              onClick={isPlaying ? () => { setIsPlaying(false); playRef.current = false; } : play}
              disabled={isComplete}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                isPlaying
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
              }`}
            >
              {isPlaying ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={showAll}
              disabled={isComplete}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Show All
            </button>
            <button
              onClick={reset}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {hasStarted && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs text-slate-500 flex-shrink-0">
              <span>
                Step <span className="font-mono font-bold text-slate-700">{stepIndex + 1}</span>/{totalSteps}
              </span>
              {phase === "brute" && duplicateCount > 0 && (
                <span>
                  Duplicates: <span className="font-mono font-bold text-red-500">{duplicateCount}</span>
                </span>
              )}
              {phase === "memo" && (
                <span>
                  Cache hits:{" "}
                  <span className="font-mono font-bold text-green-600">
                    {evalOrder
                      .slice(0, stepIndex + 1)
                      .filter((nd) => nd.duplicate && memo.has(nd.n)).length}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main visualization area: Tree + Code side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recursion tree */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 min-h-[350px] flex items-center justify-center shadow-sm">
          {tree && stepIndex >= 0 ? (
            <RecursionTree
              tree={tree}
              revealedIds={revealedIds}
              memoizedNs={memoizedNs}
              prunedIds={prunedIds}
              currentNodeId={currentNode?.id ?? null}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <svg className="w-16 h-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-300">Ready to visualize</p>
                <p className="text-sm mt-1">
                  Press <strong className="text-slate-500">Play</strong> or{" "}
                  <strong className="text-slate-500">Step</strong> to watch the recursion unfold
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Code panel */}
        <div className="lg:col-span-2">
          <CodePanel
            phase={phase}
            currentNode={hasStarted ? currentNode : null}
            isCacheHit={isCacheHit}
          />
        </div>
      </div>

      {/* Memo table */}
      {phase === "memo" && hasStarted && (
        <div className="animate-fade-in-up">
          <MemoTable
            n={n}
            memo={memo}
            lastWritten={lastWritten}
            lastRead={lastRead}
          />
        </div>
      )}

      {/* Legend */}
      {hasStarted && (
        <div className="flex flex-wrap gap-5 justify-center text-xs text-slate-500 animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-500 inline-block" />
            Unique call
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-100 border-2 border-red-500 inline-block" />
            Duplicate (wasted)
          </span>
          {phase === "memo" && (
            <>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-green-100 border-2 border-green-500 inline-block" />
                Cache hit
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-100 border-2 border-gray-400 inline-block" />
                Pruned
              </span>
            </>
          )}
        </div>
      )}

      {/* Concept callouts */}
      <div className="flex flex-col gap-4">
        <ConceptCallout title="Optimal Substructure" color="blue" visible={showOptimalSubstructure}>
          Notice how each <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">fib(n)</code> is
          built from smaller subproblems — <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">fib(n-1)</code> and{" "}
          <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">fib(n-2)</code>. This is{" "}
          <strong>optimal substructure</strong>: the best answer to the big problem comes from best answers to smaller ones.
        </ConceptCallout>

        <ConceptCallout title="Overlapping Subproblems" color="amber" visible={showOverlapping}>
          See the <span className="text-red-600 font-semibold">red nodes</span>?
          Same computation, over and over.{" "}
          <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">fib({n})</code> has{" "}
          <strong>{duplicateCount} duplicate calls</strong> out of {totalNodes} total.
          These are <strong>overlapping subproblems</strong> — why brute-force recursion is O(2^n).
        </ConceptCallout>

        <ConceptCallout title="Try Memoization" color="green" visible={showMemoIntro}>
          What if we <em>remembered</em> each answer the first time we computed it?
          Click <strong>"+ Memoization"</strong> above and watch how many branches disappear.
        </ConceptCallout>

        <ConceptCallout title="Memoization Wins" color="purple" visible={showMemoSavings}>
          With memoization, each unique subproblem is computed <strong>once</strong>.
          The tree collapses from {totalNodes} calls to {n + 1} unique computations —{" "}
          <strong>O(n) instead of O(2^n)</strong>.
        </ConceptCallout>
      </div>
    </div>
  );
}
