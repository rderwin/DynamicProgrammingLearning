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
const MAX_CALLS_TRACE = 5000; // hard cap on traced calls to prevent OOM

// ── Cleanup tracking ──
// Keep references to active workers so we can kill them on abort

let activeWorker: Worker | null = null;
let activeTimeout: ReturnType<typeof setTimeout> | null = null;

/** Kill any running code execution (call on unmount or before starting a new run) */
export function abortExecution(): void {
  if (activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
  if (activeTimeout) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
}

// ── JavaScript execution via Web Worker ──

function runJS(code: string, testCases: TestCase[]): Promise<RunResult> {
  // Kill any previous run
  abortExecution();

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
    activeWorker = worker;

    const partialResults: RunResult["results"] = [];

    function cleanup() {
      worker.terminate();
      URL.revokeObjectURL(url);
      if (activeWorker === worker) activeWorker = null;
      if (activeTimeout === timeout) activeTimeout = null;
    }

    const timeout = setTimeout(() => {
      cleanup();

      const passedCount = partialResults.filter(r => r.passed).length;
      const ranCount = partialResults.length;

      let errorMsg: string;
      if (passedCount > 0 && passedCount === ranCount) {
        errorMsg = "Your solution is correct but too slow for the larger inputs. This is exactly why we need DP — try memoization or a bottom-up approach!";
      } else if (passedCount > 0) {
        errorMsg = "Some tests passed but execution timed out. Your approach might work for small inputs but needs optimization for larger ones.";
      } else {
        errorMsg = "Time limit exceeded (5s). Check for missing base cases or infinite recursion.";
      }

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
    activeTimeout = timeout;

    worker.onmessage = (e) => {
      if (e.data.type === "progress") {
        partialResults[e.data.index] = e.data.result;
      } else if (e.data.type === "done") {
        cleanup();
        resolve({ passed: e.data.passed, results: e.data.results });
      }
    };

    worker.onerror = (e) => {
      cleanup();
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
        // @ts-ignore
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
    pyodide.runPython(code);

    const results: RunResult["results"] = [];

    for (const tc of testCases) {
      try {
        const fnMatch = code.match(/def\s+(\w+)\s*\(/);
        if (!fnMatch) {
          return { passed: false, results: [], error: "Could not find a function definition (def function_name(...))" };
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

export interface TraceNode {
  args: unknown[];
  label: string;
  result: unknown;
  children: TraceNode[];
  cached: boolean;
}

export interface TraceResult {
  tree: TraceNode | null;
  totalCalls: number;
  error?: string;
}

/**
 * Run the user's code on a single input and capture the full call tree.
 * Has a hard cap on call count to prevent OOM on brute-force solutions.
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

  // Kill any previous run
  abortExecution();

  return new Promise((resolve) => {
    const workerCode = `
      self.onmessage = function(e) {
        const { code, fnName, input, maxCalls } = e.data;
        let totalCalls = 0;
        let root = null;
        const stack = [];
        let hitLimit = false;

        try {
          (0, eval)(code);

          const origFn = self[fnName];
          if (typeof origFn !== 'function') {
            self.postMessage({ tree: null, totalCalls: 0, error: 'Could not find function ' + fnName });
            return;
          }

          self[fnName] = function(...args) {
            totalCalls++;

            // Hard cap: stop building tree if too many calls
            if (totalCalls > maxCalls) {
              if (!hitLimit) {
                hitLimit = true;
              }
              // Still call the original so the function completes,
              // but don't track the tree anymore
              return origFn.apply(self, args);
            }

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

            const result = origFn.apply(self, args);

            node.result = result;
            if (node.children.length === 0 && stack.length > 1) {
              node.cached = true;
            }
            stack.pop();
            return result;
          };

          self[fnName](...input);

          if (hitLimit) {
            self.postMessage({
              tree: root,
              totalCalls,
              error: 'Call tree truncated at ' + maxCalls + ' calls (too many for visualization). Your solution may be using brute force.'
            });
          } else {
            self.postMessage({ tree: root, totalCalls });
          }
        } catch (err) {
          self.postMessage({ tree: null, totalCalls, error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    activeWorker = worker;

    function cleanup() {
      worker.terminate();
      URL.revokeObjectURL(url);
      if (activeWorker === worker) activeWorker = null;
      if (activeTimeout === timeout) activeTimeout = null;
    }

    const timeout = setTimeout(() => {
      cleanup();
      resolve({ tree: null, totalCalls: 0, error: "Tracing timed out — your solution may be too slow to visualize. Try memoization!" });
    }, 3000);
    activeTimeout = timeout;

    worker.onmessage = (e) => {
      cleanup();
      resolve(e.data);
    };

    worker.onerror = (e) => {
      cleanup();
      resolve({ tree: null, totalCalls: 0, error: e.message || "Trace error" });
    };

    worker.postMessage({ code, fnName, input, maxCalls: MAX_CALLS_TRACE });
  });
}
