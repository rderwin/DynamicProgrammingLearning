import { useMemo } from "react";
import type { ProblemStats } from "../engine/computeStats";

interface Props {
  stats: ProblemStats[];
  currentN: number;
}

const CHART_HEIGHT = 200;
const BAR_WIDTH = 24;
const GROUP_GAP = 32;
const BAR_GAP = 4;
const LABEL_HEIGHT = 32;
const TOP_PAD = 24;

export default function ComplexityChart({ stats, currentN }: Props) {
  const maxVal = useMemo(
    () => Math.max(...stats.map((s) => s.bruteForceNodes), 1),
    [stats]
  );

  const barAreaHeight = CHART_HEIGHT - LABEL_HEIGHT - TOP_PAD;
  const groupWidth = BAR_WIDTH * 2 + BAR_GAP;
  const totalWidth = stats.length * groupWidth + (stats.length - 1) * GROUP_GAP + 48;

  const currentStats = stats.find((s) => s.n === currentN);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-slate-900/50 animate-fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Call Count Comparison
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Brute force vs memoized — watch the gap explode as n grows
          </p>
        </div>

        {currentStats && (
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-400 inline-block" />
              Brute: <strong className="text-slate-700 dark:text-slate-300">{currentStats.bruteForceNodes}</strong> calls
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-400 inline-block" />
              Memo: <strong className="text-slate-700 dark:text-slate-300">{currentStats.memoNodes}</strong> calls
            </span>
            <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
              {currentStats.savings}% saved
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${totalWidth} ${CHART_HEIGHT}`}
          className="select-none mx-auto block"
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((frac) => {
            const y = TOP_PAD + barAreaHeight * (1 - frac);
            return (
              <g key={frac}>
                <line
                  x1={20}
                  y1={y}
                  x2={totalWidth - 20}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text x={14} y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="'JetBrains Mono', monospace">
                  {Math.round(maxVal * frac)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={20}
            y1={TOP_PAD + barAreaHeight}
            x2={totalWidth - 20}
            y2={TOP_PAD + barAreaHeight}
            stroke="#cbd5e1"
            strokeWidth={1}
          />

          {/* Bar groups */}
          {stats.map((s, i) => {
            const groupX = 24 + i * (groupWidth + GROUP_GAP);
            const isCurrent = s.n === currentN;

            const bruteHeight = (s.bruteForceNodes / maxVal) * barAreaHeight;
            const memoHeight = (s.memoNodes / maxVal) * barAreaHeight;

            const bruteY = TOP_PAD + barAreaHeight - bruteHeight;
            const memoY = TOP_PAD + barAreaHeight - memoHeight;

            // Stagger animation delay per group
            const delay = i * 60;

            return (
              <g key={s.n}>
                {/* Highlight background for current n */}
                {isCurrent && (
                  <rect
                    x={groupX - 6}
                    y={TOP_PAD - 4}
                    width={groupWidth + 12}
                    height={barAreaHeight + LABEL_HEIGHT + 4}
                    rx={6}
                    fill="#f1f5f9"
                  />
                )}

                {/* Brute force bar (red) */}
                <rect
                  x={groupX}
                  y={bruteY}
                  width={BAR_WIDTH}
                  height={bruteHeight}
                  rx={4}
                  fill={isCurrent ? "#f87171" : "#fca5a5"}
                  className="chart-bar-grow"
                  style={{
                    transformOrigin: `${groupX + BAR_WIDTH / 2}px ${TOP_PAD + barAreaHeight}px`,
                    animationDelay: `${delay}ms`,
                  }}
                />

                {/* Brute count label */}
                {bruteHeight > 16 && (
                  <text
                    x={groupX + BAR_WIDTH / 2}
                    y={bruteY + 14}
                    fontSize="10"
                    fontWeight="600"
                    fill="#fff"
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    className="chart-label-fade"
                    style={{ animationDelay: `${delay + 300}ms` }}
                  >
                    {s.bruteForceNodes}
                  </text>
                )}

                {/* Memo bar (green) */}
                <rect
                  x={groupX + BAR_WIDTH + BAR_GAP}
                  y={memoY}
                  width={BAR_WIDTH}
                  height={memoHeight}
                  rx={4}
                  fill={isCurrent ? "#34d399" : "#6ee7b7"}
                  className="chart-bar-grow"
                  style={{
                    transformOrigin: `${groupX + BAR_WIDTH + BAR_GAP + BAR_WIDTH / 2}px ${TOP_PAD + barAreaHeight}px`,
                    animationDelay: `${delay + 100}ms`,
                  }}
                />

                {/* Memo count label */}
                {memoHeight > 16 && (
                  <text
                    x={groupX + BAR_WIDTH + BAR_GAP + BAR_WIDTH / 2}
                    y={memoY + 14}
                    fontSize="10"
                    fontWeight="600"
                    fill="#fff"
                    textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace"
                    className="chart-label-fade"
                    style={{ animationDelay: `${delay + 400}ms` }}
                  >
                    {s.memoNodes}
                  </text>
                )}

                {/* N label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={TOP_PAD + barAreaHeight + 18}
                  fontSize="11"
                  fontWeight={isCurrent ? "700" : "500"}
                  fill={isCurrent ? "#1e293b" : "#94a3b8"}
                  textAnchor="middle"
                  fontFamily="'Inter', system-ui, sans-serif"
                >
                  n={s.n}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
