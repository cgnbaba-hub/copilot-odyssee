import * as React from 'react';

import { updateProfile } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { LicensePicker } from './LicensePicker';

export function Onboarding(): React.ReactElement {
  const { player, strings, update } = useGame();

  return (
    <section className={`${styles.panel} ${styles.onboarding}`}>
      <h1>{strings.onboardingTitle}</h1>
      <p>{strings.onboardingIntro}</p>
      <h2>{strings.licenseQuestion}</h2>
      <LicensePicker value={player.profile.license} onChange={(license) => update((s) => updateProfile(s, { license }))} />
      <button type="button" className={styles.buttonPrimary} onClick={() => update((s) => updateProfile(s, { onboarded: true }))}>
        {strings.startJourney}
      </button>
    </section>
  );
}
