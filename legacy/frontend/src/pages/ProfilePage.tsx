import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { userApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import AvatarBuilder from '../components/game/AvatarBuilder';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import XPBar from '../components/common/XPBar';
import type { Badge, AvatarConfig } from '../types';

interface UserStats {
  islands_completed: number;
  quiz_accuracy_percent: number;
  duels_won: number;
  total_xp: number;
  current_level: number;
  prompt_total: number;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [avatar, setAvatar] = useState<AvatarConfig>(user?.avatar_config ?? {});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, profileRes] = await Promise.allSettled([
          userApi.getStats(),
          userApi.getProfile(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (profileRes.status === 'fulfilled') {
          const data = profileRes.value.data.data;
          setBadges(data?.badges ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveAvatar = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await userApi.updateAvatar(avatar as unknown as Record<string, unknown>);
      updateUser({ avatar_config: avatar });
      setSaveMsg('✓ Gespeichert');
      setEditingAvatar(false);
    } catch {
      setSaveMsg('✗ Fehler');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const displayStats = [
    { label: t('profile.islandsCompleted'), value: stats?.islands_completed ?? 0 },
    { label: t('profile.quizAccuracy'),     value: `${Math.round(stats?.quiz_accuracy_percent ?? 0)}%` },
    { label: t('profile.duelsWon'),          value: stats?.duels_won ?? 0 },
    { label: 'Prompt-Challenges',            value: stats?.prompt_total ?? 0 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="font-pixel text-sm text-xp-gold">{t('profile.title')}</h1>

      {/* User header */}
      <div className="card-pixel-dark flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar preview */}
        <div
          className="w-16 h-16 border-2 border-white shadow-pixel flex items-center justify-center shrink-0"
          style={{ backgroundColor: (user?.avatar_config as AvatarConfig)?.skin ?? '#FDBCB4' }}
        >
          <span className="font-pixel text-[8px] text-black">
            {user?.display_name?.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-pixel text-sm text-white mb-1">{user?.display_name}</div>
          <div className="font-pixel text-[8px] text-gray-400 mb-2">@{user?.username}</div>
          <div className="font-pixel text-[8px] text-xp-gold mb-2">LV.{user?.current_level}</div>
          <div className="max-w-[200px]">
            <XPBar totalXp={user?.total_xp ?? 0} currentLevel={user?.current_level ?? 1} />
          </div>
        </div>
        <PixelButton variant="secondary" onClick={() => setEditingAvatar(!editingAvatar)}>
          {t('profile.editAvatar')}
        </PixelButton>
      </div>

      {/* Avatar Editor */}
      {editingAvatar && (
        <div className="card-pixel-dark">
          <AvatarBuilder value={avatar} onChange={setAvatar} />
          {saveMsg && <div className="font-pixel text-[8px] text-xp-gold mt-2 text-center">{saveMsg}</div>}
          <div className="flex gap-3 mt-4">
            <PixelButton variant="success" fullWidth loading={saving} onClick={handleSaveAvatar}>
              {t('common.save')} ►
            </PixelButton>
            <PixelButton variant="ghost" fullWidth onClick={() => setEditingAvatar(false)}>
              {t('common.cancel')}
            </PixelButton>
          </div>
        </div>
      )}

      {/* Stats */}
      <div>
        <h2 className="font-pixel text-[9px] text-aurora mb-3">{t('profile.stats')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {displayStats.map(({ label, value }) => (
            <div key={label} className="card-pixel-dark text-center py-4">
              <div className="font-pixel text-[7px] text-gray-400 mb-2">{label}</div>
              <div className="font-pixel text-lg text-xp-gold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="font-pixel text-[9px] text-aurora mb-3">{t('profile.badges')}</h2>
        {badges.length === 0 ? (
          <div className="card-pixel-dark text-center py-8">
            <div className="font-pixel text-[8px] text-gray-600">Noch keine Abzeichen.</div>
            <div className="font-pixel text-[7px] text-gray-700 mt-2">Schließe Quests ab, um Abzeichen zu erhalten.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map(badge => (
              <div key={badge.slug} className="card-pixel-dark text-center py-4">
                <div className="font-pixel text-2xl mb-2">
                  {badge.icon_url ? (
                    <img src={badge.icon_url} alt={badge.name_de} className="w-10 h-10 mx-auto" />
                  ) : '🏅'}
                </div>
                <div className="font-pixel text-[7px] text-xp-gold mb-1">{badge.name_de}</div>
                <div className="font-pixel text-[6px] text-gray-500">{badge.description_de}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
