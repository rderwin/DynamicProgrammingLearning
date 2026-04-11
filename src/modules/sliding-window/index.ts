import type { ModuleExport } from "../types";
import { modules } from "../registry";

export const slidingUwindowModule: ModuleExport = {
  config: modules.find((m) => m.id === "sliding-window")!,
  problems: [],
  practice: [],
  transitions: [],
  LessonComponent: null,
  IntroScreen: null,
  completionContent: null,
};
