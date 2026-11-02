import * as React from 'react';

import { findIsland } from '../../core/content/bundle';
import { shuffled } from '../../core/content/shuffle';
import { QuizBlock } from '../../core/content/types';
import { examFor, examOpen, examPassMark, examPassed, recordExam } from '../../core/progress/exam';
import { isQuizAnswerCorrect } from '../../core/progress/state';
import { QuizView } from '../blocks/QuizView';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import { isPreview } from '../progressHelpers';
import styles from '../styles.module.scss';
import { IslandArt } from './Art';
import { Confetti } from './Confetti';
import { Guide } from './Guide';
import { Loading } from './Loading';

/** How long the result shows before the passport opens for the stamp. */
const STAMP_DELAY_MS = 4200;

/**
 * The island exam: new questions about the whole island, in a new order
 * every time. Only the first answer to a question counts. Enough of them
 * right and the island is complete, which is celebrated with the stamp.
 */
export function ExamView(props: { islandId: string }): React.ReactElement {
  const game = useGame();
  const { content, player, strings, t, apply, navigate } = game;
  const island = findIsland(content, props.islandId);
  const exam = examFor(content, props.islandId);
  const [attempt, setAttempt] = React.useState(0);
  const [questions, setQuestions] = React.useState<QuizBlock[]>(() => (exam ? shuffled(exam.questions) : []));
  const [index, setIndex] = React.useState(0);
  const firstAnswers = React.useRef<{ [id: string]: boolean }>({});
  const [result, setResult] = React.useState<{ right: number; passed: boolean; firstPass: boolean } | undefined>(undefined);

  const finished = !!exam && index >= questions.length;
  React.useEffect(() => {
    if (!finished || result || !exam) return;
    const right = questions.filter((q) => firstAnswers.current[q.id]).length;
    const wasPassed = examPassed(player, exam.island);
    const outcome = apply((s) => recordExam(s, exam.island, right, questions.length, new Date()));
    setResult({ right, passed: outcome.passed, firstPass: outcome.passed && !wasPassed });
  }, [finished]);

  // The first pass ends at the passport, where the island's stamp is pressed in.
  React.useEffect(() => {
    if (!result || !result.firstPass) return undefined;
    const timer = window.setTimeout(() => navigate({ name: 'passport', stamp: props.islandId }), STAMP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [result]);

  const backToIsland = (
    <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'island', islandId: props.islandId })}>
      ← {strings.toIsland}
    </button>
  );

  if (!island || !exam) return <section className={styles.panel}>{backToIsland}</section>;
  const style = { ['--od-island' as string]: island.color } as React.CSSProperties;
  const mark = examPassMark(exam.questions.length);

  if (isPreview(game, island) || !examOpen(content, player, island.id, { showDrafts: game.showDrafts })) {
    return (
      <section className={styles.panel} style={style}>
        {backToIsland}
        <h1 className={styles.pageTitle}>{format(strings.examTitle, { island: t(island.name) })}</h1>
        <Guide text={isPreview(game, island) ? strings.lockedStageText : strings.examClosed} />
      </section>
    );
  }

  if (result) {
    const again = (): void => {
      firstAnswers.current = {};
      setQuestions(shuffled(exam.questions));
      setIndex(0);
      setResult(undefined);
      setAttempt(attempt + 1);
    };
    return (
      <section className={`${styles.panel} ${styles.examDone}`} style={style}>
        {result.passed && <Confetti />}
        <div className={styles.doneArtWrap}>
          <IslandArt island={island} className={styles.moduleDoneArt} />
          {result.passed && (
            <span className={styles.doneStamp} aria-hidden="true">
              <b>{strings.examPassedStamp}</b>
            </span>
          )}
        </div>
        <h1 className={styles.pageTitle}>{result.passed ? strings.examPassedTitle : strings.examFailedTitle}</h1>
        <p className={styles.lead}>{format(strings.examScore, { right: result.right, total: questions.length, mark })}</p>
        {result.firstPass ? (
          <div className={styles.stampNotice}>
            <p>{format(strings.stampEarned, { island: t(island.name) })}</p>
            <span className={styles.stampCountdown} aria-hidden="true">
              <i style={{ animationDuration: `${STAMP_DELAY_MS}ms` }} />
            </span>
            <button type="button" className={styles.buttonPrimary} onClick={() => navigate({ name: 'passport', stamp: island.id })}>
              {strings.stampGoNow}
            </button>
          </div>
        ) : (
          <Guide text={result.passed ? strings.examPassedAgain : format(strings.examFailedText, { mark })} cheer={result.passed} />
        )}
        <div className={styles.doneActions}>
          {!result.passed && (
            <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={again}>
              {strings.examAgain}
            </button>
          )}
          <button type="button" className={styles.button} onClick={() => navigate({ name: 'island', islandId: island.id })}>
            {strings.toIsland}
          </button>
        </div>
      </section>
    );
  }

  // The result is recorded right after the last answer; until then there is nothing more to ask.
  if (finished) return <Loading text={strings.loading} compact />;
  const question = questions[index];
  const answer = (optionIds: string[]): boolean => {
    const correct = isQuizAnswerCorrect(question, optionIds);
    if (firstAnswers.current[question.id] === undefined) firstAnswers.current[question.id] = correct;
    return correct;
  };

  return (
    <section className={styles.lesson} style={style}>
      {backToIsland}
      <div className={styles.lessonHead}>
        <IslandArt island={island} className={styles.lessonArt} />
        <div>
          <p className={styles.eyebrow}>{t(island.name)}</p>
          <h1 className={styles.lessonTitle}>{strings.examHeading}</h1>
        </div>
      </div>
      <ol className={styles.reviewDots} aria-label={format(strings.examProgress, { current: index + 1, total: questions.length })}>
        {questions.map((q, i) => (
          <li key={q.id} className={i < index ? styles.reviewDotDone : i === index ? styles.reviewDotNow : undefined} />
        ))}
      </ol>
      <Guide
        text={index === 0 ? format(strings.examIntro, { total: questions.length, mark }) : format(strings.examProgress, { current: index + 1, total: questions.length })}
        compact
      />
      <div className={styles.lessonCard}>
        <QuizView key={`${attempt}-${question.id}`} moduleId={`exam-${island.id}`} block={question} onAnswer={answer} onDone={() => setIndex(index + 1)} />
      </div>
    </section>
  );
}
