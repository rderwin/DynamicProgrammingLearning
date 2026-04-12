import type { GraphProblemConfig } from "../../../../components/GraphLesson";
import type { GraphCodeLine } from "../../../../components/GraphCodePanel";
import { dijkstraGraphData, generateDijkstraSteps } from "../../graphs/dijkstraGraph";

const codeLines: GraphCodeLine[] = [
  { num: 1, tokens: [{ text: "function ", type: "keyword" }, { text: "dijkstra", type: "function" }, { text: "(", type: "punctuation" }, { text: "graph", type: "param" }, { text: ", ", type: "punctuation" }, { text: "start", type: "param" }, { text: ") {", type: "punctuation" }] },
  { num: 2, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " dist ", type: "plain" }, { text: "=", type: "operator" }, { text: " {};", type: "plain" }] },
  { num: 3, tokens: [{ text: "  ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "const", type: "keyword" }, { text: " n ", type: "plain" }, { text: "of", type: "keyword" }, { text: " nodes) dist[n] ", type: "plain" }, { text: "=", type: "operator" }, { text: " Infinity;", type: "plain" }] },
  { num: 4, tokens: [{ text: "  dist[start] ", type: "plain" }, { text: "=", type: "operator" }, { text: " ", type: "plain" }, { text: "0", type: "number" }, { text: ";", type: "plain" }, { text: "  // init", type: "comment" }] },
  { num: 5, tokens: [{ text: "  ", type: "plain" }, { text: "const", type: "keyword" }, { text: " pq ", type: "plain" }, { text: "=", type: "operator" }, { text: " [[", type: "plain" }, { text: "0", type: "number" }, { text: ",start]];", type: "plain" }] },
  { num: 6, tokens: [{ text: "  ", type: "plain" }, { text: "while", type: "keyword" }, { text: " (pq.length) {", type: "plain" }, { text: " // extract min", type: "comment" }] },
  { num: 7, tokens: [{ text: "    pq.", type: "plain" }, { text: "sort", type: "function" }, { text: "((a,b)=>a[", type: "plain" }, { text: "0", type: "number" }, { text: "]-b[", type: "plain" }, { text: "0", type: "number" }, { text: "]);", type: "plain" }] },
  { num: 8, tokens: [{ text: "    ", type: "plain" }, { text: "const", type: "keyword" }, { text: " [d,node] ", type: "plain" }, { text: "=", type: "operator" }, { text: " pq.", type: "plain" }, { text: "shift", type: "function" }, { text: "();", type: "plain" }, { text: " // finalize", type: "comment" }] },
  { num: 9, tokens: [{ text: "    ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (d ", type: "plain" }, { text: ">", type: "operator" }, { text: " dist[node]) ", type: "plain" }, { text: "continue", type: "keyword" }, { text: ";", type: "plain" }] },
  { num: 10, tokens: [] },
  { num: 11, tokens: [{ text: "    ", type: "plain" }, { text: "for", type: "keyword" }, { text: " (", type: "punctuation" }, { text: "const", type: "keyword" }, { text: " [nb,w] ", type: "plain" }, { text: "of", type: "keyword" }, { text: " graph[node]) {", type: "plain" }, { text: " // relax", type: "comment" }] },
  { num: 12, tokens: [{ text: "      ", type: "plain" }, { text: "const", type: "keyword" }, { text: " newD ", type: "plain" }, { text: "=", type: "operator" }, { text: " d ", type: "plain" }, { text: "+", type: "operator" }, { text: " w;", type: "plain" }] },
  { num: 13, tokens: [{ text: "      ", type: "plain" }, { text: "if", type: "keyword" }, { text: " (newD ", type: "plain" }, { text: "<", type: "operator" }, { text: " dist[nb]) {", type: "plain" }, { text: " // update", type: "comment" }] },
  { num: 14, tokens: [{ text: "        dist[nb] ", type: "plain" }, { text: "=", type: "operator" }, { text: " newD;", type: "plain" }] },
  { num: 15, tokens: [{ text: "        pq.", type: "plain" }, { text: "push", type: "function" }, { text: "([newD,nb]);", type: "plain" }] },
  { num: 16, tokens: [{ text: "  }  }  }", type: "punctuation" }] },
  { num: 17, tokens: [{ text: "  ", type: "plain" }, { text: "return", type: "keyword" }, { text: " dist;", type: "plain" }] },
  { num: 18, tokens: [{ text: "}", type: "punctuation" }] },
];

export const dijkstraConfig: GraphProblemConfig = {
  title: "Dijkstra's Algorithm",
  problemNumber: 4,
  totalProblems: 4,
  difficulty: "Medium",
  description: (
    <p>
      Find the <strong>shortest path</strong> from a source to all other nodes in a <strong>weighted graph</strong>.
      Dijkstra uses a <strong>priority queue</strong> to always process the closest unfinalized node next,
      greedily building up shortest distances.
    </p>
  ),
  graph: dijkstraGraphData,
  generateSteps: generateDijkstraSteps,
  algorithmName: "Dijkstra",
  codeLines,
  getActiveLine: (step) => step?.activeLine ?? null,

  dataStructureType: "priority-queue",
  dataStructureLabel: "Priority Queue (min-dist)",

  functionName: "dijkstra",
  testCases: [
    { input: [{ S: [["A",4],["B",2]], A: [["S",4],["B",1],["C",5]], B: [["S",2],["A",1],["D",7]], C: [["A",5],["D",2],["T",3]], D: [["B",7],["C",2],["T",1]], T: [["C",3],["D",1]] }, "S"], expected: { S: 0, A: 3, B: 2, C: 8, D: 9, T: 10 }, label: "dijkstra(weighted graph, S)" },
    { input: [{ A: [["B",1]], B: [["C",2]], C: [] }, "A"], expected: { A: 0, B: 1, C: 3 }, label: "dijkstra(chain, A)" },
  ],
  starterJS: `function dijkstra(graph, start) {
  // Return distance map: { nodeId: shortestDistance }
  // graph is weighted adjacency list: { S: [["A",4],["B",2]], ... }

}`,
  starterPython: `def dijkstra(graph, start):
    # Return distance dict: { "S": 0, "A": 3, ... }
    # graph is weighted adjacency list: { "S": [["A",4],["B",2]], ... }
    pass`,
  hints: [
    "Initialize all distances to Infinity except start (0). Use a priority queue sorted by distance.",
    "Extract the node with minimum distance. For each neighbor, check if going through this node is shorter: newDist = dist[current] + weight.",
    "If newDist < dist[neighbor], update dist[neighbor] and add to the priority queue. Skip already-finalized nodes.",
  ],
  solutionJS: `function dijkstra(graph, start) {
  const dist = {};
  for (const n of Object.keys(graph)) dist[n] = Infinity;
  dist[start] = 0;
  const pq = [[0, start]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, node] = pq.shift();
    if (d > dist[node]) continue;
    for (const [nb, w] of graph[node]) {
      const newD = d + w;
      if (newD < dist[nb]) {
        dist[nb] = newD;
        pq.push([newD, nb]);
      }
    }
  }
  return dist;
}`,

  insights: {
    exploreTitle: "Greedy relaxation finds shortest paths",
    exploreBody: ({ totalSteps }) => (
      <p>
        Dijkstra processed nodes in order of their shortest known distance, <strong>greedily relaxing</strong> edges
        to find shorter paths. Watch how distance values updated as better routes were discovered.
        <br /><br />
        That took <strong>{totalSteps} steps</strong>. The priority queue ensures we always process the closest node next —
        that's what makes the greedy approach work. This is why BFS alone isn't enough for weighted graphs.
      </p>
    ),
    complexity: <>Time: <strong>O((V + E) log V)</strong> with a proper heap. Space: <strong>O(V)</strong> for distances and the priority queue.</>,
  },
};
