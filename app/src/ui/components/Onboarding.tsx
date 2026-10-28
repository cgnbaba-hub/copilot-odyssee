import * as React from 'react';

import { updateProfile } from '../../core/progress/state';
import { AreaPicker } from './AreaPicker';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { SeaScene } from './Art';
import { Guide } from './Guide';
import { LicenseMockup } from './LicenseMockup';
import { LicensePicker } from './LicensePicker';
import { RichText } from './RichText';

/** Short screens: welcome, which Copilot version, field of work (when the content has areas), how the journey works. */
export function Onboarding(): React.ReactElement {
  const { content, player, strings, theme, t, update } = useGame();
  const hasAreas = (content.areas || []).length > 0;
  const total = hasAreas ? 4 : 3;
  const howStep = total;
  const [step, setStep] = React.useState(1);
  const [howToOpen, setHowToOpen] = React.useState(false);
  const guide = t(theme.terms.guide);

  const finish = (): void => {
    update((s) => updateProfile(s, { onboarded: true }));
  };

  return (
    <section className={`${styles.panel} ${styles.onboarding}`} aria-labelledby="od-onboarding-title">
      <SeaScene className={step === 1 ? styles.onboardingScene : `${styles.onboardingScene} ${styles.onboardingSceneSmall}`} />
      <div className={styles.onboardingBody}>
        <p className={styles.stepCounter}>{format(strings.onboardingStep, { current: step, total })}</p>

        {step === 1 && (
          <>
            <h1 id="od-onboarding-title" className={styles.pageTitle}>
              {strings.welcomeTitle}
            </h1>
            <Guide text={format(strings.welcomeGuide, { guide })} />
            <p className={styles.lead}>{strings.welcomeText}</p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 id="od-onboarding-title" className={styles.pageTitle}>
              {strings.licenseQuestion}
            </h1>
            <Guide text={strings.licenseGuide} />
            <LicensePicker value={player.profile.license} onChange={(license) => update((s) => updateProfile(s, { license }))} />
            <div className={styles.howTo}>
              <button type="button" className={styles.howToToggle} aria-expanded={howToOpen} onClick={() => setHowToOpen(!howToOpen)}>
                <span aria-hidden="true">{howToOpen ? '−' : '+'}</span> {strings.licenseHowToTitle}
              </button>
              {howToOpen && (
                <div className={styles.howToBody}>
                  <RichText text={strings.licenseHowTo} />
                  <LicenseMockup highlight={player.profile.license} />
                </div>
              )}
            </div>
          </>
        )}

        {hasAreas && step === 3 && (
          <>
            <h1 id="od-onboarding-title" className={styles.pageTitle}>
              {strings.areaQuestion}
            </h1>
            <Guide text={strings.areaGuide} />
            <AreaPicker value={player.profile.area} onChange={(area) => update((s) => updateProfile(s, { area }))} />
            <p className={styles.muted}>{strings.areaLater}</p>
          </>
        )}

        {step === howStep && (
          <>
            <h1 id="od-onboarding-title" className={styles.pageTitle}>
              {strings.howTitle}
            </h1>
            <ol className={styles.howSteps}>
              <li>
                <span className={styles.howNumber}>1</span>
                <strong>{strings.how1Title}</strong>
                <span>{strings.how1Text}</span>
              </li>
              <li>
                <span className={styles.howNumber}>2</span>
                <strong>{strings.how2Title}</strong>
                <span>{strings.how2Text}</span>
              </li>
              <li>
                <span className={styles.howNumber}>3</span>
                <strong>{strings.how3Title}</strong>
                <span>{strings.how3Text}</span>
              </li>
            </ol>
            <p className={styles.lead}>{strings.howRewards}</p>
          </>
        )}

        <div className={styles.wizardActions}>
          {step > 1 ? (
            <button type="button" className={styles.button} onClick={() => setStep(step - 1)}>
              {strings.back}
            </button>
          ) : (
            <span />
          )}
          {step < total ? (
            <button type="button" className={styles.buttonPrimary} onClick={() => setStep(step + 1)}>
              {step === 1 ? strings.welcomeStart : strings.next}
            </button>
          ) : (
            <button type="button" className={styles.buttonPrimary} onClick={finish}>
              {strings.startJourney}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
