import type { TransitionContent, ModuleCompletionContent } from "../../types";

export const bfsToDfs: TransitionContent = {
  fromLabel: "BFS",
  toLabel: "DFS",
  recap: {
    title: "What you just learned",
    points: [
      "BFS uses a queue (FIFO) to explore level by level",
      "It finds the shortest path in unweighted graphs",
      "Time: O(V+E), Space: O(V) — visit every node and edge once",
    ],
  },
  concept: {
    term: "Queue vs Stack",
    definition: "The data structure you choose determines the traversal order. A queue (FIFO) gives breadth-first; a stack (LIFO) gives depth-first. The code is otherwise identical.",
    example: "queue.shift() → BFS (level-by-level). stack.pop() → DFS (dive deep first).",
  },
  spotIt: {
    title: "When to use BFS vs DFS",
    signs: [
      "BFS: shortest path, level-order, minimum steps — anything where 'closest first' matters",
      "DFS: explore all paths, detect cycles, topological order — anything where 'go deep' matters",
      "If you're not sure, either works for simple traversal — pick whichever feels more natural",
    ],
  },
  preview: {
    title: "DFS",
    description: "Same graph, same code structure — but with a stack instead of a queue. Watch how the traversal order flips completely.",
    whatsNew: "The only code change is pop() instead of shift(). But the behavior is dramatically different.",
  },
};

export const dfsToTopo: TransitionContent = {
  fromLabel: "DFS",
  toLabel: "Topological Sort",
  recap: {
    title: "BFS and DFS — you know both now",
    points: [
      "DFS uses a stack (LIFO) to explore depth-first",
      "BFS and DFS have identical complexity: O(V+E) time, O(V) space",
      "The only difference is the data structure — queue vs stack",
    ],
  },
  concept: {
    term: "Post-order Processing",
    definition: "In DFS, if you process a node AFTER visiting all its children (post-order), you get a reverse topological ordering. This is the key insight behind topological sort.",
    example: "Process dependencies recursively, then add the current node to the result — ensures all deps come first.",
  },
  spotIt: {
    title: "When to use topological sort",
    signs: [
      "Dependencies or prerequisites — 'do A before B'",
      "Build systems, course schedules, task ordering",
      "Any DAG where you need a valid linear ordering of nodes",
    ],
  },
  preview: {
    title: "Topological Sort",
    description: "Given a directed graph of course prerequisites, find an order that respects all dependencies.",
    whatsNew: "It's DFS with one addition: add nodes to the result AFTER processing all their children.",
  },
};

export const topoToDijkstra: TransitionContent = {
  fromLabel: "Topological Sort",
  toLabel: "Dijkstra's Algorithm",
  recap: {
    title: "Three algorithms, one foundation",
    points: [
      "Topological sort = DFS + post-order collection",
      "It produces a valid ordering for directed acyclic graphs",
      "All three algorithms so far (BFS, DFS, Topo) are O(V+E)",
    ],
  },
  concept: {
    term: "Weighted Graphs & Greedy Relaxation",
    definition: "When edges have different costs, BFS no longer finds shortest paths. Dijkstra's algorithm uses a priority queue to always process the cheapest node next, 'relaxing' edges to find shorter routes.",
    example: "If going through node B makes the path to C shorter, update C's distance — this is 'relaxation'.",
  },
  spotIt: {
    title: "When to use Dijkstra",
    signs: [
      "Weighted edges with non-negative weights",
      "Shortest path from a single source to all destinations",
      "Network routing, GPS navigation, cheapest flight problems",
    ],
  },
  preview: {
    title: "Dijkstra's Algorithm",
    description: "Find the shortest path from S to every other node in a weighted graph. Watch distances update in real-time as the algorithm discovers better routes.",
    whatsNew: "A priority queue replaces the simple queue/stack. Edges have weights. The algorithm greedily processes the closest node.",
  },
};

export const graphCompletionContent: ModuleCompletionContent = {
  title: "Graph Algorithms — Complete!",
  subtitle: "You can navigate any graph now.",
  patterns: [
    { name: "BFS", problems: "Level-order traversal, shortest unweighted path", recurrence: "queue.push() + queue.shift()" },
    { name: "DFS", problems: "Deep exploration, cycle detection, path finding", recurrence: "stack.push() + stack.pop()" },
    { name: "Topological Sort", problems: "Dependency ordering, course scheduling", recurrence: "DFS + sorted.unshift(node) in post-order" },
    { name: "Dijkstra", problems: "Shortest weighted path, network routing", recurrence: "pq.extractMin() + relaxation" },
  ],
  recognition: [
    "If the problem involves nodes and connections (grids, networks, dependencies), think graphs",
    "Unweighted shortest path → BFS. Weighted shortest path → Dijkstra.",
    "Need all paths or cycle detection → DFS. Need ordering → Topological Sort.",
    "Most graph problems are O(V+E) — if your solution is slower, you're probably re-visiting nodes.",
  ],
};
