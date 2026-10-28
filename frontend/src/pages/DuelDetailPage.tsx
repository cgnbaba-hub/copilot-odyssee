import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { duelApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import type { Duel } from '../types';

export default function DuelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const user = useAuthStore(s => s.user);

  const [duel, setDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ player_a_score: number; player_b_score: number; winner_name?: string | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    duelApi.getResult(id)
      .then(res => {
        const data = res.data.data;
        setDuel(data);
        if (data?.status === 'completed') {
          setResult({
            player_a_score: data.player_a_score ?? 0,
            player_b_score: data.player_b_score ?? 0,
            winner_name: data.winner_name,
          });
        }
      })
      .catch(() => setError(t('errors.notFound')))
      .finally(() => setLoading(false));
  }, [id, t]);

  const handleSubmit = async () => {
    if (!id || !prompt.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await duelApi.submit(id, prompt.trim());
      const data = res.data.data;
      setDuel(prev => prev ? { ...prev, status: data.status } : prev);
      if (data.status === 'completed') {
        setResult({
          player_a_score: data.player_a_score ?? 0,
          player_b_score: data.player_b_score ?? 0,
          winner_name: data.winner_name,
        });
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !duel) {
    return (
      <div className="max-w-2xl mx-auto card-pixel-dark text-center py-12">
        <div className="font-pixel text-hp-red mb-4">{error}</div>
        <Link to="/arena" className="font-pixel text-[9px] text-aurora hover:text-white">{t('common.back')}</Link>
      </div>
    );
  }

  const isPlayerA = duel.player_a_id === user?.id;
  const iWon = duel.winner_id === user?.id;
  const isDraw = duel.status === 'completed' && !duel.winner_id;
  const title = lang === 'de' ? duel.title_de : duel.title_en;
  const islandName = lang === 'de' ? duel.island_name_de : duel.island_name_en;
  const myPrompt = isPlayerA ? duel.player_a_prompt : duel.player_b_prompt;
  const myScore = isPlayerA ? duel.player_a_score : duel.player_b_score;
  const theirScore = isPlayerA ? duel.player_b_score : duel.player_a_score;
  const opponentName = isPlayerA ? duel.player_b_name : duel.player_a_name;
  const canSubmit = duel.status === 'waiting_for_b' && !isPlayerA && !myPrompt;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to="/arena" className="font-pixel text-[9px] text-aurora hover:text-white flex items-center gap-2">
        ◄ {t('common.back')}
      </Link>

      {/* Header */}
      <div className="card-pixel-dark">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-pixel text-[9px] text-white">{title ?? t('duel.title')}</span>
          {islandName && <span className="font-pixel text-[7px] text-gray-400">– {islandName}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-pixel text-[8px] text-xp-gold">{duel.player_a_name ?? '...'}</div>
            {duel.status === 'completed' && <div className="font-pixel text-lg text-white">{duel.player_a_score ?? '-'}</div>}
          </div>
          <div className="font-pixel text-sm text-gray-500">{t('duel.vs')}</div>
          <div className="text-center">
            <div className="font-pixel text-[8px] text-gray-300">{duel.player_b_name ?? '???'}</div>
            {duel.status === 'completed' && <div className="font-pixel text-lg text-white">{duel.player_b_score ?? '-'}</div>}
          </div>
        </div>
      </div>

      {/* Status */}
      {duel.status === 'waiting_for_b' && isPlayerA && (
        <div className="card-pixel-dark text-center py-6">
          <div className="font-pixel text-[9px] text-xp-gold mb-2">{t('duel.waiting')}</div>
          <div className="font-pixel text-[8px] text-gray-400">{t('duel.noOpponent')}</div>
        </div>
      )}

      {/* Submit prompt (challenger = player B) */}
      {canSubmit && (
        <div className="card-pixel-dark space-y-3">
          <div className="font-pixel text-[9px] text-aurora mb-2">{t('duel.submit')}</div>
          <textarea
            className="input-pixel resize-none"
            rows={5}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Dein Prompt..."
            disabled={submitting}
          />
          {error && <div className="font-pixel text-[8px] text-hp-red">✗ {error}</div>}
          <PixelButton variant="danger" fullWidth loading={submitting} disabled={!prompt.trim()} onClick={handleSubmit}>
            {t('duel.submit')} ►
          </PixelButton>
        </div>
      )}

      {/* Result */}
      {duel.status === 'completed' && (
        <div className="card-pixel-dark text-center py-6 space-y-3">
          <div className={[
            'font-pixel text-sm',
            isDraw ? 'text-gray-400' : iWon ? 'text-xp-green' : 'text-hp-red',
          ].join(' ')}>
            {isDraw ? t('duel.draw_result') : iWon ? t('duel.youWon') : t('duel.youLost')}
          </div>
          {!isDraw && result?.winner_name && (
            <div className="font-pixel text-[8px] text-xp-gold">{t('duel.winner')}: {result.winner_name}</div>
          )}

          {/* Score breakdown */}
          <div className="flex justify-around pt-3 border-t border-gray-700">
            <div className="text-center">
              <div className="font-pixel text-[7px] text-gray-400 mb-1">Du</div>
              <div className="font-pixel text-2xl" style={{ color: myScore && myScore > (theirScore ?? 0) ? '#00FF00' : '#ffffff' }}>
                {myScore ?? '-'}
              </div>
            </div>
            <div className="font-pixel text-lg text-gray-600 self-center">{t('duel.vs')}</div>
            <div className="text-center">
              <div className="font-pixel text-[7px] text-gray-400 mb-1">{opponentName ?? '???'}</div>
              <div className="font-pixel text-2xl" style={{ color: theirScore && theirScore > (myScore ?? 0) ? '#00FF00' : '#ffffff' }}>
                {theirScore ?? '-'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
