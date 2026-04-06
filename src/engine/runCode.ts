// Safe code execution via inline Web Workers + Pyodide for Python

export interface TestCase {
  input: unknown[];
  expected: unknown;
  label: string;
}

export interface RunResult {
  passed: boolean;
  results: {
    input: unknown[];
    expected: unknown;
    actual: unknown;
    passed: boolean;
    error?: string;
  }[];
  error?: string;
}

const TIMEOUT_MS = 5000;

// ── JavaScript execution via Web Worker ──

function runJS(code: string, testCases: TestCase[]): Promise<RunResult> {
  return new Promise((resolve) => {
    const workerCode = `
      self.onmessage = function(e) {
        const { code, testCases } = e.data;
        const results = [];

        try {
          // Create the function from user code
          const fn = new Function('return (' + code + ')')();

          for (const tc of testCases) {
            try {
              const actual = fn(...tc.input);
              results.push({
                input: tc.input,
                expected: tc.expected,
                actual,
                passed: JSON.stringify(actual) === JSON.stringify(tc.expected),
              });
            } catch (err) {
              results.push({
                input: tc.input,
                expected: tc.expected,
                actual: null,
                passed: false,
                error: err.message,
              });
            }
          }

          const allPassed = results.every(r => r.passed);
          self.postMessage({ passed: allPassed, results });
        } catch (err) {
          self.postMessage({ passed: false, results: [], error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        passed: false,
        results: [],
        error: "Time limit exceeded (5s) — do you have an infinite loop?",
      });
    }, TIMEOUT_MS);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        passed: false,
        results: [],
        error: e.message || "Unknown error",
      });
    };

    worker.postMessage({ code, testCases });
  });
}

// ── Python execution via Pyodide ──

let pyodidePromise: Promise<any> | null = null;

function loadPyodide(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
    script.onload = async () => {
      try {
        // @ts-ignore - pyodide is loaded via script tag
        const pyodide = await (window as any).loadPyodide();
        resolve(pyodide);
      } catch (err) {
        pyodidePromise = null;
        reject(err);
      }
    };
    script.onerror = () => {
      pyodidePromise = null;
      reject(new Error("Failed to load Pyodide. Check your internet connection."));
    };
    document.head.appendChild(script);
  });

  return pyodidePromise;
}

async function runPython(code: string, testCases: TestCase[]): Promise<RunResult> {
  try {
    const pyodide = await loadPyodide();

    // Run user code to define the function
    pyodide.runPython(code);

    const results: RunResult["results"] = [];

    for (const tc of testCases) {
      try {
        // Build Python call: fn_name(*args)
        // We need to figure out the function name from the code
        const fnMatch = code.match(/def\s+(\w+)\s*\(/);
        if (!fnMatch) {
          return {
            passed: false,
            results: [],
            error: "Could not find a function definition (def function_name(...))",
          };
        }
        const fnName = fnMatch[1];
        const argsStr = tc.input.map((a) => JSON.stringify(a)).join(", ");
        const result = pyodide.runPython(`
import json
result = ${fnName}(${argsStr})
json.dumps(result)
`);
        const actual = JSON.parse(result);

        results.push({
          input: tc.input,
          expected: tc.expected,
          actual,
          passed: JSON.stringify(actual) === JSON.stringify(tc.expected),
        });
      } catch (err: any) {
        results.push({
          input: tc.input,
          expected: tc.expected,
          actual: null,
          passed: false,
          error: err.message?.split("\n").pop() || err.message,
        });
      }
    }

    return { passed: results.every((r) => r.passed), results };
  } catch (err: any) {
    return { passed: false, results: [], error: err.message };
  }
}

// ── Public API ──

export type Language = "javascript" | "python";

export async function runCode(
  code: string,
  testCases: TestCase[],
  language: Language
): Promise<RunResult> {
  if (language === "python") {
    return runPython(code, testCases);
  }
  return runJS(code, testCases);
}

export function isPyodideLoaded(): boolean {
  return pyodidePromise !== null;
}

export function preloadPyodide(): void {
  loadPyodide().catch(() => {});
}

// ── Call Tracing ──
// Instruments a user's JS function to capture the full call tree

export interface TraceNode {
  args: unknown[];
  label: string;
  result: unknown;
  children: TraceNode[];
  cached: boolean; // true if this was a memoized/cached return
}

export interface TraceResult {
  tree: TraceNode | null;
  totalCalls: number;
  error?: string;
}

/**
 * Run the user's code on a single input and capture the call tree.
 * Works by wrapping their function to intercept every call.
 */
export function traceExecution(
  code: string,
  fnName: string,
  input: unknown[],
  language: Language
): Promise<TraceResult> {
  if (language === "python") {
    return Promise.resolve({ tree: null, totalCalls: 0, error: "Tracing only supported for JavaScript" });
  }

  return new Promise((resolve) => {
    const workerCode = `
      self.onmessage = function(e) {
        const { code, fnName, input } = e.data;
        let totalCalls = 0;

        try {
          // Eval user code into scope
          const fn = new Function('return (' + code + ')')();

          // Build call tree by wrapping the function
          const stack = [];
          let root = null;

          const wrapped = function(...args) {
            totalCalls++;
            const node = {
              args: args.map(a => typeof a === 'object' ? JSON.parse(JSON.stringify(a)) : a),
              label: fnName + '(' + args.map(a => Array.isArray(a) ? '[...]' : String(a)).join(',') + ')',
              result: undefined,
              children: [],
              cached: false,
            };

            if (stack.length > 0) {
              stack[stack.length - 1].children.push(node);
            } else {
              root = node;
            }

            stack.push(node);

            // Detect memoization: measure time, if instant with children already computed
            const t0 = performance.now();
            const result = fn.apply(this, args);
            const elapsed = performance.now() - t0;

            node.result = result;
            // If the call returned nearly instantly and we expected children but got none,
            // it was likely a cache hit. Also mark as cached if call had no children but parent did.
            if (node.children.length === 0 && stack.length > 1 && elapsed < 0.01) {
              node.cached = true;
            }

            stack.pop();
            return result;
          };

          // Replace the function name in scope and run
          // We need to make the wrapped version callable by the same name
          // Strategy: run the user code, then override and call
          const callCode = new Function(fnName, 'return ' + fnName + '(...' + JSON.stringify(input) + ')');
          callCode(wrapped);

          self.postMessage({ tree: root, totalCalls });
        } catch (err) {
          self.postMessage({ tree: null, totalCalls, error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ tree: null, totalCalls: 0, error: "Tracing timed out (function too slow for visualization)" });
    }, 3000);

    worker.onmessage = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ tree: null, totalCalls: 0, error: e.message || "Trace error" });
    };

    worker.postMessage({ code, fnName, input });
  });
}
