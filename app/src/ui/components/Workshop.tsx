import * as React from 'react';

import { RubricCriterion } from '../../core/content/types';
import { evaluatePrompt, PromptFeedback } from '../../core/prompt/feedback';
import { criterionName, criterionTip, PromptFeedbackBox } from '../blocks/PromptView';
import { COPILOT_CHAT_URL, copyText, CopyState } from '../copilot';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';
import { Guide } from './Guide';
import { SheetTabs } from './SheetTabs';

const RUBRIC: RubricCriterion[] = ['goal', 'context', 'source', 'expectation'];

/**
 * The prompt workshop as its own tab: any prompt, any time, checked with the
 * same fixed rules as in the stages. Nothing leaves the browser and nothing
 * is stored, so it earns no miles.
 */
export function Workshop(props: { task?: string }): React.ReactElement {
  const { strings, navigate, pinboard } = useGame();
  const [text, setText] = React.useState('');
  const [feedback, setFeedback] = React.useState<PromptFeedback | undefined>(undefined);
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const boxRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const box = boxRef.current;
    if (feedback && box && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [feedback]);

  const check = (): void => setFeedback(evaluatePrompt(text, RUBRIC));

  return (
    <section className={styles.panel}>
      <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToOverview}
      </button>
      <SheetTabs active="workshop" />
      <h1 className={styles.pageTitle}>{strings.workshopTitle}</h1>
      <Guide text={strings.workshopGuide} />

      <ul className={styles.workshopIngredients} aria-label={strings.workshopIngredients}>
        {RUBRIC.map((c) => (
          <li key={c}>
            <strong>{criterionName(strings, c)}</strong>
            <span>{criterionTip(strings, c)}</span>
          </li>
        ))}
      </ul>

      {props.task && <p className={styles.scenario}>{format(strings.workshopForTask, { task: props.task })}</p>}

      <label htmlFor="od-workshop-text" className={styles.label}>
        {strings.promptLabel}
      </label>
      <textarea
        id="od-workshop-text"
        ref={textRef}
        className={styles.textarea}
        rows={6}
        value={text}
        placeholder={strings.workshopPlaceholder}
        onChange={(e) => {
          setText(e.target.value);
          setCopyState('idle');
        }}
      />
      <p className={styles.muted}>{strings.workshopPrivacy}</p>

      <div className={styles.blockActions}>
        <button type="button" className={styles.buttonPrimary} disabled={text.trim().length === 0} onClick={check}>
          {feedback ? strings.improvePrompt : strings.getFeedback}
        </button>
        {feedback && (
          <>
            <button
              type="button"
              className={copyState === 'copied' ? styles.buttonSuccess : styles.button}
              onClick={() => copyText(text, textRef.current || undefined, setCopyState)}
            >
              {copyState === 'copied' ? `✓ ${strings.copied}` : `⧉ ${strings.copy}`}
            </button>
            <a className={styles.button} href={COPILOT_CHAT_URL} target="_blank" rel="noopener noreferrer">
              {strings.missionOpenCopilot} ↗
            </a>
            {pinboard && (
              <button type="button" className={styles.button} onClick={() => navigate({ name: 'pinboard', draft: { title: props.task || '', prompt: text } })}>
                📌 {strings.pinboardShareOwn}
              </button>
            )}
          </>
        )}
      </div>

      <div aria-live="polite">{feedback && <PromptFeedbackBox feedback={feedback} boxRef={boxRef} />}</div>
    </section>
  );
}
