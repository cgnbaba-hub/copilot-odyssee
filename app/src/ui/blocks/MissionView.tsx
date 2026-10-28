import * as React from 'react';

import { MissionBlock } from '../../core/content/types';
import { completeMission } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

const COPILOT_CHAT_URL = 'https://m365.cloud.microsoft/chat';

export function MissionView(props: BlockViewProps<MissionBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  const [rating, setRating] = React.useState<number | undefined>(undefined);

  return (
    <div>
      <h2 className={styles.blockTitle}>{t(block.title)}</h2>
      <p className={styles.scenario}>{t(block.task)}</p>
      {block.tip && (
        <p className={styles.notice}>
          <strong>{strings.missionTip}:</strong> {t(block.tip)}
        </p>
      )}
      <p>
        <a className={styles.button} href={COPILOT_CHAT_URL} target="_blank" rel="noopener noreferrer">
          {strings.missionOpenCopilot} ↗
        </a>
      </p>

      <fieldset className={styles.rating}>
        <legend>{strings.missionRating}</legend>
        <div className={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={rating === value}
              className={rating === value ? `${styles.ratingButton} ${styles.choiceSelected}` : styles.ratingButton}
              onClick={() => setRating(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <p className={styles.muted}>{strings.missionRatingScale}</p>
      </fieldset>

      <div className={styles.blockActions}>
        <button
          type="button"
          className={styles.buttonPrimary}
          disabled={rating === undefined}
          onClick={() => {
            if (rating === undefined) return;
            apply((s) => completeMission(s, moduleId, block.id, rating));
            props.onDone();
          }}
        >
          {strings.missionDone}
        </button>
      </div>
    </div>
  );
}
