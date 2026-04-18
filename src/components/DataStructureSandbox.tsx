import { useState } from "react";

type DSType = "stack" | "queue" | "heap" | "hashmap" | "hashset";

interface Operation {
  op: string;
  value?: string;
  result?: string;
  complexity: string;
  timestamp: number;
}

interface Props {
  onBack: () => void;
}

const dsInfo: Record<DSType, { name: string; icon: string; color: string; description: string; ops: string[] }> = {
  stack: {
    name: "Stack",
    icon: "📚",
    color: "from-blue-500 to-indigo-600",
    description: "LIFO (Last In, First Out). Push and pop from the top.",
    ops: ["push", "pop", "peek"],
  },
  queue: {
    name: "Queue",
    icon: "🚶",
    color: "from-emerald-500 to-teal-600",
    description: "FIFO (First In, First Out). Enqueue at back, dequeue from front.",
    ops: ["enqueue", "dequeue", "peek"],
  },
  heap: {
    name: "Min-Heap",
    icon: "⛰️",
    color: "from-amber-500 to-orange-600",
    description: "Priority queue. Always pops the smallest element.",
    ops: ["push", "pop", "peek"],
  },
  hashmap: {
    name: "HashMap",
    icon: "🗂️",
    color: "from-purple-500 to-pink-600",
    description: "Key-value store with O(1) lookup. Keys and values as strings.",
    ops: ["set", "get", "delete", "has"],
  },
  hashset: {
    name: "HashSet",
    icon: "🎯",
    color: "from-cyan-500 to-blue-600",
    description: "Unique values with O(1) add/check.",
    ops: ["add", "delete", "has"],
  },
};

