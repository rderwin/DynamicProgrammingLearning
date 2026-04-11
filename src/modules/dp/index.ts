import type { ModuleExport, ProblemEntry } from "../types";
import { fibonacciConfig } from "./problems/configs/fibonacci";
import { climbingStairsConfig } from "./problems/configs/climbingStairs";
import { gridPathsConfig } from "./problems/configs/gridPaths";
import { coinChangeConfig } from "./problems/configs/coinChange";
import { knapsackConfig } from "./problems/configs/knapsack";
import { fibToStairs, stairsToGrid, gridToCoins, coinsToKnapsack, completionContent } from "./content/transitions";
import { practiceProblems } from "./practice/problems";
import TreeLesson from "../../components/TreeLesson";
import DPIntroScreen from "./IntroScreen";

const problems: ProblemEntry[] = [
  { id: "fibonacci", label: "Fibonacci", config: fibonacciConfig, transitionAfter: { viewId: "t-fib-stairs", content: fibToStairs, nextView: "stairs" } },
  { id: "stairs", label: "Climbing Stairs", config: climbingStairsConfig, transitionAfter: { viewId: "t-stairs-grid", content: stairsToGrid, nextView: "grid" } },
  { id: "grid", label: "Grid Paths", config: gridPathsConfig, transitionAfter: { viewId: "t-grid-coins", content: gridToCoins, nextView: "coins" } },
  { id: "coins", label: "Coin Change", config: coinChangeConfig, transitionAfter: { viewId: "t-coins-knapsack", content: coinsToKnapsack, nextView: "knapsack" } },
  { id: "knapsack", label: "Knapsack", config: knapsackConfig },
];

// Map practice problems to the module format (add patternColor)
const patternColors: Record<string, string> = {
  "1D Counting": "bg-blue-100 text-blue-700",
  "2D Counting": "bg-violet-100 text-violet-700",
  "1D Optimization": "bg-cyan-100 text-cyan-700",
  "2D Optimization": "bg-pink-100 text-pink-700",
  "Include/Exclude": "bg-orange-100 text-orange-700",
};

const practice = practiceProblems.map((p) => ({
  ...p,
  patternColor: patternColors[p.pattern] ?? "bg-slate-100 text-slate-700",
}));

export const dpModule: ModuleExport = {
  config: {
    id: "dp",
    title: "Dynamic Programming",
    shortTitle: "DP",
    tagline: "It's just remembering answers you already figured out",
    description: "Master the most feared interview topic.",
    color: {
      gradient: "from-blue-500 to-violet-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      accent: "bg-blue-500",
      border: "border-blue-200",
    },
    topics: ["Fibonacci", "Climbing Stairs", "Grid Paths", "Coin Change", "Knapsack"],
    status: "available",
    problemCount: 5,
    practiceCount: 10,
  },
  problems,
  practice,
  transitions: [],
  LessonComponent: TreeLesson,
  IntroScreen: DPIntroScreen,
  completionContent: completionContent,
};
