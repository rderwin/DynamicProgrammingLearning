import type { ModuleExport, ProblemEntry } from "../types";
import { modules } from "../registry";
import { bfsConfig } from "./problems/configs/bfs";
import GraphLesson from "../../components/GraphLesson";
import GraphIntroScreen from "./IntroScreen";

const problems: ProblemEntry[] = [
  { id: "bfs", label: "BFS", config: bfsConfig },
  // DFS, Topo Sort, Dijkstra coming next
];

export const graphsModule: ModuleExport = {
  config: modules.find((m) => m.id === "graphs")!,
  problems,
  practice: [],
  transitions: [],
  LessonComponent: GraphLesson,
  IntroScreen: GraphIntroScreen,
  completionContent: {
    title: "Graph Algorithms — Complete!",
    subtitle: "You can navigate any graph now.",
    patterns: [
      { name: "BFS", problems: "Level-order traversal, shortest path", recurrence: "queue.push() / queue.shift()" },
    ],
    recognition: [
      "Graph problems involve nodes and connections — adjacency lists, grids, matrices",
      "BFS for shortest path in unweighted graphs or level-order processing",
    ],
  },
};
