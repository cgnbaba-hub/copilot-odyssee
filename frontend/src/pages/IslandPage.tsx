import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { islandApi } from '../services/api';
import NpcDialog from '../components/game/NpcDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import type { Island } from '../types';

export default function IslandPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';

  const [island, setIsland] = useState<Island | null>(null);
  const [loading, setLoading] = useState(true);
  const [npcOpen, setNpcOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    islandApi.getOne(slug)
      .then(res => setIsland(res.data.data))
      .catch(() => setError(t('errors.notFound')))
      .finally(() => setLoading(false));
  }, [slug, t]);

  if (loading) return <LoadingSpinner />;
  if (error || !island) {
    return (
      <div className="card-pixel-dark text-center py-12">
        <div className="font-pixel text-sm text-hp-red mb-4">{error || t('errors.notFound')}</div>
        <Link to="/map" className="font-pixel text-[9px] text-aurora hover:text-white">{t('common.back')}</Link>
      </div>
    );
  }

  const name = lang === 'de' ? island.name_de : island.name_en;
  const description = lang === 'de' ? island.description_de : island.description_en;
  const lore = lang === 'de' ? island.lore_de : island.lore_en;
  const npcGreeting = lang === 'de' ? island.npc_greeting_de : island.npc_greeting_en;
  const guardianName = lang === 'de' ? island.guardian_name_de : island.guardian_name_en;
  const isLocked = island.status === 'locked';
  const quizDone = (island.quiz_completed ?? 0) >= (island.quiz_total ?? 1) && (island.quiz_total ?? 0) > 0;
  const promptDone = (island.prompt_completed ?? 0) >= (island.prompt_total ?? 1) && (island.prompt_total ?? 0) > 0;
  const canChallenge = quizDone && promptDone && !island.guardian_defeated;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back */}
      <Link to="/map" className="font-pixel text-[9px] text-aurora hover:text-white flex items-center gap-2">
        ◄ {t('common.back')}
      </Link>

      {/* Island Header */}
      <div
        className="border-2 border-white p-6 shadow-pixel relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${island.color_primary}22 0%, ${island.color_secondary || island.color_primary}11 100%)` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 border-2 border-white shadow-pixel shrink-0 flex items-center justify-center"
            style={{ backgroundColor: island.color_primary }}
          >
            {island.guardian_defeated && <span className="font-pixel text-[7px] text-black">✓</span>}
          </div>
          <div className="flex-1">
            <h1 className="font-pixel text-sm text-xp-gold mb-2">{name}</h1>
            <p className="font-pixel text-[8px] text-gray-300 leading-relaxed mb-3">{description}</p>
            {island.status && (
              <span className={[
                'badge-pixel text-[7px]',
                island.status === 'completed' ? 'bg-xp-green text-black' :
                island.status === 'in_progress' ? 'bg-xp-gold text-black' :
                'bg-accent-blue text-white',
              ].join(' ')}>
                {t(`map.${island.status === 'in_progress' ? 'inProgress' : island.status}`)}
              </span>
            )}
          </div>
        </div>

        {lore && (
          <div className="mt-4 border-l-4 pl-3 py-1" style={{ borderColor: island.color_primary }}>
            <p className="font-pixel text-[8px] text-gray-400 italic leading-relaxed">{lore}</p>
          </div>
        )}
      </div>

      {isLocked && (
        <div className="card-pixel-dark text-center py-6">
          <div className="font-pixel text-[9px] text-gray-400">{t('map.locked')}</div>
        </div>
      )}

      {!isLocked && (
        <>
          {/* NPC */}
          {island.npc_name && npcGreeting && (
            <div className="card-pixel-dark">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border-2 border-white bg-aurora flex items-center justify-center shrink-0">
                  <span className="font-pixel text-[7px] text-white">NPC</span>
                </div>
                <span className="font-pixel text-[9px] text-aurora">{island.npc_name}</span>
              </div>
              <button
                onClick={() => setNpcOpen(true)}
                className="font-pixel text-[8px] text-gray-400 hover:text-white transition-colors border border-gray-700 px-3 py-2"
              >
                {t('island.npcGreeting')} ►
              </button>
            </div>
          )}

          {/* Activities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quiz */}
            <div className="card-pixel-dark">
              <div className="font-pixel text-[8px] text-xp-gold mb-3">{t('island.quiz')}</div>
              {(island.quiz_total ?? 0) > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-pixel text-[7px] text-gray-400">{island.quiz_completed ?? 0}/{island.quiz_total ?? 0}</span>
                    <span className="font-pixel text-[7px] text-xp-green">{quizDone ? '✓' : ''}</span>
                  </div>
                  <div className="progress-pixel h-2">
                    <div
                      className="progress-fill h-full"
                      style={{ width: `${island.quiz_total ? ((island.quiz_completed ?? 0) / island.quiz_total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
              <PixelButton
                variant={quizDone ? 'success' : 'primary'}
                fullWidth
                onClick={() => navigate(`/island/${slug}/quiz`)}
              >
                {t('island.startQuiz')} ►
              </PixelButton>
            </div>

            {/* Prompt */}
            <div className="card-pixel-dark">
              <div className="font-pixel text-[8px] text-aurora mb-3">{t('island.promptChallenge')}</div>
              {(island.prompt_total ?? 0) > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-pixel text-[7px] text-gray-400">{island.prompt_completed ?? 0}/{island.prompt_total ?? 0}</span>
                    <span className="font-pixel text-[7px] text-xp-green">{promptDone ? '✓' : ''}</span>
                  </div>
                  <div className="progress-pixel h-2">
                    <div
                      className="progress-fill h-full"
                      style={{ width: `${island.prompt_total ? ((island.prompt_completed ?? 0) / island.prompt_total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
              <PixelButton
                variant={promptDone ? 'success' : 'secondary'}
                fullWidth
                onClick={() => navigate(`/island/${slug}/prompt`)}
              >
                {t('island.startChallenge')} ►
              </PixelButton>
            </div>

            {/* Guardian */}
            <div className="card-pixel-dark">
              <div className="font-pixel text-[8px] text-hp-red mb-3">{t('island.guardian')}</div>
              {guardianName && (
                <div className="font-pixel text-[8px] text-gray-300 mb-3">{guardianName}</div>
              )}
              {island.guardian_defeated && (
                <div className="font-pixel text-[8px] text-xp-green mb-3">✓ {t('guardian.victory')}</div>
              )}
              <PixelButton
                variant={island.guardian_defeated ? 'success' : 'danger'}
                fullWidth
                disabled={!canChallenge && !island.guardian_defeated}
                onClick={() => navigate(`/island/${slug}/guardian`)}
              >
                {island.guardian_defeated ? '✓ DONE' : t('island.challengeGuardian')} ►
              </PixelButton>
              {!canChallenge && !island.guardian_defeated && (
                <div className="font-pixel text-[7px] text-gray-600 mt-2 text-center">Quiz + Prompt nötig</div>
              )}
            </div>
          </div>

          {island.status === 'completed' && (
            <div className="card-pixel text-center py-4">
              <div className="font-pixel text-sm text-xp-gold">{t('island.completed')}</div>
            </div>
          )}
        </>
      )}

      {/* NPC Dialog Modal */}
      {island.npc_name && npcGreeting && (
        <div className={['fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4', npcOpen ? '' : 'hidden'].join(' ')}>
          <div className="w-full max-w-lg">
            <NpcDialog
              npcName={island.npc_name}
              text={npcGreeting}
              onClose={() => setNpcOpen(false)}
              visible={npcOpen}
            />
          </div>
        </div>
      )}
    </div>
  );
}
