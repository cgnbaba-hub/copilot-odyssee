import * as React from 'react';

import { MissionBlock } from '../../core/content/types';
import { completeMission } from '../../core/progress/state';
import { format, Strings } from '../i18n/strings';
import { APP_NAMES, COPILOT_CHAT_URL, copyText, CopyState } from '../copilot';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

const RATINGS = [1, 2, 3, 4, 5];

export function MissionView(props: BlockViewProps<MissionBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  const [rating, setRating] = React.useState<number | undefined>(undefined);
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const copyRef = React.useRef<HTMLParagraphElement>(null);
  const inCopilot = block.copilot !== false;
  const textToCopy = block.copyText ? t(block.copyText) : undefined;

  const copy = (): void => {
    if (textToCopy) copyText(textToCopy, copyRef.current || undefined, setCopyState);
  };

  const copyBox = textToCopy && (
    <div className={styles.copyBox}>
      <p className={styles.copyLabel}>{strings.missionCopyLabel}</p>
      <p className={styles.copyText} ref={copyRef}>
        {textToCopy}
      </p>
      <button type="button" className={copyState === 'copied' ? styles.buttonSuccess : styles.button} onClick={copy}>
        {copyState === 'copied' ? `✓ ${strings.missionCopied}` : `⧉ ${strings.missionCopy}`}
      </button>
      {copyState === 'failed' && <p className={styles.copyFailed}>{strings.missionCopyFailed}</p>}
    </div>
  );

  // Each step carries the button it talks about, so nobody has to look for it.
  const app = block.app ? { app: APP_NAMES[block.app] } : undefined;
  const steps: { text: string; action?: React.ReactNode }[] = app
    ? [
        { text: format(strings.missionAppStep1, app) },
        { text: format(textToCopy ? strings.missionAppStep2Copy : strings.missionAppStep2, app), action: copyBox },
        { text: strings.missionAppStep3 },
        { text: strings.missionAppStep4 }
      ]
    : [
        {
          text: strings.missionStep1,
          action: (
            <a className={`${styles.buttonPrimary} ${styles.buttonBig}`} href={COPILOT_CHAT_URL} target="_blank" rel="noopener noreferrer">
              {strings.missionOpenCopilot} ↗
            </a>
          )
        },
        { text: textToCopy ? strings.missionStep2Copy : strings.missionStep2, action: copyBox },
        { text: strings.missionStep3 },
        { text: strings.missionStep4 }
      ];

  return (
    <>
      <h2 className={styles.blockTitle}>{t(block.title)}</h2>
      <p className={styles.scenario}>{t(block.task)}</p>

      {inCopilot ? (
        <div className={styles.missionSteps}>
          <h3>{strings.missionStepsTitle}</h3>
          <ol>
            {steps.map((step, i) => (
              <li key={i}>
                <span className={styles.howNumber}>{i + 1}</span>
                <div className={styles.missionStepBody}>
                  <span>{step.text}</span>
                  {step.action}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        copyBox
      )}

      {block.tip && (
        <p className={styles.notice}>
          <strong>{strings.missionTip}:</strong> {t(block.tip)}
        </p>
      )}

      <fieldset className={styles.rating}>
        <legend>{strings.missionRating}</legend>
        <div className={styles.ratingButtons}>
          {RATINGS.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={rating === value}
              className={rating === value ? `${styles.ratingButton} ${styles.ratingButtonSelected}` : styles.ratingButton}
              onClick={() => setRating(value)}
            >
              <span className={styles.ratingFace} aria-hidden="true">
                {['😞', '🙁', '😐', '🙂', '😄'][value - 1]}
              </span>
              <span>{strings[`rating_${value}` as keyof Strings]}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.actionBar}>
        <button
          type="button"
          className={`${styles.buttonPrimary} ${styles.buttonWide}`}
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
    </>
  );
}
