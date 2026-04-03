import { useEffect, useRef } from "react";
import type { TreeNode } from "../problems/fibonacci";

interface Props {
  tree: TreeNode;
  revealedIds: Set<string>;
  memoizedNs: Set<number>;
  prunedIds: Set<string>;
}

interface LayoutNode {
  node: TreeNode;
  x: number;
  y: number;
  children: LayoutNode[];
}

const NODE_RADIUS = 22;
const LEVEL_HEIGHT = 70;
const H_SPACING = 8;

function layoutTree(node: TreeNode, depth = 0): LayoutNode {
  if (node.children.length === 0) {
    return { node, x: 0, y: depth * LEVEL_HEIGHT, children: [] };
  }

  const laid = node.children.map((c) => layoutTree(c, depth + 1));

  // Position children side by side
  let cursor = 0;
  for (const child of laid) {
    const width = subtreeWidth(child);
    shiftX(child, cursor + width / 2);
    cursor += width + H_SPACING;
  }

  // Center parent above children
  const left = laid[0].x;
  const right = laid[laid.length - 1].x;
  const x = (left + right) / 2;

  return { node, x, y: depth * LEVEL_HEIGHT, children: laid };
}

function subtreeWidth(ln: LayoutNode): number {
  if (ln.children.length === 0) return NODE_RADIUS * 2;
  let min = Infinity,
    max = -Infinity;
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
    n.x -= minX - NODE_RADIUS - 10;
    n.children.forEach(shift);
  }
  shift(root);
}

function getMaxBounds(root: LayoutNode): { maxX: number; maxY: number } {
  let maxX = 0,
    maxY = 0;
  function walk(n: LayoutNode) {
    maxX = Math.max(maxX, n.x + NODE_RADIUS + 10);
    maxY = Math.max(maxY, n.y + NODE_RADIUS + 10);
    n.children.forEach(walk);
  }
  walk(root);
  return { maxX, maxY };
}

export default function RecursionTree({
  tree,
  revealedIds,
  memoizedNs,
  prunedIds,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const laid = layoutTree(tree);
    normalizePositions(laid);
    const { maxX, maxY } = getMaxBounds(laid);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = maxX * dpr;
    canvas.height = maxY * dpr;
    canvas.style.width = `${maxX}px`;
    canvas.style.height = `${maxY}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, maxX, maxY);

    // Draw edges first
    function drawEdges(ln: LayoutNode) {
      for (const child of ln.children) {
        const parentRevealed = revealedIds.has(ln.node.id);
        const childRevealed = revealedIds.has(child.node.id);
        const childPruned = prunedIds.has(child.node.id);

        if (parentRevealed && childRevealed) {
          ctx!.beginPath();
          ctx!.moveTo(ln.x, ln.y + NODE_RADIUS);
          ctx!.lineTo(child.x, child.y - NODE_RADIUS);
          ctx!.strokeStyle = childPruned ? "#9ca3af" : "#64748b";
          ctx!.lineWidth = childPruned ? 1 : 2;
          if (childPruned) {
            ctx!.setLineDash([4, 4]);
          }
          ctx!.stroke();
          ctx!.setLineDash([]);
        }
        drawEdges(child);
      }
    }
    drawEdges(laid);

    // Draw nodes
    function drawNodes(ln: LayoutNode) {
      const revealed = revealedIds.has(ln.node.id);
      if (!revealed) {
        ln.children.forEach(drawNodes);
        return;
      }

      const pruned = prunedIds.has(ln.node.id);
      const isDuplicate = ln.node.duplicate;
      const isMemoHit = memoizedNs.has(ln.node.n) && isDuplicate;

      ctx!.beginPath();
      ctx!.arc(ln.x, ln.y, NODE_RADIUS, 0, Math.PI * 2);

      if (pruned) {
        // Pruned by memoization — greyed out
        ctx!.fillStyle = "#e5e7eb";
        ctx!.strokeStyle = "#9ca3af";
      } else if (isMemoHit) {
        // Cache hit — green
        ctx!.fillStyle = "#bbf7d0";
        ctx!.strokeStyle = "#16a34a";
      } else if (isDuplicate) {
        // Duplicate in brute force — red
        ctx!.fillStyle = "#fecaca";
        ctx!.strokeStyle = "#dc2626";
      } else {
        // Unique computation
        ctx!.fillStyle = "#dbeafe";
        ctx!.strokeStyle = "#3b82f6";
      }

      ctx!.lineWidth = 2;
      ctx!.fill();
      ctx!.stroke();

      // Label
      ctx!.fillStyle = pruned ? "#9ca3af" : "#1e293b";
      ctx!.font = "13px system-ui, sans-serif";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(ln.node.label, ln.x, ln.y);

      ln.children.forEach(drawNodes);
    }
    drawNodes(laid);
  }, [tree, revealedIds, memoizedNs, prunedIds]);

  return (
    <div className="overflow-x-auto w-full">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  );
}
