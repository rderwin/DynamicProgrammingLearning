interface Props {
  n: number;
  memo: Map<number, number>;
  lastWritten: number | null;
  lastRead: number | null;
}

export default function MemoTable({ n, memo, lastWritten, lastRead }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Memo Table
      </h3>
      <div className="flex gap-1">
        {Array.from({ length: n + 1 }, (_, i) => {
          const value = memo.get(i);
          const isWritten = lastWritten === i;
          const isRead = lastRead === i;

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-xs text-slate-400">{i}</div>
              <div
                className={`
                  w-12 h-12 flex items-center justify-center rounded-lg
                  text-sm font-mono font-semibold
                  transition-all duration-300
                  ${
                    isWritten
                      ? "bg-green-200 border-2 border-green-500 scale-110 text-green-800"
                      : isRead
                        ? "bg-amber-100 border-2 border-amber-400 text-amber-800"
                        : value !== undefined
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-slate-50 border border-slate-200 text-slate-300"
                  }
                `}
              >
                {value !== undefined ? value : "—"}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 text-xs text-slate-400 mt-1">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200 border border-green-400 inline-block" />
          Written
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400 inline-block" />
          Read (cache hit)
        </span>
      </div>
    </div>
  );
}
