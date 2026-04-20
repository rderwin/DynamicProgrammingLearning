import { useEffect, useMemo, useRef, useState } from "react";

export interface CommandItem {
  id: string;
  label: string;
  /** Optional secondary label, e.g. breadcrumb/category. */
  category?: string;
  icon?: string;
  /** Extra words to match on (not shown but searchable). */
  keywords?: string[];
  handler: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}

/**
 * Cmd+K style fuzzy command palette.
 * - Typing filters by label + category + keywords (simple substring + word-start).
 * - ArrowUp/ArrowDown navigates; Enter triggers; Esc closes.
 * - Click outside also closes.
 *
 * Matching: splits the query into tokens; every token must appear somewhere
 * in the item's searchable text. Ranking: items where all tokens hit the
 * label early rank higher.
 */
export default function CommandPalette({ open, onClose, items }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored: { item: CommandItem; score: number }[] = [];
    for (const item of items) {
      const haystack = [
        item.label,
        item.category ?? "",
        ...(item.keywords ?? []),
      ].join(" ").toLowerCase();
      let passed = true;
      let score = 0;
      for (const tok of tokens) {
        const idx = haystack.indexOf(tok);
        if (idx < 0) { passed = false; break; }
        // Earlier matches score higher; label-prefix matches are best.
        score += 100 - Math.min(idx, 100);
        if (item.label.toLowerCase().startsWith(tok)) score += 50;
      }
      if (passed) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }, [query, items]);

  // Reset selected when results change.
  useEffect(() => {
    setSelected(0);
  }, [filtered]);

  // Focus + reset on open.
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      // Defer focus to next tick so the portal exists.
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Keep selected item scrolled into view.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[selected];
      if (item) {
        onClose();
        // Defer so onClose state settles before navigation.
        setTimeout(() => item.handler(), 0);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <svg aria-hidden="true" className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Jump to any lesson, trainer, tool…"
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No results for "{query}"
            </div>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.id}
                data-idx={i}
                onClick={() => {
                  onClose();
                  setTimeout(() => item.handler(), 0);
                }}
                onMouseEnter={() => setSelected(i)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  i === selected
                    ? "bg-blue-50 dark:bg-blue-950/40"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon && <span className="text-lg flex-shrink-0">{item.icon}</span>}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${i === selected ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-slate-800 dark:text-slate-100"}`}>
                    {item.label}
                  </p>
                  {item.category && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.category}</p>
                  )}
                </div>
                {i === selected && (
                  <kbd className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 flex-shrink-0">
                    ↵
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-slate-300 dark:border-slate-600 rounded px-1">↑</kbd>
              <kbd className="font-mono border border-slate-300 dark:border-slate-600 rounded px-1">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono border border-slate-300 dark:border-slate-600 rounded px-1">↵</kbd>
              select
            </span>
          </div>
          <span>{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>
        </div>
      </div>
    </div>
  );
}
