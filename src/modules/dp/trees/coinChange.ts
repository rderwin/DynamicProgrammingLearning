export interface TreeNode {
  id: string;
  label: string;
  n: number;
  children: TreeNode[];
  result: number;
  duplicate: boolean;
}

let nodeId = 0;

const COINS = [1, 2, 5];

export function buildCoinTree(amount: number, seen = new Set<number>()): TreeNode {
  const id = `node-${nodeId++}`;
  const duplicate = seen.has(amount);
  seen.add(amount);

  if (amount === 0) {
    return { id, label: `cc(0)`, n: 0, children: [], result: 0, duplicate };
  }
  if (amount < 0) {
    return { id, label: `cc(${amount})`, n: amount, children: [], result: Infinity, duplicate };
  }

  const children: TreeNode[] = [];
  let best = Infinity;

  for (const coin of COINS) {
    if (amount - coin >= 0) {
      const child = buildCoinTree(amount - coin, seen);
      children.push(child);
      if (child.result !== Infinity) {
        best = Math.min(best, 1 + child.result);
      }
    }
  }

  return { id, label: `cc(${amount})`, n: amount, children, result: best, duplicate };
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
