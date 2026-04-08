import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// ─── Data shape stored per user ───

export interface LessonProgress {
  stage: string;
  challengePassed: boolean;
  code: { js: string; py: string };
}

export interface UserData {
  lessonProgress: Record<string, LessonProgress>;
  practiceCompleted: string[];
  practiceCode: Record<string, { js: string; py: string }>;
}

const DEFAULT_DATA: UserData = {
  lessonProgress: {},
  practiceCompleted: [],
  practiceCode: {},
};

// ─── Firestore operations ───

export async function loadUserData(uid: string): Promise<UserData> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data() as Partial<UserData>;
      return { ...DEFAULT_DATA, ...data };
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

// ─── Debounced save (prevents hammering Firestore on every keystroke) ───

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

// Force flush any pending save (call on sign-out or page unload)
export function flushPendingSave(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  if (pendingData) {
    saveUserData(pendingData.uid, pendingData.data);
    pendingData = null;
  }
}

// ─── LocalStorage fallback (for non-logged-in users) ───

const LS_KEY = "dp-learning-local";

export function loadLocalData(): UserData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Partial<UserData>;
      return { ...DEFAULT_DATA, ...data };
    }
    // Migrate old practice-only key
    const oldKey = localStorage.getItem("dp-practice-completed");
    if (oldKey) {
      const completed = JSON.parse(oldKey) as string[];
      return { ...DEFAULT_DATA, practiceCompleted: completed };
    }
  } catch {}
  return { ...DEFAULT_DATA };
}

export function saveLocalData(data: UserData): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}
