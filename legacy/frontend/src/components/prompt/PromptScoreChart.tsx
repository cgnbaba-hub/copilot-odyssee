import { useTranslation } from 'react-i18next';

interface PromptScoreChartProps {
  clarity:    number;
  context:    number;
  accuracy:   number;
  efficiency: number;
  total:      number;
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-[8px] text-gray-300">{label}</span>
        <span className="font-pixel text-[9px] font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="progress-pixel h-4 relative">
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 8px)',
          }}
        />
        <span
          className="absolute right-1 top-0 font-pixel text-[7px] text-white leading-4"
          style={{ mixBlendMode: 'difference' }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

export default function PromptScoreChart({
  clarity, context, accuracy, efficiency, total,
}: PromptScoreChartProps) {
  const { t } = useTranslation();

  const totalColor =
    total >= 80 ? '#00FF00' :
    total >= 60 ? '#FFD700' :
    total >= 40 ? '#FF6B35' : '#FF4444';

  const bars = [
    { label: t('prompt.scores.clarity'),    value: clarity,    color: '#7B68EE' },
    { label: t('prompt.scores.context'),    value: context,    color: '#FF6B35' },
    { label: t('prompt.scores.accuracy'),   value: accuracy,   color: '#FF1493' },
    { label: t('prompt.scores.efficiency'), value: efficiency, color: '#00CCFF' },
  ];

  return (
    <div>
      {bars.map(b => <Bar key={b.label} {...b} />)}
      <div className="border-t-2 border-white pt-4 mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-pixel text-[10px] text-xp-gold">{t('prompt.scores.total')}</span>
          <span className="font-pixel text-[14px]" style={{ color: totalColor }}>{total}</span>
        </div>
        <div className="progress-pixel h-5">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, total))}%`,
              backgroundColor: totalColor,
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 8px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
