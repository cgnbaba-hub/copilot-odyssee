import * as React from 'react';

import { SUPPORTED_LANGS } from '../../core/i18n/locale';
import { LicenseChoice, updateProfile } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { Drawer } from './Drawer';
import { LicenseMockup } from './LicenseMockup';
import { LicensePicker } from './LicensePicker';

export function Settings(props: { onClose: () => void; onReset: () => void }): React.ReactElement {
  const { player, lang, strings, update } = useGame();
  const [confirmReset, setConfirmReset] = React.useState(false);

  return (
    <Drawer id="od-settings-title" title={strings.settings} onClose={props.onClose}>
      <h3 className={styles.drawerSection}>{strings.settingsLicense}</h3>
      <LicensePicker value={player.profile.license} onChange={(license: LicenseChoice) => update((s) => updateProfile(s, { license }))} />
      <LicenseMockup highlight={player.profile.license} />

      <h3 className={styles.drawerSection}>{strings.language}</h3>
      <div className={styles.langSwitch} role="group" aria-label={strings.language}>
        {SUPPORTED_LANGS.map((l) => (
          <button type="button" key={l} aria-pressed={l === lang} className={l === lang ? styles.langActive : undefined} onClick={() => update((s) => updateProfile(s, { lang: l }))}>
            {l === 'de' ? 'Deutsch' : 'English'}
          </button>
        ))}
      </div>

      <div className={styles.drawerFooter}>
        {confirmReset ? (
          <div className={styles.feedbackBad} role="alert">
            <p>{strings.resetConfirm}</p>
            <div className={styles.blockActions}>
              <button type="button" className={styles.buttonDanger} onClick={props.onReset}>
                {strings.resetYes}
              </button>
              <button type="button" className={styles.button} onClick={() => setConfirmReset(false)}>
                {strings.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.buttonDanger} onClick={() => setConfirmReset(true)}>
            {strings.resetProgress}
          </button>
        )}
      </div>
    </Drawer>
  );
}
