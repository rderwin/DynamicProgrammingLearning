import { useMemo } from "react";
import type { TreeNode } from "../problems/fibonacci";

interface Props {
  tree: TreeNode;
  revealedIds: Set<string>;
  memoizedNs: Set<number>;
  prunedIds: Set<string>;
  currentNodeId: string | null;
}

interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number;
  children: LayoutNode[];
}

const NODE_RADIUS = 24;
const LEVEL_HEIGHT = 76;
const H_SPACING = 12;
const PADDING = 20;

function layoutTree(node: TreeNode, depth = 0): LayoutNode {
  if (node.children.length === 0) {
    return { node, x: 0, y: depth * LEVEL_HEIGHT, children: [] };
  }

  const laid = node.children.map((c) => layoutTree(c, depth + 1));

  let cursor = 0;
  for (const child of laid) {
    const width = subtreeWidth(child);
    shiftX(child, cursor + width / 2);
    cursor += width + H_SPACING;
  }

  const left = laid[0].x;
  const right = laid[laid.length - 1].x;
  const x = (left + right) / 2;

  return { node, x, y: depth * LEVEL_HEIGHT, children: laid };
}

function subtreeWidth(ln: LayoutNode): number {
  if (ln.children.length === 0) return NODE_RADIUS * 2;
  let min = Infinity, max = -Infinity;
  function walk(n: LayoutNode) {
    min = Math.min(min, n.x - NODE_RADIUS);
    max = Math.max(max, n.x + NODE_RADIUS);
    n.children.forEach(walk);
  }
  walk(ln);
  return max - min;
}

function shiftX(ln: LayoutNode, dx: number) {
  const offset = dx - ln.x;
  function walk(n: LayoutNode) {
    n.x += offset;
    n.children.forEach(walk);
  }
  walk(ln);
}

function normalizePositions(root: LayoutNode) {
  let minX = Infinity;
  function findMin(n: LayoutNode) {
    minX = Math.min(minX, n.x);
    n.children.forEach(findMin);
  }
  findMin(root);
  function shift(n: LayoutNode) {
    n.x -= minX - NODE_RADIUS - PADDING;
    n.children.forEach(shift);
  }
  shift(root);
}

function getMaxBounds(root: LayoutNode): { maxX: number; maxY: number } {
  let maxX = 0, maxY = 0;
  function walk(n: LayoutNode) {
    maxX = Math.max(maxX, n.x + NODE_RADIUS + PADDING);
    maxY = Math.max(maxY, n.y + NODE_RADIUS + PADDING);
    n.children.forEach(walk);
  }
  walk(root);
  return { maxX, maxY };
}

function collectAll(ln: LayoutNode): LayoutNode[] {
  const result: LayoutNode[] = [ln];
  for (const child of ln.children) {
    result.push(...collectAll(child));
  }
  return result;
}

