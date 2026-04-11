import type { ModuleExport } from "../types";
import { modules } from "../registry";

export const heapsUgreedyModule: ModuleExport = {
  config: modules.find((m) => m.id === "heaps-greedy")!,
  problems: [],
  practice: [],
  transitions: [],
  LessonComponent: null,
  IntroScreen: null,
  completionContent: null,
};
