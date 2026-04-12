import type { GraphData, AlgorithmStep } from "./types";

// DAG representing course prerequisites
export const topoGraphData: GraphData = {
  nodes: [
    { id: "CS101", label: "CS101", x: 100, y: 50 },
    { id: "CS102", label: "CS102", x: 300, y: 50 },
    { id: "CS201", label: "CS201", x: 50, y: 175 },
    { id: "CS202", label: "CS202", x: 200, y: 175 },
    { id: "CS301", label: "CS301", x: 400, y: 175 },
    { id: "CS401", label: "CS401", x: 125, y: 300 },
    { id: "CS402", label: "CS402", x: 300, y: 300 },
  ],
  edges: [
    { id: "e-101-201", from: "CS101", to: "CS201", directed: true },
    { id: "e-101-202", from: "CS101", to: "CS202", directed: true },
    { id: "e-102-202", from: "CS102", to: "CS202", directed: true },
    { id: "e-102-301", from: "CS102", to: "CS301", directed: true },
    { id: "e-201-401", from: "CS201", to: "CS401", directed: true },
    { id: "e-202-401", from: "CS202", to: "CS401", directed: true },
    { id: "e-202-402", from: "CS202", to: "CS402", directed: true },
    { id: "e-301-402", from: "CS301", to: "CS402", directed: true },
  ],
  directed: true,
  weighted: false,
  startNode: "CS101",
};

export function generateTopoSteps(graph: GraphData): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const sorted: string[] = [];

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    steps.push({
      action: "visit",
      nodeId,
      dataStructure: [...sorted],
      activeLine: 4,
      description: `Visit ${nodeId}`,
      sortedOutput: [...sorted],
    });

    // Get outgoing neighbors (directed)
    const neighbors = graph.edges
      .filter((e) => e.from === nodeId)
      .map((e) => e.to);

    for (const neighbor of neighbors) {
      const edgeId = graph.edges.find((e) => e.from === nodeId && e.to === neighbor)?.id;
      steps.push({
        action: "explore-edge",
        nodeId: neighbor,
        edgeId,
        dataStructure: [...sorted],
        activeLine: 6,
        description: `Explore dependency ${nodeId} → ${neighbor}`,
        sortedOutput: [...sorted],
      });

      if (!visited.has(neighbor)) {
        steps.push({
          action: "push",
          nodeId: neighbor,
          dataStructure: [...sorted],
          activeLine: 7,
          description: `${neighbor} not visited — recurse deeper`,
          sortedOutput: [...sorted],
        });
        dfs(neighbor);
      }
    }

    // Post-order: add to front of sorted after all dependencies processed
    sorted.unshift(nodeId);
    steps.push({
      action: "add-to-order",
      nodeId,
      dataStructure: [...sorted],
      activeLine: 10,
      description: `All deps of ${nodeId} processed — add to sorted order`,
      sortedOutput: [...sorted],
    });
  }

  // Process all nodes (some may not be reachable from startNode)
  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return steps;
}
