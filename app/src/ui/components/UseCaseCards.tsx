import * as React from 'react';

import { findModule } from '../../core/content/bundle';
import { minutesPerMonth } from '../../core/progress/state';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

export function UseCaseCards(): React.ReactElement {
  const { content, player, strings, t } = useGame();
  const cards = player.useCases.slice().reverse();
  const frequency = {
    daily: strings.frequency_daily,
    weekly: strings.frequency_weekly,
    monthly: strings.frequency_monthly,
    rarely: strings.frequency_rarely
  };

  return (
    <>
      <h2 className={styles.sectionTitle}>{strings.useCaseTitle}</h2>
      {cards.length === 0 ? (
        <p className={styles.muted}>{strings.useCaseEmpty}</p>
      ) : (
        <ul className={styles.cardGrid}>
          {cards.map((card) => {
            const module = findModule(content, card.moduleId);
            return (
              <li key={card.id} className={styles.useCaseCard}>
                <p className={styles.eyebrow}>{module ? t(module.title) : card.moduleId}</p>
                <p className={styles.useCaseTask}>{card.task}</p>
                <p className={styles.muted}>
                  {frequency[card.frequency]} · {card.minutesPerTime} {strings.minutes} ·{' '}
                  {format(strings.useCaseTimePerMonth, { minutes: minutesPerMonth(card) })}
                </p>
                {card.prompt && <p className={styles.useCasePrompt}>{card.prompt}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
