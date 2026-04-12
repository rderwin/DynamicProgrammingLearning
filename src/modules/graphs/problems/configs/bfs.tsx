import type { GraphProblemConfig } from "../../../../components/GraphLesson";
import type { GraphCodeLine } from "../../../../components/GraphCodePanel";
import { bfsGraphData, generateBFSSteps } from "../../graphs/bfsGraph";

const codeLines: GraphCodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "bfs", type: "function" }, { text: "(", type: "punctuation" }, { text: "graph", type: "param" }, { text: ", ", type: "punctuation" }, { text: "start", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " visited ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "new", type: "keyword" }, { text: " Set();", type: "plain" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " queue ", type: "plain" }, { text: "=", type: "operator" }, { text: " [start];", type: "plain" }, { text: "  // enqueue", type: "comment" }] },
  { num: 4, tokens: [] },
  { num: 5, tokens: [{ text: "  ", type: "plain" }, { text: "while", type: "keyword" }, { text: " (queue.length) {", type: "plain" }, { text: " // dequeue", type: "comment" }] },
  { num: 6, tokens: [{ text: "    ", type: "plain" }, { text: "const", type: "keyword" }, { text: " node ", type: "plain" }, { text: "=", type: "operator" }, { text: " queue.", type: "plain" }, { text: "shift", type: "function" }, { text: "();", type: "plain" }] },
  { num: 7, tokens: [{ text: "    ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (visited.has(node)) ", type: "plain" }, { text: "continue", type: "keyword" }, { text: ";", type: "plain" }] },
  { num: 8, tokens: [{ text: "    visited.", type: "plain" }, { text: "add", type: "function" }, { text: "(node);", type: "plain" }, { text: "  // visit", type: "comment" }] },
  { num: 9, tokens: [] },
  { num: 10, tokens: [{ text: "    ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "const", type: "keyword" }, { text: " nb ", type: "plain" }, { text: "of", type: "keyword" }, { text: " graph[node]) {", type: "plain" }] },
  { num: 11, tokens: [{ text: "      ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (!visited.has(nb))", type: "plain" }] },
  { num: 12, tokens: [{ text: "        queue.", type: "plain" }, { text: "push", type: "function" }, { text: "(nb);", type: "plain" }, { text: " // enqueue", type: "comment" }] },
  { num: 13, tokens: [{ text: "    }", type: "punctuation" }] },
  { num: 14, tokens: [{ text: "  }", type: "punctuation" }] },
  { num: 15, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " visited;", type: "plain" }] },
  { num: 16, tokens: [{ text: "}", type: "punctuation" }] },
];

export const bfsConfig: GraphProblemConfig = {
  title: "Breadth-First Search (BFS)",
  problemNumber: 1,
  totalProblems: 4,
  difficulty: "Intro",
  description: (
    <p>
      BFS explores a graph <strong>level by level</strong> using a <strong>queue</strong>.
      Starting from a node, it visits all neighbors first, then their neighbors, and so on —
      like ripples spreading from a stone dropped in water.
    </p>
  ),
  graph: bfsGraphData,
  generateSteps: generateBFSSteps,
  algorithmName: "BFS",
  codeLines,
  getActiveLine: (step) => step?.activeLine ?? null,

  dataStructureType: "queue",
  dataStructureLabel: "Queue (FIFO)",

  functionName: "bfs",
  testCases: [
    { input: [{ A: ["B", "C"], B: ["A", "D"], C: ["A"], D: ["B"] }, "A"], expected: ["A", "B", "C", "D"], label: "bfs(simple graph, A) = [A,B,C,D]" },
    { input: [{ A: ["B"], B: ["C"], C: [] }, "A"], expected: ["A", "B", "C"], label: "bfs(chain, A) = [A,B,C]" },
    { input: [{ A: [] }, "A"], expected: ["A"], label: "bfs(single node) = [A]" },
    { input: [{ A: ["B", "C"], B: ["A", "C", "D"], C: ["A", "B"], D: ["B"] }, "A"], expected: ["A", "B", "C", "D"], label: "bfs(with cycle) = [A,B,C,D]" },
  ],
  starterJS: `function bfs(graph, start) {
  // Return an array of node names in BFS order
  // graph is an adjacency list: { A: ["B","C"], B: ["A","D"], ... }

}`,
  starterPython: `def bfs(graph, start):
    # Return a list of node names in BFS order
    # graph is an adjacency list: { "A": ["B","C"], ... }
    pass`,
  hints: [
    "Use a queue (array with shift/push) and a visited set. Process nodes in FIFO order.",
    "Pattern: enqueue start → while queue not empty → dequeue → if not visited → mark visited → enqueue unvisited neighbors.",
    "In JS: const queue = [start]; const visited = new Set(); while (queue.length) { const node = queue.shift(); ... }",
  ],
  solutionJS: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    for (const nb of graph[node]) {
      if (!visited.has(nb)) queue.push(nb);
    }
  }
  return order;
}`,

  insights: {
    exploreTitle: "The BFS pattern",
    exploreBody: ({ totalSteps, nodesVisited }) => (
      <p>
        BFS visited all <strong>{nodesVisited} nodes</strong> in <strong>{totalSteps} steps</strong>,
        processing them <strong>level by level</strong>. First A, then its neighbors B and C, then their neighbors D, E, F, G.
        <br /><br />
        This "wave" pattern is why BFS finds the <strong>shortest path</strong> in unweighted graphs — it always reaches a node via the fewest edges possible.
      </p>
    ),
    complexity: <>Time: <strong>O(V + E)</strong> — every node and edge visited once. Space: <strong>O(V)</strong> — the queue can hold up to V nodes.</>,
  },
};
