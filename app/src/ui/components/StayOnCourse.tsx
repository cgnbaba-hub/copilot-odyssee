import * as React from 'react';

import { activeWeeks, buildIcs, DEFAULT_SLOT, PLAN_WEEKS, PlanSlot, weekStreak } from '../../core/progress/habit';
import { updateProfile } from '../../core/progress/state';
import { saveFile } from '../download';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

const WORKDAYS = [0, 1, 2, 3, 4];
const LENGTHS = [15, 30];

/**
 * Staying with it, in one slim bar on the start page: the weeks in a row in
 * which something was done, and a weekly slot for the person's own calendar.
 * It appears once the first stage is done, so new players are not asked to
 * plan before they know what for.
 */
export function StayOnCourse(): React.ReactElement {
  const { player, strings, appUrl, update } = useGame();
  const plan = player.profile.plan;
  const [open, setOpen] = React.useState(false);
  const [slot, setSlot] = React.useState<PlanSlot>(plan || DEFAULT_SLOT);
  const [made, setMade] = React.useState(false);
  if (activeWeeks(player).length === 0) return <></>;

  const streak = weekStreak(player, new Date());
  const days = strings.planDays.split(',');
  const streakText =
    streak.weeks === 0
      ? strings.streakNone
      : `${streak.weeks === 1 ? strings.streakOne : format(strings.streakMany, { weeks: streak.weeks })} · ${streak.thisWeek ? strings.streakThisWeekDone : strings.streakThisWeekOpen}`;

  const download = (): void => {
    const ics = buildIcs({
      slot,
      now: new Date(),
      title: format(strings.planEventTitle, { minutes: slot.minutes }),
      description: strings.planEventText,
      url: appUrl
    });
    saveFile('copilot-odyssee.ics', ics, 'text/calendar;charset=utf-8');
    update((s) => updateProfile(s, { plan: slot }));
    setMade(true);
  };

  return (
    <section className={styles.courseBar} aria-label={strings.planTitle}>
      <p className={styles.courseStreak}>
        <span className={streak.weeks > 0 ? `${styles.courseFlame} ${styles.courseFlameOn}` : styles.courseFlame} aria-hidden="true">
          {streak.weeks > 0 ? streak.weeks : '·'}
        </span>
        {streakText}
      </p>
      <p className={styles.coursePlan}>
        {plan && <span>{format(strings.planYours, { day: days[plan.weekday] || '', time: plan.time })}</span>}
        <button type="button" className={styles.linkButton} aria-expanded={open} onClick={() => setOpen(!open)}>
          {plan ? strings.planChange : strings.planOffer}
        </button>
      </p>
      {open && (
        <div className={styles.coursePicker}>
          <p className={styles.coursePickerTitle}>{strings.planTitle}</p>
          <p className={styles.muted}>{format(strings.planIntro, { weeks: PLAN_WEEKS })}</p>
          <div className={styles.courseFields}>
            <div className={styles.courseDays} role="radiogroup" aria-label={strings.planDay}>
              {WORKDAYS.map((day) => (
                <button
                  type="button"
                  role="radio"
                  key={day}
                  aria-checked={slot.weekday === day}
                  className={slot.weekday === day ? styles.courseDayOn : undefined}
                  onClick={() => setSlot({ ...slot, weekday: day })}
                >
                  {days[day]}
                </button>
              ))}
            </div>
            <label className={styles.courseField}>
              <span>{strings.planTime}</span>
              <input type="time" step={900} value={slot.time} onChange={(e) => e.target.value && setSlot({ ...slot, time: e.target.value })} />
            </label>
            <label className={styles.courseField}>
              <span>{strings.planLength}</span>
              <select value={slot.minutes} onChange={(e) => setSlot({ ...slot, minutes: Number(e.target.value) })}>
                {LENGTHS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {format(strings.planMinutes, { minutes })}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.blockActions}>
            <button type="button" className={styles.buttonPrimary} onClick={download}>
              {strings.planDownload}
            </button>
            <button type="button" className={styles.button} onClick={() => setOpen(false)}>
              {strings.planClose}
            </button>
          </div>
          {made && (
            <p className={styles.coursePickerDone} role="status">
              ✓ {strings.planDone}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
