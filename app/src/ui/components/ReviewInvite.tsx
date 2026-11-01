import * as React from 'react';

import { dueReviews, REVIEW_ROUND_SIZE, reviewOffered, snoozeReview } from '../../core/progress/review';
import { useGame } from '../GameContext';
import { GuidePortrait, guideById } from '../guides';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

/** About half a minute per question, rounded up to whole minutes. */
function minutesFor(count: number): number {
  return Math.max(1, Math.ceil(count / 2));
}

/**
 * The companion steps into the spotlight when questions are due for
 * brushing up, and offers a short round. It is an offer: «Heute nicht»
 * hides it until tomorrow.
 */
export function ReviewInvite(): React.ReactElement {
  const { content, player, strings, t, navigate, update } = useGame();
  const now = new Date();
  if (!reviewOffered(player, content, now)) return <></>;
  const count = Math.min(dueReviews(player, content, now).length, REVIEW_ROUND_SIZE);
  const guide = guideById(player.profile.guide);
  const text = count === 1 ? strings.reviewInviteOne : format(strings.reviewInviteMany, { count, minutes: minutesFor(count) });

  return (
    <section className={styles.reviewInvite} aria-labelledby="od-review-invite">
      <div className={styles.reviewSpot} aria-hidden="true">
        <span className={styles.reviewRays} />
        <GuidePortrait id={guide.id} className={styles.reviewGuide} />
      </div>
      <div className={styles.reviewBubble}>
        <p className={styles.reviewBadge} id="od-review-invite">
          {strings.reviewBadge}
        </p>
        <span className={styles.guideName}>{t(guide.name)}</span>
        <p className={styles.reviewText}>{text}</p>
        <div className={styles.reviewActions}>
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => navigate({ name: 'review' })}>
            {strings.reviewStart}
          </button>
          <button type="button" className={styles.linkButton} onClick={() => update((s) => snoozeReview(s, new Date()))}>
            {strings.reviewLater}
          </button>
        </div>
      </div>
    </section>
  );
}
