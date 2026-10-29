import * as React from 'react';

import { QuizBlock } from '../../core/content/types';
import { answerQuiz } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

export function QuizView(props: BlockViewProps<QuizBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [result, setResult] = React.useState<{ optionId: string; correct: boolean } | undefined>(undefined);
  const [wrongIds, setWrongIds] = React.useState<string[]>([]);

  const check = (): void => {
    if (!selected) return;
    const outcome = apply((s) => answerQuiz(s, moduleId, block, selected));
    setResult({ optionId: selected, correct: outcome.correct });
    if (!outcome.correct) setWrongIds(wrongIds.concat([selected]));
  };

  const retry = (): void => {
    setSelected(undefined);
    setResult(undefined);
  };

  const answered = block.options.filter((o) => result && o.id === result.optionId)[0];

  return (
    <>
      <h2 className={styles.blockTitle}>{t(block.question)}</h2>
      <div className={styles.choiceList} role="radiogroup" aria-label={t(block.question)}>
        {block.options.map((option, optionIndex) => {
          let className = `${styles.choice} ${styles.choiceLarge}`;
          if (result && result.optionId === option.id) className += ` ${result.correct ? styles.choiceCorrect : styles.choiceWrong}`;
          else if (wrongIds.indexOf(option.id) >= 0) className += ` ${styles.choiceWrong}`;
          else if (selected === option.id) className += ` ${styles.choiceSelected}`;
          return (
            <button
              type="button"
              role="radio"
              aria-checked={selected === option.id}
              key={option.id}
              className={className}
              disabled={!!result || wrongIds.indexOf(option.id) >= 0}
              onClick={() => setSelected(option.id)}
            >
              <span className={styles.choiceLetter} aria-hidden="true">
                {String.fromCharCode(65 + optionIndex)}
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
              {answered && answered.explanation && <p>{t(answered.explanation)}</p>}
            </div>
          </div>
        )}
        {!result && !selected && <p className={styles.actionHint}>{strings.hintPickAnswer}</p>}
        {!result && (
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonWide}`} disabled={!selected} onClick={check}>
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
