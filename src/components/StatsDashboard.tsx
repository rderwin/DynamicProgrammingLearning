import { useMemo } from "react";
import type { UserData } from "../services/userDataService";
import type { ModuleConfig } from "../modules/types";
import { getLevel, getNextLevel, calculateStreak, ACHIEVEMENTS } from "../engine/gamification";
import { getModuleProgress } from "../services/userDataService";

interface Props {
  userData: UserData;
  moduleConfigs: ModuleConfig[];
  onBack: () => void;
}

const trainingActivityLabels: Record<string, { name: string; icon: string }> = {
  "quiz-dp": { name: "DP Pattern Quiz", icon: "🎯" },
  "quiz-graphs": { name: "Graph Pattern Quiz", icon: "🗺️" },
  "quiz-mixed": { name: "Mixed Patterns", icon: "🧩" },
  "bugs-dp": { name: "DP Bug Hunt", icon: "🔍" },
  "bugs-graphs": { name: "Graph Bug Hunt", icon: "🐛" },
  "speed": { name: "Speed Drill", icon: "⏱️" },
  "cards": { name: "Concept Review", icon: "🧠" },
  "complexity": { name: "Complexity Estimator", icon: "📊" },
  "predict": { name: "What Comes Next?", icon: "🔮" },
  "race": { name: "Algorithm Race", icon: "🏁" },
  "refactor": { name: "Optimize This", icon: "🔧" },
  "interview": { name: "Mock Interview", icon: "🎤" },
};

