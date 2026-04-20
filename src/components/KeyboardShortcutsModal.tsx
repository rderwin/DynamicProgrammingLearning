import { useEffect } from "react";

interface Section {
  title: string;
  items: { keys: string; description: string }[];
}

const SECTIONS: Section[] = [
  {
    title: "Navigation",
    items: [
      { keys: "g h", description: "Go home" },
      { keys: "g s", description: "Go to My Stats" },
      { keys: "g t", description: "Go to Training Center" },
      { keys: "g c", description: "Open Cheat Sheet" },
      { keys: "Escape", description: "Go home / close dialog" },
    ],
  },
  {
    title: "Help",
    items: [
      { keys: "?", description: "Show this dialog" },
    ],
  },
  {
    title: "Theme",
    items: [
      { keys: "t", description: "Toggle dark / light mode" },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{section.title}</h3>
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <div key={item.keys} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.description}</span>
                    <KeyCombo combo={item.keys} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-5 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          Press <Kbd>?</Kbd> anytime to see this list.
        </p>
      </div>
    </div>
  );
}

function KeyCombo({ combo }: { combo: string }) {
  const parts = combo.includes(" ") ? combo.split(" ") : [combo];
  return (
    <div className="flex items-center gap-1">
      {parts.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <Kbd>{p === "Escape" ? "Esc" : p === "ArrowLeft" ? "←" : p === "ArrowRight" ? "→" : p}</Kbd>
          {i < parts.length - 1 && <span className="text-[10px] text-slate-400">then</span>}
        </span>
      ))}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 min-w-[22px] justify-center">
      {children}
    </kbd>
  );
}
