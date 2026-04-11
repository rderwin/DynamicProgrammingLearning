import type { Achievement } from "../engine/gamification";

interface Props {
  achievement: Achievement;
}

export default function AchievementToast({ achievement }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] achievement-toast">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 px-5 py-4 flex items-center gap-4 min-w-[300px]">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          {achievement.icon}
        </div>
        <div>
          <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mb-0.5">Achievement Unlocked</p>
          <p className="text-sm font-bold text-slate-800">{achievement.title}</p>
          <p className="text-xs text-slate-500">{achievement.description}</p>
        </div>
        <div className="text-xs font-bold text-emerald-600 flex-shrink-0">
          +{achievement.xpReward} XP
        </div>
      </div>
    </div>
  );
}
