import type { GraphProblemConfig } from "../../../../components/GraphLesson";
import type { GraphCodeLine } from "../../../../components/GraphCodePanel";
import { dfsGraphData, generateDFSSteps } from "../../graphs/dfsGraph";

const codeLines: GraphCodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "dfs", type: "function" }, { text: "(", type: "punctuation" }, { text: "graph", type: "param" }, { text: ", ", type: "punctuation" }, { text: "start", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " visited ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "new", type: "keyword" }, { text: " Set();", type: "plain" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " stack ", type: "plain" }, { text: "=", type: "operator" }, { text: " [start];", type: "plain" }, { text: "  // push", type: "comment" }] },
  { num: 4, tokens: [] },
  { num: 5, tokens: [{ text: "  ", type: "plain" }, { text: "while", type: "keyword" }, { text: " (stack.length) {", type: "plain" }, { text: " // pop", type: "comment" }] },
  { num: 6, tokens: [{ text: "    ", type: "plain" }, { text: "const", type: "keyword" }, { text: " node ", type: "plain" }, { text: "=", type: "operator" }, { text: " stack.", type: "plain" }, { text: "pop", type: "function" }, { text: "();", type: "plain" }] },
  { num: 7, tokens: [{ text: "    ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (visited.has(node)) ", type: "plain" }, { text: "continue", type: "keyword" }, { text: ";", type: "plain" }] },
  { num: 8, tokens: [{ text: "    visited.", type: "plain" }, { text: "add", type: "function" }, { text: "(node);", type: "plain" }, { text: "  // visit", type: "comment" }] },
  { num: 9, tokens: [] },
  { num: 10, tokens: [{ text: "    ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "const", type: "keyword" }, { text: " nb ", type: "plain" }, { text: "of", type: "keyword" }, { text: " graph[node]) {", type: "plain" }] },
  { num: 11, tokens: [{ text: "      ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (!visited.has(nb))", type: "plain" }] },
  { num: 12, tokens: [{ text: "        stack.", type: "plain" }, { text: "push", type: "function" }, { text: "(nb);", type: "plain" }, { text: " // push", type: "comment" }] },
  { num: 13, tokens: [{ text: "    }", type: "punctuation" }] },
  { num: 14, tokens: [{ text: "  }", type: "punctuation" }] },
  { num: 15, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " visited;", type: "plain" }] },
  { num: 16, tokens: [{ text: "}", type: "punctuation" }] },
];

export const dfsConfig: GraphProblemConfig = {
  title: "Depth-First Search (DFS)",
  problemNumber: 2,
  totalProblems: 4,
  difficulty: "Intro",
  description: (
    <p>
      DFS explores a graph by going <strong>as deep as possible</strong> before backtracking, using a <strong>stack</strong>.
      Same graph as BFS — but watch how the traversal order is completely different.
    </p>
  ),
  graph: dfsGraphData,
  generateSteps: generateDFSSteps,
  algorithmName: "DFS",
  codeLines,
  getActiveLine: (step) => step?.activeLine ?? null,

  dataStructureType: "stack",
  dataStructureLabel: "Stack (LIFO)",

  functionName: "dfs",
  testCases: [
    { input: [{ A: ["B", "C"], B: ["A", "D"], C: ["A"], D: ["B"] }, "A"], expected: ["A", "B", "D", "C"], label: "dfs(simple graph, A)" },
    { input: [{ A: ["B"], B: ["C"], C: [] }, "A"], expected: ["A", "B", "C"], label: "dfs(chain, A) = [A,B,C]" },
    { input: [{ A: [] }, "A"], expected: ["A"], label: "dfs(single node) = [A]" },
  ],
  starterJS: `function dfs(graph, start) {
  // Return an array of node names in DFS order
  // graph is an adjacency list: { A: ["B","C"], ... }
  // Hint: same as BFS but use a stack (pop) instead of queue (shift)

}`,
  starterPython: `def dfs(graph, start):
    # Return a list of node names in DFS order
    # Hint: same as BFS but use a stack (pop) instead of queue (shift/popleft)
    pass`,
  hints: [
    "DFS is structurally identical to BFS — just change queue.shift() to stack.pop(). That's the only difference!",
    "Pattern: push start → while stack not empty → pop → if not visited → mark visited → push unvisited neighbors.",
    "Or use recursion: function dfs(node) { visited.add(node); for (const nb of graph[node]) if (!visited.has(nb)) dfs(nb); }",
  ],
  solutionJS: `function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    for (const nb of graph[node]) {
      if (!visited.has(nb)) stack.push(nb);
    }
  }
  return order;
}`,

  insights: {
    exploreTitle: "BFS vs DFS — one line difference",
    exploreBody: ({ totalSteps }) => (
      <p>
        Same graph, same code structure, but DFS visited nodes in a completely different order — diving deep into one branch before backtracking.
        The <strong>only difference</strong> is <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded text-xs">stack.pop()</code> instead of <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded text-xs">queue.shift()</code>.
        <br /><br />
        That took <strong>{totalSteps} steps</strong>. Use BFS when you need <strong>shortest path</strong> or <strong>level-order</strong>.
        Use DFS when you need to <strong>explore all paths</strong>, detect <strong>cycles</strong>, or do <strong>topological sorting</strong>.
      </p>
    ),
    complexity: <>Time: <strong>O(V + E)</strong>. Space: <strong>O(V)</strong>. Same as BFS — the data structure choice only affects traversal <em>order</em>, not cost.</>,
  },
};
