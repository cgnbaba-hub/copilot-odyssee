import * as React from 'react';

import { LicenseChoice, updateProfile } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { LicensePicker } from './LicensePicker';

export function Settings(props: { onClose: () => void; onReset: () => void }): React.ReactElement {
  const { player, strings, update } = useGame();

  return (
    <div className={styles.dialogBackdrop} onClick={props.onClose}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="od-settings-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="od-settings-title">{strings.settings}</h2>
        <h3>{strings.settingsLicense}</h3>
        <LicensePicker value={player.profile.license} onChange={(license: LicenseChoice) => update((s) => updateProfile(s, { license }))} />
        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.buttonDanger}
            onClick={() => {
              if (window.confirm(strings.resetConfirm)) props.onReset();
            }}
          >
            {strings.resetProgress}
          </button>
          <button type="button" className={styles.button} onClick={props.onClose}>
            {strings.close}
          </button>
        </div>
      </div>
    </div>
  );
}
