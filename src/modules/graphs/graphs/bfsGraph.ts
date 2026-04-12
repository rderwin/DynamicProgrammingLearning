import type { GraphData, AlgorithmStep } from "./types";
import { getNeighbors, findEdgeId } from "./types";

// 7-node undirected graph with clear BFS layering
export const bfsGraphData: GraphData = {
  nodes: [
    { id: "A", label: "A", x: 300, y: 50 },
    { id: "B", label: "B", x: 150, y: 150 },
    { id: "C", label: "C", x: 450, y: 150 },
    { id: "D", label: "D", x: 75, y: 275 },
    { id: "E", label: "E", x: 225, y: 275 },
    { id: "F", label: "F", x: 375, y: 275 },
    { id: "G", label: "G", x: 525, y: 275 },
  ],
  edges: [
    { id: "e-AB", from: "A", to: "B", directed: false },
    { id: "e-AC", from: "A", to: "C", directed: false },
    { id: "e-BD", from: "B", to: "D", directed: false },
    { id: "e-BE", from: "B", to: "E", directed: false },
    { id: "e-CF", from: "C", to: "F", directed: false },
    { id: "e-CG", from: "C", to: "G", directed: false },
    { id: "e-EF", from: "E", to: "F", directed: false },
  ],
  directed: false,
  weighted: false,
  startNode: "A",
};

export function generateBFSSteps(graph: GraphData): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];

  // Enqueue start
  queue.push(graph.startNode);
  steps.push({
    action: "enqueue",
    nodeId: graph.startNode,
    dataStructure: [...queue],
    activeLine: 3,
    description: `Enqueue start node ${graph.startNode}`,
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    steps.push({
      action: "dequeue",
      nodeId: current,
      dataStructure: [...queue],
      activeLine: 5,
      description: `Dequeue ${current} from front of queue`,
    });

    if (visited.has(current)) continue;
    visited.add(current);
    steps.push({
      action: "visit",
      nodeId: current,
      dataStructure: [...queue],
      activeLine: 7,
      description: `Mark ${current} as visited`,
    });

    const neighbors = getNeighbors(graph, current);
    for (const neighbor of neighbors) {
      const edgeId = findEdgeId(graph, current, neighbor);
      steps.push({
        action: "explore-edge",
        nodeId: neighbor,
        edgeId,
        dataStructure: [...queue],
        activeLine: 9,
        description: `Check edge ${current} → ${neighbor}`,
      });

      if (!visited.has(neighbor) && !queue.includes(neighbor)) {
        queue.push(neighbor);
        steps.push({
          action: "enqueue",
          nodeId: neighbor,
          dataStructure: [...queue],
          activeLine: 11,
          description: `${neighbor} not visited — enqueue`,
        });
      }
    }
  }

  return steps;
}