export default function StatsDashboard({ userData, moduleConfigs, onBack }: Props) {
  const stats = useMemo(() => {
    // Gamification
    const level = getLevel(userData.gamification.xp);
    const nextLevel = getNextLevel(userData.gamification.xp);
    const streak = calculateStreak(userData.gamification.activityDates);
    const activeDays = new Set(userData.gamification.activityDates).size;

    // Module progress
    let totalLessons = 0, completedLessons = 0;
    let totalPractice = 0, completedPractice = 0;
    let totalChallenges = 0, passedChallenges = 0;

    const moduleStats = moduleConfigs.map((mod) => {
      const progress = getModuleProgress(userData, mod.id);
      const lessonsDone = Object.values(progress.lessonProgress).filter((l) => l.challengePassed).length;
      const practiceDone = progress.practiceCompleted.length;

      totalLessons += mod.problemCount;
      completedLessons += lessonsDone;
      totalPractice += mod.practiceCount;
      completedPractice += practiceDone;

      // Challenges = total code challenges across lessons + practice
      totalChallenges += mod.problemCount + mod.practiceCount;
      passedChallenges += lessonsDone + practiceDone;

      return {
        ...mod,
        lessonsDone,
        practiceDone,
        totalLessons: mod.problemCount,
        totalPractice: mod.practiceCount,
        pct: mod.problemCount + mod.practiceCount > 0
          ? ((lessonsDone + practiceDone) / (mod.problemCount + mod.practiceCount)) * 100
          : 0,
      };
    });

    // Training scores
    const trainingScores = userData.trainingScores ?? {};
    const trainingEntries = Object.entries(trainingScores);
    const totalTrainingAttempts = trainingEntries.reduce((s, [, ts]) => s + ts.attempts, 0);
    const avgTrainingAccuracy = trainingEntries.length > 0
      ? trainingEntries.reduce((s, [, ts]) => s + (ts.best / Math.max(ts.total, 1)), 0) / trainingEntries.length * 100
      : 0;

    // Activity heat map (last 30 days)
    const today = new Date();
    const heatmapDays: { date: string; active: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      heatmapDays.push({ date: dateStr, active: userData.gamification.activityDates.includes(dateStr) });
    }

    return {
      level, nextLevel, streak, activeDays,
      moduleStats,
      totalLessons, completedLessons, totalPractice, completedPractice,
      totalChallenges, passedChallenges,
      totalAchievements: ACHIEVEMENTS.length,
      unlockedAchievements: userData.gamification.achievementsUnlocked.length,
      trainingEntries,
      totalTrainingAttempts,
      avgTrainingAccuracy,
      heatmapDays,
    };
  }, [userData, moduleConfigs]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">Your Stats</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Everything you've done so far</p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon="⭐" label="XP" value={userData.gamification.xp.toString()} sub={stats.level.name} color="from-blue-500 to-violet-600" />
        <StatCard icon="🔥" label="Day streak" value={stats.streak.toString()} sub={`${stats.activeDays} total days`} color="from-orange-500 to-red-600" />
        <StatCard icon="✓" label="Challenges" value={`${stats.passedChallenges}/${stats.totalChallenges}`} sub={`${Math.round((stats.passedChallenges / Math.max(stats.totalChallenges, 1)) * 100)}% complete`} color="from-emerald-500 to-teal-600" />
        <StatCard icon="🏆" label="Achievements" value={`${stats.unlockedAchievements}/${stats.totalAchievements}`} sub="badges earned" color="from-amber-500 to-orange-600" />
      </div>

      {/* Level progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Level Progress</h3>
          <span className={`text-xs font-mono ${stats.level.color}`}>{stats.level.name}</span>
        </div>
        {stats.nextLevel ? (
          <>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stats.level.gradient} transition-all duration-700`}
                style={{ width: `${((userData.gamification.xp - stats.level.minXP) / (stats.nextLevel.minXP - stats.level.minXP)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {stats.nextLevel.minXP - userData.gamification.xp} XP until <strong className={stats.nextLevel.color}>{stats.nextLevel.name}</strong>
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">🎉 You've reached the highest level!</p>
        )}
      </div>

      {/* Activity heatmap (last 30 days) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Last 30 days</h3>
        <div className="flex gap-1 flex-wrap">
          {stats.heatmapDays.map((d) => (
            <div
              key={d.date}
              className={`w-5 h-5 rounded-sm ${d.active ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-slate-100 dark:bg-slate-800"}`}
              title={`${d.date}${d.active ? " — active" : ""}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 dark:text-slate-500">
          <span>30 days ago</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600" />
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </div>

      {/* Module progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Module Progress</h3>
        <div className="space-y-4">
          {stats.moduleStats.map((m) => (
            <div key={m.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${m.color.gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-[10px] font-bold">{m.shortTitle[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.title}</span>
                  {m.status === "coming-soon" && (
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">Coming Soon</span>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {m.lessonsDone + m.practiceDone}/{m.totalLessons + m.totalPractice}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${m.color.gradient} transition-all duration-500`} style={{ width: `${m.pct}%` }} />
              </div>
              {(m.lessonsDone > 0 || m.practiceDone > 0) && (
                <div className="flex gap-3 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {m.lessonsDone > 0 && <span>{m.lessonsDone}/{m.totalLessons} lessons</span>}
                  {m.practiceDone > 0 && <span>{m.practiceDone}/{m.totalPractice} practice</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Training scores */}
      {stats.trainingEntries.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Training Scores</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">{stats.totalTrainingAttempts} attempts • avg {Math.round(stats.avgTrainingAccuracy)}%</span>
          </div>
          <div className="space-y-2">
            {stats.trainingEntries.sort((a, b) => b[1].lastAttemptAt - a[1].lastAttemptAt).map(([id, score]) => {
              const meta = trainingActivityLabels[id];
              if (!meta) return null;
              const pct = Math.round((score.best / Math.max(score.total, 1)) * 100);
              return (
                <div key={id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{meta.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{score.attempts} attempt{score.attempts > 1 ? "s" : ""}</span>
                  <div className={`font-mono font-bold text-sm ${pct >= 80 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                    {score.best}/{score.total} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Achievements ({stats.unlockedAchievements}/{stats.totalAchievements})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = userData.gamification.achievementsUnlocked.includes(a.id);
            return (
              <div key={a.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${unlocked ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 opacity-60"}`}>
                <span className={`text-lg ${unlocked ? "" : "grayscale"}`}>{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{a.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">{unlocked ? `+${a.xpReward} XP` : a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Summary</p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          You've earned <strong>{userData.gamification.xp} XP</strong> and are currently <strong>{stats.level.name}</strong>.
          You've passed <strong>{stats.passedChallenges} code challenges</strong> across{" "}
          <strong>{stats.moduleStats.filter(m => m.lessonsDone > 0 || m.practiceDone > 0).length} module{stats.moduleStats.filter(m => m.lessonsDone > 0 || m.practiceDone > 0).length !== 1 ? "s" : ""}</strong>
          {stats.totalTrainingAttempts > 0 && (
            <> and done <strong>{stats.totalTrainingAttempts} training exercises</strong> with <strong>{Math.round(stats.avgTrainingAccuracy)}% average accuracy</strong></>
          )}.
          {stats.streak >= 3 && <> You've been active <strong>{stats.streak} days in a row</strong> 🔥</>}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100 font-mono">{value}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}
