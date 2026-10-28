import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { islandApi, questApi, duelApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import IslandCard from '../components/game/IslandCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Island } from '../types';

export default function MapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [islands, setIslands] = useState<Island[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDuels, setOpenDuels] = useState(0);
  const [hasDaily, setHasDaily] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [islandRes, duelRes, questRes] = await Promise.allSettled([
          islandApi.getAll(),
          duelApi.getPending(),
          questApi.getDaily(),
        ]);
        if (islandRes.status === 'fulfilled') setIslands(islandRes.value.data.data ?? []);
        if (duelRes.status === 'fulfilled') setOpenDuels((duelRes.value.data.data ?? []).length);
        if (questRes.status === 'fulfilled') setHasDaily(!!(questRes.value.data.data));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-pixel text-sm text-xp-gold mb-1">{t('map.title')}</h1>
        <p className="font-pixel text-[8px] text-gray-400">{t('map.subtitle')}</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card-pixel-dark text-center py-3">
          <div className="font-pixel text-[8px] text-gray-400 mb-1">{t('map.yourLevel')}</div>
          <div className="font-pixel text-lg text-xp-gold">{user?.current_level}</div>
        </div>
        <div className="card-pixel-dark text-center py-3">
          <div className="font-pixel text-[8px] text-gray-400 mb-1">{t('map.totalXP')}</div>
          <div className="font-pixel text-sm text-aurora">{user?.total_xp?.toLocaleString()}</div>
        </div>
        <button
          onClick={() => navigate('/arena')}
          className="card-pixel-dark text-center py-3 hover:bg-accent-teal transition-colors cursor-pointer"
        >
          <div className="font-pixel text-[8px] text-gray-400 mb-1">{t('map.openDuels')}</div>
          <div className={['font-pixel text-sm', openDuels > 0 ? 'text-hp-red' : 'text-gray-500'].join(' ')}>
            {openDuels}
          </div>
        </button>
        <button
          onClick={() => navigate('/quest')}
          className={[
            'card-pixel-dark text-center py-3 hover:bg-accent-teal transition-colors cursor-pointer',
            hasDaily ? 'border-xp-gold' : '',
          ].join(' ')}
        >
          <div className="font-pixel text-[8px] text-gray-400 mb-1">{t('map.dailyQuest')}</div>
          <div className={['font-pixel text-xs', hasDaily ? 'text-xp-gold' : 'text-gray-500'].join(' ')}>
            {hasDaily ? '!' : '–'}
          </div>
        </button>
      </div>

      {/* Islands Grid */}
      {islands.length === 0 ? (
        <div className="card-pixel-dark text-center py-12">
          <div className="font-pixel text-[9px] text-gray-400 mb-4">Keine Inseln verfügbar.</div>
          <div className="font-pixel text-[8px] text-gray-600">
            Ein Admin muss zuerst Inseln anlegen.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {islands.map(island => (
            <IslandCard
              key={island.id}
              island={island}
              onClick={() => navigate(`/island/${island.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