export default function DataStructureSandbox({ onBack }: Props) {
  const [dsType, setDsType] = useState<DSType>("stack");
  const [items, setItems] = useState<string[]>([]);
  const [map, setMap] = useState<Record<string, string>>({});
  const [set, setSet] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [history, setHistory] = useState<Operation[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);

  function switchDS(t: DSType) {
    setDsType(t);
    setItems([]);
    setMap({});
    setSet(new Set());
    setHistory([]);
    setLastAdded(null);
    setLastRemoved(null);
  }

  function recordOp(op: string, value?: string, result?: string, complexity = "O(1)") {
    setHistory((h) => [...h.slice(-9), { op, value, result, complexity, timestamp: Date.now() }]);
  }

  // Stack operations
  function stackPush() {
    if (!input) return;
    setItems((i) => [...i, input]);
    setLastAdded(input);
    setLastRemoved(null);
    recordOp("push", input);
    setInput("");
  }
  function stackPop() {
    if (items.length === 0) return;
    const popped = items[items.length - 1];
    setItems((i) => i.slice(0, -1));
    setLastRemoved(popped);
    setLastAdded(null);
    recordOp("pop", undefined, popped);
  }
  function stackPeek() {
    if (items.length === 0) return;
    recordOp("peek", undefined, items[items.length - 1]);
  }

  // Queue operations
  function queueEnqueue() {
    if (!input) return;
    setItems((i) => [...i, input]);
    setLastAdded(input);
    setLastRemoved(null);
    recordOp("enqueue", input);
    setInput("");
  }
  function queueDequeue() {
    if (items.length === 0) return;
    const front = items[0];
    setItems((i) => i.slice(1));
    setLastRemoved(front);
    setLastAdded(null);
    recordOp("dequeue", undefined, front);
  }
  function queuePeek() {
    if (items.length === 0) return;
    recordOp("peek", undefined, items[0]);
  }

  // Heap operations
  function heapPush() {
    const num = parseFloat(input);
    if (isNaN(num)) return;
    // Simple min-heap: insert and sift up (we'll just re-sort for simplicity of display)
    const newItems = [...items, input];
    newItems.sort((a, b) => parseFloat(a) - parseFloat(b));
    setItems(newItems);
    setLastAdded(input);
    setLastRemoved(null);
    recordOp("push", input, undefined, "O(log n)");
    setInput("");
  }
  function heapPop() {
    if (items.length === 0) return;
    const min = items[0];
    setItems((i) => i.slice(1));
    setLastRemoved(min);
    setLastAdded(null);
    recordOp("pop", undefined, min, "O(log n)");
  }
  function heapPeek() {
    if (items.length === 0) return;
    recordOp("peek", undefined, items[0]);
  }

  // HashMap operations
  function mapSet() {
    if (!keyInput || !valueInput) return;
    setMap((m) => ({ ...m, [keyInput]: valueInput }));
    setLastAdded(keyInput);
    setLastRemoved(null);
    recordOp("set", `${keyInput} → ${valueInput}`);
    setKeyInput(""); setValueInput("");
  }
  function mapGet() {
    if (!keyInput) return;
    const val = map[keyInput];
    recordOp("get", keyInput, val ?? "undefined");
  }
  function mapDelete() {
    if (!keyInput) return;
    setMap((m) => { const n = { ...m }; delete n[keyInput]; return n; });
    setLastRemoved(keyInput);
    setLastAdded(null);
    recordOp("delete", keyInput);
    setKeyInput("");
  }
  function mapHas() {
    if (!keyInput) return;
    recordOp("has", keyInput, String(keyInput in map));
  }

  // HashSet operations
  function setAdd() {
    if (!input) return;
    setSet((s) => { const n = new Set(s); n.add(input); return n; });
    setLastAdded(input);
    setLastRemoved(null);
    recordOp("add", input);
    setInput("");
  }
  function setDelete() {
    if (!input) return;
    const removed = input;
    setSet((s) => { const n = new Set(s); n.delete(input); return n; });
    setLastRemoved(removed);
    setLastAdded(null);
    recordOp("delete", removed);
    setInput("");
  }
  function setHas() {
    if (!input) return;
    recordOp("has", input, String(set.has(input)));
  }

  const info = dsInfo[dsType];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🎮</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Data Structure Sandbox</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Play with data structures — watch how operations work in real time</p>
      </div>

      {/* DS switcher */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {(Object.keys(dsInfo) as DSType[]).map((t) => (
          <button
            key={t}
            onClick={() => switchDS(t)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${dsType === t ? `bg-gradient-to-br ${dsInfo[t].color} text-white shadow-md` : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
          >
            <span className="mr-1.5">{dsInfo[t].icon}</span>
            {dsInfo[t].name}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden animate-fade-in" key={dsType}>
        {/* Header */}
        <div className={`bg-gradient-to-br ${info.color} px-6 py-4 text-white`}>
          <h3 className="text-lg font-bold">{info.icon} {info.name}</h3>
          <p className="text-sm opacity-90">{info.description}</p>
        </div>

        {/* Visualization */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 min-h-[180px] flex items-center justify-center">
          {dsType === "stack" && (
            <div className="flex flex-col-reverse gap-1 items-center">
              {items.length === 0 && <span className="text-slate-400 dark:text-slate-600 italic text-sm">empty</span>}
              {items.length > 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">↑ top ↑</span>}
              {items.map((item, i) => {
                const isTop = i === items.length - 1;
                return (
                  <div key={`${item}-${i}`} className={`w-28 py-2.5 text-center rounded-lg font-mono font-bold text-sm transition-all ${item === lastAdded ? "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 scale-110 memo-cell-written" : item === lastRemoved ? "bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-600 dark:text-red-400 opacity-60 scale-95" : isTop ? "bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-400 text-blue-700 dark:text-blue-300" : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}>
                    {item}
                  </div>
                );
              })}
            </div>
          )}

          {dsType === "queue" && (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                <span>← out</span>
                <div className="flex-1 min-w-[200px]" />
                <span>in →</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto max-w-full">
                {items.length === 0 && <span className="text-slate-400 dark:text-slate-600 italic text-sm">empty</span>}
                {items.map((item, i) => {
                  const isFront = i === 0;
                  const isBack = i === items.length - 1;
                  return (
                    <div key={`${item}-${i}`} className={`w-16 h-16 flex items-center justify-center rounded-lg font-mono font-bold text-sm transition-all flex-shrink-0 ${item === lastAdded ? "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 scale-110 memo-cell-written" : item === lastRemoved ? "bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-600 dark:text-red-400 opacity-60 scale-95" : isFront ? "bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-700 dark:text-amber-400" : isBack ? "bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-400 text-blue-700 dark:text-blue-300" : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}>
                      {item}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between w-full max-w-xs text-[10px] text-slate-400 dark:text-slate-500">
                <span>← front</span>
                <span>back →</span>
              </div>
            </div>
          )}

          {dsType === "heap" && (
            <HeapTree items={items} lastAdded={lastAdded} lastRemoved={lastRemoved} />
          )}

          {dsType === "hashmap" && (
            <div className="w-full max-w-md">
              {Object.keys(map).length === 0 && <span className="text-slate-400 dark:text-slate-600 italic text-sm block text-center">empty</span>}
              <div className="space-y-1.5">
                {Object.entries(map).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-mono text-sm transition-all ${k === lastAdded ? "bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-400 memo-cell-written" : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{k}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-700 dark:text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dsType === "hashset" && (
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {set.size === 0 && <span className="text-slate-400 dark:text-slate-600 italic text-sm">empty</span>}
              {Array.from(set).map((item) => (
                <div key={item} className={`px-4 py-2 rounded-full font-mono font-bold text-sm transition-all ${item === lastAdded ? "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 memo-cell-written" : "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"}`}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          {(dsType === "stack" || dsType === "queue" || dsType === "heap" || dsType === "hashset") && (
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type={dsType === "heap" ? "number" : "text"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dsType === "heap" ? "Enter number" : "Enter value"}
                className="flex-1 min-w-[160px] px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (dsType === "stack") stackPush();
                    if (dsType === "queue") queueEnqueue();
                    if (dsType === "heap") heapPush();
                    if (dsType === "hashset") setAdd();
                  }
                }}
              />
              {dsType === "stack" && (
                <>
                  <button onClick={stackPush} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">push</button>
                  <button onClick={stackPop} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600" disabled={items.length === 0}>pop</button>
                  <button onClick={stackPeek} className="px-3 py-2 bg-slate-500 text-white rounded-lg text-xs font-semibold hover:bg-slate-600" disabled={items.length === 0}>peek</button>
                </>
              )}
              {dsType === "queue" && (
                <>
                  <button onClick={queueEnqueue} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">enqueue</button>
                  <button onClick={queueDequeue} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600" disabled={items.length === 0}>dequeue</button>
                  <button onClick={queuePeek} className="px-3 py-2 bg-slate-500 text-white rounded-lg text-xs font-semibold hover:bg-slate-600" disabled={items.length === 0}>peek</button>
                </>
              )}
              {dsType === "heap" && (
                <>
                  <button onClick={heapPush} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">push</button>
                  <button onClick={heapPop} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600" disabled={items.length === 0}>pop min</button>
                  <button onClick={heapPeek} className="px-3 py-2 bg-slate-500 text-white rounded-lg text-xs font-semibold hover:bg-slate-600" disabled={items.length === 0}>peek</button>
                </>
              )}
              {dsType === "hashset" && (
                <>
                  <button onClick={setAdd} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">add</button>
                  <button onClick={setDelete} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600">delete</button>
                  <button onClick={setHas} className="px-3 py-2 bg-slate-500 text-white rounded-lg text-xs font-semibold hover:bg-slate-600">has</button>
                </>
              )}
            </div>
          )}

          {dsType === "hashmap" && (
            <div className="flex flex-wrap gap-2 items-center">
              <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="key" className="w-28 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              <input value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="value" className="w-28 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
              <button onClick={mapSet} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">set</button>
              <button onClick={mapGet} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600">get</button>
              <button onClick={mapDelete} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600">delete</button>
              <button onClick={mapHas} className="px-3 py-2 bg-slate-500 text-white rounded-lg text-xs font-semibold hover:bg-slate-600">has</button>
            </div>
          )}
        </div>

        {/* History */}
        <div className="p-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">History</p>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-600 italic">No operations yet. Try adding/removing items!</p>
          ) : (
            <div className="space-y-1">
              {history.slice().reverse().map((h, i) => (
                <div key={h.timestamp + i} className="flex items-center gap-3 text-xs font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <span className="font-bold text-blue-600 dark:text-blue-400 w-16">{h.op}</span>
                  <span className="text-slate-600 dark:text-slate-400 flex-1">{h.value ?? ""}</span>
                  {h.result !== undefined && <span className="text-emerald-600 dark:text-emerald-400">→ {h.result}</span>}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{h.complexity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeapTree({ items, lastAdded, lastRemoved }: { items: string[]; lastAdded: string | null; lastRemoved: string | null }) {
  if (items.length === 0) return <span className="text-slate-400 dark:text-slate-600 italic text-sm">empty</span>;

  // Draw as a binary tree
  const levels: string[][] = [];
  let idx = 0;
  let levelSize = 1;
  while (idx < items.length) {
    levels.push(items.slice(idx, idx + levelSize));
    idx += levelSize;
    levelSize *= 2;
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {levels.map((level, li) => (
        <div key={li} className="flex gap-3" style={{ gap: `${Math.max(4, 20 - li * 4)}px` }}>
          {level.map((item) => (
            <div key={item + li} className={`w-11 h-11 flex items-center justify-center rounded-full font-mono font-bold text-sm transition-all ${item === lastAdded ? "bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 memo-cell-written" : item === lastRemoved ? "bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-600" : "bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 text-amber-700 dark:text-amber-400"}`}>
              {item}
            </div>
          ))}
        </div>
      ))}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Min at the top. Each child ≥ parent.</p>
    </div>
  );
}
