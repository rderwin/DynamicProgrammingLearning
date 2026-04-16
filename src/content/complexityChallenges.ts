import type { ComplexityChallenge } from "../components/ComplexityEstimator";

export const complexityChallenges: ComplexityChallenge[] = [
  {
    id: "cx-1",
    code: `function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}`,
    language: "js",
    correctTime: "O(n)",
    correctSpace: "O(1)",
    explanation: "One loop through n elements = O(n) time. Only a single variable `total` = O(1) space.",
    difficulty: "Easy",
  },
  {
    id: "cx-2",
    code: `function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}`,
    language: "js",
    correctTime: "O(n²)",
    correctSpace: "O(1)",
    explanation: "Nested loops where both iterate up to n = O(n²). No extra data structures = O(1) space. A Set-based approach would be O(n) time but O(n) space.",
    difficulty: "Easy",
  },
  {
    id: "cx-3",
    code: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    language: "js",
    correctTime: "O(log n)",
    correctSpace: "O(1)",
    explanation: "Each iteration halves the search space: n → n/2 → n/4 → ... → 1. That's log₂(n) iterations. Only pointer variables = O(1) space.",
    difficulty: "Easy",
  },
  {
    id: "cx-4",
    code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    language: "js",
    correctTime: "O(2^n)",
    correctSpace: "O(n)",
    explanation: "Each call branches into 2 subcalls, creating a binary tree of height n = O(2^n) time. The call stack goes n deep = O(n) space. This is why memoization matters!",
    difficulty: "Medium",
  },
  {
    id: "cx-5",
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right); // O(n) merge
}`,
    language: "js",
    correctTime: "O(n log n)",
    correctSpace: "O(n)",
    explanation: "Divides into 2 halves (log n levels), merges n elements at each level = O(n log n). Creates new arrays at each level = O(n) space.",
    difficulty: "Medium",
  },
  {
    id: "cx-6",
    code: `function twoSum(nums, target) {
  const map = {};
  for (const num of nums) {
    if (target - num in map) return true;
    map[num] = true;
  }
  return false;
}`,
    language: "js",
    correctTime: "O(n)",
    correctSpace: "O(n)",
    explanation: "One pass through n elements = O(n) time. The hash map can store up to n entries = O(n) space. This is the classic time-space tradeoff vs the O(n²) brute force.",
    difficulty: "Easy",
  },
  {
    id: "cx-7",
    code: `function dpGrid(m, n) {
  const dp = Array.from({length: m},
    () => new Array(n).fill(0));
  dp[0][0] = 1;
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      if (i > 0) dp[i][j] += dp[i-1][j];
      if (j > 0) dp[i][j] += dp[i][j-1];
  return dp[m-1][n-1];
}`,
    language: "js",
    correctTime: "O(n²)",
    correctSpace: "O(n²)",
    explanation: "Double loop through m×n grid = O(m×n). For a square grid (m=n), that's O(n²). The dp array is m×n = O(n²) space. Could be optimized to O(n) space with a 1D array.",
    difficulty: "Medium",
  },
  {
    id: "cx-8",
    code: `function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0,i), ...arr.slice(i+1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}`,
    language: "js",
    correctTime: "O(n!)",
    correctSpace: "O(n!)",
    explanation: "Generates all n! permutations. Each permutation takes O(n) to construct. Total: O(n × n!). Storing all permutations = O(n × n!) ≈ O(n!) space.",
    difficulty: "Hard",
  },
];
