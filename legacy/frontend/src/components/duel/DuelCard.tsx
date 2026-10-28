import { useTranslation } from 'react-i18next';
import type { Duel } from '../../types';
import PixelButton from '../common/PixelButton';

interface DuelCardProps {
  duel: Duel;
  currentUserId: string;
  onSubmit?: (id: string) => void;
  onViewResult?: (id: string) => void;
}

const STATUS_COLOR: Record<string, string> = {
  pending:       'bg-accent-blue text-white',
  waiting_for_b: 'bg-xp-gold text-black',
  completed:     'bg-xp-green text-black',
  expired:       'bg-gray-700 text-gray-400',
};

export default function DuelCard({ duel, currentUserId, onSubmit, onViewResult }: DuelCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';

  const isPlayerA  = duel.player_a_id === currentUserId;
  const myName     = isPlayerA ? duel.player_a_name : duel.player_b_name;
  const opponent   = isPlayerA ? duel.player_b_name : duel.player_a_name;
  const myScore    = isPlayerA ? duel.player_a_score : duel.player_b_score;
  const theirScore = isPlayerA ? duel.player_b_score : duel.player_a_score;
  const title      = lang === 'de' ? duel.title_de : duel.title_en;
  const islandName = lang === 'de' ? duel.island_name_de : duel.island_name_en;
  const iWon       = duel.winner_id === currentUserId;
  const isDraw     = duel.status === 'completed' && !duel.winner_id;

  const canSubmit = duel.status === 'waiting_for_b' && !isPlayerA;

  return (
    <div className="card-pixel-dark mb-3">
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-pixel text-[9px] text-white mb-1 truncate">{title ?? t('duel.title')}</div>
          {islandName && (
            <div className="font-pixel text-[7px] text-gray-400 mb-2">{islandName}</div>
          )}

          {/* VS row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-pixel text-[8px] text-xp-gold">{myName ?? '...'}</span>
            <span className="font-pixel text-[8px] text-gray-500">{t('duel.vs')}</span>
            <span className="font-pixel text-[8px] text-gray-300">{opponent ?? '???'}</span>
          </div>

          {duel.difficulty && (
            <span className="badge-pixel text-[7px] bg-accent-teal text-white">
              {t(`quiz.difficulty.\${duel.difficulty}`)}
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={['badge-pixel text-[7px]', STATUS_COLOR[duel.status] ?? 'bg-gray-700 text-white'].join(' ')}>
            {duel.status === 'waiting_for_b' ? t('duel.waiting') :
             duel.status === 'completed'     ? 'DONE' :
             duel.status === 'expired'       ? t('duel.expired') : 'OPEN'}
          </span>
          {canSubmit && onSubmit && (
            <PixelButton variant="primary" onClick={() => onSubmit(duel.id)}>
              {t('duel.submit')}
            </PixelButton>
          )}
          {duel.status === 'completed' && onViewResult && (
            <PixelButton variant="secondary" onClick={() => onViewResult(duel.id)}>
              {t('duel.result')}
            </PixelButton>
          )}
        </div>
      </div>

      {/* Completed scores */}
      {duel.status === 'completed' && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex justify-around items-center">
            <div className="text-center">
              <div className="font-pixel text-[7px] text-gray-400 mb-1">{myName}</div>
              <div className="font-pixel text-[13px] text-xp-gold">{myScore ?? '-'}</div>
            </div>
            <div className="font-pixel text-[10px] text-gray-600">{t('duel.vs')}</div>
            <div className="text-center">
              <div className="font-pixel text-[7px] text-gray-400 mb-1">{opponent ?? '???'}</div>
              <div className="font-pixel text-[13px] text-xp-gold">{theirScore ?? '-'}</div>
            </div>
          </div>
          <div className={['text-center mt-2 font-pixel text-[9px]',
            isDraw ? 'text-gray-400' : iWon ? 'text-xp-green' : 'text-hp-red',
          ].join(' ')}>
            {isDraw ? t('duel.draw_result') : iWon ? t('duel.youWon') : t('duel.youLost')}
          </div>
        </div>
      )}
    </div>
  );
}
