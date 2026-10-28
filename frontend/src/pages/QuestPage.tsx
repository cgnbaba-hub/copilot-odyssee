import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { questApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Quest {
  id: string;
  title_de: string;
  title_en: string;
  description_de: string;
  description_en: string;
  xp_reward: number;
  target_count: number;
  progress?: number;
  completed?: boolean;
  expires_at?: string;
  type: 'daily' | 'weekly';
}

function timeUntil(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return 'Abgelaufen';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}

function QuestCard({ quest, lang }: { quest: Quest; lang: string }) {
  const { t } = useTranslation();
  const title = lang === 'de' ? quest.title_de : quest.title_en;
  const description = lang === 'de' ? quest.description_de : quest.description_en;
  const progress = quest.progress ?? 0;
  const pct = quest.target_count > 0 ? Math.min(100, (progress / quest.target_count) * 100) : 0;

  return (
    <div className={['card-pixel-dark', quest.completed ? 'border-xp-green' : ''].join(' ')}>
      <div className="flex items-start gap-3 mb-3">
        <div className={[
          'w-8 h-8 border-2 flex items-center justify-center shrink-0 font-pixel text-[7px]',
          quest.type === 'daily' ? 'border-xp-gold text-xp-gold' : 'border-aurora text-aurora',
        ].join(' ')}>
          {quest.type === 'daily' ? 'DAY' : 'WEK'}
        </div>
        <div className="flex-1">
          <div className="font-pixel text-[9px] text-white mb-1">{title}</div>
          <div className="font-pixel text-[7px] text-gray-400 leading-relaxed">{description}</div>
        </div>
        {quest.completed && (
          <span className="badge-pixel text-[7px] bg-xp-green text-black shrink-0">✓</span>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="font-pixel text-[7px] text-gray-500">
            {progress}/{quest.target_count}
          </span>
          <span className="font-pixel text-[7px] text-xp-green">{Math.round(pct)}%</span>
        </div>
        <div className="progress-pixel h-3">
          <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-pixel text-[8px] text-xp-gold">+{quest.xp_reward} XP</span>
        {quest.expires_at && (
          <span className="font-pixel text-[7px] text-gray-600">
            {t('quest.expires')}: {timeUntil(quest.expires_at)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function QuestPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('de') ? 'de' : 'en';

  const [daily, setDaily] = useState<Quest[]>([]);
  const [weekly, setWeekly] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [dRes, wRes] = await Promise.allSettled([
        questApi.getDaily(),
        questApi.getWeekly(),
      ]);
      if (dRes.status === 'fulfilled') {
        const data = dRes.value.data.data;
        setDaily(Array.isArray(data) ? data : data ? [data] : []);
      }
      if (wRes.status === 'fulfilled') {
        const data = wRes.value.data.data;
        setWeekly(Array.isArray(data) ? data : data ? [data] : []);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-pixel text-sm text-xp-gold">{t('quest.title')}</h1>

      {/* Daily */}
      <section>
        <h2 className="font-pixel text-[9px] text-xp-gold mb-3">{t('quest.daily')}</h2>
        {daily.length === 0 ? (
          <div className="card-pixel-dark text-center py-8">
            <div className="font-pixel text-[8px] text-gray-600">{t('quest.noQuest')}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {daily.map(q => <QuestCard key={q.id} quest={{ ...q, type: 'daily' }} lang={lang} />)}
          </div>
        )}
      </section>

      {/* Weekly */}
      <section>
        <h2 className="font-pixel text-[9px] text-aurora mb-3">{t('quest.weekly')}</h2>
        {weekly.length === 0 ? (
          <div className="card-pixel-dark text-center py-8">
            <div className="font-pixel text-[8px] text-gray-600">{t('quest.noQuest')}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {weekly.map(q => <QuestCard key={q.id} quest={{ ...q, type: 'weekly' }} lang={lang} />)}
          </div>
        )}
      </section>
    </div>
  );
}
