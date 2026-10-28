import * as React from 'react';

import { License } from '../../core/content/types';
import { useGame } from '../GameContext';
import { licenseCovers } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CheckIcon, LockIcon } from './Art';

/**
 * Says in plain words whether something works with the player's Copilot:
 * green for "works with your Copilot", violet with a lock for "Premium only".
 */
export function LicenseChip(props: { license: License }): React.ReactElement {
  const game = useGame();
  const { strings } = game;
  if (!licenseCovers(game, props.license)) {
    return (
      <span className={styles.chipPremium}>
        <LockIcon /> {strings.premiumOnly}
      </span>
    );
  }
  if (props.license === 'premium') {
    return (
      <span className={styles.chipPremium}>
        <CheckIcon /> {strings.premiumIncluded}
      </span>
    );
  }
  return (
    <span className={styles.chipWorks}>
      <CheckIcon /> {strings.worksForYou}
    </span>
  );
}
