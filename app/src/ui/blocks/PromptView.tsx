import * as React from 'react';

import { PromptBlock, RubricCriterion } from '../../core/content/types';
import { submitPrompt } from '../../core/progress/state';
import { evaluatePrompt, PromptFeedback } from '../../core/prompt/feedback';
import { Strings } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

function criterionName(strings: Strings, criterion: RubricCriterion): string {
  return strings[`criterion_${criterion}` as keyof Strings];
}

function criterionTip(strings: Strings, criterion: RubricCriterion): string {
  return strings[`criterionTip_${criterion}` as keyof Strings];
}

export function PromptView(props: BlockViewProps<PromptBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  const [text, setText] = React.useState('');
  const [feedback, setFeedback] = React.useState<PromptFeedback | undefined>(undefined);
  const [showExample, setShowExample] = React.useState(false);
  const inputId = `od-prompt-${block.id}`;

  const evaluate = (): void => {
    const result = evaluatePrompt(text, block.rubric);
    apply((s) => submitPrompt(s, moduleId, block.id, result.score));
    setFeedback(result);
  };

  return (
    <>
      <h2 className={styles.blockTitle}>{t(block.title)}</h2>
      <p className={styles.scenario}>{t(block.scenario)}</p>

      <label htmlFor={inputId} className={styles.label}>
        {strings.promptLabel}
      </label>
      <textarea id={inputId} className={styles.textarea} rows={5} value={text} placeholder={strings.promptPlaceholder} onChange={(e) => setText(e.target.value)} />
      <p className={styles.muted}>{strings.promptPrivacy}</p>

      <div aria-live="polite">
        {feedback && (
          <div className={styles.feedbackBox}>
            <div className={styles.scoreRow}>
              <span className={styles.scoreValue}>{feedback.score}</span>
              <span>
                <strong>{strings.score}</strong> / 100
              </span>
              <div className={styles.scoreBar}>
                <div className={styles.scoreBarFill} style={{ width: `${feedback.score}%` }} />
              </div>
            </div>
            {feedback.tooShort && <p>{strings.promptTooShort}</p>}
            <ul className={styles.criteria}>
              {feedback.met.map((c) => (
                <li key={c} className={styles.criterionMet}>
                  <strong>{criterionName(strings, c)}</strong> · {strings.criterionMet}
                </li>
              ))}
              {feedback.missing.map((c) => (
                <li key={c} className={styles.criterionMissing}>
                  <strong>{criterionName(strings, c)}</strong> · {strings.criterionMissing}: {criterionTip(strings, c)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {feedback && block.examplePrompt && (
        <div>
          <button type="button" className={styles.linkButton} aria-expanded={showExample} onClick={() => setShowExample(!showExample)}>
            {showExample ? strings.hideExample : strings.showExample}
          </button>
          {showExample && <p className={styles.example}>{t(block.examplePrompt)}</p>}
        </div>
      )}

      <div className={styles.actionBar}>
        <button type="button" className={`${feedback ? styles.button : styles.buttonPrimary} ${styles.buttonWide}`} disabled={text.trim().length === 0} onClick={evaluate}>
          {feedback ? strings.improvePrompt : strings.getFeedback}
        </button>
        {feedback && (
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonWide}`} onClick={props.onDone}>
            {strings.continue}
          </button>
        )}
      </div>
    </>
  );
}
