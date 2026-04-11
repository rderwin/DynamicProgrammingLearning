import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { ModuleId } from "../modules/types";

// ─── Data shape stored per user ───

export interface LessonProgress {
  stage: string;
  challengePassed: boolean;
  code: { js: string; py: string };
}

export interface ModuleProgress {
  lessonProgress: Record<string, LessonProgress>;
  practiceCompleted: string[];
  practiceCode: Record<string, { js: string; py: string }>;
}

export interface UserData {
  modules: Partial<Record<ModuleId, ModuleProgress>>;
}

const DEFAULT_MODULE: ModuleProgress = {
  lessonProgress: {},
  practiceCompleted: [],
  practiceCode: {},
};

const DEFAULT_DATA: UserData = {
  modules: {},
};

// ─── Migration from old flat format ───

function migrateUserData(raw: Record<string, unknown>): UserData {
  // New format: has `modules` key
  if (raw.modules && typeof raw.modules === "object") {
    return raw as unknown as UserData;
  }
  // Old format: flat lessonProgress/practiceCompleted at top level
  if (raw.lessonProgress || raw.practiceCompleted || raw.practiceCode) {
    return {
      modules: {
        dp: {
          lessonProgress: (raw.lessonProgress as Record<string, LessonProgress>) || {},
          practiceCompleted: (raw.practiceCompleted as string[]) || [],
          practiceCode: (raw.practiceCode as Record<string, { js: string; py: string }>) || {},
        },
      },
    };
  }
  return { ...DEFAULT_DATA };
}

// ─── Helpers ───

export function getModuleProgress(data: UserData, moduleId: ModuleId): ModuleProgress {
  return data.modules[moduleId] ?? { ...DEFAULT_MODULE, lessonProgress: {}, practiceCompleted: [], practiceCode: {} };
}

export function updateModuleProgress(
  data: UserData,
  moduleId: ModuleId,
  update: Partial<ModuleProgress>
): UserData {
  const existing = getModuleProgress(data, moduleId);
  return {
    ...data,
    modules: {
      ...data.modules,
      [moduleId]: { ...existing, ...update },
    },
  };
}

// ─── Firestore operations ───

export async function loadUserData(uid: string): Promise<UserData> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return migrateUserData(snap.data() as Record<string, unknown>);
    }
    return { ...DEFAULT_DATA };
  } catch (err) {
    console.error("Failed to load user data:", err);
    return { ...DEFAULT_DATA };
  }
}

export async function saveUserData(uid: string, data: UserData): Promise<void> {
  try {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  } catch (err) {
    console.error("Failed to save user data:", err);
  }
}

// ─── Debounced save ───

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingData: { uid: string; data: UserData } | null = null;

export function debouncedSave(uid: string, data: UserData, delayMs = 1500): void {
  pendingData = { uid, data };
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (pendingData) {
      saveUserData(pendingData.uid, pendingData.data);
      pendingData = null;
    }
  }, delayMs);
}

export function flushPendingSave(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  if (pendingData) {
    saveUserData(pendingData.uid, pendingData.data);
    pendingData = null;
  }
}

// ─── LocalStorage fallback ───

const LS_KEY = "interview-prep-local";

export function loadLocalData(): UserData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      return migrateUserData(JSON.parse(raw));
    }
    // Try old key
    const oldKey = localStorage.getItem("dp-learning-local");
    if (oldKey) {
      return migrateUserData(JSON.parse(oldKey));
    }
    // Try even older key
    const veryOldKey = localStorage.getItem("dp-practice-completed");
    if (veryOldKey) {
      const completed = JSON.parse(veryOldKey) as string[];
      return { modules: { dp: { ...DEFAULT_MODULE, practiceCompleted: completed } } };
    }
  } catch {}
  return { ...DEFAULT_DATA };
}

export function saveLocalData(data: UserData): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}
