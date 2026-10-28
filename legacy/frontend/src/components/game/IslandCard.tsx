import { useTranslation } from 'react-i18next';
import type { Island, IslandStatus } from '../../types';

interface IslandCardProps {
  island: Island;
  onClick?: () => void;
}

const STATUS_LABEL: Record<IslandStatus, string> = {
  locked:      'map.locked',
  available:   'map.available',
  in_progress: 'map.inProgress',
  completed:   'map.completed',
};

const STATUS_COLOR: Record<IslandStatus, string> = {
  locked:      'bg-gray-700 text-gray-400',
  available:   'bg-accent-blue text-white',
  in_progress: 'bg-xp-gold text-black',
  completed:   'bg-xp-green text-black',
};

export default function IslandCard({ island, onClick }: IslandCardProps) {
  const { t, i18n } = useTranslation();
  const lang       = i18n.language.startsWith('de') ? 'de' : 'en';
  const name       = lang === 'de' ? island.name_de : island.name_en;
  const status     = island.status ?? 'locked';
  const locked     = status === 'locked';
  const completion = island.completion_percentage ?? 0;

  return (
    <div
      className={['island-card bg-accent-teal', locked ? 'locked' : ''].join(' ')}
      onClick={!locked ? onClick : undefined}
      role={!locked ? 'button' : undefined}
      tabIndex={!locked ? 0 : undefined}
      onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) onClick?.(); }}
    >
      {/* Island visual */}
      <div
        className="w-full h-20 flex items-center justify-center border-b-2 border-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${island.color_primary}44 0%, ${island.color_secondary || island.color_primary}22 100%)`,
        }}
      >
        <div
          className="w-14 h-14 border-2 border-white shadow-pixel flex items-center justify-center"
          style={{ backgroundColor: island.color_primary }}
        >
          {island.guardian_defeated && (
            <span className="font-pixel text-[8px] text-black">DONE</span>
          )}
        </div>
        {locked && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="font-pixel text-[10px] text-gray-400">LOCK</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="font-pixel text-[9px] text-white mb-2 leading-tight line-clamp-2">{name}</div>

        <span className={['badge-pixel text-[7px] mb-2 inline-block', STATUS_COLOR[status]].join(' ')}>
          {t(STATUS_LABEL[status])}
        </span>

        {status !== 'locked' && (
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="font-pixel text-[7px] text-gray-400">{t('island.progress')}</span>
              <span className="font-pixel text-[7px] text-xp-green">{completion}%</span>
            </div>
            <div className="progress-pixel h-2">
              <div className="progress-fill h-full" style={{ width: `${completion}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
