import type { ModuleExport, ProblemEntry } from "../types";
import { modules } from "../registry";
import { bfsConfig } from "./problems/configs/bfs";
import { dfsConfig } from "./problems/configs/dfs";
import { topoConfig } from "./problems/configs/topologicalSort";
import { dijkstraConfig } from "./problems/configs/dijkstra";
import { bfsToDfs, dfsToTopo, topoToDijkstra, graphCompletionContent } from "./content/transitions";
import GraphLesson from "../../components/GraphLesson";
import GraphIntroScreen from "./IntroScreen";

const problems: ProblemEntry[] = [
  { id: "bfs", label: "BFS", config: bfsConfig, transitionAfter: { viewId: "t-bfs-dfs", content: bfsToDfs, nextView: "dfs" } },
  { id: "dfs", label: "DFS", config: dfsConfig, transitionAfter: { viewId: "t-dfs-topo", content: dfsToTopo, nextView: "topo" } },
  { id: "topo", label: "Topo Sort", config: topoConfig, transitionAfter: { viewId: "t-topo-dijkstra", content: topoToDijkstra, nextView: "dijkstra" } },
  { id: "dijkstra", label: "Dijkstra", config: dijkstraConfig },
];

export const graphsModule: ModuleExport = {
  config: modules.find((m) => m.id === "graphs")!,
  problems,
  practice: [],
  transitions: [],
  LessonComponent: GraphLesson,
  IntroScreen: GraphIntroScreen,
  completionContent: graphCompletionContent,
};
