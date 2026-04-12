import type { GraphProblemConfig } from "../../../../components/GraphLesson";
import type { GraphCodeLine } from "../../../../components/GraphCodePanel";
import { topoGraphData, generateTopoSteps } from "../../graphs/topoGraph";

const codeLines: GraphCodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "topoSort", type: "function" }, { text: "(", type: "punctuation" }, { text: "graph", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " visited ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "new", type: "keyword" }, { text: " Set();", type: "plain" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " sorted ", type: "plain" }, { text: "=", type: "operator" }, { text: " [];", type: "plain" }] },
  { num: 4, tokens: [{ text: "  ", type: "plain" }, { text: "function ", type: "keyword" }, { text: "dfs", type: "function" }, { text: "(node) {", type: "punctuation" }, { text: " // visit", type: "comment" }] },
  { num: 5, tokens: [{ text: "    ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (visited.has(node)) ", type: "plain" }, { text: "return", type: "keyword" }, { text: ";", type: "plain" }] },
  { num: 6, tokens: [{ text: "    visited.", type: "plain" }, { text: "add", type: "function" }, { text: "(node);", type: "plain" }] },
  { num: 7, tokens: [{ text: "    ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "const", type: "keyword" }, { text: " nb ", type: "plain" }, { text: "of", type: "keyword" }, { text: " graph[node])", type: "plain" }, { text: " // explore deps", type: "comment" }] },
  { num: 8, tokens: [{ text: "      ", type: "plain" }, { text: "dfs", type: "function" }, { text: "(nb);", type: "plain" }] },
  { num: 9, tokens: [] },
  { num: 10, tokens: [{ text: "    sorted.", type: "plain" }, { text: "unshift", type: "function" }, { text: "(node);", type: "plain" }, { text: " // post-order", type: "comment" }] },
  { num: 11, tokens: [{ text: "  }", type: "punctuation" }] },
  { num: 12, tokens: [{ text: "  ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "const", type: "keyword" }, { text: " n ", type: "plain" }, { text: "of", type: "keyword" }, { text: " Object.keys(graph)) ", type: "plain" }, { text: "dfs", type: "function" }, { text: "(n);", type: "plain" }] },
  { num: 13, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " sorted;", type: "plain" }] },
  { num: 14, tokens: [{ text: "}", type: "punctuation" }] },
];

export const topoConfig: GraphProblemConfig = {
  title: "Topological Sort",
  problemNumber: 3,
  totalProblems: 4,
  difficulty: "Medium",
  description: (
    <p>
      Given a <strong>directed acyclic graph (DAG)</strong> of course prerequisites, find an ordering where every
      course appears <strong>after</strong> its prerequisites. This is <strong>topological sort</strong> — it uses DFS
      post-order to produce a valid dependency ordering.
    </p>
  ),
  graph: topoGraphData,
  generateSteps: generateTopoSteps,
  algorithmName: "Topo Sort",
  codeLines,
  getActiveLine: (step) => step?.activeLine ?? null,

  dataStructureType: "stack",
  dataStructureLabel: "Sorted Output",

  functionName: "topoSort",
  testCases: [
    { input: [{ A: ["B", "C"], B: ["D"], C: ["D"], D: [] }], expected: ["A", "B", "C", "D"], label: "topoSort(diamond) includes A before B,C before D" },
    { input: [{ A: ["B"], B: ["C"], C: [] }], expected: ["A", "B", "C"], label: "topoSort(chain) = [A,B,C]" },
    { input: [{ A: [], B: [], C: [] }], expected: ["A", "B", "C"], label: "topoSort(no deps) = all nodes" },
  ],
  starterJS: `function topoSort(graph) {
  // Return nodes in topological order
  // graph is adjacency list: { A: ["B","C"], ... }
  // A depends on nothing, but B and C depend on A

}`,
  starterPython: `def topoSort(graph):
    # Return nodes in topological order
    # graph is adjacency list: { "A": ["B","C"], ... }
    pass`,
  hints: [
    "Run DFS on every node. After visiting all of a node's dependencies (post-order), add it to the front of the result.",
    "Key insight: sorted.unshift(node) after the recursive DFS calls — this ensures dependencies come first.",
    "Handle disconnected components by iterating all nodes: for (const n of Object.keys(graph)) dfs(n);",
  ],
  solutionJS: `function topoSort(graph) {
  const visited = new Set();
  const sorted = [];
  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    for (const nb of graph[node]) dfs(nb);
    sorted.unshift(node);
  }
  for (const n of Object.keys(graph)) dfs(n);
  return sorted;
}`,

  insights: {
    exploreTitle: "DFS + post-order = topological sort",
    exploreBody: ({ totalSteps }) => (
      <p>
        The key insight: add each node to the sorted order <strong>after</strong> all its dependencies are processed.
        By the time we add a node, everything it depends on is already in the list.
        <br /><br />
        That's why topo sort uses DFS — it naturally processes dependencies depth-first before backtracking.
        The algorithm took <strong>{totalSteps} steps</strong> to produce a valid course ordering.
      </p>
    ),
    complexity: <>Time: <strong>O(V + E)</strong>. Space: <strong>O(V)</strong> for the visited set and recursion stack.</>,
  },
};
