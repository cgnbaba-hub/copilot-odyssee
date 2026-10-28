interface XPBarProps {
  totalXp: number;
  currentLevel: number;
}

function xpForLevel(level: number): number {
  return level * level * 100;
}

export default function XPBar({ totalXp, currentLevel }: XPBarProps) {
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp    = xpForLevel(currentLevel + 1);
  const range          = nextLevelXp - currentLevelXp;
  const progress       = range > 0
    ? Math.min(100, Math.max(0, ((totalXp - currentLevelXp) / range) * 100))
    : 0;
  const xpToNext = Math.max(0, nextLevelXp - totalXp);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="font-pixel text-[7px] text-xp-green">{totalXp} XP</span>
        <span className="font-pixel text-[7px] text-gray-500">{xpToNext} to next</span>
      </div>
      <div className="progress-pixel w-full h-3">
        <div
          className="progress-fill h-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
