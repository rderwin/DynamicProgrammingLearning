interface Props {
  n: number;
  memo: Map<number, number>;
  lastWritten: number | null;
  lastRead: number | null;
}

export default function MemoTable({ n, memo, lastWritten, lastRead }: Props) {
  const filledCount = memo.size;
  const totalSlots = n + 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Memo Table
          <span className="text-[10px] font-mono text-slate-400 font-normal">
            {filledCount}/{totalSlots} filled
          </span>
        </h3>
        <div className="flex gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-green-200 border border-green-400 inline-block" />
            Written
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-400 inline-block" />
            Read (cache hit)
          </span>
        </div>
      </div>

      {/* Fill progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1 mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-violet-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(filledCount / totalSlots) * 100}%` }}
        />
      </div>

      <div className="flex gap-2 justify-center">
        {Array.from({ length: n + 1 }, (_, i) => {
          const value = memo.get(i);
          const isWritten = lastWritten === i;
          const isRead = lastRead === i;

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`text-[10px] font-mono font-medium transition-colors duration-200 ${
                isWritten ? "text-green-600" : isRead ? "text-amber-600" : "text-slate-400"
              }`}>{i}</div>
              <div
                className={`
                  w-14 h-14 flex items-center justify-center rounded-xl
                  text-sm font-mono font-bold
                  transition-all duration-300
                  ${isWritten ? "memo-cell-written" : ""}
                  ${isRead ? "memo-cell-read" : ""}
                  ${
                    isWritten
                      ? "bg-green-100 border-2 border-green-500 text-green-700 shadow-lg shadow-green-500/25 scale-110"
                      : isRead
                        ? "bg-amber-50 border-2 border-amber-400 text-amber-700 shadow-lg shadow-amber-400/25 scale-105"
                        : value !== undefined
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-slate-50 border border-dashed border-slate-200 text-slate-300"
                  }
                `}
              >
                {value !== undefined ? value : "?"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
