import type { PracticeProblem } from "./types";

export const practiceProblems: PracticeProblem[] = [
  // ─── 1. House Robber ───
  {
    id: "house-robber",
    title: "House Robber",
    difficulty: "Easy",
    pattern: "Include/Exclude",
    description:
      "You're a robber planning to rob houses along a street. Each house has a certain amount of money. The constraint: you can't rob two adjacent houses (security systems are linked). Return the maximum amount you can rob.",
    examples: [
      "rob([1,2,3,1]) → 4  (rob house 1 and house 3: 1+3=4)",
      "rob([2,7,9,3,1]) → 12  (rob house 1, 3, and 5: 2+9+1=12)",
    ],
    constraints: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
    hints: [
      "For each house, you have two choices: rob it or skip it. Sound familiar? It's the include/exclude pattern from Knapsack.",
      "If you rob house i, you get nums[i] + best you can do from house i+2 onward. If you skip, you get best from house i+1.",
      "Recurrence: rob(i) = max(nums[i] + rob(i+2), rob(i+1)). Base: rob(n)=0, rob(n-1)=nums[n-1].",
    ],
    testCases: [
      { input: [[1, 2, 3, 1]], expected: 4, label: "rob([1,2,3,1]) = 4" },
      { input: [[2, 7, 9, 3, 1]], expected: 12, label: "rob([2,7,9,3,1]) = 12" },
      { input: [[0]], expected: 0, label: "rob([0]) = 0" },
      { input: [[5, 1, 1, 5]], expected: 10, label: "rob([5,1,1,5]) = 10" },
      { input: [[2, 1, 1, 2]], expected: 4, label: "rob([2,1,1,2]) = 4" },
      { input: [[1, 3, 1, 3, 100]], expected: 103, label: "rob([1,3,1,3,100]) = 103" },
    ],
    functionName: "rob",
    starterJS: `function rob(nums) {
  // Return max amount you can rob
  // Can't rob two adjacent houses

}`,
    starterPython: `def rob(nums):
    # Return max amount you can rob
    # Can't rob two adjacent houses
    pass`,
    solutionJS: `function rob(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  const dp = new Array(n);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i-1], nums[i] + dp[i-2]);
  }
  return dp[n-1];
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n) — can be O(1) with two variables",
  },

  // ─── 2. Min Cost Climbing Stairs ───
  {
    id: "min-cost-stairs",
    title: "Min Cost Climbing Stairs",
    difficulty: "Easy",
    pattern: "1D Optimization",
    description:
      "You're given an array cost where cost[i] is the cost to step on stair i. You can start from step 0 or step 1. Each time, you can climb 1 or 2 steps. Return the minimum cost to reach the top (past the last step).",
    examples: [
      "minCost([10,15,20]) → 15  (start at step 1, pay 15, jump 2 to top)",
      "minCost([1,100,1,1,1,100,1,1,100,1]) → 6",
    ],
    constraints: ["2 ≤ cost.length ≤ 1000", "0 ≤ cost[i] ≤ 999"],
    hints: [
      "This is Climbing Stairs but with a cost — instead of counting ways, you minimize cost. Use min() instead of +.",
      "To reach step i, you came from step i-1 or i-2. Pick whichever is cheaper.",
      "dp[i] = cost[i] + min(dp[i-1], dp[i-2]). The answer is min(dp[n-1], dp[n-2]) since you can skip the last step.",
    ],
    testCases: [
      { input: [[10, 15, 20]], expected: 15, label: "minCost([10,15,20]) = 15" },
      { input: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6, label: "minCost([1,100,1,...]) = 6" },
      { input: [[0, 0]], expected: 0, label: "minCost([0,0]) = 0" },
      { input: [[1, 2, 3]], expected: 2, label: "minCost([1,2,3]) = 2" },
      { input: [[5, 1, 2, 4, 8, 1]], expected: 8, label: "minCost([5,1,2,4,8,1]) = 8" },
    ],
    functionName: "minCost",
    starterJS: `function minCost(cost) {
  // Return minimum cost to reach the top
  // Can start from step 0 or 1, take 1 or 2 steps

}`,
    starterPython: `def minCost(cost):
    # Return minimum cost to reach the top
    # Can start from step 0 or 1, take 1 or 2 steps
    pass`,
    solutionJS: `function minCost(cost) {
  const n = cost.length;
  const dp = new Array(n);
  dp[0] = cost[0];
  dp[1] = cost[1];
  for (let i = 2; i < n; i++) {
    dp[i] = cost[i] + Math.min(dp[i-1], dp[i-2]);
  }
  return Math.min(dp[n-1], dp[n-2]);
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },

  // ─── 3. Decode Ways ───
  {
    id: "decode-ways",
    title: "Decode Ways",
    difficulty: "Medium",
    pattern: "1D Counting",
    description:
      "A message containing letters A-Z is encoded as numbers: 'A'→1, 'B'→2, ..., 'Z'→26. Given a string of digits, count how many ways it can be decoded. For example, '12' could be 'AB' (1,2) or 'L' (12).",
    examples: [
      'numDecodings("12") → 2  ("AB" or "L")',
      'numDecodings("226") → 3  ("BZ", "VF", "BBF")',
      'numDecodings("06") → 0  (leading zero is invalid)',
    ],
    constraints: ["1 ≤ s.length ≤ 100", "s contains only digits"],
    hints: [
      "This is like Climbing Stairs — you can 'take' 1 or 2 digits at each step. But not all steps are valid.",
      "Single digit is valid if it's 1-9 (not 0). Two digits are valid if they form 10-26.",
      "dp[i] = (valid single? dp[i-1] : 0) + (valid pair? dp[i-2] : 0). Base: dp[0]=1 (empty string = 1 way).",
    ],
    testCases: [
      { input: ["12"], expected: 2, label: 'numDecodings("12") = 2' },
      { input: ["226"], expected: 3, label: 'numDecodings("226") = 3' },
      { input: ["06"], expected: 0, label: 'numDecodings("06") = 0' },
      { input: ["10"], expected: 1, label: 'numDecodings("10") = 1' },
      { input: ["11106"], expected: 2, label: 'numDecodings("11106") = 2' },
      { input: ["27"], expected: 1, label: 'numDecodings("27") = 1' },
    ],
    functionName: "numDecodings",
    starterJS: `function numDecodings(s) {
  // Count ways to decode digit string to letters
  // '1'-'26' map to 'A'-'Z'

}`,
    starterPython: `def numDecodings(s):
    # Count ways to decode digit string to letters
    # '1'-'26' map to 'A'-'Z'
    pass`,
    solutionJS: `function numDecodings(s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  dp[1] = s[0] !== '0' ? 1 : 0;
  for (let i = 2; i <= n; i++) {
    if (s[i-1] !== '0') dp[i] += dp[i-1];
    const two = parseInt(s.substring(i-2, i));
    if (two >= 10 && two <= 26) dp[i] += dp[i-2];
  }
  return dp[n];
}`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  },

  // ─── 4. Unique Paths with Obstacles ───
  {
    id: "unique-paths-obstacles",
    title: "Unique Paths with Obstacles",
    difficulty: "Medium",
    pattern: "2D Counting",
    description:
      "A robot on an m×n grid starts at the top-left and wants to reach the bottom-right, moving only right or down. Some cells have obstacles (marked 1). Return the number of unique paths.",
    examples: [
      "uniquePaths([[0,0,0],[0,1,0],[0,0,0]]) → 2",
      "uniquePaths([[0,1],[0,0]]) → 1",
    ],
    constraints: ["1 ≤ m,n ≤ 100", "grid[i][j] is 0 or 1"],
    hints: [
      "Same as Grid Paths, but if a cell has an obstacle, its path count is 0.",
      "dp[i][j] = 0 if obstacle, else dp[i-1][j] + dp[i][j-1]. First row/col need special handling for obstacles.",
      "For first row: dp[0][j] = 0 if obstacle at (0,j) or any cell before it. Same for first column.",
    ],
    testCases: [
      { input: [[[0,0,0],[0,1,0],[0,0,0]]], expected: 2, label: "3×3 grid with center obstacle = 2" },
      { input: [[[0,1],[0,0]]], expected: 1, label: "2×2 grid with obstacle = 1" },
      { input: [[[1,0]]], expected: 0, label: "Start blocked = 0" },
      { input: [[[0,0],[0,0]]], expected: 2, label: "2×2 no obstacles = 2" },
      { input: [[[0,0,0,0],[0,1,0,0],[0,0,0,0]]], expected: 4, label: "3×4 grid = 4" },
    ],
    functionName: "uniquePaths",
    starterJS: `function uniquePaths(grid) {
  // Count paths from top-left to bottom-right
  // Can only move right or down
  // grid[i][j] === 1 means obstacle

}`,
    starterPython: `def uniquePaths(grid):
    # Count paths from top-left to bottom-right
    # Can only move right or down
    # grid[i][j] == 1 means obstacle
    pass`,
    solutionJS: `function uniquePaths(grid) {
  const m = grid.length, n = grid[0].length;
  if (grid[0][0] === 1) return 0;
  const dp = Array.from({length: m}, () => new Array(n).fill(0));
  dp[0][0] = 1;
  for (let i = 1; i < m; i++) dp[i][0] = grid[i][0] === 1 ? 0 : dp[i-1][0];
  for (let j = 1; j < n; j++) dp[0][j] = grid[0][j] === 1 ? 0 : dp[0][j-1];
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] = grid[i][j] === 1 ? 0 : dp[i-1][j] + dp[i][j-1];
  return dp[m-1][n-1];
}`,
    timeComplexity: "O(m×n)",
    spaceComplexity: "O(m×n)",
  },

  // ─── 5. Coin Change II ───
  {
    id: "coin-change-ii",
    title: "Coin Change II (Combinations)",
    difficulty: "Medium",
    pattern: "1D Counting",
    description:
      "Given coin denominations and a total amount, return the number of combinations that make up that amount. Each coin can be used unlimited times. Order doesn't matter: (1,1,2) and (2,1,1) count as one combination.",
    examples: [
      "change(5, [1,2,5]) → 4  (5, 2+2+1, 2+1+1+1, 1+1+1+1+1)",
      "change(3, [2]) → 0  (impossible with only 2s)",
    ],
    constraints: ["0 ≤ amount ≤ 5000", "1 ≤ coins.length ≤ 300"],
    hints: [
      "This is Coin Change but counting combinations instead of minimizing. The trick: process coins in order to avoid counting permutations.",
      "For each coin, update all amounts it can contribute to. dp[j] += dp[j - coin].",
      "Outer loop: coins. Inner loop: amounts. dp[0] = 1 (one way to make 0). This ordering prevents double-counting.",
    ],
    testCases: [
      { input: [5, [1, 2, 5]], expected: 4, label: "change(5, [1,2,5]) = 4" },
      { input: [3, [2]], expected: 0, label: "change(3, [2]) = 0" },
      { input: [0, [1, 2]], expected: 1, label: "change(0, [1,2]) = 1" },
      { input: [10, [10]], expected: 1, label: "change(10, [10]) = 1" },
      { input: [7, [1, 2, 3]], expected: 8, label: "change(7, [1,2,3]) = 8" },
    ],
    functionName: "change",
    starterJS: `function change(amount, coins) {
  // Count number of combinations to make amount
  // Each coin can be used unlimited times

}`,
    starterPython: `def change(amount, coins):
    # Count number of combinations to make amount
    # Each coin can be used unlimited times
    pass`,
    solutionJS: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let j = coin; j <= amount; j++) {
      dp[j] += dp[j - coin];
    }
  }
  return dp[amount];
}`,
    timeComplexity: "O(amount × coins)",
    spaceComplexity: "O(amount)",
  },

  // ─── 6. Longest Increasing Subsequence ───
  {
    id: "lis",
    title: "Longest Increasing Subsequence",
    difficulty: "Medium",
    pattern: "1D Optimization",
    description:
      "Given an array of integers, return the length of the longest strictly increasing subsequence. A subsequence doesn't need to be contiguous.",
    examples: [
      "lengthOfLIS([10,9,2,5,3,7,101,18]) → 4  (e.g. [2,3,7,101])",
      "lengthOfLIS([0,1,0,3,2,3]) → 4  (e.g. [0,1,2,3])",
    ],
    constraints: ["1 ≤ nums.length ≤ 2500"],
    hints: [
      "dp[i] = length of longest increasing subsequence ending at index i. Every element alone is a subsequence of length 1.",
      "For each i, look at all j < i where nums[j] < nums[i]. dp[i] = max(dp[j] + 1) for all valid j.",
      "The answer is max(dp[0], dp[1], ..., dp[n-1]). The O(n²) solution is fine for interviews.",
    ],
    testCases: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4, label: "LIS([10,9,2,5,3,7,101,18]) = 4" },
      { input: [[0, 1, 0, 3, 2, 3]], expected: 4, label: "LIS([0,1,0,3,2,3]) = 4" },
      { input: [[7, 7, 7, 7]], expected: 1, label: "LIS([7,7,7,7]) = 1" },
      { input: [[1]], expected: 1, label: "LIS([1]) = 1" },
      { input: [[1, 3, 6, 7, 9, 4, 10, 5, 6]], expected: 6, label: "LIS([1,3,6,7,9,4,10,5,6]) = 6" },
    ],
    functionName: "lengthOfLIS",
    starterJS: `function lengthOfLIS(nums) {
  // Return length of longest strictly increasing subsequence

}`,
    starterPython: `def lengthOfLIS(nums):
    # Return length of longest strictly increasing subsequence
    pass`,
    solutionJS: `function lengthOfLIS(nums) {
  const n = nums.length;
  const dp = new Array(n).fill(1);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}`,
    timeComplexity: "O(n²)",
    spaceComplexity: "O(n)",
  },

  // ─── 7. Partition Equal Subset Sum ───
  {
    id: "partition-subset",
    title: "Partition Equal Subset Sum",
    difficulty: "Medium",
    pattern: "Include/Exclude",
    description:
      "Given an array of positive integers, determine if it can be partitioned into two subsets with equal sum.",
    examples: [
      "canPartition([1,5,11,5]) → true  ({1,5,5} and {11})",
      "canPartition([1,2,3,5]) → false",
    ],
    constraints: ["1 ≤ nums.length ≤ 200", "1 ≤ nums[i] ≤ 100"],
    hints: [
      "If total sum is odd, impossible. Otherwise find if a subset sums to total/2. This is a 0/1 Knapsack where capacity = sum/2.",
      "dp[j] = true if we can make sum j from the numbers seen so far. For each number, update from right to left.",
      "dp[0] = true. For each num: for j from target down to num: dp[j] = dp[j] || dp[j-num].",
    ],
    testCases: [
      { input: [[1, 5, 11, 5]], expected: true, label: "canPartition([1,5,11,5]) = true" },
      { input: [[1, 2, 3, 5]], expected: false, label: "canPartition([1,2,3,5]) = false" },
      { input: [[1, 1]], expected: true, label: "canPartition([1,1]) = true" },
      { input: [[3, 3, 3, 4, 5]], expected: true, label: "canPartition([3,3,3,4,5]) = true" },
      { input: [[1, 2, 5]], expected: false, label: "canPartition([1,2,5]) = false" },
    ],
    functionName: "canPartition",
    starterJS: `function canPartition(nums) {
  // Can the array be split into two equal-sum subsets?

}`,
    starterPython: `def canPartition(nums):
    # Can the array be split into two equal-sum subsets?
    pass`,
    solutionJS: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }
  return dp[target];
}`,
    timeComplexity: "O(n × sum)",
    spaceComplexity: "O(sum)",
  },

  // ─── 8. Minimum Path Sum ───
  {
    id: "min-path-sum",
    title: "Minimum Path Sum",
    difficulty: "Medium",
    pattern: "2D Optimization",
    description:
      "Given an m×n grid filled with non-negative numbers, find a path from top-left to bottom-right that minimizes the sum. You can only move right or down.",
    examples: [
      "minPathSum([[1,3,1],[1,5,1],[4,2,1]]) → 7  (1→3→1→1→1)",
      "minPathSum([[1,2,3],[4,5,6]]) → 12  (1→2→3→6)",
    ],
    constraints: ["1 ≤ m,n ≤ 200", "0 ≤ grid[i][j] ≤ 200"],
    hints: [
      "Same structure as Grid Paths but instead of counting, you minimize. dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).",
      "First row: can only come from the left. First column: can only come from above.",
      "Build the dp table row by row. The answer is dp[m-1][n-1].",
    ],
    testCases: [
      { input: [[[1,3,1],[1,5,1],[4,2,1]]], expected: 7, label: "minPathSum(3×3) = 7" },
      { input: [[[1,2,3],[4,5,6]]], expected: 12, label: "minPathSum(2×3) = 12" },
      { input: [[[5]]], expected: 5, label: "minPathSum(1×1) = 5" },
      { input: [[[1,2],[1,1]]], expected: 3, label: "minPathSum(2×2) = 3" },
      { input: [[[1,4,8,2],[5,3,1,6],[9,2,1,3]]], expected: 11, label: "minPathSum(3×4) = 11" },
    ],
    functionName: "minPathSum",
    starterJS: `function minPathSum(grid) {
  // Find path from top-left to bottom-right with minimum sum
  // Only move right or down

}`,
    starterPython: `def minPathSum(grid):
    # Find path from top-left to bottom-right with minimum sum
    # Only move right or down
    pass`,
    solutionJS: `function minPathSum(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = Array.from({length: m}, (_, i) => [...grid[i]]);
  for (let i = 1; i < m; i++) dp[i][0] += dp[i-1][0];
  for (let j = 1; j < n; j++) dp[0][j] += dp[0][j-1];
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      dp[i][j] += Math.min(dp[i-1][j], dp[i][j-1]);
  return dp[m-1][n-1];
}`,
    timeComplexity: "O(m×n)",
    spaceComplexity: "O(m×n)",
  },

  // ─── 9. Target Sum ───
  {
    id: "target-sum",
    title: "Target Sum",
    difficulty: "Medium",
    pattern: "Include/Exclude",
    description:
      "Given an array of integers and a target, assign + or - to each number so the sum equals the target. Return the count of ways.",
    examples: [
      "findTargetSumWays([1,1,1,1,1], 3) → 5",
      "findTargetSumWays([1], 1) → 1",
    ],
    constraints: ["1 ≤ nums.length ≤ 20", "0 ≤ nums[i] ≤ 1000", "|target| ≤ 1000"],
    hints: [
      "For each number, you either add it (+) or subtract it (-). This is include/exclude with a running sum.",
      "State: (index, currentSum). Memoize on both. At each step: count(i+1, sum+nums[i]) + count(i+1, sum-nums[i]).",
      "Base case: if i === nums.length, return currentSum === target ? 1 : 0.",
    ],
    testCases: [
      { input: [[1, 1, 1, 1, 1], 3], expected: 5, label: "findTargetSumWays([1,1,1,1,1], 3) = 5" },
      { input: [[1], 1], expected: 1, label: "findTargetSumWays([1], 1) = 1" },
      { input: [[1, 0], 1], expected: 2, label: "findTargetSumWays([1,0], 1) = 2" },
      { input: [[1, 2, 1], 0], expected: 2, label: "findTargetSumWays([1,2,1], 0) = 2" },
      { input: [[2, 3, 5, 7], 3], expected: 2, label: "findTargetSumWays([2,3,5,7], 3) = 2" },
    ],
    functionName: "findTargetSumWays",
    starterJS: `function findTargetSumWays(nums, target) {
  // Assign + or - to each number
  // Return count of ways to reach target

}`,
    starterPython: `def findTargetSumWays(nums, target):
    # Assign + or - to each number
    # Return count of ways to reach target
    pass`,
    solutionJS: `function findTargetSumWays(nums, target) {
  const memo = {};
  function dp(i, sum) {
    const key = i + ',' + sum;
    if (key in memo) return memo[key];
    if (i === nums.length) return sum === target ? 1 : 0;
    memo[key] = dp(i + 1, sum + nums[i]) + dp(i + 1, sum - nums[i]);
    return memo[key];
  }
  return dp(0, 0);
}`,
    timeComplexity: "O(n × sum)",
    spaceComplexity: "O(n × sum)",
  },

  // ─── 10. Edit Distance ───
  {
    id: "edit-distance",
    title: "Edit Distance",
    difficulty: "Hard",
    pattern: "2D Optimization",
    description:
      "Given two strings, return the minimum number of operations (insert, delete, replace a character) to convert one string into the other. This is a classic interview problem.",
    examples: [
      'minDistance("horse", "ros") → 3  (horse→rorse→rose→ros)',
      'minDistance("intention", "execution") → 5',
    ],
    constraints: ["0 ≤ word.length ≤ 500"],
    hints: [
      "dp[i][j] = min edits to convert word1[0..i-1] to word2[0..j-1]. If characters match, no edit needed.",
      "If word1[i-1] === word2[j-1]: dp[i][j] = dp[i-1][j-1]. Otherwise: 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
      "Base cases: dp[i][0] = i (delete all), dp[0][j] = j (insert all). Build the full m×n table.",
    ],
    testCases: [
      { input: ["horse", "ros"], expected: 3, label: 'minDistance("horse","ros") = 3' },
      { input: ["intention", "execution"], expected: 5, label: 'minDistance("intention","execution") = 5' },
      { input: ["", ""], expected: 0, label: 'minDistance("","") = 0' },
      { input: ["abc", "abc"], expected: 0, label: 'minDistance("abc","abc") = 0' },
      { input: ["a", "b"], expected: 1, label: 'minDistance("a","b") = 1' },
      { input: ["kitten", "sitting"], expected: 3, label: 'minDistance("kitten","sitting") = 3' },
    ],
    functionName: "minDistance",
    starterJS: `function minDistance(word1, word2) {
  // Min operations (insert, delete, replace) to convert word1 to word2

}`,
    starterPython: `def minDistance(word1, word2):
    # Min operations (insert, delete, replace) to convert word1 to word2
    pass`,
    solutionJS: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i-1] === word2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
      }
    }
  }
  return dp[m][n];
}`,
    timeComplexity: "O(m×n)",
    spaceComplexity: "O(m×n)",
  },
];
