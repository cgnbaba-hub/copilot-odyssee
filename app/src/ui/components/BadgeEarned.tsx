import * as React from 'react';

import { BadgeId } from '../../core/progress/badges';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';
import { BadgeArt } from './BadgeArt';
import { badgeName } from './badgeHelpers';
import { Confetti } from './Confetti';

/** Shown once per kind of badge, right after it was earned. */
export function BadgeEarned(props: { id: BadgeId; onClose: (toPassport: boolean) => void }): React.ReactElement {
  const { strings } = useGame();
  const name = badgeName(strings, props.id);
  return (
    <div className={styles.dialogBackdrop} onClick={() => props.onClose(false)}>
      <Confetti />
      <div className={`${styles.dialog} ${styles.rankUp}`} role="dialog" aria-modal="true" aria-labelledby="od-badge-title" onClick={(e) => e.stopPropagation()}>
        <BadgeArt id={props.id} earned={true} className={styles.badgeEarnedArt} />
        <p className={styles.eyebrow}>{strings.badgeEarnedTitle}</p>
        <h2 id="od-badge-title" className={styles.rankUpName}>
          {name}
        </h2>
        <p>{format(strings.badgeEarnedText, { name })}</p>
        <div className={styles.badgeEarnedActions}>
          <button type="button" className={styles.buttonPrimary} onClick={() => props.onClose(true)} autoFocus>
            {strings.badgeToPassport}
          </button>
          <button type="button" className={styles.button} onClick={() => props.onClose(false)}>
            {strings.badgeLater}
          </button>
        </div>
      </div>
    </div>
  );
}
