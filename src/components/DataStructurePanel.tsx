interface Props {
  type: "queue" | "stack" | "priority-queue";
  label: string;
  items: string[];
  lastAdded: string | null;
  lastRemoved: string | null;
  priorities?: Record<string, number>;
}

export default function DataStructurePanel({ type, label, items, lastAdded, lastRemoved, priorities }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {type === "queue" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            ) : type === "stack" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            )}
          </svg>
          {label}
        </h3>
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Flow direction indicator */}
      {type === "queue" && items.length > 0 && (
        <div className="flex items-center gap-1 mb-2 text-[9px] text-slate-400 dark:text-slate-500">
          <span>out ←</span>
          <div className="flex-1" />
          <span>→ in</span>
        </div>
      )}
      {type === "stack" && items.length > 0 && (
        <div className="text-[9px] text-slate-400 dark:text-slate-500 mb-2">↕ top</div>
      )}

      {/* Items */}
      <div className={`flex gap-1.5 ${type === "stack" ? "flex-col-reverse" : "flex-row"} ${type === "stack" ? "items-start" : "items-center"} flex-wrap`}>
        {items.length === 0 ? (
          <div className="text-xs text-slate-300 dark:text-slate-600 italic py-2">empty</div>
        ) : (
          items.map((item, i) => {
            const isAdded = item === lastAdded;
            const isRemoved = item === lastRemoved;
            const priority = priorities?.[item];
            const isFirst = type === "queue" && i === 0;
            const isLast = type === "queue" && i === items.length - 1;

            return (
              <div
                key={`${item}-${i}`}
                className={`
                  flex items-center justify-center rounded-lg font-mono font-bold text-sm
                  transition-all duration-300
                  ${type === "stack" ? "w-full py-2 px-3" : "w-12 h-12"}
                  ${isAdded ? "memo-cell-written bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 scale-110" :
                    isRemoved ? "bg-red-50 dark:bg-red-900/30 border-2 border-red-400 text-red-600 dark:text-red-400 scale-95 opacity-60" :
                    isFirst ? "bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400" :
                    isLast ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400" :
                    "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}
                `}
              >
                <span>{item}</span>
                {priority !== undefined && (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-1.5">:{priority}</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
