import { useState } from "react";
import type { GraphData } from "../modules/graphs/graphs/types";

const NODE_RADIUS = 24;
const PADDING = 40;

interface Props {
  graph: GraphData;
  visitedNodes: Set<string>;
  activeNode: string | null;
  exploredEdges: Set<string>;
  activeEdge: string | null;
  frontierNodes: Set<string>;
  finalizedNodes?: Set<string>;
  distances?: Record<string, number>;
  sortedOutput?: string[];
  compact?: boolean;
}

type NodeState = "default" | "frontier" | "active" | "visited" | "finalized";

function getNodeState(
  id: string,
  active: string | null,
  visited: Set<string>,
  frontier: Set<string>,
  finalized?: Set<string>
): NodeState {
  if (id === active) return "active";
  if (finalized?.has(id)) return "finalized";
  if (visited.has(id)) return "visited";
  if (frontier.has(id)) return "frontier";
  return "default";
}

const nodeStyles: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  default:   { fill: "#f8fafc", stroke: "#94a3b8", text: "#475569" },
  frontier:  { fill: "#fef3c7", stroke: "#f59e0b", text: "#92400e" },
  active:    { fill: "#d1fae5", stroke: "#10b981", text: "#065f46" },
  visited:   { fill: "#ecfdf5", stroke: "#34d399", text: "#047857" },
  finalized: { fill: "#ccfbf1", stroke: "#0d9488", text: "#134e4a" },
};

export default function GraphView({
  graph,
  visitedNodes,
  activeNode,
  exploredEdges,
  activeEdge,
  frontierNodes,
  finalizedNodes,
  distances,
  sortedOutput,
  compact = false,
}: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Compute bounds
  const xs = graph.nodes.map((n) => n.x);
  const ys = graph.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - PADDING - NODE_RADIUS;
  const maxX = Math.max(...xs) + PADDING + NODE_RADIUS;
  const minY = Math.min(...ys) - PADDING - NODE_RADIUS;
  const maxY = Math.max(...ys) + PADDING + NODE_RADIUS + (distances ? 20 : 0);
  const width = maxX - minX;
  const height = maxY - minY;

  const r = compact ? 18 : NODE_RADIUS;

  return (
    <div className="overflow-x-auto w-full flex justify-center">
      <svg
        width={compact ? width * 0.7 : width}
        height={compact ? height * 0.7 : height}
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="select-none"
      >
        <defs>
          {/* Arrowhead for directed edges */}
          <marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-active" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill="#10b981" />
          </marker>
          {/* Glow for active node */}
          <filter id="graph-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#10b981" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="graph-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Edges */}
        {graph.edges.map((edge) => {
          const from = graph.nodes.find((n) => n.id === edge.from)!;
          const to = graph.nodes.find((n) => n.id === edge.to)!;
          const isExplored = exploredEdges.has(edge.id);
          const isActive = edge.id === activeEdge;

          // Shorten line by node radius so it doesn't overlap circles
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len;
          const uy = dy / len;
          const x1 = from.x + ux * r;
          const y1 = from.y + uy * r;
          const x2 = to.x - ux * (r + (graph.directed ? 8 : 0));
          const y2 = to.y - uy * (r + (graph.directed ? 8 : 0));

          const edgeLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

          return (
            <g key={edge.id}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? "#10b981" : isExplored ? "#6ee7b7" : "#cbd5e1"}
                strokeWidth={isActive ? 3 : isExplored ? 2 : 1.5}
                markerEnd={graph.directed ? (isActive || isExplored ? "url(#arrow-active)" : "url(#arrow)") : undefined}
                style={isActive ? {
                  strokeDasharray: edgeLen,
                  animation: `edgeTraverse 0.3s ease-out both`,
                } : undefined}
                className="transition-all duration-200"
              />
              {/* Weight label */}
              {edge.weight !== undefined && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="'JetBrains Mono', monospace"
                  fill={isActive || isExplored ? "#059669" : "#94a3b8"}
                  className="transition-all duration-200"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const state = getNodeState(node.id, activeNode, visitedNodes, frontierNodes, finalizedNodes);
          const style = nodeStyles[state];
          const isHovered = node.id === hoveredNode;
          const isActive = state === "active";
          const dist = distances?.[node.id];
          const sortIdx = sortedOutput?.indexOf(node.id);
          const hasSortBadge = sortIdx !== undefined && sortIdx >= 0;

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Pulse rings for active */}
              {isActive && (
                <>
                  <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke="#10b981" strokeWidth={1} opacity={0.15}
                    style={{ transformOrigin: `${node.x}px ${node.y}px`, animation: "pingSlow 2s ease-in-out infinite" }} />
                  <circle cx={node.x} cy={node.y} r={r + 4} fill="none" stroke="#10b981" strokeWidth={2} opacity={0.3}
                    style={{ transformOrigin: `${node.x}px ${node.y}px`, animation: "pingSlow 2s ease-in-out infinite 0.3s" }} />
                </>
              )}

              {/* Main circle */}
              <circle
                cx={node.x} cy={node.y}
                r={isActive ? r + 1 : isHovered ? r + 1 : r}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isActive ? 3 : 2}
                filter={isActive ? "url(#graph-glow)" : isHovered ? "none" : "url(#graph-shadow)"}
                style={{
                  transition: "fill 0.3s, stroke 0.3s, r 0.2s",
                  animation: state === "visited" || state === "finalized" ? "nodeVisit 0.3s ease-out" : undefined,
                }}
              />

              {/* Label */}
              <text
                x={node.x} y={node.y}
                textAnchor="middle" dominantBaseline="central"
                fill={style.text} fontSize={compact ? "11" : "13"} fontWeight="700"
                fontFamily="'Inter', system-ui, sans-serif"
                className="pointer-events-none"
              >
                {node.label}
              </text>

              {/* Distance label (Dijkstra) */}
              {dist !== undefined && (
                <text
                  x={node.x} y={node.y + r + 14}
                  textAnchor="middle" fontSize="10" fontWeight="600"
                  fontFamily="'JetBrains Mono', monospace"
                  fill={state === "finalized" ? "#0d9488" : state === "active" ? "#10b981" : "#94a3b8"}
                  className="transition-all duration-300"
                  style={{ animation: "distanceUpdate 0.3s ease-out" }}
                >
                  {dist === Infinity ? "∞" : dist}
                </text>
              )}

              {/* Sort order badge (Topo Sort) */}
              {hasSortBadge && (
                <g style={{ animation: "nodePopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both" }}>
                  <circle cx={node.x + r - 4} cy={node.y - r + 4} r={9} fill="#0d9488" />
                  <text
                    x={node.x + r - 4} y={node.y - r + 4}
                    textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize="9" fontWeight="700"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {sortIdx! + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
