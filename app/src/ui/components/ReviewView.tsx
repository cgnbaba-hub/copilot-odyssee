import * as React from 'react';

import { findIsland } from '../../core/content/bundle';
import { answerReview, DueReview, dueReviews, nextReviewDay, REVIEW_ROUND_SIZE } from '../../core/progress/review';
import { isQuizAnswerCorrect } from '../../core/progress/state';
import { QuizView } from '../blocks/QuizView';
import { formatLongDate } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';
import { Confetti } from './Confetti';
import { Guide } from './Guide';

/**
 * A short round of questions that tripped the player up a few days ago.
 * Only the first answer to each question counts for the schedule; after a
 * wrong one the player can still try again, as in the stage.
 */
export function ReviewView(): React.ReactElement {
  const { content, player, lang, strings, t, apply, navigate, reviewIntervals } = useGame();
  // The round is fixed when it starts, so answering does not reshuffle it.
  const [round] = React.useState<DueReview[]>(() => dueReviews(player, content, new Date()).slice(0, REVIEW_ROUND_SIZE));
  const [index, setIndex] = React.useState(0);
  const firstAnswers = React.useRef<{ [key: string]: boolean }>({});
  const back = (
    <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'map' })}>
      ← {strings.backToOverview}
    </button>
  );

  if (round.length === 0) {
    const next = nextReviewDay(player, content, new Date());
    return (
      <section className={styles.panel}>
        {back}
        <h1 className={styles.pageTitle}>{strings.reviewTitle}</h1>
        <Guide text={strings.reviewEmpty} />
        {next && <p className={styles.muted}>{format(strings.reviewEmptyNext, { date: formatLongDate(lang, next) })}</p>}
      </section>
    );
  }

  if (index >= round.length) {
    const right = round.filter((r) => firstAnswers.current[r.key]).length;
    return (
      <section className={`${styles.panel} ${styles.reviewDone}`}>
        {right === round.length && <Confetti />}
        <h1 className={styles.pageTitle}>{strings.reviewDoneTitle}</h1>
        <p className={styles.lead}>{format(strings.reviewDoneText, { right, total: round.length })}</p>
        <Guide text={strings.reviewDoneHint} cheer />
        <div className={styles.doneActions}>
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => navigate({ name: 'map' })}>
            {strings.backToOverview}
          </button>
        </div>
      </section>
    );
  }

  const item = round[index];
  const island = findIsland(content, item.module.island);
  const answer = (optionIds: string[]): boolean => {
    const correct = isQuizAnswerCorrect(item.quiz, optionIds);
    if (firstAnswers.current[item.key] === undefined) {
      firstAnswers.current[item.key] = correct;
      apply((s) => answerReview(s, item.key, correct, new Date(), reviewIntervals));
    }
    return correct;
  };

  return (
    <section className={styles.lesson} style={island ? ({ ['--od-island' as string]: island.color } as React.CSSProperties) : undefined}>
      {back}
      <div className={styles.reviewHead}>
        <h1 className={styles.lessonTitle}>{strings.reviewTitle}</h1>
        <ol className={styles.reviewDots} aria-label={format(strings.reviewGuide, { current: index + 1, total: round.length })}>
          {round.map((r, i) => (
            <li key={r.key} className={i < index ? styles.reviewDotDone : i === index ? styles.reviewDotNow : undefined} />
          ))}
        </ol>
      </div>
      <Guide text={format(strings.reviewGuide, { current: index + 1, total: round.length })} compact />
      <div className={styles.lessonCard}>
        <p className={styles.reviewFrom}>{format(strings.reviewFrom, { island: island ? t(island.name) : '', stage: t(item.module.title) })}</p>
        <QuizView key={item.key} moduleId={item.module.id} block={item.quiz} onAnswer={answer} onDone={() => setIndex(index + 1)} />
      </div>
    </section>
  );
}
