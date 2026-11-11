import * as React from 'react';

import { newsFor, newsSeenDay } from '../../core/content/news';
import { updateProfile } from '../../core/progress/state';
import { formatDate } from '../format';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** How many changes the card lists before it says there are more. */
const MAX_NEWS = 3;

/**
 * «Neu seit deinem letzten Besuch»: stages that were added or changed, so
 * people who are already under way hear when Copilot and the content moved
 * on. «Gesehen» puts the card aside until the next change.
 */
export function NewsCard(): React.ReactElement {
  const { content, player, lang, strings, showDrafts, t, navigate, update } = useGame();
  const now = new Date();
  const items = newsFor(content, player, { showDrafts }, now);
  if (items.length === 0) return <></>;

  return (
    <section className={styles.newsCard} aria-labelledby="od-news">
      <div className={styles.newsHead}>
        <h2 id="od-news" className={styles.newsTitle}>
          {strings.newsTitle}
        </h2>
        <button type="button" className={styles.linkButton} onClick={() => update((s) => updateProfile(s, { newsSeen: newsSeenDay(new Date()) }))}>
          {strings.newsSeen}
        </button>
      </div>
      <ul className={styles.newsList}>
        {items.slice(0, MAX_NEWS).map((item) => (
          <li key={item.module.id}>
            <span className={item.change.new ? `${styles.newsKind} ${styles.newsKindNew}` : styles.newsKind}>{item.change.new ? strings.newsNew : strings.newsChanged}</span>
            <div className={styles.newsText}>
              <strong>{t(item.module.title)}</strong>
              <span>{t(item.change.note)}</span>
              <span className={styles.muted}>
                {item.island ? `${t(item.island.name)} · ` : ''}
                {formatDate(lang, `${item.change.date}T12:00:00`)}
                {item.completedBefore ? ` · ${strings.newsSinceDone}` : ''}
              </span>
            </div>
            <button type="button" className={styles.button} onClick={() => navigate({ name: 'module', moduleId: item.module.id })}>
              {item.completedBefore ? strings.newsLookAgain : strings.newsLook}
            </button>
          </li>
        ))}
      </ul>
      {items.length > MAX_NEWS && <p className={styles.muted}>{strings.newsMore.replace('{count}', String(items.length - MAX_NEWS))}</p>}
    </section>
  );
}
