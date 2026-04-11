import type { TestCase } from "../../../engine/runCode";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type DPPattern =
  | "1D Counting"
  | "2D Counting"
  | "1D Optimization"
  | "2D Optimization"
  | "Include/Exclude";

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: DPPattern;
  description: string;
  examples: string[];
  constraints: string[];
  hints: string[];
  testCases: TestCase[];
  starterJS: string;
  starterPython: string;
  functionName: string;
  solutionJS: string;
  solutionPython: string;
  timeComplexity: string;
  spaceComplexity: string;
}
