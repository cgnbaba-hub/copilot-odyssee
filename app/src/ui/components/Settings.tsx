import * as React from 'react';

import { SUPPORTED_LANGS } from '../../core/i18n/locale';
import { LicenseChoice, updateProfile } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { AreaPicker } from './AreaPicker';
import { Drawer } from './Drawer';
import { GuidePicker } from './GuidePicker';
import { LicenseMockup } from './LicenseMockup';
import { LicensePicker } from './LicensePicker';

export function Settings(props: { onClose: () => void; onReset: () => void; onRestartTour: () => void }): React.ReactElement {
  const { content, player, lang, strings, update } = useGame();
  const [confirmReset, setConfirmReset] = React.useState(false);

  return (
    <Drawer id="od-settings-title" title={strings.settings} onClose={props.onClose}>
      <h3 className={styles.drawerSection}>{strings.settingsLicense}</h3>
      <LicensePicker value={player.profile.license} onChange={(license: LicenseChoice) => update((s) => updateProfile(s, { license }))} />
      <LicenseMockup highlight={player.profile.license} />

      {(content.areas || []).length > 0 && (
        <>
          <h3 className={styles.drawerSection}>{strings.settingsArea}</h3>
          <AreaPicker value={player.profile.area} onChange={(area) => update((s) => updateProfile(s, { area }))} />
        </>
      )}

      <h3 className={styles.drawerSection}>{strings.guideQuestion}</h3>
      <GuidePicker value={player.profile.guide} onChange={(guide) => update((s) => updateProfile(s, { guide }))} />

      <h3 className={styles.drawerSection}>{strings.language}</h3>
      <div className={styles.langSwitch} role="group" aria-label={strings.language}>
        {SUPPORTED_LANGS.map((l) => (
          <button
            type="button"
            key={l}
            aria-pressed={l === lang}
            className={l === lang ? styles.langActive : undefined}
            onClick={() => update((s) => updateProfile(s, { lang: l }))}
          >
            {l === 'de' ? 'Deutsch' : 'English'}
          </button>
        ))}
      </div>

      <h3 className={styles.drawerSection}>{strings.tourTitle}</h3>
      <button type="button" className={styles.button} onClick={props.onRestartTour}>
        {strings.tourRestart}
      </button>

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
