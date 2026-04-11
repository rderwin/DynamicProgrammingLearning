import { useState, useRef, useEffect, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { autocompletion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import {
  runCode,
  abortExecution,
  preloadPyodide,
  isPyodideLoaded,
  type TestCase,
  type RunResult,
  type Language,
} from "../engine/runCode";

function dpCompletions(lang: Language) {
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    const jsSnippets = [
      { label: "memo", detail: "memoization object", apply: "const memo = {};" },
      { label: "if (n in memo)", detail: "cache check", apply: "if (n in memo) return memo[n];" },
      { label: "memo[n] =", detail: "cache store", apply: "memo[n] = result;" },
      { label: "Math.min", detail: "minimum", apply: "Math.min(a, b)" },
      { label: "Math.max", detail: "maximum", apply: "Math.max(a, b)" },
      { label: "Infinity", detail: "positive infinity" },
      { label: "dp array", detail: "DP table", apply: "const dp = new Array(n + 1).fill(0);" },
      { label: "for loop", detail: "bottom-up loop", apply: "for (let i = 0; i <= n; i++) {\n  \n}" },
    ];
    const pySnippets = [
      { label: "memo", detail: "memoization dict", apply: "memo = {}" },
      { label: "if n in memo", detail: "cache check", apply: "if n in memo:\n        return memo[n]" },
      { label: "memo[n]", detail: "cache store", apply: "memo[n] = result" },
      { label: "min(", detail: "minimum", apply: "min(a, b)" },
      { label: "max(", detail: "maximum", apply: "max(a, b)" },
      { label: "float('inf')", detail: "positive infinity", apply: "float('inf')" },
      { label: "dp list", detail: "DP table", apply: "dp = [0] * (n + 1)" },
      { label: "for range", detail: "bottom-up loop", apply: "for i in range(n + 1):\n        " },
      { label: "functools.lru_cache", detail: "auto memoize decorator", apply: "@functools.lru_cache(maxsize=None)" },
    ];
    return { from: word.from, options: lang === "javascript" ? jsSnippets : pySnippets };
  };
}

interface Props {
  testCases: TestCase[];
  starterJS: string;
  starterPython: string;
  functionName: string;
  onPass?: (code: string, language: Language) => void;
  onCodeChange?: (lang: "js" | "py", code: string) => void;
}

export default function CodeEditor({ testCases, starterJS, starterPython, functionName, onPass, onCodeChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [language, setLanguage] = useState<Language>("javascript");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [hasEverPassed, setHasEverPassed] = useState(false);

  const codeStore = useRef<Record<Language, string>>({
    javascript: starterJS,
    python: starterPython,
  });

  const createEditor = useCallback(
    (lang: Language) => {
      if (!editorRef.current) return;
      if (viewRef.current) {
        codeStore.current[language] = viewRef.current.state.doc.toString();
        viewRef.current.destroy();
      }
      const extensions = [
        basicSetup,
        keymap.of([indentWithTab]),
        oneDark,
        EditorView.theme({
          "&": { fontSize: "13px", height: "100%" },
          ".cm-scroller": { overflow: "auto", fontFamily: "'JetBrains Mono', monospace" },
          ".cm-content": { padding: "12px 0" },
          ".cm-gutters": { backgroundColor: "transparent", borderRight: "1px solid #313244" },
          ".cm-tooltip.cm-tooltip-autocomplete": { backgroundColor: "#1e1e2e", border: "1px solid #313244", borderRadius: "8px", fontSize: "12px" },
          ".cm-tooltip-autocomplete .cm-completionLabel": { color: "#cdd6f4" },
          ".cm-tooltip-autocomplete .cm-completionDetail": { color: "#6c7086", fontStyle: "normal" },
          ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "#313244" },
        }),
        lang === "javascript" ? javascript() : python(),
        autocompletion({ override: [dpCompletions(lang)] }),
      ];
      const state = EditorState.create({ doc: codeStore.current[lang], extensions });
      viewRef.current = new EditorView({ state, parent: editorRef.current });
    },
    [language]
  );

  useEffect(() => {
    createEditor(language);
    return () => {
      if (viewRef.current) {
        codeStore.current[language] = viewRef.current.state.doc.toString();
        viewRef.current.destroy();
      }
      // Kill any running worker on unmount
      abortExecution();
    };
  }, [language]);

  const handleRun = async () => {
    if (!viewRef.current) return;
    const code = viewRef.current.state.doc.toString();
    codeStore.current[language] = code;
    // Save code on each run
    onCodeChange?.(language === "python" ? "py" : "js", code);
    setRunning(true);
    setResult(null);
    if (language === "python" && !isPyodideLoaded()) setPyodideLoading(true);
    try {
      const res = await runCode(code, testCases, language);
      setResult(res);
      if (res.passed) {
        setHasEverPassed(true);
        onPass?.(code, language);
      }
    } catch {
      setResult({ passed: false, results: [], error: "Unexpected error" });
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  };

  const handleReset = () => {
    codeStore.current[language] = language === "javascript" ? starterJS : starterPython;
    createEditor(language);
    setResult(null);
  };

  const switchLanguage = (lang: Language) => {
    if (viewRef.current) codeStore.current[language] = viewRef.current.state.doc.toString();
    setResult(null);
    setLanguage(lang);
    if (lang === "python") preloadPyodide();
  };

  const passedCount = result?.results.filter((r) => r.passed).length ?? 0;
  const totalCount = result?.results.length ?? 0;

  return (
    <div className="bg-[#1e1e2e] rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181825] border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-300">
            {functionName}()
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-[#11111b] rounded-md p-0.5 text-xs">
            <button onClick={() => switchLanguage("javascript")} className={`px-2.5 py-1 rounded font-medium transition-colors ${language === "javascript" ? "bg-[#313244] text-amber-400" : "text-slate-500 hover:text-slate-300"}`}>JS</button>
            <button onClick={() => switchLanguage("python")} className={`px-2.5 py-1 rounded font-medium transition-colors ${language === "python" ? "bg-[#313244] text-blue-400" : "text-slate-500 hover:text-slate-300"}`}>Python</button>
          </div>
          <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors">Reset</button>
          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {running ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {pyodideLoading ? "Loading Python..." : "Running..."}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Run Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="h-[220px] overflow-auto" />

      {/* ─── Results ─── */}
      {result && (
        <div className="border-t border-slate-700/50">
          {/* Big result banner */}
          {result.error ? (
            <div className="px-5 py-4 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1">Error</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-red-300/80">{result.error}</pre>
                </div>
              </div>
            </div>
          ) : result.passed ? (
            <div className="px-5 py-5 bg-emerald-500/10 border-b border-emerald-500/20 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-scale-in">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-400">
                    {hasEverPassed ? "Correct!" : "Nailed it!"}
                  </p>
                  <p className="text-sm text-emerald-300/70">
                    All {totalCount} tests passed. You've got the DP pattern down.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 bg-amber-500/10 border-b border-amber-500/20 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-400">
                    Not quite — {passedCount}/{totalCount} passed
                  </p>
                  <p className="text-xs text-amber-300/60 mt-0.5">
                    {passedCount === 0
                      ? "Check your base cases and return values."
                      : passedCount < totalCount / 2
                        ? "Some cases work — check the failing inputs for edge cases."
                        : "Almost there! The larger inputs might be timing out — try memoization."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Test case details (collapsible feel — always shown but compact) */}
          {!result.error && (
            <div className="px-4 py-3 space-y-1">
              {result.results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-xs font-mono px-3 py-2 rounded-lg transition-all duration-200 ${
                    r.passed
                      ? "bg-emerald-500/5 text-emerald-300/80"
                      : "bg-red-500/8 text-red-300"
                  }`}
                >
                  {r.passed ? (
                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={r.passed ? "text-slate-500" : "text-slate-400"}>{testCases[i].label}</span>
                  {!r.passed && (
                    <span className="ml-auto text-slate-500">
                      got {r.error ? <span className="text-red-400">{r.error}</span> : <span className="text-red-400">{JSON.stringify(r.actual)}</span>}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
