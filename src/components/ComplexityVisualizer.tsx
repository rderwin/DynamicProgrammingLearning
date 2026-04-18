import { useState, useMemo } from "react";

interface ComplexityCurve {
  id: string;
  name: string;
  color: string;
  fn: (n: number) => number;
  example: string;
}

const curves: ComplexityCurve[] = [
  { id: "const", name: "O(1)", color: "#10b981", fn: () => 1, example: "Hash lookup, array index" },
  { id: "log", name: "O(log n)", color: "#06b6d4", fn: (n) => Math.log2(Math.max(n, 1)), example: "Binary search" },
  { id: "linear", name: "O(n)", color: "#3b82f6", fn: (n) => n, example: "Linear scan" },
  { id: "nlogn", name: "O(n log n)", color: "#8b5cf6", fn: (n) => n * Math.log2(Math.max(n, 1)), example: "Merge sort, heap sort" },
  { id: "squared", name: "O(n²)", color: "#f59e0b", fn: (n) => n * n, example: "Nested loops, naive DP" },
  { id: "cubed", name: "O(n³)", color: "#f97316", fn: (n) => n * n * n, example: "Triple nested loops" },
  { id: "exp", name: "O(2ⁿ)", color: "#ef4444", fn: (n) => Math.pow(2, Math.min(n, 30)), example: "Brute-force recursion" },
  { id: "fact", name: "O(n!)", color: "#ec4899", fn: (n) => factorial(Math.min(n, 15)), example: "All permutations" },
];

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

interface Props {
  onBack: () => void;
}

export default function ComplexityVisualizer({ onBack }: Props) {
  const [n, setN] = useState(20);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    const: true, log: true, linear: true, nlogn: true, squared: true, cubed: false, exp: true, fact: false,
  });
  const [logScale, setLogScale] = useState(true);

  const W = 600;
  const H = 300;
  const PAD = 40;

  // Compute data points
  const enabledCurves = curves.filter((c) => enabled[c.id]);
  const samples = useMemo(() => {
    const points: { curve: string; n: number; y: number }[] = [];
    for (const c of enabledCurves) {
      for (let i = 1; i <= n; i++) {
        points.push({ curve: c.id, n: i, y: c.fn(i) });
      }
    }
    return points;
  }, [n, enabledCurves]);

  const maxY = useMemo(() => {
    return Math.max(...samples.map((s) => s.y), 1);
  }, [samples]);

  function yCoord(y: number): number {
    if (logScale) {
      return H - PAD - (Math.log10(Math.max(y, 1)) / Math.log10(maxY)) * (H - 2 * PAD);
    }
    return H - PAD - (y / maxY) * (H - 2 * PAD);
  }

  function xCoord(x: number): number {
    return PAD + ((x - 1) / Math.max(n - 1, 1)) * (W - 2 * PAD);
  }

  // Hardware reference comparisons
  function humanizeOps(ops: number): string {
    if (ops < 1e3) return `${Math.round(ops)} ops`;
    if (ops < 1e6) return `${(ops / 1e3).toFixed(1)}K ops`;
    if (ops < 1e9) return `${(ops / 1e6).toFixed(1)}M ops`;
    if (ops < 1e12) return `${(ops / 1e9).toFixed(1)}B ops`;
    if (ops < 1e15) return `${(ops / 1e12).toFixed(1)}T ops`;
    return ops.toExponential(1);
  }

  function humanizeTime(ops: number): string {
    const secs = ops / 1e9;
    if (secs < 1e-6) return "instant";
    if (secs < 1) return `${(secs * 1000).toFixed(1)}ms`;
    if (secs < 60) return `${secs.toFixed(1)}s`;
    if (secs < 3600) return `${(secs / 60).toFixed(1)}m`;
    if (secs < 86400) return `${(secs / 3600).toFixed(1)}h`;
    if (secs < 31536000) return `${(secs / 86400).toFixed(0)}d`;
    if (secs < 3.15e16) return `${(secs / 31536000).toExponential(1)}y`;
    return "heat death of universe";
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
          <span className="text-2xl">📈</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Complexity Growth Visualizer</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Watch how different Big O classes grow with input size</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">n =</span>
            <input type="range" min={5} max={50} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-40 accent-cyan-500" />
            <span className="bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200 w-10 h-7 rounded-md flex items-center justify-center text-xs">{n}</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} className="accent-cyan-500" />
            Log scale (needed for exponential)
          </label>
        </div>

        {/* Curve toggles */}
        <div className="flex flex-wrap gap-2 mb-6">
          {curves.map((c) => (
            <button
              key={c.id}
              onClick={() => setEnabled((e) => ({ ...e, [c.id]: !e[c.id] }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${enabled[c.id] ? "text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500"}`}
              style={enabled[c.id] ? { backgroundColor: c.color } : undefined}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Graph */}
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 mb-6">
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - 2 * PAD)} y2={H - PAD - f * (H - 2 * PAD)} stroke="#cbd5e1" strokeDasharray="2 4" strokeWidth={0.5} opacity={0.5} />
            ))}

            {/* X-axis */}
            <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="#94a3b8" strokeWidth={1} />
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const val = Math.round(1 + f * (n - 1));
              return (
                <g key={f}>
                  <line x1={PAD + f * (W - 2 * PAD)} x2={PAD + f * (W - 2 * PAD)} y1={H - PAD} y2={H - PAD + 4} stroke="#94a3b8" />
                  <text x={PAD + f * (W - 2 * PAD)} y={H - PAD + 18} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="'JetBrains Mono', monospace">n={val}</text>
                </g>
              );
            })}
            <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">Input Size (n)</text>

            {/* Y-axis */}
            <line x1={PAD} x2={PAD} y1={PAD / 2} y2={H - PAD} stroke="#94a3b8" strokeWidth={1} />
            <text x={PAD} y={PAD / 2 - 5} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="'JetBrains Mono', monospace">{logScale ? "log ops" : "ops"}</text>

            {/* Curves */}
            {enabledCurves.map((c) => {
              const pts: string[] = [];
              for (let i = 1; i <= n; i++) {
                pts.push(`${xCoord(i)},${yCoord(c.fn(i))}`);
              }
              return (
                <g key={c.id}>
                  <polyline
                    points={pts.join(" ")}
                    fill="none"
                    stroke={c.color}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Label at end */}
                  <text
                    x={xCoord(n) + 6}
                    y={yCoord(c.fn(n)) + 4}
                    fontSize="10"
                    fill={c.color}
                    fontWeight="600"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Ops at current n */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">At n = {n}</p>
          {enabledCurves.map((c) => {
            const ops = c.fn(n);
            return (
              <div key={c.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="inline-block w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300 w-20">{c.name}</span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 flex-1">{humanizeOps(ops)}</span>
                <span className="font-mono text-xs text-slate-400 dark:text-slate-500">≈ {humanizeTime(ops)}</span>
              </div>
            );
          })}
        </div>

        {/* Hardware reference */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Real-world context</p>
          <div className="space-y-1.5 text-xs">
            <p className="text-slate-600 dark:text-slate-400">Typical CPU does <strong>~1 billion operations/second</strong></p>
            <p className="text-slate-500 dark:text-slate-400">
              <strong className="text-emerald-600 dark:text-emerald-400">Safe for interviews:</strong> O(1), O(log n), O(n), O(n log n), O(n²) for n≤10,000
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              <strong className="text-red-600 dark:text-red-400">Dangerous:</strong> O(n³) slow for n&gt;1000, O(2ⁿ) dies at n=30, O(n!) dies at n=12
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
