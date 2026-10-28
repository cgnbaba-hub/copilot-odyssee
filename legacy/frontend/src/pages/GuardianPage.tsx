import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { promptApi, islandApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import PromptScoreChart from '../components/prompt/PromptScoreChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import LevelUpModal from '../components/common/LevelUpModal';
import type { Island, PromptEvaluation } from '../types';

const GUARDIAN_MAX_HP = 100;

function GuardianSprite({ name, hp, maxHp }: { name: string; hp: number; maxHp: number }) {
  const hpPct = Math.max(0, (hp / maxHp) * 100);
  const col = hpPct > 50 ? '#FF4444' : hpPct > 25 ? '#FF6B35' : '#7B68EE';
  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated', filter: hp <= 0 ? 'grayscale(1) opacity(0.4)' : undefined }}>
        <rect width="80" height="80" fill="#0D0D1A" />
        {/* Body */}
        <rect x="15" y="44" width="50" height="30" fill={col} />
        {/* Head */}
        <rect x="18" y="14" width="44" height="32" fill={col} opacity="0.9" />
        {/* Eyes (glowing) */}
        <rect x="24" y="22" width="12" height="10" fill="#FFD700" />
        <rect x="44" y="22" width="12" height="10" fill="#FFD700" />
        <rect x="27" y="25" width="6" height="4" fill="#0D0D1A" />
        <rect x="47" y="25" width="6" height="4" fill="#0D0D1A" />
        {/* Mouth */}
        <rect x="24" y="38" width="32" height="4" fill="#0D0D1A" />
        {/* Arms */}
        <rect x="0" y="44" width="16" height="8" fill={col} />
        <rect x="64" y="44" width="16" height="8" fill={col} />
        {/* Crown/horns */}
        <rect x="24" y="6" width="8" height="10" fill={col} />
        <rect x="48" y="6" width="8" height="10" fill={col} />
        {/* Border */}
        <rect x="0" y="0" width="80" height="80" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
      <div className="mt-2 w-full max-w-[120px]">
        <div className="font-pixel text-[7px] text-gray-400 text-center mb-1">{name}</div>
        <div className="flex justify-between mb-1">
          <span className="font-pixel text-[6px] text-hp-red">HP</span>
          <span className="font-pixel text-[6px] text-white">{Math.max(0, hp)}/{maxHp}</span>
        </div>
        <div className="progress-pixel h-3">
          <div className="h-full bg-hp-red transition-all duration-700" style={{ width: `${hpPct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function GuardianPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const navigate = useNavigate();
  const updateUser = useAuthStore(s => s.updateUser);
  const user = useAuthStore(s => s.user);

  const [island, setIsland] = useState<Island | null>(null);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<{ id: string; title_de: string; title_en: string; scenario_de: string; scenario_en: string; xp_reward_max: number } | null>(null);
  const [guardianHp, setGuardianHp] = useState(GUARDIAN_MAX_HP);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<PromptEvaluation | null>(null);
  const [round, setRound] = useState(1);
  const [defeated, setDefeated] = useState(false);
  const [playerLost, setPlayerLost] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [error, setError] = useState('');

  const loadChallenge = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await promptApi.getNext(slug);
      const data = res.data.data;
      setChallenge(data ?? null);
    } catch {
      setChallenge(null);
    }
  }, [slug]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [iRes] = await Promise.allSettled([islandApi.getOne(slug!)]);
        if (iRes.status === 'fulfilled') setIsland(iRes.value.data.data);
        await loadChallenge();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [slug, loadChallenge]);

  const handleAttack = async () => {
    if (!challenge || !prompt.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await promptApi.submit(challenge.id, prompt.trim());
      const data = res.data.data;
      const score = data.total ?? 0;
      const damage = Math.round(score * 0.5);
      const newHp = Math.max(0, guardianHp - damage);
      setGuardianHp(newHp);
      setEvaluation({
        clarity: data.clarity ?? 0,
        context: data.context ?? 0,
        accuracy: data.accuracy ?? 0,
        efficiency: data.efficiency ?? 0,
        total: score,
        feedback_de: data.feedback_de ?? '',
        feedback_en: data.feedback_en ?? '',
        ai_evaluated: data.ai_evaluated ?? false,
      });
      setTotalXP(prev => prev + (data.xpEarned ?? 0));
      if (data.leveledUp) {
        setNewLevel(data.newLevel ?? 1);
        updateUser({ current_level: data.newLevel, total_xp: (user?.total_xp ?? 0) + (data.xpEarned ?? 0) });
        setShowLevelUp(true);
      }

      if (newHp <= 0) {
        setDefeated(true);
      } else if (round >= 3) {
        setPlayerLost(true);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const nextRound = async () => {
    setEvaluation(null);
    setPrompt('');
    setRound(r => r + 1);
    await loadChallenge();
  };

  if (loading) return <LoadingSpinner />;

  const guardianName = island ? (lang === 'de' ? island.guardian_name_de : island.guardian_name_en) ?? 'Wächter' : 'Wächter';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link to={`/island/${slug}`} className="font-pixel text-[9px] text-aurora hover:text-white flex items-center gap-2">
        ◄ {t('common.back')}
      </Link>

      <h1 className="font-pixel text-xs text-hp-red">{t('guardian.title')}</h1>

      {/* Battle arena */}
      <div className="card-pixel-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #E94560 0px, #E94560 1px, transparent 1px, transparent 4px)',
        }} />
        <div className="relative flex justify-around items-end py-4">
          {/* Player side */}
          <div className="text-center">
            <div
              className="w-16 h-16 border-2 border-white mx-auto flex items-center justify-center mb-2"
              style={{ backgroundColor: (user?.avatar_config as { skin?: string })?.skin ?? '#FDBCB4' }}
            >
              <span className="font-pixel text-[8px] text-black">
                {user?.display_name?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="font-pixel text-[7px] text-aurora">{user?.display_name}</div>
            <div className="font-pixel text-[7px] text-gray-500">Runde {round}/3</div>
          </div>

          {/* VS */}
          <div className="font-pixel text-lg text-hp-red" style={{ textShadow: '2px 2px 0 #000' }}>VS</div>

          {/* Guardian */}
          <GuardianSprite name={guardianName} hp={guardianHp} maxHp={GUARDIAN_MAX_HP} />
        </div>
      </div>

      {/* Defeat */}
      {playerLost && !defeated && (
        <div className="card-pixel text-center py-8 border-hp-red">
          <div className="font-pixel text-sm text-hp-red mb-4">{t('guardian.defeat')}</div>
          <PixelButton variant="secondary" onClick={() => navigate(`/island/${slug}`)}>
            {t('common.back')}
          </PixelButton>
        </div>
      )}

      {/* Victory */}
      {defeated && (
        <div className="card-pixel text-center py-8 border-xp-green">
          <div className="font-pixel text-sm text-xp-gold mb-2">{t('guardian.victory')}</div>
          <div className="font-pixel text-[9px] text-aurora mb-4">+{totalXP} XP {t('guardian.xpBonus')}</div>
          <PixelButton variant="success" onClick={() => navigate(`/island/${slug}`)}>
            {t('common.back')} ►
          </PixelButton>
        </div>
      )}

      {/* Battle in progress */}
      {!defeated && !playerLost && (
        <>
          {challenge && !evaluation && (
            <div className="card-pixel-dark space-y-3">
              <div className="font-pixel text-[8px] text-xp-gold mb-2">
                Angriff mit Prompt! (Runde {round}/3)
              </div>
              <div className="border-l-4 border-hp-red pl-3 py-1">
                <div className="font-pixel text-[7px] text-gray-400 mb-1">Szenario:</div>
                <p className="font-pixel text-[8px] text-white leading-relaxed">
                  {lang === 'de' ? challenge.scenario_de : challenge.scenario_en}
                </p>
              </div>
              <textarea
                className="input-pixel resize-none"
                rows={4}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Formuliere deinen Angriff-Prompt..."
                disabled={submitting}
              />
              {error && <div className="font-pixel text-[8px] text-hp-red">✗ {error}</div>}
              <PixelButton
                variant="danger"
                fullWidth
                loading={submitting}
                disabled={!prompt.trim()}
                onClick={handleAttack}
              >
                {t('guardian.attack')} ►
              </PixelButton>
            </div>
          )}

          {evaluation && !defeated && (
            <div className="card-pixel-dark space-y-4">
              <div className="font-pixel text-[8px] text-xp-gold">
                Schaden: {Math.round(evaluation.total * 0.5)} HP
              </div>
              <PromptScoreChart
                clarity={evaluation.clarity}
                context={evaluation.context}
                accuracy={evaluation.accuracy}
                efficiency={evaluation.efficiency}
                total={evaluation.total}
              />
              {round < 3 && (
                <PixelButton variant="danger" fullWidth onClick={nextRound}>
                  Nächste Runde ►
                </PixelButton>
              )}
            </div>
          )}
        </>
      )}

      <LevelUpModal visible={showLevelUp} newLevel={newLevel} onClose={() => setShowLevelUp(false)} />
    </div>
  );
}
