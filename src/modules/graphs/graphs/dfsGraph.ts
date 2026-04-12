import type { GraphData, AlgorithmStep } from "./types";
import { getNeighbors, findEdgeId } from "./types";
import { bfsGraphData } from "./bfsGraph";

// Same graph as BFS for direct comparison
export const dfsGraphData: GraphData = bfsGraphData;

export function generateDFSSteps(graph: GraphData): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const stack: string[] = [];

  stack.push(graph.startNode);
  steps.push({
    action: "push",
    nodeId: graph.startNode,
    dataStructure: [...stack],
    activeLine: 3,
    description: `Push start node ${graph.startNode} onto stack`,
  });

  while (stack.length > 0) {
    const current = stack.pop()!;
    steps.push({
      action: "pop",
      nodeId: current,
      dataStructure: [...stack],
      activeLine: 5,
      description: `Pop ${current} from top of stack`,
    });

    if (visited.has(current)) continue;
    visited.add(current);
    steps.push({
      action: "visit",
      nodeId: current,
      dataStructure: [...stack],
      activeLine: 7,
      description: `Mark ${current} as visited`,
    });

    const neighbors = getNeighbors(graph, current).reverse(); // reverse for natural DFS order
    for (const neighbor of neighbors) {
      const edgeId = findEdgeId(graph, current, neighbor);
      steps.push({
        action: "explore-edge",
        nodeId: neighbor,
        edgeId,
        dataStructure: [...stack],
        activeLine: 9,
        description: `Check edge ${current} → ${neighbor}`,
      });

      if (!visited.has(neighbor) && !stack.includes(neighbor)) {
        stack.push(neighbor);
        steps.push({
          action: "push",
          nodeId: neighbor,
          dataStructure: [...stack],
          activeLine: 11,
          description: `${neighbor} not visited — push onto stack`,
        });
      }
    }
  }

  return steps;
}
