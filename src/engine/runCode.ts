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
          const fn = new Function('return (' + code + ')')();

          for (const tc of testCases) {
            try {
              const actual = fn(...tc.input);
              const r = {
                input: tc.input,
                expected: tc.expected,
                actual,
                passed: JSON.stringify(actual) === JSON.stringify(tc.expected),
              };
              results.push(r);
              // Post progress so main thread knows what passed before timeout
              self.postMessage({ type: 'progress', result: r, index: results.length - 1 });
            } catch (err) {
              const r = {
                input: tc.input,
                expected: tc.expected,
                actual: null,
                passed: false,
                error: err.message,
              };
              results.push(r);
              self.postMessage({ type: 'progress', result: r, index: results.length - 1 });
            }
          }

          const allPassed = results.every(r => r.passed);
          self.postMessage({ type: 'done', passed: allPassed, results });
        } catch (err) {
          self.postMessage({ type: 'done', passed: false, results: [], error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    // Track partial results for smart timeout messages
    const partialResults: RunResult["results"] = [];

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);

      const passedCount = partialResults.filter(r => r.passed).length;
      const ranCount = partialResults.length;

      let errorMsg: string;
      if (passedCount > 0 && passedCount === ranCount) {
        // All completed tests passed but we timed out on a later one
        errorMsg = "Your solution is correct but too slow for the larger inputs. This is exactly why we need DP — try memoization or a bottom-up approach!";
      } else if (passedCount > 0) {
        errorMsg = "Some tests passed but execution timed out. Your approach might work for small inputs but needs optimization for larger ones.";
      } else {
        errorMsg = "Time limit exceeded (5s). Check for missing base cases or infinite recursion.";
      }

      // Fill in remaining tests as timed-out
      for (let i = ranCount; i < testCases.length; i++) {
        partialResults.push({
          input: testCases[i].input,
          expected: testCases[i].expected,
          actual: null,
          passed: false,
          error: "Timed out",
        });
      }

      resolve({ passed: false, results: partialResults, error: errorMsg });
    }, TIMEOUT_MS);

    worker.onmessage = (e) => {
      if (e.data.type === "progress") {
        partialResults[e.data.index] = e.data.result;
      } else if (e.data.type === "done") {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(url);
        resolve({ passed: e.data.passed, results: e.data.results });
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ passed: false, results: [], error: e.message || "Unknown error" });
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
 * Run the user's code on a single input and capture the full call tree.
 * Uses eval + global scope override so recursive calls go through our tracer.
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
        let root = null;
        const stack = [];

        try {
          // Eval user code in global scope — creates the function as self[fnName]
          (0, eval)(code);

          const origFn = self[fnName];
          if (typeof origFn !== 'function') {
            self.postMessage({ tree: null, totalCalls: 0, error: 'Could not find function ' + fnName });
            return;
          }

          // Override the global function with our tracing wrapper.
          // When origFn recurses and calls fnName(...), it resolves
          // through the scope chain to self[fnName] = our wrapper.
          self[fnName] = function(...args) {
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

            // Call the original — its recursive calls go through self[fnName] = this wrapper
            const result = origFn.apply(self, args);

            node.result = result;
            // Cache hit heuristic: returned without making any child calls
            // and not a base case (stack depth > 1)
            if (node.children.length === 0 && stack.length > 1) {
              node.cached = true;
            }
            stack.pop();
            return result;
          };

          // Run the traced function
          self[fnName](...input);

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
