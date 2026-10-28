import * as React from 'react';

import { LicenseChoice } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

export function LicensePicker(props: { value: LicenseChoice; onChange: (license: LicenseChoice) => void }): React.ReactElement {
  const { strings } = useGame();
  const options: { value: LicenseChoice; title: string; hint: string }[] = [
    { value: 'basic', title: strings.licenseBasic, hint: strings.licenseBasicHint },
    { value: 'premium', title: strings.licensePremium, hint: strings.licensePremiumHint },
    { value: 'unknown', title: strings.licenseUnknown, hint: strings.licenseUnknownHint }
  ];

  return (
    <div className={styles.choiceList} role="radiogroup" aria-label={strings.licenseQuestion}>
      {options.map((o) => (
        <button
          type="button"
          role="radio"
          aria-checked={props.value === o.value}
          key={o.value}
          className={props.value === o.value ? `${styles.choice} ${styles.choiceSelected}` : styles.choice}
          onClick={() => props.onChange(o.value)}
        >
          <span className={styles.choiceText}>
            <strong>{o.title}</strong>
            <span className={styles.choiceHint}>{o.hint}</span>
          </span>
        </button>
      ))}
      <p className={styles.muted}>{strings.licenseHowTo}</p>
    </div>
  );
}
