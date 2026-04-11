import { getLevel, getNextLevel, getLevelProgress, calculateStreak, ACHIEVEMENTS, type GamificationData } from "../engine/gamification";

interface Props {
  data: GamificationData;
}

export default function ProgressBar({ data }: Props) {
  const level = getLevel(data.xp);
  const nextLevel = getNextLevel(data.xp);
  const progress = getLevelProgress(data.xp);
  const streak = calculateStreak(data.activityDates);
  const unlockedCount = data.achievementsUnlocked.length;
  const totalAchievements = ACHIEVEMENTS.length;

  // Recent achievements (last 3)
  const recentAchievements = ACHIEVEMENTS.filter((a) =>
    data.achievementsUnlocked.includes(a.id)
  ).slice(-3);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Level badge */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
          <span className="text-white text-lg font-bold">{data.xp}</span>
        </div>

        {/* Level info + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${level.color}`}>{level.name}</span>
            {nextLevel && (
              <span className="text-[10px] text-slate-400">→ {nextLevel.name} at {nextLevel.minXP} XP</span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${level.gradient}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Streak */}
          {streak > 0 && (
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">{streak}</div>
              <div className="text-[9px] text-slate-400">day streak</div>
            </div>
          )}
          {/* Achievements */}
          <div className="text-center">
            <div className="text-lg font-bold text-violet-600">{unlockedCount}</div>
            <div className="text-[9px] text-slate-400">of {totalAchievements}</div>
          </div>
        </div>
      </div>

      {/* Recent achievements */}
      {recentAchievements.length > 0 && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          {recentAchievements.map((a) => (
            <div key={a.id} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1 text-[10px]">
              <span>{a.icon}</span>
              <span className="font-medium text-slate-600">{a.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
