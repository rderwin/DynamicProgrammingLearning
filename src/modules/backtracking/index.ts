import type { ModuleExport } from "../types";
import { modules } from "../registry";

export const backtrackingModule: ModuleExport = {
  config: modules.find((m) => m.id === "backtracking")!,
  problems: [],
  practice: [],
  transitions: [],
  LessonComponent: null,
  IntroScreen: null,
  completionContent: null,
};
