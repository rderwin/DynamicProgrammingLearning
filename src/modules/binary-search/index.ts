import type { ModuleExport } from "../types";
import { modules } from "../registry";

export const binaryUsearchModule: ModuleExport = {
  config: modules.find((m) => m.id === "binary-search")!,
  problems: [],
  practice: [],
  transitions: [],
  LessonComponent: null,
  IntroScreen: null,
  completionContent: null,
};
