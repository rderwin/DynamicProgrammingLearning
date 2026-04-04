import type { ProblemConfig, TreeNode } from "../components/TreeLesson";

export interface ProblemStats {
  n: number;
  bruteForceNodes: number;
  memoNodes: number;
  duplicates: number;
  savings: number; // percentage 0-100
}

/**
 * Build the tree for a given n and compute brute-force vs memoized stats.
 * Memoized nodes = unique subproblems (each computed once).
 */
function computeForN(config: ProblemConfig, n: number): ProblemStats {
  config.resetIds();
  const tree = config.buildTree(n);
  const total = config.countNodes(tree);

  // Count unique n-values (these are the only calls memo would make)
  const uniqueNs = new Set<number>();
  function walk(node: TreeNode) {
    uniqueNs.add(node.n);
    node.children.forEach(walk);
  }
  walk(tree);

  const memoNodes = uniqueNs.size;
  const duplicates = total - memoNodes;
  const savings = total > 0 ? Math.round(((total - memoNodes) / total) * 100) : 0;

  return { n, bruteForceNodes: total, memoNodes, duplicates, savings };
}

/**
 * Compute stats for a range of n values around the current one.
 * Returns an array sorted by n.
 */
export function computeStatsRange(
  config: ProblemConfig,
  _currentN: number,
  nRange: [number, number]
): ProblemStats[] {
  const [min, max] = nRange;
  const stats: ProblemStats[] = [];

  for (let n = min; n <= max; n++) {
    stats.push(computeForN(config, n));
  }

  // Reset IDs so the main tree isn't affected
  config.resetIds();

  return stats;
}
