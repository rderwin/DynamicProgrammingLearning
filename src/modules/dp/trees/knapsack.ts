export interface TreeNode {
  id: string;
  label: string;
  n: number; // encode as itemIndex * 100 + capacity
  children: TreeNode[];
  result: number;
  duplicate: boolean;
}

let nodeId = 0;

// Fixed small item set for visualization
const ITEMS = [
  { weight: 1, value: 1 },
  { weight: 2, value: 6 },
  { weight: 3, value: 10 },
  { weight: 5, value: 15 },
];

export function buildKnapsackTree(
  capacity: number,
  idx = 0,
  seen = new Set<number>()
): TreeNode {
  const id = `node-${nodeId++}`;
  const key = idx * 100 + capacity;
  const duplicate = seen.has(key);
  seen.add(key);

  const label = `ks(${idx},${capacity})`;

  // Base cases
  if (idx >= ITEMS.length || capacity <= 0) {
    return { id, label, n: key, children: [], result: 0, duplicate };
  }

  const children: TreeNode[] = [];

  // Skip item
  const skip = buildKnapsackTree(capacity, idx + 1, seen);
  children.push(skip);

  let result = skip.result;

  // Take item (if it fits)
  if (ITEMS[idx].weight <= capacity) {
    const take = buildKnapsackTree(capacity - ITEMS[idx].weight, idx + 1, seen);
    children.push(take);
    result = Math.max(skip.result, ITEMS[idx].value + take.result);
  }

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

export function getItems() {
  return ITEMS;
}
