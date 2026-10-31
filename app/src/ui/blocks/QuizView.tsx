import * as React from 'react';

import { shuffled } from '../../core/content/shuffle';
import { Localized, QuizBlock, QuizOption } from '../../core/content/types';
import { answerQuiz } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

type Result = { optionIds: string[]; correct: boolean };

/** What to say after an attempt: the explanations of a right answer, else the first wrongly chosen option's, or that one is missing. */
function feedbackFor(options: QuizOption[], result: Result, t: (text: Localized) => string, missing: string): string[] {
  const chosen = options.filter((o) => result.optionIds.indexOf(o.id) >= 0);
  if (result.correct) return chosen.filter((o) => o.explanation).map((o) => t(o.explanation as Localized));
  const wrong = chosen.filter((o) => !o.correct)[0];
  if (wrong) return wrong.explanation ? [t(wrong.explanation)] : [];
  return [missing];
}

export function QuizView(props: BlockViewProps<QuizBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  // Mixed anew each time the question opens, so the place of an answer gives nothing away.
  const options = React.useMemo(() => shuffled(block.options), [block.id]);
  const multi = block.options.filter((o) => o.correct).length > 1;
  const [selected, setSelected] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<Result | undefined>(undefined);
  const [wrongIds, setWrongIds] = React.useState<string[]>([]);

  const toggle = (id: string): void => {
    if (!multi) setSelected([id]);
    else setSelected(selected.indexOf(id) >= 0 ? selected.filter((x) => x !== id) : selected.concat([id]));
  };

  const check = (): void => {
    if (selected.length === 0) return;
    const outcome = apply((s) => answerQuiz(s, moduleId, block, selected));
    setResult({ optionIds: selected, correct: outcome.correct });
    // With one right answer a wrong choice is ruled out; with several the player adjusts the selection.
    if (!outcome.correct && !multi) setWrongIds(wrongIds.concat(selected));
  };

  const retry = (): void => {
    if (!multi) setSelected([]);
    setResult(undefined);
  };

  const feedback = result ? feedbackFor(block.options, result, t, strings.quizMissing) : [];

  return (
    <>
      <h2 className={styles.blockTitle}>{t(block.question)}</h2>
      {multi && <p className={styles.quizMulti}>{strings.quizMultiHint}</p>}
      <div className={styles.choiceList} role={multi ? 'group' : 'radiogroup'} aria-label={t(block.question)}>
        {options.map((option, optionIndex) => {
          const isSelected = selected.indexOf(option.id) >= 0;
          let className = `${styles.choice} ${styles.choiceLarge}`;
          if (multi) className += ` ${styles.choiceMulti}`;
          if (result && isSelected && !multi) className += ` ${result.correct ? styles.choiceCorrect : styles.choiceWrong}`;
          else if (result && result.correct && isSelected) className += ` ${styles.choiceCorrect}`;
          else if (wrongIds.indexOf(option.id) >= 0) className += ` ${styles.choiceWrong}`;
          else if (isSelected) className += ` ${styles.choiceSelected}`;
          return (
            <button
              type="button"
              role={multi ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              key={option.id}
              className={className}
              disabled={!!result || wrongIds.indexOf(option.id) >= 0}
              onClick={() => toggle(option.id)}
            >
              <span className={styles.choiceLetter} aria-hidden="true">
                {multi ? (isSelected ? '✓' : '') : String.fromCharCode(65 + optionIndex)}
              </span>
              <span className={styles.choiceText}>{t(option.text)}</span>
            </button>
          );
        })}
      </div>

      <div className={result ? `${styles.actionBar} ${result.correct ? styles.actionBarGood : styles.actionBarBad}` : styles.actionBar} aria-live="polite">
        {result && (
          <div className={styles.actionFeedback}>
            <span className={styles.actionIcon} aria-hidden="true">
              {result.correct ? '✓' : '✕'}
            </span>
            <div>
              <strong>{result.correct ? strings.correct : strings.wrong}</strong>
              {feedback.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
        )}
        {!result && selected.length === 0 && <p className={styles.actionHint}>{multi ? strings.hintPickAnswers : strings.hintPickAnswer}</p>}
        {!result && (
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonWide}`} disabled={selected.length === 0} onClick={check}>
            {strings.check}
          </button>
        )}
        {result && !result.correct && (
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonWide}`} onClick={retry}>
            {strings.tryAgain}
          </button>
        )}
        {result && result.correct && (
          <button type="button" className={`${styles.buttonSuccess} ${styles.buttonWide}`} onClick={props.onDone}>
            {strings.continue}
          </button>
        )}
      </div>
    </>
  );
}
