import { useState, useRef, useEffect, useCallback } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import {
  runCode,
  preloadPyodide,
  isPyodideLoaded,
  type TestCase,
  type RunResult,
  type Language,
} from "../engine/runCode";

interface Props {
  testCases: TestCase[];
  starterJS: string;
  starterPython: string;
  /** Name of the function the user should implement */
  functionName: string;
}

export default function CodeEditor({
  testCases,
  starterJS,
  starterPython,
  functionName,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [language, setLanguage] = useState<Language>("javascript");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Store code per language so switching doesn't lose work
  const codeStore = useRef<Record<Language, string>>({
    javascript: starterJS,
    python: starterPython,
  });

  const createEditor = useCallback(
    (lang: Language) => {
      if (!editorRef.current) return;
      if (viewRef.current) {
        // Save current code before destroying
        codeStore.current[language] = viewRef.current.state.doc.toString();
        viewRef.current.destroy();
      }

      const extensions = [
        basicSetup,
        oneDark,
        EditorView.theme({
          "&": { fontSize: "13px", height: "100%" },
          ".cm-scroller": { overflow: "auto", fontFamily: "'JetBrains Mono', monospace" },
          ".cm-content": { padding: "12px 0" },
          ".cm-gutters": {
            backgroundColor: "transparent",
            borderRight: "1px solid #313244",
          },
        }),
        ...(lang === "javascript" ? [javascript()] : []),
      ];

      const state = EditorState.create({
        doc: codeStore.current[lang],
        extensions,
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });
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
    };
  }, [language]);

  const handleRun = async () => {
    if (!viewRef.current) return;
    const code = viewRef.current.state.doc.toString();
    codeStore.current[language] = code;

    setRunning(true);
    setResult(null);

    if (language === "python" && !isPyodideLoaded()) {
      setPyodideLoading(true);
    }

    try {
      const res = await runCode(code, testCases, language);
      setResult(res);
    } catch {
      setResult({ passed: false, results: [], error: "Unexpected error" });
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  };

  const handleReset = () => {
    codeStore.current[language] =
      language === "javascript" ? starterJS : starterPython;
    createEditor(language);
    setResult(null);
  };

  const switchLanguage = (lang: Language) => {
    if (viewRef.current) {
      codeStore.current[language] = viewRef.current.state.doc.toString();
    }
    setResult(null);
    setLanguage(lang);
    // Preload Pyodide when user switches to Python
    if (lang === "python") {
      preloadPyodide();
    }
  };

  return (
    <div className="bg-[#1e1e2e] rounded-xl border border-slate-700/50 overflow-hidden animate-fade-in-up">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181825] border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-300">Try it yourself</h3>
          <span className="text-[10px] text-slate-500 font-mono">
            implement {functionName}()
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex gap-0.5 bg-[#11111b] rounded-md p-0.5 text-xs">
            <button
              onClick={() => switchLanguage("javascript")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                language === "javascript"
                  ? "bg-[#313244] text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              JS
            </button>
            <button
              onClick={() => switchLanguage("python")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                language === "python"
                  ? "bg-[#313244] text-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Python
            </button>
          </div>

          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
          >
            Reset
          </button>

          <button
            onClick={handleRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {running ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {pyodideLoading ? "Loading Python..." : "Running..."}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="h-[200px] overflow-auto" />

      {/* Results */}
      {result && (
        <div className="border-t border-slate-700/50 px-4 py-3 animate-slide-down">
          {result.error ? (
            <div className="flex items-start gap-2 text-red-400 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <pre className="whitespace-pre-wrap font-mono text-xs">{result.error}</pre>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <span className="inline-flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    All tests passed!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {result.results.filter((r) => r.passed).length}/{result.results.length} tests passed
                  </span>
                )}
              </div>
              <div className="grid gap-1.5">
                {result.results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 text-xs font-mono px-3 py-1.5 rounded-md ${
                      r.passed
                        ? "bg-green-500/10 text-green-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    <span className={r.passed ? "text-green-500" : "text-red-500"}>
                      {r.passed ? "PASS" : "FAIL"}
                    </span>
                    <span className="text-slate-400">{testCases[i].label}</span>
                    {!r.passed && (
                      <span className="ml-auto text-slate-500">
                        expected {JSON.stringify(r.expected)}, got{" "}
                        {r.error ? <span className="text-red-400">{r.error}</span> : JSON.stringify(r.actual)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
