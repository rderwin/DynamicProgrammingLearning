import type { TestCase } from "../engine/runCode";

export type ModuleId = "dp" | "graphs" | "backtracking" | "binary-search" | "sliding-window" | "heaps-greedy";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  color: {
    gradient: string;
    bg: string;
    text: string;
    accent: string;
    border: string;
  };
  topics: string[];
  status: "available" | "coming-soon";
  problemCount: number;
  practiceCount: number;
}

export interface ModuleExport {
  config: ModuleConfig;
  problems: ProblemEntry[];
  practice: PracticeProblem[];
  transitions: TransitionEntry[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LessonComponent: React.ComponentType<any> | null;
  IntroScreen: React.ComponentType<{ onStart: () => void }> | null;
  completionContent: ModuleCompletionContent | null;
}

export interface ProblemEntry {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any; // ProblemConfig varies per module's lesson type
  transitionAfter?: {
    viewId: string;
    content: TransitionContent;
    nextView: string;
  };
}

export interface TransitionContent {
  fromLabel: string;
  toLabel: string;
  recap: { title: string; points: string[] };
  concept: { term: string; definition: string; example: string };
  spotIt: { title: string; signs: string[] };
  preview: { title: string; description: string; whatsNew: string };
}

export interface TransitionEntry {
  viewId: string;
  content: TransitionContent;
  nextView: string;
}

export interface ModuleCompletionContent {
  title: string;
  subtitle: string;
  patterns: { name: string; problems: string; recurrence: string }[];
  recognition: string[];
}

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  patternColor: string;
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
