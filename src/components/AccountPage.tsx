import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { UserData } from "../services/userDataService";

interface Props {
  userData: UserData;
  onReset: () => void;
  totalLessons: number;
  totalPractice: number;
}

export default function AccountPage({ userData, onReset, totalLessons, totalPractice }: Props) {
  const { user, signOut } = useAuth();
  const [showResetGate, setShowResetGate] = useState(false);

  if (!user) return null;

  const lessonsCompleted = Object.values(userData.lessonProgress).filter((l) => l.challengePassed).length;
  const practiceCompleted = userData.practiceCompleted.length;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Profile */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 text-center">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-slate-200"
            referrerPolicy="no-referrer"
          />
        )}
        <h2 className="text-lg font-bold text-slate-900">{user.displayName}</h2>
        <p className="text-sm text-slate-400">{user.email}</p>
      </div>

      {/* Progress summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Progress</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{lessonsCompleted}/{totalLessons}</div>
            <div className="text-xs text-blue-500 mt-1">Lessons completed</div>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-700">{practiceCompleted}/{totalPractice}</div>
            <div className="text-xs text-violet-500 mt-1">Practice solved</div>
          </div>
        </div>

        {/* Per-lesson status */}
        {Object.keys(userData.lessonProgress).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {Object.entries(userData.lessonProgress).map(([id, prog]) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 capitalize">{id}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{prog.stage}</span>
                  {prog.challengePassed && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Solved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Reset */}
        {!showResetGate ? (
          <button
            onClick={() => setShowResetGate(true)}
            className="w-full text-left bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-red-300 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 14.652" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Reset all progress</p>
                <p className="text-xs text-slate-400">Clear all lessons, practice, and saved code</p>
              </div>
            </div>
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
            <p className="text-sm font-semibold text-red-700 mb-1">Are you sure?</p>
            <p className="text-xs text-red-500 mb-4">
              This will permanently delete all your progress, saved code, and practice completions. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onReset(); setShowResetGate(false); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setShowResetGate(false)}
                className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full text-left bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">Sign out</p>
          </div>
        </button>
      </div>
    </div>
  );
}
