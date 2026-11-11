import * as React from 'react';

import { currentChallenge, daysUntilNextWeek, weekKey } from '../../core/challenge/challenge';
import { CHALLENGE_XP, completeChallenge } from '../../core/progress/state';
import { APP_NAMES, copyText, CopyState } from '../copilot';
import { CopilotLink } from './CopilotLink';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

/**
 * The challenge of the week on the start screen: one short task in the real
 * Copilot, a new one every Monday, with bonus Seemeilen once per week.
 */
export function ChallengeCard(): React.ReactElement {
  const { content, player, strings, theme, t, apply } = useGame();
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const copyRef = React.useRef<HTMLParagraphElement>(null);
  // Folded to one line by default, so the start screen stays calm; opens on a click.
  const [open, setOpen] = React.useState(false);
  const now = new Date();
  const challenge = currentChallenge(content.challenges, player.profile.license, now);
  if (!challenge) return <></>;

  const week = weekKey(now);
  const done = !!(player.challenges && player.challenges[week]);
  const days = daysUntilNextWeek(now);
  const text = challenge.copyText ? t(challenge.copyText) : undefined;
  const where = challenge.app ? format(strings.challengeInApp, { app: APP_NAMES[challenge.app] }) : strings.challengeInChat;

  return (
    <section className={done ? `${styles.challenge} ${styles.challengeDone}` : styles.challenge} aria-labelledby="od-challenge-title">
      <div className={styles.challengeHead}>
        <span className={styles.challengeBadge}>{strings.challengeTitle}</span>
        <span className={styles.challengeDays}>{days === 1 ? strings.challengeLastDay : format(strings.challengeDaysLeft, { days })}</span>
      </div>
      <div className={styles.challengeLine}>
        <h2 id="od-challenge-title" className={styles.challengeName}>
          {done && <span aria-hidden="true">✓ </span>}
          {t(challenge.title)}
        </h2>
        {!done && (
          <span className={styles.challengeReward}>
            +{CHALLENGE_XP} {t(theme.terms.xp)}
          </span>
        )}
        <button type="button" className={styles.challengeToggle} aria-expanded={open} aria-controls="od-challenge-body" onClick={() => setOpen(!open)}>
          {open ? strings.challengeFold : strings.challengeOpen}
        </button>
      </div>
      {open && (
        <div id="od-challenge-body">
          <p className={styles.challengeTask}>{t(challenge.task)}</p>
          <p className={styles.challengeWhere}>{where}</p>

          {done ? (
            <div className={styles.challengeStamp} role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>{strings.challengeDone}</strong>
                <p>{days === 1 ? strings.challengeNextTomorrow : format(strings.challengeNext, { days })}</p>
              </div>
            </div>
          ) : (
            <>
              {text && (
                <div className={styles.challengeCopy}>
                  <p className={styles.copyText} ref={copyRef}>
                    {text}
                  </p>
                  <button
                    type="button"
                    className={copyState === 'copied' ? styles.buttonSuccess : styles.button}
                    onClick={() => copyText(text, copyRef.current || undefined, setCopyState)}
                  >
                    {copyState === 'copied' ? `✓ ${strings.missionCopied}` : `⧉ ${strings.missionCopy}`}
                  </button>
                </div>
              )}
              <div className={styles.challengeActions}>
                <button type="button" className={styles.buttonPrimary} onClick={() => apply((s) => completeChallenge(s, week, challenge.id))}>
                  {format(strings.challengeComplete, { xp: CHALLENGE_XP, xpName: t(theme.terms.xp) })}
                </button>
                {!challenge.app && <CopilotLink text={text} className={styles.edgeFallback} label={strings.missionOpenCopilotTab} />}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
