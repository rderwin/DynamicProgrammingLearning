export interface TreeNode {
  id: string;
  label: string;
  n: number; // encode (r,c) as r * 100 + c for memo keying
  children: TreeNode[];
  result: number;
  duplicate: boolean;
}

let nodeId = 0;

export function buildGridTree(size: number, row = 0, col = 0, seen = new Set<number>()): TreeNode {
  const id = `node-${nodeId++}`;
  const key = row * 100 + col;
  const duplicate = seen.has(key);
  seen.add(key);

  const label = `gp(${row},${col})`;

  if (row === size - 1 && col === size - 1) {
    return { id, label, n: key, children: [], result: 1, duplicate };
  }

  const children: TreeNode[] = [];

  // Go down
  if (row < size - 1) {
    children.push(buildGridTree(size, row + 1, col, seen));
  }
  // Go right
  if (col < size - 1) {
    children.push(buildGridTree(size, row, col + 1, seen));
  }

  const result = children.reduce((sum, c) => sum + c.result, 0);

  return { id, label, n: key, children, result, duplicate };
}

export function resetNodeId() {
  nodeId = 0;
}

export function countNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}

export function collectEvalOrder(node: TreeNode): TreeNode[] {
  const order: TreeNode[] = [];
  function walk(n: TreeNode) {
    for (const child of n.children) walk(child);
    order.push(n);
  }
  walk(node);
  return order;
}
