import * as React from 'react';

import { PromptTemplate } from '../../core/content/types';
import { isPromptSaved, toggleSavedPrompt } from '../../core/progress/state';
import { APP_NAMES, copyText, CopyState } from '../copilot';
import { Game, useGame } from '../GameContext';
import { format } from '../i18n/strings';
import { licenseCovers } from '../progressHelpers';
import { dayNumber } from '../sky';
import styles from '../styles.module.scss';
import { CopilotLink } from './CopilotLink';
import { PromptText } from './PromptCard';

/**
 * A message in a bottle drifts past the ship every day: one prompt from the
 * library that suits the player's licence and field of work. Opening it is
 * remembered for the day in this browser only; it is a small surprise, not
 * progress.
 */

const READ_KEY = 'odyssee.bottle';

/** The prompt of the day; the same all day, a different one tomorrow. */
export function bottlePrompt(game: Game, date: Date): PromptTemplate | undefined {
  const area = game.player.profile.area;
  const all = (game.content.prompts || []).filter((p) => licenseCovers(game, p.license));
  const suited = all.filter((p) => !p.areas || !area || p.areas.indexOf(area) >= 0);
  const pool = suited.length > 0 ? suited : all;
  if (pool.length === 0) return undefined;
  return pool[dayNumber(date) % pool.length];
}

function openedToday(day: number): boolean {
  try {
    return window.localStorage.getItem(READ_KEY) === String(day);
  } catch {
    return false;
  }
}

function markOpened(day: number): void {
  try {
    window.localStorage.setItem(READ_KEY, String(day));
  } catch {
    // Then the bottle simply sparkles again next time.
  }
}

/** The bottle bobbing on the water; opens the note on top of the scene. */
export function Bottle(): React.ReactElement {
  const game = useGame();
  const { strings, t, player, update } = game;
  const today = new Date();
  const day = dayNumber(today);
  const prompt = bottlePrompt(game, today);
  const [fresh, setFresh] = React.useState(() => !openedToday(day));
  const [open, setOpen] = React.useState(false);
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const bottleRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (open && closeRef.current) closeRef.current.focus();
  }, [open]);

  if (!prompt) return <></>;

  const show = (): void => {
    setOpen(true);
    setFresh(false);
    markOpened(day);
  };
  const hide = (): void => {
    setOpen(false);
    setCopyState('idle');
    if (bottleRef.current) bottleRef.current.focus();
  };
  const saved = isPromptSaved(player, prompt.id);
  const place = prompt.app ? format(strings.placeApp, { app: APP_NAMES[prompt.app] }) : strings.placeChat;

  return (
    <>
      <button
        type="button"
        ref={bottleRef}
        className={fresh ? `${styles.bottle} ${styles.bottleFresh}` : styles.bottle}
        onClick={show}
        aria-label={fresh ? strings.bottleOpenNew : strings.bottleOpen}
        aria-expanded={open}
        title={fresh ? strings.bottleOpenNew : strings.bottleOpen}
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <g className={styles.bottleBody}>
            <path
              d="M24 14h10v6c7 3 11 9 11 17v12c0 5-3 8-8 8H21c-5 0-8-3-8-8V37c0-8 4-14 11-17Z"
              fill="#bfe3dc"
              stroke="#1a2940"
              strokeWidth="3"
              strokeLinejoin="round"
              transform="rotate(-24 29 36)"
            />
            <path d="M22 34h14v14H22Z" fill="#fbf1d6" stroke="#1a2940" strokeWidth="2" transform="rotate(-24 29 36)" />
            <path d="M25 39h8M25 43h6" stroke="#c94f33" strokeWidth="2" strokeLinecap="round" transform="rotate(-24 29 36)" />
            <path d="M23 7h12v8H23Z" fill="#a0683f" stroke="#1a2940" strokeWidth="3" strokeLinejoin="round" transform="rotate(-24 29 36)" />
          </g>
          <path className={styles.bottleRipple} d="M4 56q7-5 14 0t14 0 14 0 14 0" fill="none" stroke="#fbf5e6" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {fresh && <span className={styles.bottleBadge}>{strings.bottleNew}</span>}
      </button>

      {open && (
        <div className={styles.bottleNote} role="dialog" aria-modal="false" aria-labelledby="od-bottle-title" onKeyDown={(e) => e.key === 'Escape' && hide()}>
          <div className={styles.bottlePaper}>
            <p className={styles.bottleEyebrow}>{strings.bottleTitle}</p>
            <h2 id="od-bottle-title" className={styles.bottleHeading}>
              {t(prompt.title)}
            </h2>
            <p className={styles.bottlePlace}>{place}</p>
            <p className={styles.bottleText} ref={textRef}>
              <PromptText text={t(prompt.prompt)} />
            </p>
            <div className={styles.bottleActions}>
              <CopilotLink text={t(prompt.prompt)} app={prompt.app} className={styles.buttonPrimary} />
              <button
                type="button"
                className={copyState === 'copied' ? styles.buttonSuccess : styles.button}
                onClick={() => copyText(t(prompt.prompt), textRef.current || undefined, setCopyState)}
              >
                {copyState === 'copied' ? `✓ ${strings.copied}` : `⧉ ${strings.copy}`}
              </button>
              <button type="button" className={styles.button} aria-pressed={saved} onClick={() => update((s) => toggleSavedPrompt(s, prompt.id))}>
                {saved ? `★ ${strings.savedPrompt}` : `☆ ${strings.savePrompt}`}
              </button>
              <button type="button" ref={closeRef} className={styles.linkButton} onClick={hide}>
                {strings.bottleClose}
              </button>
            </div>
            {copyState === 'failed' && <p className={styles.copyFailed}>{strings.missionCopyFailed}</p>}
            <p className={styles.bottleFoot}>{strings.bottleTomorrow}</p>
          </div>
        </div>
      )}
    </>
  );
}
