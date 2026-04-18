import { useState } from "react";
import CodeEditor from "./CodeEditor";
import type { TestCase } from "../engine/runCode";

interface TreeLesson {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  pattern: string;
  recurrence: string;
  keyInsight: string;
  walkthrough: { step: string; description: string }[];
  task: string;
  starter: string;
  functionName: string;
  testCases: TestCase[];
  hints: string[];
  solution: string;
  explanation: string;
  commonMistakes: string[];
  interviewWisdom: string;
  difficulty: "Medium" | "Hard";
}

const lessons: TreeLesson[] = [
  // ─── 1. The Fundamental Pattern: Post-Order Traversal ───
  {
    id: "t1",
    title: "Post-Order is the Key",
    subtitle: "Why tree DP is always post-order DFS",
    difficulty: "Medium",
    concept:
      "Tree DP almost always uses POST-ORDER traversal: compute children first, then combine into parent's answer. This is because a node's answer depends on its subtrees. The structure is ALWAYS: recurse on children, then use their results. Master this pattern and you'll solve 80% of tree DP problems without breaking a sweat.",
    pattern: "Post-order DFS",
    recurrence: "dfs(node): \n  if not node: return base_case\n  left = dfs(node.left)\n  right = dfs(node.right)\n  return combine(node.val, left, right)",
    keyInsight:
      "Every tree DP problem is the same skeleton: recurse left, recurse right, then combine. What CHANGES is the 'return value' and the 'combine logic'. Get comfortable asking: 'What does each subtree need to tell its parent?' The answer is ALMOST NEVER just the final answer — it's usually a helper value (depth, sum, a pair, etc.).",
    walkthrough: [
      { step: "Warmup problem", description: "Sum all values in a binary tree" },
      { step: "Think post-order", description: "Each subtree tells parent its sum. Parent's sum = own + left + right" },
      { step: "Skeleton", description: "if not node: return 0; l=dfs(left); r=dfs(right); return node.val + l + r" },
      { step: "Why base case = 0", description: "An empty subtree contributes 0. Trivially correct." },
      { step: "Practice", description: "Apply the same skeleton to Max Depth, Count Nodes, Sum of Left Leaves — they're all variants" },
    ],
    task: "Given a binary tree root, return the sum of all node values. Note: in this trainer, tree is represented as nested dict {'val': 1, 'left': {...} or None, 'right': {...} or None}.",
    functionName: "sumTree",
    starter: `def sumTree(root):
    # Post-order DFS.
    # Base: None returns 0
    # Recursive: val + left_sum + right_sum
    pass`,
    hints: [
      "Base case: if root is None, return 0",
      "Recurse on root['left'] and root['right']",
      "Return root['val'] + left_sum + right_sum",
      "This is the foundational skeleton for every tree DP",
    ],
    solution: `def sumTree(root):
    if root is None:
        return 0
    left_sum = sumTree(root['left'])
    right_sum = sumTree(root['right'])
    return root['val'] + left_sum + right_sum`,
    explanation:
      "The skeleton: base case → recurse children → combine. Every tree DP follows this exact shape. The 'combine' step is where all the logic lives. For sum: combine = own + left + right. For count: combine = 1 + left + right. For max depth: combine = 1 + max(left, right). Recognize the skeleton and you've done 80% of the work.",
    commonMistakes: [
      "Forgetting the None base case — causes AttributeError on leaf children",
      "Returning something non-numeric (like None) for the base case — poisons arithmetic",
      "Recursing before handling None — put the guard FIRST",
      "Using global variables instead of return values — works but less elegant, harder to generalize",
    ],
    interviewWisdom:
      "Tree DP's mental model: 'What does each subtree need to report to its parent?' If you can answer that, you can write the function. The return value is the communication protocol between children and parent. Before coding, SAY OUT LOUD what dfs() returns — that clarifies the whole problem.",
    testCases: [
      { input: [{ val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } }], expected: 6, label: "1+2+3=6" },
      { input: [{ val: 5, left: null, right: null }], expected: 5, label: "single=5" },
      { input: [null], expected: 0, label: "empty=0" },
      { input: [{ val: -1, left: { val: -2, left: null, right: null }, right: null }], expected: -3, label: "negatives=-3" },
    ],
  },

  // ─── 2. Diameter (return TWO things) ───
  {
    id: "t2",
    title: "Diameter of a Tree",
    subtitle: "Return TWO things from DFS — the 'two-value' trick",
    difficulty: "Medium",
    concept:
      "Diameter = longest path between ANY two nodes (measured in edges). The path doesn't need to go through the root. Crucial insight: at each node, the potentially-longest path going THROUGH it is (left depth + right depth + 1). So the dfs returns DEPTH, but we TRACK the answer globally. This 'return one thing, track another' pattern is everywhere in tree DP.",
    pattern: "Post-order + global max",
    recurrence: "depth(node) = 1 + max(depth(left), depth(right))\nanswer = max(answer, depth(left) + depth(right) + 1)  # nodes on longest path through 'node'",
    keyInsight:
      "The trick: the function returns DEPTH (for parent's benefit), but at each call we UPDATE a global answer with the longest path through this node. 'Through me' = left depth + right depth + 1 nodes (or + 0 + 0 for edges). So the function returns ONE thing but computes the final answer as a SIDE EFFECT. You see this pattern in: Binary Tree Max Path Sum, Longest Univalue Path, Diameter — all the same skeleton.",
    walkthrough: [
      { step: "Define", description: "depth(node) = number of edges in the longest path from 'node' down to any leaf" },
      { step: "Recurse", description: "left_depth = depth(left), right_depth = depth(right)" },
      { step: "Update answer", description: "diameter_through_node = left_depth + right_depth (edges). Update global max" },
      { step: "Return", description: "depth(node) = 1 + max(left_depth, right_depth)" },
      { step: "Subtle", description: "We return depth, NOT diameter. The diameter is tracked via global. This separation is critical." },
    ],
    task: "Return the diameter of the binary tree (number of edges in the longest path between any two nodes).",
    functionName: "diameterOfBinaryTree",
    starter: `def diameterOfBinaryTree(root):
    diameter = [0]
    def depth(node):
        if node is None: return 0
        # Recurse left, right
        # Update diameter[0] using left_depth + right_depth
        # Return 1 + max(left_depth, right_depth)
        pass
    depth(root)
    return diameter[0]`,
    hints: [
      "depth(node) returns the height (edges to farthest leaf)",
      "Use a nonlocal or list to track global max diameter",
      "At each node: diameter = max(diameter, left_depth + right_depth)",
      "Return 1 + max(left_depth, right_depth) as the depth",
      "Return the tracked max, not the final depth call",
    ],
    solution: `def diameterOfBinaryTree(root):
    diameter = [0]
    def depth(node):
        if node is None:
            return 0
        left_d = depth(node['left'])
        right_d = depth(node['right'])
        diameter[0] = max(diameter[0], left_d + right_d)
        return 1 + max(left_d, right_d)
    depth(root)
    return diameter[0]`,
    explanation:
      "The 'return one thing, track another' pattern. The recursive function returns DEPTH because that's what the parent needs. But at each node we can compute 'longest path THROUGH this node' as (left + right), and track the overall max. We don't return diameter up the tree because that wouldn't help the parent — the parent can't extend a path that's ALREADY going through two children. This cleanly separates 'what to report to parent' from 'what to compute as the answer'.",
    commonMistakes: [
      "Returning diameter from the function (confusing depth with diameter)",
      "Adding 1 when computing diameter — be consistent with nodes vs edges (edges = left + right)",
      "Using a simple variable that Python scopes to the inner function — use nonlocal or a list",
      "Forgetting the None base case returns 0",
    ],
    interviewWisdom:
      "The 'track answer globally while returning something else' pattern is a MUST-KNOW for tree DP. Diameter, Max Path Sum, Longest ZigZag Path, Binary Tree Cameras — all use this same technique. In interviews, VERBALIZE the split: 'I'll return depth to the parent, but track diameter globally as I go.' That clarity wins points even before you finish coding.",
    testCases: [
      { input: [{ val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: null, right: null } }], expected: 3, label: "[1,2,3,4,5]=3" },
      { input: [{ val: 1, left: { val: 2, left: null, right: null }, right: null }], expected: 1, label: "edge=1" },
      { input: [{ val: 1, left: null, right: null }], expected: 0, label: "single=0" },
      { input: [null], expected: 0, label: "empty=0" },
    ],
  },

  // ─── 3. House Robber III (pick/skip tree DP) ───
  {
    id: "t3",
    title: "House Robber III (Tree)",
    subtitle: "Return a PAIR: (took_this, skipped_this)",
    difficulty: "Medium",
    concept:
      "Houses are arranged as a binary tree. Can't rob adjacent (parent-child). Max money to rob? The classic 'return a pair' tree DP. At each node, return (max if we ROB this, max if we DON'T rob this). Parent uses these two values to make its decision. This pattern scales: any 'pick or skip with adjacency constraint' on trees uses it.",
    pattern: "Post-order + pair return",
    recurrence:
      "dfs(node) = (rob_this, skip_this)\nrob_this = node.val + skip_left + skip_right  # can't take kids\nskip_this = max(rob_left, skip_left) + max(rob_right, skip_right)",
    keyInsight:
      "Return TWO values from dfs. One 'I took this node' value, one 'I didn't take' value. The parent uses these to decide: if I take myself, I CAN'T take kids → use their 'skip' values. If I skip myself, I'm free to take or not take each kid → use max of their two values. This decouples decisions and avoids exponential branching.",
    walkthrough: [
      { step: "State", description: "dfs(node) returns (rob, skip): rob = best if we rob this node, skip = best if we don't" },
      { step: "Base", description: "dfs(None) = (0, 0)" },
      { step: "Recurse", description: "(rob_left, skip_left) = dfs(left); (rob_right, skip_right) = dfs(right)" },
      { step: "Compute rob_this", description: "node.val + skip_left + skip_right (we took this, so kids must be skipped)" },
      { step: "Compute skip_this", description: "max(rob_left, skip_left) + max(rob_right, skip_right) (kids free to choose)" },
      { step: "Answer", description: "max of the pair at the root" },
    ],
    task: "Return the max money you can rob from the tree (no two directly-linked nodes can both be robbed).",
    functionName: "rob",
    starter: `def rob(root):
    def dfs(node):
        if node is None: return (0, 0)
        # Recurse left, right
        # rob_this = node['val'] + skip_left + skip_right
        # skip_this = max(rob_left, skip_left) + max(rob_right, skip_right)
        # Return (rob_this, skip_this)
        pass
    r, s = dfs(root)
    return max(r, s)`,
    hints: [
      "dfs(node) returns (rob_this, skip_this)",
      "Base: dfs(None) = (0, 0)",
      "rob_this = node['val'] + skip_left + skip_right (kids forced to skip)",
      "skip_this = max(rob_left, skip_left) + max(rob_right, skip_right) (kids free)",
      "Answer: max of root's returned pair",
    ],
    solution: `def rob(root):
    def dfs(node):
        if node is None:
            return (0, 0)
        rl, sl = dfs(node['left'])
        rr, sr = dfs(node['right'])
        rob_this = node['val'] + sl + sr
        skip_this = max(rl, sl) + max(rr, sr)
        return (rob_this, skip_this)
    r, s = dfs(root)
    return max(r, s)`,
    explanation:
      "Classic pair-return tree DP. Without the pair trick, you'd need exponential recursion trying every combination. With the pair, each node does O(1) work combining children's results. The key insight: the parent needs BOTH answers from each child (not just the max), because 'is the kid robbed' affects whether parent can be robbed. Total O(n) time.",
    commonMistakes: [
      "Using just max(rob, skip) as the return — loses critical info",
      "Taking max(rob_left, skip_left) + node.val for rob_this — wrong, you MUST skip kids",
      "Forgetting the base case returns (0, 0) tuple, not a single 0",
      "Returning rob vs skip in wrong order (inconsistent) — label them clearly",
    ],
    interviewWisdom:
      "The pair-return trick is tree DP's workhorse. Also appears in: Robot on Tree, Binary Tree Cameras, Minimum Cost Tree. Whenever a decision at a node CONSTRAINS the choices at children (or vice versa), return multiple states so the parent can pick the right one. Think of it as: 'I don't know what I'll do yet, so I'll send up options.'",
    testCases: [
      { input: [{ val: 3, left: { val: 2, left: null, right: { val: 3, left: null, right: null } }, right: { val: 3, left: null, right: { val: 1, left: null, right: null } } }], expected: 7, label: "classic=7" },
      { input: [{ val: 3, left: { val: 4, left: { val: 1, left: null, right: null }, right: { val: 3, left: null, right: null } }, right: { val: 5, left: null, right: { val: 1, left: null, right: null } } }], expected: 9, label: "wide=9" },
      { input: [{ val: 5, left: null, right: null }], expected: 5, label: "single=5" },
    ],
  },

  // ─── 4. Binary Tree Max Path Sum ───
  {
    id: "t4",
    title: "Binary Tree Max Path Sum",
    subtitle: "The hardest tree DP, the simplest once you see it",
    difficulty: "Hard",
    concept:
      "Path = any sequence of connected nodes (not necessarily root-to-leaf). Can go through any node, including turning. Find max path sum. Values can be negative! This IS the Diameter problem with values instead of counts, and with a crucial twist: negative paths can be DROPPED (return 0 for a negative contribution).",
    pattern: "Post-order + global max + negative clamp",
    recurrence:
      "gain(node) = node.val + max(0, gain(left), gain(right))  // best 'downward' path\nanswer = max(answer, node.val + max(0, gain(left)) + max(0, gain(right)))  // 'through-me' path",
    keyInsight:
      "Two insights combine: (1) Diameter's 'through me' trick. At each node, consider the path that goes LEFT through me THROUGH me to RIGHT. Track the max. (2) Negative clamping: if a subtree's best downward path is negative, DON'T include it (use 0). This is the max(0, gain(child)) clamp — a reusable trick whenever negative values can hurt the accumulated sum.",
    walkthrough: [
      { step: "Define", description: "gain(node) = max sum of a DOWNWARD path from node (must include node)" },
      { step: "Recurse", description: "left_gain = max(0, gain(left)); right_gain = max(0, gain(right))" },
      { step: "Through-me path", description: "node.val + left_gain + right_gain — this is the best 'turning' path at this node" },
      { step: "Update global", description: "answer = max(answer, through_me_path)" },
      { step: "Return", description: "node.val + max(left_gain, right_gain) — parent can only extend ONE side" },
      { step: "Why clamp to 0", description: "If a subtree's gain is negative, we don't take that subtree. 0 means 'stop here'." },
    ],
    task: "Given a binary tree, return the maximum path sum of any path (connected sequence of nodes).",
    functionName: "maxPathSum",
    starter: `def maxPathSum(root):
    ans = [float('-inf')]
    def gain(node):
        if node is None: return 0
        # Recurse on children with max(0, ...) clamp
        # Update ans with node.val + left + right
        # Return node.val + max(left, right)
        pass
    gain(root)
    return ans[0]`,
    hints: [
      "Clamp child gains with max(0, ...) — don't take negative paths",
      "Track global answer: max(ans, node.val + left + right) — the through-me path",
      "Return node.val + max(left, right) — parent can only extend one side",
      "Initialize ans to -infinity (handles all-negative trees)",
      "Use a list or nonlocal for the global",
    ],
    solution: `def maxPathSum(root):
    ans = [float('-inf')]
    def gain(node):
        if node is None:
            return 0
        left_gain = max(0, gain(node['left']))
        right_gain = max(0, gain(node['right']))
        # Path THROUGH this node (can use both sides here)
        ans[0] = max(ans[0], node['val'] + left_gain + right_gain)
        # Path that goes UP to parent (can only use one side)
        return node['val'] + max(left_gain, right_gain)
    gain(root)
    return ans[0]`,
    explanation:
      "The elegance: two different paths at each node. (1) The 'through-me' path — uses both left and right — is a valid path but can't go UP. We compare against the global answer. (2) The 'gain' returned to the parent — can only use ONE child — because if the parent extends the path, it can't turn at us. The max(0, child) clamp handles negative values: if a subtree hurts us, we skip it (equivalent to returning just the node with no extension).",
    commonMistakes: [
      "Not clamping to 0 — negative paths poison the computation",
      "Initializing answer to 0 — wrong for all-negative trees (answer could be the max single node)",
      "Returning the through-me path to parent — breaks the single-child rule",
      "Forgetting that the path must have at least one node (so answer isn't negative unless all values are)",
    ],
    interviewWisdom:
      "This is THE classic Hard tree DP at FAANG. If you can derive it from scratch — the two-path insight and the clamp — you're demonstrating mastery. Many candidates know the solution but can't DERIVE it live. Practice narrating the reasoning: 'I need gain for the parent's sake; I need the through-me path for the answer; I clamp negatives because they'd hurt.'",
    testCases: [
      { input: [{ val: -10, left: { val: 9, left: null, right: null }, right: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 7, left: null, right: null } } }], expected: 42, label: "15+20+7=42" },
      { input: [{ val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } }], expected: 6, label: "2+1+3=6" },
      { input: [{ val: -3, left: null, right: null }], expected: -3, label: "single neg=-3" },
      { input: [{ val: 2, left: { val: -1, left: null, right: null }, right: null }], expected: 2, label: "clamp=2" },
    ],
  },

  // ─── 5. Rerooting ───
  {
    id: "t5",
    title: "Rerooting (Sum of Distances)",
    subtitle: "The most elegant trick in tree DP — compute for ALL roots in O(n)",
    difficulty: "Hard",
    concept:
      "Given a tree, for EACH node i, compute the sum of distances from i to every other node. Naive: O(n²) by doing BFS from each node. Smart: O(n) via REROOTING. First do a normal post-order DFS from root 0. Then do a second DFS that 'shifts' the root, computing each child's answer from the parent's answer in O(1). This mind-bending technique is a FAANG favorite for Hard.",
    pattern: "Tree Rerooting (two-pass DP)",
    recurrence:
      "Pass 1 (post-order from root 0):\n  count[u] = 1 + sum(count[v] for v in children)\n  answer[0] = sum(distance from 0 to every node)\nPass 2 (pre-order, rerooting):\n  answer[v] = answer[u] - count[v] + (n - count[v])\n  // moving root from u to v: 'count[v]' nodes get 1 closer, '(n - count[v])' get 1 farther",
    keyInsight:
      "When you move the root from u to its child v, nodes on v's side get 1 closer (count[v] of them), and nodes on u's side get 1 farther (n - count[v] of them). Net change: -count[v] + (n - count[v]) = n - 2*count[v]. This O(1) update is the magic. Combined with the count[] computed in pass 1, we get all n answers in O(n).",
    walkthrough: [
      { step: "Setup", description: "Build adjacency list from edges. Root at 0." },
      { step: "Pass 1 — post-order", description: "For each subtree, compute count[u] (number of nodes) and sum_dist[0] (total distance from root 0)" },
      { step: "The recurrence", description: "count[u] = 1 + sum count[v]; dist[u] contribution = dist[v] + count[v] (each of v's subtree nodes is 1 farther)" },
      { step: "Pass 2 — pre-order rerooting", description: "For each child v of u: answer[v] = answer[u] + (n - count[v]) - count[v] = answer[u] + n - 2*count[v]" },
      { step: "Why it works", description: "Moving root u → v: count[v] nodes become 1 closer, (n - count[v]) become 1 farther. Delta = -count[v] + (n - count[v])." },
      { step: "Return answers array", description: "Indexed by node, each value is sum of distances from that node." },
    ],
    task: "Given n nodes and edges forming a tree, return an array where res[i] = sum of distances from i to all other nodes.",
    functionName: "sumOfDistancesInTree",
    starter: `def sumOfDistancesInTree(n, edges):
    from collections import defaultdict
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    count = [1] * n
    ans = [0] * n

    # Pass 1: post-order from root 0
    def dfs1(u, parent):
        # Fill count[u] and contribute to ans[0]
        pass

    # Pass 2: pre-order rerooting
    def dfs2(u, parent):
        # For each child v: ans[v] = ans[u] + n - 2*count[v]
        pass

    dfs1(0, -1)
    dfs2(0, -1)
    return ans`,
    hints: [
      "Build adjacency list from edges (undirected, so add both directions)",
      "Pass 1: DFS from root 0. For each node u, count[u] = 1 + sum of children's counts. ans[0] adds dist of subtree.",
      "In pass 1: after recursing on child v, do ans[0] += ans[v] + count[v] (each subtree node 1 farther from root)",
      "Pass 2: DFS from root 0. For child v of u: ans[v] = ans[u] + n - 2*count[v]",
      "Be careful: pass 1 uses ans[] as a temporary, pass 2 overwrites",
    ],
    solution: `def sumOfDistancesInTree(n, edges):
    from collections import defaultdict
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    count = [1] * n
    ans = [0] * n

    # Pass 1: post-order, fills count[] and ans[0]
    def dfs1(u, parent):
        for v in graph[u]:
            if v == parent:
                continue
            dfs1(v, u)
            count[u] += count[v]
            ans[u] += ans[v] + count[v]

    # Pass 2: pre-order, rerooting
    def dfs2(u, parent):
        for v in graph[u]:
            if v == parent:
                continue
            ans[v] = ans[u] - count[v] + (n - count[v])
            dfs2(v, u)

    dfs1(0, -1)
    dfs2(0, -1)
    return ans`,
    explanation:
      "Pass 1 computes the answer for node 0 via post-order, while also filling count[u] = size of subtree rooted at u. Pass 2 uses the clever rerooting recurrence: when moving root from u to v, count[v] nodes get 1 closer (on v's side) and (n - count[v]) nodes get 1 farther (on u's new side). So ans[v] = ans[u] - count[v] + (n - count[v]). Total O(n) for the whole array — vastly better than O(n²).",
    commonMistakes: [
      "Doing a BFS from each node — O(n²), times out on large trees",
      "Forgetting to subtract count[v] in pass 2 (only adding n - count[v])",
      "Using ans[u] AFTER it was modified in the rerooting — compute v's answer before recursing",
      "Confusing 'pre-order' vs 'post-order' — pass 1 accumulates AFTER recursing, pass 2 sets child BEFORE recursing",
    ],
    interviewWisdom:
      "Rerooting is one of the most beautiful tree DP techniques. It comes up in Tree Distance problems, Centroid Decomposition problems, and anywhere you need 'for each node, what's the answer if we rooted here?' The phrase 'rerooting technique' is a signal to interviewers that you know advanced DP. If you get this right, you're hitting the top ~10% of candidates on tree DP.",
    testCases: [
      { input: [6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]], expected: [8, 12, 6, 10, 10, 10], label: "6 nodes" },
      { input: [1, []], expected: [0], label: "single=0" },
      { input: [2, [[1, 0]]], expected: [1, 1], label: "edge=[1,1]" },
    ],
  },
];

