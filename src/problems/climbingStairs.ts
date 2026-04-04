export interface TreeNode {
  id: string;
  label: string;
  n: number;
  children: TreeNode[];
  result: number;
  duplicate: boolean;
}

let nodeId = 0;

export function buildStairsTree(n: number, seen = new Set<number>()): TreeNode {
  const id = `node-${nodeId++}`;
  const duplicate = seen.has(n);
  seen.add(n);

  if (n <= 1) {
    return { id, label: `cs(${n})`, n, children: [], result: 1, duplicate };
  }

  const left = buildStairsTree(n - 1, seen);
  const right = buildStairsTree(n - 2, seen);

  return {
    id,
    label: `cs(${n})`,
    n,
    children: [left, right],
    result: left.result + right.result,
    duplicate,
  };
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
