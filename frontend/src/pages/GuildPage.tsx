import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { guildApi } from '../services/api';
import { useAuthStore } from '../context/AuthStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import type { Guild, GuildMember } from '../types';

export default function GuildPage() {
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);

  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'my' | 'search' | 'create'>('my');

  // Create form
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  // Search
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guild[]>([]);
  const [searching, setSearching] = useState(false);

  // Join
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    guildApi.getMy()
      .then(res => setMyGuild(res.data.data ?? null))
      .catch(() => setMyGuild(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    setCreateMsg('');
    try {
      const res = await guildApi.create({ name: createName.trim(), description: createDesc.trim() || undefined });
      setMyGuild(res.data.data);
      setView('my');
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 409) setCreateMsg('Name bereits vergeben.');
      else setCreateMsg(t('common.error'));
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await guildApi.search(query.trim());
      setSearchResults(res.data.data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async (id: string) => {
    setJoining(id);
    try {
      await guildApi.join(id);
      const res = await guildApi.getOne(id);
      setMyGuild(res.data.data);
      setView('my');
    } catch {
      // ignore
    } finally {
      setJoining(null);
    }
  };

  const handleLeave = async () => {
    if (!myGuild) return;
    setLeaving(true);
    try {
      await guildApi.leave(myGuild.id);
      setMyGuild(null);
    } catch {
      // ignore
    } finally {
      setLeaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const ROLE_LABEL: Record<string, string> = {
    leader:  t('guild.leader'),
    officer: t('guild.officer'),
    member:  t('guild.member'),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="font-pixel text-sm text-xp-gold">{t('guild.title')}</h1>

      {/* My guild view */}
      {myGuild && view === 'my' ? (
        <>
          <div className="card-pixel-dark">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-pixel text-sm text-white mb-1">{myGuild.name}</div>
                {myGuild.description && (
                  <div className="font-pixel text-[8px] text-gray-400 mb-2">{myGuild.description}</div>
                )}
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="font-pixel text-[7px] text-gray-500">{t('guild.level')}</div>
                    <div className="font-pixel text-sm text-xp-gold">{myGuild.level}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-pixel text-[7px] text-gray-500">{t('guild.totalXP')}</div>
                    <div className="font-pixel text-sm text-aurora">{myGuild.total_xp?.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-pixel text-[7px] text-gray-500">{t('guild.members')}</div>
                    <div className="font-pixel text-sm text-white">{myGuild.member_count}/{myGuild.max_members}</div>
                  </div>
                </div>
              </div>
              <PixelButton variant="danger" loading={leaving} onClick={handleLeave}>
                {t('guild.leave')}
              </PixelButton>
            </div>
          </div>

          {/* Members list */}
          <div>
            <h2 className="font-pixel text-[9px] text-aurora mb-3">{t('guild.members')}</h2>
            <div className="space-y-2">
              {(myGuild.members ?? []).map((m: GuildMember) => (
                <div key={m.id} className="card-pixel-dark flex items-center gap-3">
                  <div
                    className="w-8 h-8 border-2 border-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#7B68EE' }}
                  >
                    <span className="font-pixel text-[7px] text-white">{m.display_name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-pixel text-[8px] text-white">{m.display_name}</div>
                    <div className="font-pixel text-[7px] text-gray-500">LV.{m.current_level}</div>
                  </div>
                  <span className="badge-pixel text-[6px] bg-accent-teal text-white shrink-0">
                    {ROLE_LABEL[m.role] ?? m.role}
                  </span>
                  {m.id === user?.id && <span className="font-pixel text-[6px] text-aurora shrink-0">◄ Du</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : !myGuild ? (
        <>
          {/* No guild – options */}
          <div className="card-pixel-dark text-center py-6">
            <div className="font-pixel text-[9px] text-gray-400 mb-2">{t('guild.noGuild')}</div>
            <div className="font-pixel text-[8px] text-gray-600">{t('guild.joinCta')}</div>
          </div>

          <div className="flex gap-3">
            <PixelButton variant="primary" fullWidth onClick={() => setView('create')}>
              {t('guild.create')} ►
            </PixelButton>
            <PixelButton variant="secondary" fullWidth onClick={() => setView('search')}>
              {t('guild.search')} ►
            </PixelButton>
          </div>

          {/* Create form */}
          {view === 'create' && (
            <div className="card-pixel-dark space-y-3">
              <div className="font-pixel text-[9px] text-xp-gold">{t('guild.create')}</div>
              <div>
                <label className="block font-pixel text-[8px] text-gray-400 mb-2">{t('guild.guildName')}</label>
                <input
                  className="input-pixel"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block font-pixel text-[8px] text-gray-400 mb-2">{t('guild.description')}</label>
                <textarea
                  className="input-pixel resize-none"
                  rows={3}
                  value={createDesc}
                  onChange={e => setCreateDesc(e.target.value)}
                  maxLength={200}
                />
              </div>
              {createMsg && <div className="font-pixel text-[8px] text-hp-red">{createMsg}</div>}
              <PixelButton variant="success" fullWidth loading={creating} onClick={handleCreate}>
                Gründen ►
              </PixelButton>
            </div>
          )}

          {/* Search form */}
          {view === 'search' && (
            <div className="card-pixel-dark space-y-3">
              <div className="font-pixel text-[9px] text-xp-gold">{t('guild.search')}</div>
              <div className="flex gap-2">
                <input
                  className="input-pixel flex-1"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Gildenname..."
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <PixelButton variant="secondary" loading={searching} onClick={handleSearch}>
                  ►
                </PixelButton>
              </div>
              <div className="space-y-2">
                {searchResults.map(g => (
                  <div key={g.id} className="border border-gray-700 p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-pixel text-[8px] text-white">{g.name}</div>
                      <div className="font-pixel text-[7px] text-gray-500">
                        {g.member_count}/{g.max_members} Mitglieder · LV.{g.level}
                      </div>
                    </div>
                    <PixelButton
                      variant="primary"
                      loading={joining === g.id}
                      onClick={() => handleJoin(g.id)}
                    >
                      {t('guild.join')}
                    </PixelButton>
                  </div>
                ))}
                {searchResults.length === 0 && query && !searching && (
                  <div className="font-pixel text-[8px] text-gray-600 text-center py-4">Keine Gilden gefunden.</div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
