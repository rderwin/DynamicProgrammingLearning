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

  if (tree && stepIndex >= 0) {
    const stepsToShow = evalOrder.slice(0, stepIndex + 1);

    if (phase === "brute") {
      // In brute force, reveal all ancestors of evaluated nodes
      const revealedNodeSet = new Set<TreeNode>();
      for (const node of stepsToShow) {
        revealedNodeSet.add(node);
      }
      // Reveal everything up to current step via walk
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
      // Memo mode: track which values are cached
      const memoCache = new Map<number, number>();
      const prunedSet = new Set<string>();
      const revealedNodeSet = new Set<TreeNode>();

      for (const node of stepsToShow) {
        revealedNodeSet.add(node);
        if (memoCache.has(node.n) && node.duplicate) {
          // Cache hit — this subtree gets pruned
          prunedSet.add(node.id);
          lastRead = node.n;
        } else {
          memoCache.set(node.n, node.result);
          lastWritten = node.n;
        }
      }

      // Copy memo state
      for (const [k, v] of memoCache) {
        memo.set(k, v);
        memoizedNs.add(k);
      }

      // Mark pruned subtrees
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

      // Reveal ancestors
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

    // If last step, clear highlights
    if (stepIndex === evalOrder.length - 1) {
      lastWritten = null;
      lastRead = null;
    }
  } else if (tree && stepIndex === -1) {
    // Show nothing — waiting to start
  }

  const totalSteps = evalOrder.length;
  const totalNodes = tree ? countNodes(tree) : 0;
  const duplicateCount = tree
    ? evalOrder.filter((n) => n.duplicate).length
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
          setTimeout(tick, 200);
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

  return (
    <div className="flex flex-col gap-8">
      {/* Problem description */}
      <div className="text-left">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Fibonacci Numbers
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Compute the <em>n</em>th Fibonacci number:{" "}
          <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">
            fib(n) = fib(n-1) + fib(n-2)
          </code>
          , with{" "}
          <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">
            fib(0) = 0
          </code>{" "}
          and{" "}
          <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">
            fib(1) = 1
          </code>
          .
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          n =
          <input
            type="range"
            min={2}
            max={8}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-24"
          />
          <span className="font-mono font-bold text-slate-800 w-4">{n}</span>
        </label>

        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => {
              setPhase("brute");
              reset();
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              phase === "brute"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Brute Force
          </button>
          <button
            onClick={() => {
              setPhase("memo");
              reset();
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              phase === "memo"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            + Memoization
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={step}
            disabled={isPlaying || isComplete}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Step
          </button>
          <button
            onClick={isPlaying ? () => { setIsPlaying(false); playRef.current = false; } : play}
            disabled={isComplete}
            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={showAll}
            disabled={isComplete}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Show All
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {hasStarted && (
        <div className="flex gap-6 text-sm text-slate-500">
          <span>
            Step{" "}
            <span className="font-mono font-bold text-slate-700">
              {stepIndex + 1}
            </span>{" "}
            / {totalSteps}
          </span>
          <span>
            Nodes:{" "}
            <span className="font-mono font-bold text-slate-700">
              {totalNodes}
            </span>
          </span>
          {phase === "brute" && (
            <span>
              Duplicates:{" "}
              <span className="font-mono font-bold text-red-500">
                {duplicateCount}
              </span>
            </span>
          )}
          {phase === "memo" && (
            <span>
              Cache hits:{" "}
              <span className="font-mono font-bold text-green-600">
                {evalOrder
                  .slice(0, stepIndex + 1)
                  .filter(
                    (nd) =>
                      nd.duplicate &&
                      memo.has(nd.n)
                  ).length}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Tree visualization */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[300px] flex items-center justify-center">
        {tree && stepIndex >= 0 ? (
          <RecursionTree
            tree={tree}
            revealedIds={revealedIds}
            memoizedNs={memoizedNs}
            prunedIds={prunedIds}
          />
        ) : (
          <div className="text-slate-400 text-lg">
            Press <strong>Play</strong> or <strong>Step</strong> to watch the
            recursion unfold
          </div>
        )}
      </div>

      {/* Memo table */}
      {phase === "memo" && hasStarted && (
        <MemoTable
          n={n}
          memo={memo}
          lastWritten={lastWritten}
          lastRead={lastRead}
        />
      )}

      {/* Legend */}
      {hasStarted && (
        <div className="flex flex-wrap gap-4 justify-center text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500 inline-block" />
            Unique call
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-500 inline-block" />
            Duplicate (wasted work)
          </span>
          {phase === "memo" && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500 inline-block" />
                Cache hit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-400 inline-block" />
                Pruned
              </span>
            </>
          )}
        </div>
      )}

      {/* Concept callouts — appear after the user has seen them in action */}
      <div className="flex flex-col gap-4">
        <ConceptCallout
          title="Optimal Substructure"
          color="blue"
          visible={showOptimalSubstructure}
        >
          Notice how each <code className="bg-blue-100 px-1 rounded text-xs">fib(n)</code> is
          built from the optimal answers to smaller subproblems — <code className="bg-blue-100 px-1 rounded text-xs">fib(n-1)</code> and{" "}
          <code className="bg-blue-100 px-1 rounded text-xs">fib(n-2)</code>. This is{" "}
          <strong>optimal substructure</strong>: the best answer to the big
          problem is composed of best answers to smaller ones.
        </ConceptCallout>

        <ConceptCallout
          title="Overlapping Subproblems"
          color="amber"
          visible={showOverlapping}
        >
          See all those{" "}
          <span className="text-red-600 font-semibold">red nodes</span>?
          That's the same computation happening over and over.{" "}
          <code className="bg-amber-100 px-1 rounded text-xs">fib({n})</code> has{" "}
          <strong>{duplicateCount} duplicate calls</strong> out of {totalNodes}{" "}
          total. These are <strong>overlapping subproblems</strong> — and they're
          why brute-force recursion blows up exponentially.
        </ConceptCallout>

        <ConceptCallout
          title="Ready for memoization?"
          color="green"
          visible={showMemoIntro}
        >
          What if we <em>remembered</em> each answer the first time we computed
          it? Click <strong>"+ Memoization"</strong> above to see the same tree,
          but with a memo table. Watch how many branches disappear.
        </ConceptCallout>

        <ConceptCallout
          title="Memoization wins!"
          color="purple"
          visible={showMemoSavings}
        >
          With memoization, we only compute each unique subproblem{" "}
          <strong>once</strong>. The tree collapses from {totalNodes} calls down
          to just {n + 1} unique computations. That's{" "}
          <strong>O(n) instead of O(2^n)</strong> — the difference between
          milliseconds and heat death of the universe for large inputs.
        </ConceptCallout>
      </div>
    </div>
  );
}
