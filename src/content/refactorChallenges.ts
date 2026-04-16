import type { RefactorChallenge } from "../components/CodeRefactor";

export const refactorChallenges: RefactorChallenge[] = [
  {
    id: "refactor-1",
    title: "Two Sum: O(n²) → O(n)",
    description: "This brute force two sum checks every pair. Optimize it using a hash map.",
    originalCode: `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target)
        return [i, j];
    }
  }
  return [];
}`,
    originalComplexity: "O(n²)",
    targetComplexity: "O(n)",
    functionName: "twoSum",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], label: "twoSum([2,7,11,15], 9)" },
      { input: [[3, 2, 4], 6], expected: [1, 2], label: "twoSum([3,2,4], 6)" },
      { input: [[3, 3], 6], expected: [0, 1], label: "twoSum([3,3], 6)" },
    ],
    starterJS: `function twoSum(nums, target) {\n  // Optimize to O(n) using a hash map\n\n}`,
    hint: "As you iterate, store each number's index in a map. For each number, check if (target - number) is already in the map.",
    solutionJS: `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in map) return [map[complement], i];
    map[nums[i]] = i;
  }
  return [];
}`,
    difficulty: "Medium",
  },
  {
    id: "refactor-2",
    title: "Has Duplicate: O(n²) → O(n)",
    description: "This checks every pair for duplicates. Use a Set instead.",
    originalCode: `function hasDuplicate(nums) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) return true;
    }
  }
  return false;
}`,
    originalComplexity: "O(n²)",
    targetComplexity: "O(n)",
    functionName: "hasDuplicate",
    testCases: [
      { input: [[1, 2, 3, 1]], expected: true, label: "has dup" },
      { input: [[1, 2, 3, 4]], expected: false, label: "no dup" },
    ],
    starterJS: `function hasDuplicate(nums) {\n  // Optimize to O(n) using a Set\n\n}`,
    hint: "A Set can check membership in O(1). Add each element, if it's already there → duplicate.",
    solutionJS: `function hasDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}`,
    difficulty: "Medium",
  },
  {
    id: "refactor-3",
    title: "Fibonacci: O(2^n) → O(n)",
    description: "Classic exponential Fibonacci. Add memoization or go bottom-up.",
    originalCode: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    originalComplexity: "O(2^n)",
    targetComplexity: "O(n)",
    functionName: "fib",
    testCases: [
      { input: [0], expected: 0, label: "fib(0)" },
      { input: [10], expected: 55, label: "fib(10)" },
      { input: [40], expected: 102334155, label: "fib(40) — must be fast!" },
    ],
    starterJS: `function fib(n) {\n  // Optimize to O(n)\n\n}`,
    hint: "Either add a memo object and pass it through recursive calls, or build bottom-up with a dp array.",
    solutionJS: `function fib(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
    difficulty: "Medium",
  },
  {
    id: "refactor-4",
    title: "Max Subarray: O(n²) → O(n)",
    description: "This brute force checks all subarrays. Use Kadane's algorithm.",
    originalCode: `function maxSubArray(nums) {
  let max = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      max = Math.max(max, sum);
    }
  }
  return max;
}`,
    originalComplexity: "O(n²)",
    targetComplexity: "O(n)",
    functionName: "maxSubArray",
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, label: "mixed" },
      { input: [[1]], expected: 1, label: "single" },
      { input: [[-1, -2, -3]], expected: -1, label: "all negative" },
    ],
    starterJS: `function maxSubArray(nums) {\n  // Kadane's algorithm: O(n)\n\n}`,
    hint: "Track current sum. If it goes negative, reset to 0 (start fresh). Always update the max.",
    solutionJS: `function maxSubArray(nums) {
  let current = nums[0], max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    max = Math.max(max, current);
  }
  return max;
}`,
    difficulty: "Medium",
  },
];