interface Props {
  onBack: () => void;
  onLessonComplete?: (lessonId: string) => void;
}

export default function TreeDPTrainer({ onBack, onLessonComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [awarded, setAwarded] = useState<Set<string>>(new Set());

  const lesson = lessons[idx];
  const total = lessons.length;

  function handleNext() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setShowSolution(false);
      setSolved(false);
      setHintIdx(0);
    }
  }
  function handlePrev() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setShowSolution(false);
      setSolved(false);
      setHintIdx(0);
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -mx-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">🌳</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Tree DP Masterclass</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Post-order recursion + tricks — 5 lessons ending with rerooting</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Lesson {idx + 1} of {total}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lesson.difficulty === "Hard" ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400" : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"}`}>
            {lesson.difficulty}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-semibold">{lesson.pattern}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      <div className="space-y-5" key={lesson.id}>
        {/* Title + Concept */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 italic">{lesson.subtitle}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{lesson.concept}</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recurrence / Core Idea</p>
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lesson.recurrence}</pre>
          </div>
        </div>

        {/* Key insight */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">💡 Key Insight</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{lesson.keyInsight}</p>
        </div>

        {/* Walkthrough */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">📋 How to Derive It</p>
          <ol className="space-y-2">
            {lesson.walkthrough.map((w, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{w.step}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{w.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Task */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">✍️ Your Turn</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.task}</p>
        </div>

        {/* Hints */}
        {hintIdx > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 animate-fade-in">
            {lesson.hints.slice(0, hintIdx).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="bg-amber-100 text-amber-700 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Solution */}
        {showSolution && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">✅ Solution</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-2">{lesson.explanation}</p>
              <div className="bg-[#1e1e2e] rounded-lg p-3">
                <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap">{lesson.solution}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Code editor */}
        <CodeEditor
          functionName={lesson.functionName}
          testCases={lesson.testCases}
          starterJS=""
          starterPython={lesson.starter}
          onPass={() => {
            setSolved(true);
            if (!awarded.has(lesson.id)) {
              setAwarded((prev) => new Set(prev).add(lesson.id));
              onLessonComplete?.(lesson.id);
            }
          }}
        />

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 text-xs">
          {!solved && (
            <>
              <button onClick={() => setHintIdx((h) => Math.min(h + 1, lesson.hints.length))} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {hintIdx === 0 ? "Get a hint" : hintIdx < lesson.hints.length ? `Next hint (${hintIdx + 1}/${lesson.hints.length})` : "All hints shown"}
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button onClick={() => setShowSolution(!showSolution)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                {showSolution ? "Hide solution" : "Show solution"}
              </button>
            </>
          )}
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">⚠️ Common Mistakes</p>
          <ul className="space-y-1">
            {lesson.commonMistakes.map((m) => (
              <li key={m} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interview Wisdom */}
        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-5">
          <p className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-2">💎 Interview Wisdom</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{lesson.interviewWisdom}</p>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between pt-4">
          <button onClick={handlePrev} disabled={idx === 0} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            ← Previous
          </button>
          <button onClick={handleNext} disabled={idx === total - 1} className="group px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next lesson
            <svg className="w-4 h-4 inline ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