interface EdgeData {
  key: string;
  parentId: string;
  childId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function collectEdges(ln: LayoutNode): EdgeData[] {
  const edges: EdgeData[] = [];
  for (const child of ln.children) {
    edges.push({
      key: `${ln.node.id}-${child.node.id}`,
      parentId: ln.node.id,
      childId: child.node.id,
      x1: ln.x,
      y1: ln.y + NODE_RADIUS,
      x2: child.x,
      y2: child.y - NODE_RADIUS,
    });
    edges.push(...collectEdges(child));
  }
  return edges;
}

type NodeColor = "blue" | "red" | "green" | "grey";

function getNodeColor(
  node: TreeNode,
  memoizedNs: Set<number>,
  prunedIds: Set<string>
): NodeColor {
  if (prunedIds.has(node.id)) return "grey";
  if (memoizedNs.has(node.n) && node.duplicate) return "green";
  if (node.duplicate) return "red";
  return "blue";
}

const colorStyles: Record<NodeColor, { fill: string; stroke: string; text: string }> = {
  blue:  { fill: "#eff6ff", stroke: "#3b82f6", text: "#1e40af" },
  red:   { fill: "#fee2e2", stroke: "#ef4444", text: "#b91c1c" },
  green: { fill: "#dcfce7", stroke: "#22c55e", text: "#15803d" },
  grey:  { fill: "#f1f5f9", stroke: "#94a3b8", text: "#94a3b8" },
};

export default function RecursionTree({
  tree,
  revealedIds,
  memoizedNs,
  prunedIds,
  currentNodeId,
}: Props) {
  const layout = useMemo(() => {
    const laid = layoutTree(tree);
    normalizePositions(laid);
    return laid;
  }, [tree]);

  const { maxX, maxY } = useMemo(() => getMaxBounds(layout), [layout]);
  const allNodes = useMemo(() => collectAll(layout), [layout]);
  const allEdges = useMemo(() => collectEdges(layout), [layout]);

  return (
    <div className="overflow-x-auto w-full flex justify-center">
      <svg
        width={maxX}
        height={maxY}
        viewBox={`0 0 ${maxX} ${maxY}`}
        className="select-none"
      >
        <defs>
          {/* Glow filter for current node */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#3b82f6" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#ef4444" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Edges */}
        {allEdges.map((edge) => {
          const parentRevealed = revealedIds.has(edge.parentId);
          const childRevealed = revealedIds.has(edge.childId);
          const childPruned = prunedIds.has(edge.childId);

          if (!parentRevealed || !childRevealed) return null;

          const midY = (edge.y1 + edge.y2) / 2;
          const d = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`;

          // Approximate path length for animation
          const dx = edge.x2 - edge.x1;
          const dy = edge.y2 - edge.y1;
          const pathLen = Math.sqrt(dx * dx + dy * dy) * 1.2;

          return (
            <path
              key={edge.key}
              d={d}
              fill="none"
              stroke={childPruned ? "#cbd5e1" : "#94a3b8"}
              strokeWidth={childPruned ? 1 : 1.5}
              strokeDasharray={childPruned ? "4 4" : `${pathLen}`}
              strokeDashoffset={childPruned ? "0" : "0"}
              className="tree-edge-animate"
              style={{
                animation: childPruned ? "none" : `edgeDraw 0.3s ease-out both`,
              }}
            />
          );
        })}

        {/* Nodes */}
        {allNodes.map((ln) => {
          const revealed = revealedIds.has(ln.node.id);
          if (!revealed) return null;

          const isCurrent = ln.node.id === currentNodeId;
          const color = getNodeColor(ln.node, memoizedNs, prunedIds);
          const style = colorStyles[color];
          const glowFilter =
            isCurrent && color === "green"
              ? "url(#glow-green)"
              : isCurrent && color === "red"
                ? "url(#glow-red)"
                : isCurrent
                  ? "url(#glow-blue)"
                  : "url(#shadow)";

          return (
            <g
              key={ln.node.id}
              className="tree-node-animate"
              style={{
                transformOrigin: `${ln.x}px ${ln.y}px`,
                animation: `nodePopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
              }}
            >
              {/* Pulse ring for current node */}
              {isCurrent && (
                <circle
                  cx={ln.x}
                  cy={ln.y}
                  r={NODE_RADIUS + 4}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={2}
                  opacity={0.4}
                  style={{
                    transformOrigin: `${ln.x}px ${ln.y}px`,
                    animation: "pingSlow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                  }}
                />
              )}

              {/* Main circle */}
              <circle
                cx={ln.x}
                cy={ln.y}
                r={NODE_RADIUS}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={2}
                filter={glowFilter}
                className="transition-all duration-300"
              />

              {/* Label */}
              <text
                x={ln.x}
                y={ln.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={style.text}
                fontSize="12"
                fontWeight="600"
                fontFamily="'Inter', system-ui, sans-serif"
                className="pointer-events-none"
              >
                {ln.node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
