export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
  directed: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  startNode: string;
}

export type StepAction =
  | "enqueue"
  | "dequeue"
  | "push"
  | "pop"
  | "visit"
  | "explore-edge"
  | "update-dist"
  | "finalize"
  | "add-to-order";

export interface AlgorithmStep {
  action: StepAction;
  nodeId?: string;
  edgeId?: string;
  dataStructure: string[];
  distances?: Record<string, number>;
  sortedOutput?: string[];
  activeLine: number;
  description: string;
}

// Helpers

export function getNeighbors(graph: GraphData, nodeId: string): string[] {
  const neighbors: string[] = [];
  for (const edge of graph.edges) {
    if (edge.from === nodeId) neighbors.push(edge.to);
    if (!graph.directed && edge.to === nodeId) neighbors.push(edge.from);
  }
  return neighbors;
}

export function findEdgeId(graph: GraphData, from: string, to: string): string | undefined {
  return graph.edges.find(
    (e) => (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)
  )?.id;
}
