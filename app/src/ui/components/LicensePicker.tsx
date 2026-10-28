import * as React from 'react';

import { LicenseChoice } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

export function LicensePicker(props: { value: LicenseChoice; onChange: (license: LicenseChoice) => void }): React.ReactElement {
  const { strings } = useGame();
  const options: { value: LicenseChoice; title: string; hint: string; tone: string }[] = [
    { value: 'basic', title: strings.versionBasic, hint: strings.licenseBasicHint, tone: styles.choiceToneBasic },
    { value: 'premium', title: strings.versionPremium, hint: strings.licensePremiumHint, tone: styles.choiceTonePremium },
    { value: 'unknown', title: strings.licenseUnknown, hint: strings.licenseUnknownHint, tone: '' }
  ];

  return (
    <div className={styles.choiceList} role="radiogroup" aria-label={strings.licenseQuestion}>
      {options.map((o) => (
        <button
          type="button"
          role="radio"
          aria-checked={props.value === o.value}
          key={o.value}
          className={`${styles.choice} ${styles.choiceLarge} ${o.tone} ${props.value === o.value ? styles.choiceSelected : ''}`}
          onClick={() => props.onChange(o.value)}
        >
          <span className={styles.radioDot} aria-hidden="true" />
          <span className={styles.choiceText}>
            <strong>{o.title}</strong>
            <span className={styles.choiceHint}>{o.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
