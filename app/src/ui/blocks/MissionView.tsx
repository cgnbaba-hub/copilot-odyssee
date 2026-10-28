import * as React from 'react';

import { MissionApp, MissionBlock } from '../../core/content/types';
import { completeMission } from '../../core/progress/state';
import { format, Strings } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

const COPILOT_CHAT_URL = 'https://m365.cloud.microsoft/chat';

/** Product names, the same in every language. */
export const APP_NAMES: Record<MissionApp, string> = {
  outlook: 'Outlook',
  teams: 'Teams',
  word: 'Word',
  excel: 'Excel',
  powerpoint: 'PowerPoint'
};
const RATINGS = [1, 2, 3, 4, 5];

type CopyState = 'idle' | 'copied' | 'failed';

/** Selects the text of an element so it can be copied by hand. */
function selectText(element: HTMLElement | undefined): void {
  const selection = window.getSelection();
  if (!element || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function MissionView(props: BlockViewProps<MissionBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  const [rating, setRating] = React.useState<number | undefined>(undefined);
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const copyRef = React.useRef<HTMLParagraphElement>(null);
  const inCopilot = block.copilot !== false;
  const copyText = block.copyText ? t(block.copyText) : undefined;

  const copy = (): void => {
    if (!copyText) return;
    const failed = (): void => {
      selectText(copyRef.current || undefined);
      setCopyState('failed');
    };
    try {
      navigator.clipboard.writeText(copyText).then(() => setCopyState('copied'), failed);
    } catch {
      failed();
    }
  };

  const copyBox = copyText && (
    <div className={styles.copyBox}>
      <p className={styles.copyLabel}>{strings.missionCopyLabel}</p>
      <p className={styles.copyText} ref={copyRef}>
        {copyText}
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
        { text: format(copyText ? strings.missionAppStep2Copy : strings.missionAppStep2, app), action: copyBox },
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
        { text: copyText ? strings.missionStep2Copy : strings.missionStep2, action: copyBox },
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
