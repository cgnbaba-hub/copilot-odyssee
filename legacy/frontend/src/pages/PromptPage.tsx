import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { promptApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import PromptScoreChart from '../components/prompt/PromptScoreChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import LevelUpModal from '../components/common/LevelUpModal';
import type { PromptChallenge, PromptEvaluation } from '../types';

export default function PromptPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const updateUser = useAuthStore(s => s.updateUser);
  const user = useAuthStore(s => s.user);

  const [challenge, setChallenge] = useState<PromptChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showIdeal, setShowIdeal] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  const loadNext = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setEvaluation(null);
    setPromptText('');
    setShowIdeal(false);
    setError('');
    try {
      const res = await promptApi.getNext(slug);
      const data = res.data.data;
      if (!data) setDone(true);
      else setChallenge(data);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { loadNext(); }, [loadNext]);

  const handleSubmit = async () => {
    if (!challenge || !promptText.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await promptApi.submit(challenge.id, promptText.trim());
      const data = res.data.data;
      setEvaluation({
        clarity: data.clarity ?? 0,
        context: data.context ?? 0,
        accuracy: data.accuracy ?? 0,
        efficiency: data.efficiency ?? 0,
        total: data.total ?? 0,
        feedback_de: data.feedback_de ?? '',
        feedback_en: data.feedback_en ?? '',
        ai_evaluated: data.ai_evaluated ?? false,
      });
      setXpEarned(data.xpEarned ?? 0);
      if (data.leveledUp) {
        setNewLevel(data.newLevel ?? 1);
        updateUser({ current_level: data.newLevel, total_xp: (user?.total_xp ?? 0) + (data.xpEarned ?? 0) });
        setShowLevelUp(true);
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 429) setError(t('prompt.rateLimit'));
      else setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (done) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-pixel text-center py-12">
          <div className="font-pixel text-sm text-xp-gold mb-4">{t('prompt.allDone')}</div>
          <Link to={`/island/${slug}`}>
            <PixelButton variant="secondary">{t('quiz.backToIsland')}</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  const title = challenge ? (lang === 'de' ? challenge.title_de : challenge.title_en) : '';
  const description = challenge ? (lang === 'de' ? challenge.description_de : challenge.description_en) : '';
  const scenario = challenge ? (lang === 'de' ? challenge.scenario_de : challenge.scenario_en) : '';
  const feedback = evaluation ? (lang === 'de' ? evaluation.feedback_de : evaluation.feedback_en) : '';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link to={`/island/${slug}`} className="font-pixel text-[9px] text-aurora hover:text-white">
          ◄ {t('common.back')}
        </Link>
        {xpEarned > 0 && (
          <div className="font-pixel text-[9px] text-xp-gold">
            {t('prompt.xpEarned', { xp: xpEarned })}
          </div>
        )}
      </div>

      <h1 className="font-pixel text-xs text-aurora">{t('prompt.title')}</h1>

      {challenge && (
        <>
          {/* Challenge header */}
          <div className="card-pixel-dark">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge-pixel text-[7px] bg-aurora text-white">{challenge.difficulty}</span>
              <span className="font-pixel text-[8px] text-xp-gold">+{challenge.xp_reward_max} XP max</span>
            </div>
            <h2 className="font-pixel text-[10px] text-white mb-2">{title}</h2>
            <p className="font-pixel text-[8px] text-gray-300 leading-relaxed">{description}</p>
          </div>

          {/* Scenario */}
          <div className="border-2 border-xp-gold bg-bg-darker p-4 shadow-pixel">
            <div className="font-pixel text-[8px] text-xp-gold mb-2">{t('prompt.scenario')}</div>
            <p className="font-pixel text-[9px] text-white leading-relaxed">{scenario}</p>
          </div>

          {/* Input */}
          {!evaluation && (
            <div className="card-pixel-dark space-y-3">
              <label className="block font-pixel text-[8px] text-aurora">{t('prompt.yourPrompt')}</label>
              <textarea
                className="input-pixel resize-none"
                rows={5}
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder={t('prompt.placeholder')}
                maxLength={2000}
                disabled={submitting}
              />
              <div className="flex justify-between items-center">
                <span className="font-pixel text-[7px] text-gray-600">{promptText.length}/2000</span>
              </div>
              {error && (
                <div className="border border-hp-red bg-red-950/50 px-3 py-2 font-pixel text-[8px] text-hp-red">
                  ✗ {error}
                </div>
              )}
              <PixelButton
                variant="primary"
                fullWidth
                loading={submitting}
                disabled={!promptText.trim()}
                onClick={handleSubmit}
              >
                {submitting ? t('prompt.evaluating') : t('prompt.submit')} ►
              </PixelButton>
            </div>
          )}

          {/* Evaluation result */}
          {evaluation && (
            <div className="card-pixel-dark space-y-4">
              <PromptScoreChart
                clarity={evaluation.clarity}
                context={evaluation.context}
                accuracy={evaluation.accuracy}
                efficiency={evaluation.efficiency}
                total={evaluation.total}
              />

              {feedback && (
                <div className="border-l-4 border-aurora pl-3 py-1">
                  <div className="font-pixel text-[7px] text-aurora mb-1">{t('prompt.feedback')}</div>
                  <p className="font-pixel text-[8px] text-gray-300 leading-relaxed">{feedback}</p>
                </div>
              )}

              {!evaluation.ai_evaluated && (
                <div className="font-pixel text-[7px] text-gray-500 text-center">
                  (Fallback-Bewertung – kein Mistral API Key gesetzt)
                </div>
              )}

              <div className="flex flex-col gap-2">
                <PixelButton variant="ghost" fullWidth onClick={() => setShowIdeal(!showIdeal)}>
                  {t('prompt.showIdeal')}
                </PixelButton>
                <PixelButton variant="secondary" fullWidth onClick={loadNext}>
                  {t('common.next')} ►
                </PixelButton>
              </div>
            </div>
          )}
        </>
      )}

      <LevelUpModal visible={showLevelUp} newLevel={newLevel} onClose={() => setShowLevelUp(false)} />
    </div>
  );
}
