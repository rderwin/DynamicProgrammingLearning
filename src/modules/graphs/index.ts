import type { ModuleExport } from "../types";
import { modules } from "../registry";

export const graphsModule: ModuleExport = {
  config: modules.find((m) => m.id === "graphs")!,
  problems: [],
  practice: [],
  transitions: [],
  LessonComponent: null,
  IntroScreen: null,
  completionContent: null,
};
