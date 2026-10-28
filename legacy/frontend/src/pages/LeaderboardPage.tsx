import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { leaderboardApi, islandApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { LeaderboardEntry, Island, PeriodType } from '../types';

type LBTab = 'global' | 'island' | 'guild' | 'duels';

interface GuildEntry {
  guild_id: string;
  guild_name: string;
  total_xp: number;
  member_count: number;
  rank: number;
}

interface DuelEntry {
  user_id: string;
  display_name: string;
  duels_won: number;
  duels_played: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';
  const user = useAuthStore(s => s.user);

  const [tab, setTab] = useState<LBTab>('global');
  const [period, setPeriod] = useState<PeriodType>('alltime');
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [guildEntries, setGuildEntries] = useState<GuildEntry[]>([]);
  const [duelEntries, setDuelEntries] = useState<DuelEntry[]>([]);
  const [islands, setIslands] = useState<Island[]>([]);
  const [selectedIsland, setSelectedIsland] = useState('');
  const [islandEntries, setIslandEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load global
  useEffect(() => {
    if (tab !== 'global') return;
    setLoading(true);
    leaderboardApi.getGlobal(period)
      .then(res => setGlobalEntries(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, period]);

  // Load guild
  useEffect(() => {
    if (tab !== 'guild') return;
    setLoading(true);
    leaderboardApi.getGuild()
      .then(res => setGuildEntries(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Load duels
  useEffect(() => {
    if (tab !== 'duels') return;
    setLoading(true);
    leaderboardApi.getDuels()
      .then(res => setDuelEntries(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Load islands for island tab
  useEffect(() => {
    if (tab !== 'island') return;
    islandApi.getAll().then(res => {
      const list = res.data.data ?? [];
      setIslands(list);
      if (list.length > 0 && !selectedIsland) setSelectedIsland(list[0].slug);
    }).catch(() => {});
  }, [tab]);

  // Load island leaderboard
  useEffect(() => {
    if (tab !== 'island' || !selectedIsland) return;
    setLoading(true);
    leaderboardApi.getIsland(selectedIsland)
      .then(res => setIslandEntries(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, selectedIsland]);

  const tabs: { key: LBTab; label: string }[] = [
    { key: 'global', label: t('leaderboard.global') },
    { key: 'island', label: t('leaderboard.island') },
    { key: 'guild',  label: t('leaderboard.guild') },
    { key: 'duels',  label: t('leaderboard.duels') },
  ];

  const periods: PeriodType[] = ['daily', 'weekly', 'monthly', 'alltime'];

  function rankColor(rank: number) {
    if (rank === 1) return 'text-xp-gold';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-500';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="font-pixel text-sm text-xp-gold">{t('leaderboard.title')}</h1>

      {/* Tabs */}
      <div className="flex border-b-2 border-white flex-wrap">
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

      {/* Period filter for global */}
      {tab === 'global' && (
        <div className="flex gap-2 flex-wrap">
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'font-pixel text-[7px] px-3 py-1 border',
                period === p ? 'border-xp-gold text-xp-gold bg-xp-gold bg-opacity-10' : 'border-gray-700 text-gray-400 hover:text-white',
              ].join(' ')}
            >
              {t(`leaderboard.${p}`)}
            </button>
          ))}
        </div>
      )}

      {/* Island selector */}
      {tab === 'island' && (
        <select
          className="input-pixel max-w-xs"
          value={selectedIsland}
          onChange={e => setSelectedIsland(e.target.value)}
        >
          {islands.map(i => (
            <option key={i.slug} value={i.slug}>{lang === 'de' ? i.name_de : i.name_en}</option>
          ))}
        </select>
      )}

      {loading && <LoadingSpinner />}

      {/* Global + Island tables */}
      {(tab === 'global' || tab === 'island') && !loading && (
        <div className="card-pixel-dark overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="font-pixel text-[7px] text-gray-400 text-left py-2 pr-4">{t('leaderboard.rank')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-left py-2 pr-4">{t('leaderboard.player')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-right py-2 pr-4">{t('leaderboard.level')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-right py-2">{t('leaderboard.xp')}</th>
              </tr>
            </thead>
            <tbody>
              {(tab === 'global' ? globalEntries : islandEntries).map(entry => (
                <tr
                  key={entry.user_id}
                  className={['border-b border-gray-800', entry.user_id === user?.id ? 'bg-accent-teal bg-opacity-30' : ''].join(' ')}
                >
                  <td className={['font-pixel text-[9px] py-3 pr-4', rankColor(entry.rank)].join(' ')}>
                    #{entry.rank}
                  </td>
                  <td className="font-pixel text-[8px] text-white py-3 pr-4 max-w-[140px] truncate">
                    {entry.display_name}
                    {entry.user_id === user?.id && <span className="text-aurora ml-1">◄</span>}
                  </td>
                  <td className="font-pixel text-[8px] text-aurora text-right py-3 pr-4">
                    {entry.current_level}
                  </td>
                  <td className="font-pixel text-[8px] text-xp-gold text-right py-3">
                    {entry.xp_earned?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {(tab === 'global' ? globalEntries : islandEntries).length === 0 && (
                <tr><td colSpan={4} className="font-pixel text-[8px] text-gray-600 text-center py-8">Noch keine Einträge.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Guild table */}
      {tab === 'guild' && !loading && (
        <div className="card-pixel-dark overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="font-pixel text-[7px] text-gray-400 text-left py-2 pr-4">{t('leaderboard.rank')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-left py-2 pr-4">Gilde</th>
                <th className="font-pixel text-[7px] text-gray-400 text-right py-2 pr-4">Mitglieder</th>
                <th className="font-pixel text-[7px] text-gray-400 text-right py-2">{t('leaderboard.xp')}</th>
              </tr>
            </thead>
            <tbody>
              {guildEntries.map(entry => (
                <tr key={entry.guild_id} className="border-b border-gray-800">
                  <td className={['font-pixel text-[9px] py-3 pr-4', rankColor(entry.rank)].join(' ')}>#{entry.rank}</td>
                  <td className="font-pixel text-[8px] text-white py-3 pr-4">{entry.guild_name}</td>
                  <td className="font-pixel text-[8px] text-gray-400 text-right py-3 pr-4">{entry.member_count}</td>
                  <td className="font-pixel text-[8px] text-xp-gold text-right py-3">{entry.total_xp?.toLocaleString()}</td>
                </tr>
              ))}
              {guildEntries.length === 0 && (
                <tr><td colSpan={4} className="font-pixel text-[8px] text-gray-600 text-center py-8">Noch keine Gilden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Duels table */}
      {tab === 'duels' && !loading && (
        <div className="card-pixel-dark overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="font-pixel text-[7px] text-gray-400 text-left py-2 pr-4">{t('leaderboard.rank')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-left py-2 pr-4">{t('leaderboard.player')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-right py-2 pr-4">{t('leaderboard.wins')}</th>
                <th className="font-pixel text-[7px] text-gray-400 text-right py-2">Gespielt</th>
              </tr>
            </thead>
            <tbody>
              {duelEntries.map(entry => (
                <tr
                  key={entry.user_id}
                  className={['border-b border-gray-800', entry.user_id === user?.id ? 'bg-accent-teal bg-opacity-30' : ''].join(' ')}
                >
                  <td className={['font-pixel text-[9px] py-3 pr-4', rankColor(entry.rank)].join(' ')}>#{entry.rank}</td>
                  <td className="font-pixel text-[8px] text-white py-3 pr-4">{entry.display_name}</td>
                  <td className="font-pixel text-[8px] text-xp-green text-right py-3 pr-4">{entry.duels_won}</td>
                  <td className="font-pixel text-[8px] text-gray-400 text-right py-3">{entry.duels_played}</td>
                </tr>
              ))}
              {duelEntries.length === 0 && (
                <tr><td colSpan={4} className="font-pixel text-[8px] text-gray-600 text-center py-8">Noch keine Duelle.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
