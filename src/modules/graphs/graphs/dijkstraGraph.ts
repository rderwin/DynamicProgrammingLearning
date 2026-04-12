import type { GraphData, AlgorithmStep } from "./types";

export const dijkstraGraphData: GraphData = {
  nodes: [
    { id: "S", label: "S", x: 75, y: 200 },
    { id: "A", label: "A", x: 225, y: 75 },
    { id: "B", label: "B", x: 225, y: 325 },
    { id: "C", label: "C", x: 400, y: 75 },
    { id: "D", label: "D", x: 400, y: 325 },
    { id: "T", label: "T", x: 550, y: 200 },
  ],
  edges: [
    { id: "e-SA", from: "S", to: "A", weight: 4, directed: false },
    { id: "e-SB", from: "S", to: "B", weight: 2, directed: false },
    { id: "e-AB", from: "A", to: "B", weight: 1, directed: false },
    { id: "e-AC", from: "A", to: "C", weight: 5, directed: false },
    { id: "e-BD", from: "B", to: "D", weight: 7, directed: false },
    { id: "e-CD", from: "C", to: "D", weight: 2, directed: false },
    { id: "e-CT", from: "C", to: "T", weight: 3, directed: false },
    { id: "e-DT", from: "D", to: "T", weight: 1, directed: false },
  ],
  directed: false,
  weighted: true,
  startNode: "S",
};

export function generateDijkstraSteps(graph: GraphData): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const dist: Record<string, number> = {};
  const finalized = new Set<string>();
  const pq: { node: string; dist: number }[] = [];

  // Initialize distances
  for (const node of graph.nodes) {
    dist[node.id] = node.id === graph.startNode ? 0 : Infinity;
  }

  pq.push({ node: graph.startNode, dist: 0 });
  steps.push({
    action: "enqueue",
    nodeId: graph.startNode,
    dataStructure: pq.map((p) => p.node),
    distances: { ...dist },
    activeLine: 4,
    description: `Initialize: distance to ${graph.startNode} = 0, all others = ∞`,
  });

  while (pq.length > 0) {
    // Extract min
    pq.sort((a, b) => a.dist - b.dist);
    const { node: current, dist: currentDist } = pq.shift()!;

    steps.push({
      action: "dequeue",
      nodeId: current,
      dataStructure: pq.map((p) => p.node),
      distances: { ...dist },
      activeLine: 6,
      description: `Extract min: ${current} (distance ${currentDist})`,
    });

    if (finalized.has(current)) continue;
    finalized.add(current);

    steps.push({
      action: "finalize",
      nodeId: current,
      dataStructure: pq.map((p) => p.node),
      distances: { ...dist },
      activeLine: 8,
      description: `Finalize ${current}: shortest distance = ${currentDist}`,
    });

    // Get neighbors with weights
    for (const edge of graph.edges) {
      let neighbor: string | null = null;
      let weight = edge.weight ?? 1;

      if (edge.from === current) neighbor = edge.to;
      else if (!graph.directed && edge.to === current) neighbor = edge.from;
      if (!neighbor || finalized.has(neighbor)) continue;

      steps.push({
        action: "explore-edge",
        nodeId: neighbor,
        edgeId: edge.id,
        dataStructure: pq.map((p) => p.node),
        distances: { ...dist },
        activeLine: 11,
        description: `Check edge ${current} → ${neighbor} (weight ${weight})`,
      });

      const newDist = currentDist + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        pq.push({ node: neighbor, dist: newDist });
        steps.push({
          action: "update-dist",
          nodeId: neighbor,
          dataStructure: pq.map((p) => p.node),
          distances: { ...dist },
          activeLine: 13,
          description: `Update distance to ${neighbor}: ${newDist} (via ${current})`,
        });
      }
    }
  }

  return steps;
}
