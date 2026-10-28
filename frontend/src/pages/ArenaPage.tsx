import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { duelApi, islandApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import DuelCard from '../components/duel/DuelCard';
import { useAuthStore } from '../context/AuthStore';
import type { Duel, Island } from '../types';

type Tab = 'create' | 'pending' | 'history';

export default function ArenaPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';

  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<Tab>('pending');
  const [islands, setIslands] = useState<Island[]>([]);
  const [pending, setPending] = useState<Duel[]>([]);
  const [history, setHistory] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [selectedIsland, setSelectedIsland] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [createMsg, setCreateMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [iRes, pRes, hRes] = await Promise.allSettled([
          islandApi.getAll(),
          duelApi.getPending(),
          duelApi.getHistory(),
        ]);
        if (iRes.status === 'fulfilled') {
          const list = (iRes.value.data.data ?? []) as Island[];
          setIslands(list.filter(i => i.status !== 'locked'));
        }
        if (pRes.status === 'fulfilled') setPending(pRes.value.data.data ?? []);
        if (hRes.status === 'fulfilled') setHistory(hRes.value.data.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCreate = async () => {
    if (!selectedIsland) return;
    setCreating(true);
    setCreateMsg('');
    try {
      const res = await duelApi.create(selectedIsland, selectedDifficulty);
      const data = res.data.data;
      if (data?.status === 'waiting_for_b') {
        setCreateMsg(t('duel.waiting'));
        const pRes = await duelApi.getPending();
        setPending(pRes.data.data ?? []);
        setTab('pending');
      } else if (data?.id) {
        navigate(`/duel/${data.id}`);
      }
    } catch {
      setCreateMsg(t('common.error'));
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: t('duel.pending') },
    { key: 'history', label: t('duel.history') },
    { key: 'create',  label: t('duel.create') },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="font-pixel text-sm text-xp-gold">{t('duel.title')}</h1>

      {/* Tabs */}
      <div className="flex border-b-2 border-white">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'font-pixel text-[8px] px-4 py-2 border-r border-gray-700',
              tab === key ? 'bg-accent-red text-white' : 'text-gray-400 hover:text-white',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Create Tab */}
      {tab === 'create' && (
        <div className="card-pixel-dark space-y-4">
          <div className="font-pixel text-[9px] text-white mb-4">{t('duel.create')}</div>

          <div>
            <label className="block font-pixel text-[8px] text-gray-400 mb-2">{t('duel.selectIsland')}</label>
            <select
              className="input-pixel"
              value={selectedIsland}
              onChange={e => setSelectedIsland(e.target.value)}
            >
              <option value="">– Insel wählen –</option>
              {islands.map(i => (
                <option key={i.id} value={i.slug}>
                  {lang === 'de' ? i.name_de : i.name_en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-pixel text-[8px] text-gray-400 mb-2">{t('duel.selectDifficulty')}</label>
            <select
              className="input-pixel"
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
            >
              {['beginner', 'intermediate', 'advanced', 'expert'].map(d => (
                <option key={d} value={d}>{t(`quiz.difficulty.${d}`)}</option>
              ))}
            </select>
          </div>

          {createMsg && (
            <div className="border border-xp-gold px-3 py-2 font-pixel text-[8px] text-xp-gold">
              {createMsg}
            </div>
          )}

          <PixelButton
            variant="danger"
            fullWidth
            loading={creating}
            disabled={!selectedIsland}
            onClick={handleCreate}
          >
            {t('duel.startDuel')} ►
          </PixelButton>
        </div>
      )}

      {/* Pending Tab */}
      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="card-pixel-dark text-center py-8">
              <div className="font-pixel text-[9px] text-gray-400">Keine offenen Duelle.</div>
              <button
                onClick={() => setTab('create')}
                className="font-pixel text-[8px] text-aurora hover:text-white mt-3 transition-colors"
              >
                {t('duel.create')} ►
              </button>
            </div>
          ) : (
            pending.map(duel => (
              <DuelCard
                key={duel.id}
                duel={duel}
                currentUserId={user?.id ?? ''}
                onSubmit={id => navigate(`/duel/${id}`)}
                onViewResult={id => navigate(`/duel/${id}`)}
              />
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card-pixel-dark text-center py-8">
              <div className="font-pixel text-[9px] text-gray-400">Noch keine abgeschlossenen Duelle.</div>
            </div>
          ) : (
            history.map(duel => (
              <DuelCard
                key={duel.id}
                duel={duel}
                currentUserId={user?.id ?? ''}
                onViewResult={id => navigate(`/duel/${id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
