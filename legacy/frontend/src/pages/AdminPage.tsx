import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PixelButton from '../components/common/PixelButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type AdminTab = 'analytics' | 'quiz';

interface ActiveUser { date: string; count: number }
interface LevelDist  { level: number; count: number }
interface IslandComp { island_name: string; completion_rate: number }

export default function AdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AdminTab>('analytics');

  // Analytics state
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [levelDist, setLevelDist] = useState<LevelDist[]>([]);
  const [islandComp, setIslandComp] = useState<IslandComp[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState<{ id: string; question_de: string; difficulty: string; island_slug?: string }[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== 'analytics') return;
    setAnalyticsLoading(true);
    Promise.allSettled([
      adminApi.getActiveUsers(30),
      adminApi.getLevelDistribution(),
      adminApi.getIslandCompletion(),
    ]).then(([aRes, lRes, iRes]) => {
      if (aRes.status === 'fulfilled') setActiveUsers(aRes.value.data.data ?? []);
      if (lRes.status === 'fulfilled') setLevelDist(lRes.value.data.data ?? []);
      if (iRes.status === 'fulfilled') setIslandComp(iRes.value.data.data ?? []);
    }).finally(() => setAnalyticsLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'quiz') return;
    setQuizLoading(true);
    adminApi.listQuestions()
      .then(res => setQuestions(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setQuizLoading(false));
  }, [tab]);

  const handleDeleteQuestion = async (id: string) => {
    setDeleting(id);
    try {
      await adminApi.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.exportCSV();
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'odyssey-analytics.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'analytics', label: t('admin.analytics') },
    { key: 'quiz',      label: t('admin.quizQuestions') },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-sm text-xp-gold">{t('admin.title')}</h1>
        <span className="badge-pixel text-[7px] bg-accent-red text-white">ADMIN</span>
      </div>

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

      {/* Analytics */}
      {tab === 'analytics' && (
        analyticsLoading ? <LoadingSpinner /> : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <PixelButton variant="secondary" onClick={handleExport}>
                {t('admin.exportCSV')} ↓
              </PixelButton>
            </div>

            {/* Active Users */}
            <div className="card-pixel-dark">
              <div className="font-pixel text-[9px] text-xp-gold mb-4">{t('admin.activeUsers')} (30 Tage)</div>
              {activeUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={activeUsers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#888' }} />
                    <YAxis tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#888' }} />
                    <Tooltip contentStyle={{ background: '#0D0D1A', border: '1px solid #fff', fontFamily: 'monospace', fontSize: 10 }} />
                    <Line type="stepAfter" dataKey="count" stroke="#E94560" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="font-pixel text-[8px] text-gray-600 text-center py-8">Noch keine Daten.</div>
              )}
            </div>

            {/* Level Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-pixel-dark">
                <div className="font-pixel text-[9px] text-aurora mb-4">{t('admin.levelDistribution')}</div>
                {levelDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={levelDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="level" tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#888' }} />
                      <YAxis tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#888' }} />
                      <Tooltip contentStyle={{ background: '#0D0D1A', border: '1px solid #fff', fontFamily: 'monospace', fontSize: 10 }} />
                      <Bar dataKey="count" fill="#7B68EE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="font-pixel text-[8px] text-gray-600 text-center py-8">Noch keine Daten.</div>
                )}
              </div>

              {/* Island Completion */}
              <div className="card-pixel-dark">
                <div className="font-pixel text-[9px] text-gridforge mb-4">{t('admin.islandCompletion')}</div>
                {islandComp.length > 0 ? (
                  <div className="space-y-2">
                    {islandComp.map(ic => (
                      <div key={ic.island_name}>
                        <div className="flex justify-between mb-1">
                          <span className="font-pixel text-[7px] text-gray-300 truncate max-w-[150px]">{ic.island_name}</span>
                          <span className="font-pixel text-[7px] text-xp-green">{Math.round(ic.completion_rate)}%</span>
                        </div>
                        <div className="progress-pixel h-3">
                          <div className="progress-fill h-full" style={{ width: `${ic.completion_rate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-pixel text-[8px] text-gray-600 text-center py-8">Noch keine Daten.</div>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* Quiz Questions */}
      {tab === 'quiz' && (
        quizLoading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            <div className="font-pixel text-[8px] text-gray-400">
              {questions.length} Fragen in der Datenbank
            </div>

            {questions.length === 0 ? (
              <div className="card-pixel-dark text-center py-8">
                <div className="font-pixel text-[8px] text-gray-600">
                  Noch keine Quiz-Fragen. Füge Fragen über die API oder Seed-Daten hinzu.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map(q => (
                  <div key={q.id} className="card-pixel-dark flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-pixel text-[8px] text-white leading-relaxed mb-1 line-clamp-2">
                        {q.question_de}
                      </div>
                      <span className="badge-pixel text-[6px] bg-accent-teal text-white">{q.difficulty}</span>
                    </div>
                    <PixelButton
                      variant="danger"
                      loading={deleting === q.id}
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      {t('admin.delete')}
                    </PixelButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
