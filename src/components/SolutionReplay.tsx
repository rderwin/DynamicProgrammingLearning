import { useState, useCallback, useRef, useEffect } from "react";
import RecursionTree from "./RecursionTree";
import { traceExecution, type TraceNode, type Language } from "../engine/runCode";
import type { TreeNode } from "./TreeLesson";

interface Props {
  code: string;
  language: Language;
  functionName: string;
  /** A small input to trace on (e.g. [5] for fib(5)) */
  traceInput: unknown[];
  traceInputLabel: string;
}

// Convert TraceNode → TreeNode format
let _nodeId = 0;
function traceToTree(trace: TraceNode, seen = new Set<string>()): TreeNode {
  const id = `trace-${_nodeId++}`;
  const key = trace.label;
  const duplicate = seen.has(key);
  seen.add(key);

  const children = trace.children.map((c) => traceToTree(c, seen));

  return {
    id,
    label: key,
    n: typeof trace.args[0] === "number" ? trace.args[0] : _nodeId,
    children,
    result: typeof trace.result === "number" ? trace.result : 0,
    duplicate,
  };
}

function collectEvalOrder(node: TreeNode): TreeNode[] {
  const order: TreeNode[] = [];
  function walk(n: TreeNode) {
    for (const c of n.children) walk(c);
    order.push(n);
  }
  walk(node);
  return order;
}

function countNodes(node: TreeNode): number {
  return 1 + node.children.reduce((s, c) => s + countNodes(c), 0);
}

export default function SolutionReplay({ code, language, functionName, traceInput, traceInputLabel }: Props) {
  const [state, setState] = useState<"idle" | "tracing" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [evalOrder, setEvalOrder] = useState<TreeNode[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const playRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  async function startTrace() {
    setState("tracing");
    _nodeId = 0;
    const result = await traceExecution(code, functionName, traceInput, language);
    if (result.error || !result.tree) {
      setState("error");
      setError(result.error || "No call tree captured");
      return;
    }
    const treeNode = traceToTree(result.tree);
    setTree(treeNode);
    setEvalOrder(collectEvalOrder(treeNode));
    setTotalCalls(result.totalCalls);
    setStepIndex(-1);
    setState("ready");
  }

  // Compute revealed set for current step
  const revealedIds = new Set<string>();
  const memoizedNs = new Set<number>();
  const prunedIds = new Set<string>();
  let currentNodeId: string | null = null;

  if (tree && stepIndex >= 0) {
    const steps = evalOrder.slice(0, stepIndex + 1);
    const revealedSet = new Set<TreeNode>(steps);
    currentNodeId = steps[steps.length - 1]?.id ?? null;

    // Track duplicates for cache hit coloring
    const seen = new Set<number>();
    for (const node of steps) {
      if (seen.has(node.n)) {
        memoizedNs.add(node.n);
      }
      seen.add(node.n);
    }

    function markRevealed(node: TreeNode): boolean {
      let childRevealed = false;
      for (const child of node.children) { if (markRevealed(child)) childRevealed = true; }
      if (revealedSet.has(node) || childRevealed) { revealedIds.add(node.id); return true; }
      return false;
    }
    markRevealed(tree);
  }

  const totalSteps = evalOrder.length;
  const hasStarted = stepIndex >= 0;
  const isComplete = stepIndex === totalSteps - 1;

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

  // Keyboard shortcuts
  useEffect(() => {
    if (state !== "ready") return;
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.closest?.(".cm-editor")) return;
      if (e.code === "Space") { e.preventDefault(); if (isComplete) return; if (isPlaying) pause(); else play(); }
      else if (e.code === "ArrowRight") { e.preventDefault(); if (!isPlaying && !isComplete) step(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state, isPlaying, isComplete, play, pause, step]);

  const progressPercent = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  // ── Idle: show button ──
  if (state === "idle") {
    return (
      <button
        onClick={startTrace}
        className="group w-full bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-5 text-left hover:border-violet-300 hover:shadow-sm transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
              Visualize your solution
            </p>
            <p className="text-xs text-slate-500">
              Watch your code execute on <span className="font-mono font-medium text-slate-600">{traceInputLabel}</span> — see the actual call tree it builds
            </p>
          </div>
          <svg className="w-5 h-5 text-slate-400 ml-auto transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </button>
    );
  }

  // ── Tracing ──
  if (state === "tracing") {
    return (
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 text-center animate-fade-in">
        <div className="w-8 h-8 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-violet-700 font-medium">Tracing your solution...</p>
      </div>
    );
  }

  // ── Error ──
  if (state === "error") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
        <p className="text-sm text-red-700 font-medium">Couldn't trace your solution</p>
        <p className="text-xs text-red-500 mt-1">{error}</p>
        <button onClick={() => setState("idle")} className="text-xs text-red-600 underline mt-2">Try again</button>
      </div>
    );
  }

  // ── Ready: show replay ──
  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-slate-200">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Your solution on {traceInputLabel}</h4>
            <p className="text-xs text-slate-500">
              {totalCalls} total calls — {tree ? countNodes(tree) : 0} unique nodes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={step} disabled={isPlaying || isComplete} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">Step</button>
            <button onClick={isPlaying ? pause : play} disabled={isComplete} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${isPlaying ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
              {isPlaying ? "Pause" : "Play"}
            </button>
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <input type="range" min={50} max={600} step={10} value={650 - speed} onChange={(e) => setSpeed(650 - Number(e.target.value))} className="w-12 accent-violet-500" />
            </label>
          </div>
        </div>

        {/* Progress */}
        {hasStarted && (
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">{stepIndex + 1}/{totalSteps}</span>
            </div>
          </div>
        )}

        {/* Tree */}
        <div className="p-6 min-h-[250px] flex items-center justify-center">
          {tree && hasStarted ? (
            <RecursionTree tree={tree} revealedIds={revealedIds} memoizedNs={memoizedNs} prunedIds={prunedIds} currentNodeId={currentNodeId} />
          ) : (
            <p className="text-sm text-slate-400">Press <kbd className="kbd-hint">Space</kbd> or <strong>Play</strong> to watch</p>
          )}
        </div>
      </div>
    </div>
  );
}
