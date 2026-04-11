import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getModuleProgress } from "../services/userDataService";
import type { UserData } from "../services/userDataService";
import type { ModuleConfig } from "../modules/types";

interface Props {
  userData: UserData;
  onReset: () => void;
  moduleConfigs: ModuleConfig[];
  onHome: () => void;
}

export default function AccountPage({ userData, onReset, moduleConfigs, onHome }: Props) {
  const { user, signOut } = useAuth();
  const [showResetGate, setShowResetGate] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={onHome} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        All modules
      </button>

      {/* Profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-slate-900/50 mb-6 text-center">
        {user.photoURL && (
          <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
        )}
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.displayName}</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500">{user.email}</p>
      </div>

      {/* Per-module progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm dark:shadow-slate-900/50 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Progress by module</h3>
        <div className="space-y-4">
          {moduleConfigs.map((mod) => {
            const progress = getModuleProgress(userData, mod.id);
            const lessonsCompleted = Object.values(progress.lessonProgress).filter((l) => l.challengePassed).length;
            const practiceCompleted = progress.practiceCompleted.length;
            const total = mod.problemCount + mod.practiceCount;
            const completed = lessonsCompleted + practiceCompleted;
            const pct = total > 0 ? (completed / total) * 100 : 0;

            return (
              <div key={mod.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${mod.color.gradient} flex items-center justify-center`}>
                      <span className="text-white text-[10px] font-bold">{mod.shortTitle[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{mod.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {completed}/{total}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${mod.color.gradient}`} style={{ width: `${pct}%` }} />
                </div>
                {(lessonsCompleted > 0 || practiceCompleted > 0) && (
                  <div className="flex gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    {lessonsCompleted > 0 && <span>{lessonsCompleted} lessons</span>}
                    {practiceCompleted > 0 && <span>{practiceCompleted} practice</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {!showResetGate ? (
          <button onClick={() => setShowResetGate(true)} className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 hover:border-red-300 dark:hover:border-red-800 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 14.652" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Reset all progress</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Clear all modules, practice, and saved code</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
            <p className="text-sm font-semibold text-red-700 mb-1">Are you sure?</p>
            <p className="text-xs text-red-500 mb-4">This will permanently delete all progress across all modules.</p>
            <div className="flex gap-2">
              <button onClick={() => { onReset(); setShowResetGate(false); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">Yes, reset everything</button>
              <button onClick={() => setShowResetGate(false)} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <button onClick={signOut} className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sign out</p>
          </div>
        </button>
      </div>
    </div>
  );
}
