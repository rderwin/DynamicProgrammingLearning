/**
 * A small "+N XP" badge that slides in + fades out to signal XP earned.
 * Shown above the achievement toast slot so they can coexist without overlap.
 * The parent controls visibility via a keyed prop so rapid successive awards
 * retrigger the animation.
 */
interface Props {
  amount: number;
  /** Unique instance id — changing this retriggers the animation. */
  instanceId: number;
}

export default function XPToast({ amount, instanceId }: Props) {
  return (
    <div
      key={instanceId}
      className="fixed bottom-24 right-6 z-[80] pointer-events-none xp-toast"
    >
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full px-4 py-2 shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
        <span className="text-base">⭐</span>
        <span className="text-sm font-bold font-mono">+{amount} XP</span>
      </div>
    </div>
  );
}
