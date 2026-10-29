import * as React from 'react';

import { Island } from '../../core/content/types';
import { useGame } from '../GameContext';
import { GuidePortrait, guideById } from '../guides';
import { format } from '../i18n/strings';
import { islandProgress, isPreview, nextStage } from '../progressHelpers';
import styles from '../styles.module.scss';
import { islandSilhouette, PosterIsland } from './PosterArt';

/**
 * The start screen seen from the bow of the ship: the selected island lies
 * ahead, its neighbours small on the horizon. Two arrows steer, one button
 * docks. The scene is drawn in a 1000 × 600 box that is cropped to fit.
 */

const HORIZON = 340;
const INK = '#1a2940';
const SAND = '#d9b57c';
/** Distance from the centre and scale for the islands 0, 1, 2 and 3+ steps away. */
const OFFSETS = [0, 330, 560, 760];
const SCALES = [1.1, 0.6, 0.4, 0.3];
const OPACITY = [1, 0.8, 0.5, 0];

function Waves(): React.ReactElement {
  const rows: React.ReactElement[] = [];
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const y = HORIZON + 8 + Math.pow(t, 1.8) * (600 - HORIZON - 14);
    const dash = Math.round(10 + t * 90);
    const gap = Math.round(26 + t * 150);
    const from = (i * 137) % 400;
    const style = {
      ['--od-from' as string]: `${from}px`,
      ['--od-to' as string]: `${from - (dash + gap) * 4}px`,
      ['--od-dur' as string]: `${(16 + (1 - t) * 26).toFixed(1)}s`,
      strokeDashoffset: from
    } as React.CSSProperties;
    rows.push(
      <path key={i} className={styles.deckWave} d={`M-200 ${y.toFixed(1)} H1200`} strokeWidth={(1.2 + t * 5).toFixed(1)} strokeDasharray={`${dash} ${gap}`} style={style} />
    );
  }
  return <g>{rows}</g>;
}

function SunRays(): React.ReactElement {
  const rays: string[] = [];
  for (let i = 0; i < 20; i++) {
    const a1 = (i / 20) * Math.PI * 2;
    const a2 = a1 + Math.PI / 40;
    const p = (a: number): string => `${(500 + Math.cos(a) * 1200).toFixed(0)} ${(HORIZON + Math.sin(a) * 1200).toFixed(0)}`;
    rays.push(`M500 ${HORIZON} L${p(a1)} L${p(a2)}Z`);
  }
  return <path d={rays.join(' ')} fill="#f9ebc9" opacity="0.75" />;
}

function Bow(props: { sway: string }): React.ReactElement {
  const planks: React.ReactElement[] = [];
  for (let i = -6; i <= 6; i++) planks.push(<path key={i} d={`M${500 + i * 70} 600 L500 482`} stroke="#7d5032" strokeWidth="2" />);
  return (
    <g className={`${styles.deckBow} ${props.sway}`}>
      <path d="M500 374 L40 600 M500 374 L960 600" stroke={INK} strokeWidth="2" opacity="0.55" />
      <path d="M80 600 L500 482 L920 600 Z" fill="#9a6640" />
      {planks}
      <path d="M-200 540 L496 466 L500 482 L80 600 L-200 600 Z" fill="#6b4228" />
      <path d="M1200 540 L504 466 L500 482 L920 600 L1200 600 Z" fill="#6b4228" />
      <path d="M-200 528 L497 462 L497 469 L-200 552 Z" fill="#b98256" stroke={INK} strokeWidth="2" />
      <path d="M1200 528 L503 462 L503 469 L1200 552 Z" fill="#b98256" stroke={INK} strokeWidth="2" />
      <path d="M490 478 L510 478 L502 376 L498 376 Z" fill="#6b4228" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M493 440 h14 M495 410 h10" stroke={SAND} strokeWidth="3" />
      <path d="M500 376 V352" stroke={INK} strokeWidth="2.5" />
      <path className={styles.deckPennant} d="M500 352 L530 359 L500 366 Z" fill="#c94f33" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <g fill="none" stroke={SAND} strokeWidth="6">
        <ellipse cx="190" cy="578" rx="48" ry="14" />
        <ellipse cx="190" cy="578" rx="30" ry="8" />
      </g>
    </g>
  );
}

function ArrowIcon(props: { dir: -1 | 1 }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={props.dir < 0 ? 'M15 4 L7 12 L15 20' : 'M9 4 L17 12 L9 20'} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Streaks on the water and birds in the sky while the ship sails to the next island. */
function Voyage(props: { dir: -1 | 1 }): React.ReactElement {
  const shift = { ['--od-dx' as string]: `${-props.dir * 420}px` } as React.CSSProperties;
  const streaks: React.ReactElement[] = [];
  for (let i = 0; i < 14; i++) {
    const y = HORIZON + 18 + ((i * 53) % 200);
    const x = 60 + ((i * 271) % 880);
    const length = 50 + ((i * 37) % 110);
    streaks.push(
      <path key={i} className={styles.deckStreak} d={`M${x} ${y} h${length}`} strokeWidth={1.5 + (y - HORIZON) / 70} style={{ ...shift, animationDelay: `${(i % 5) * 60}ms` }} />
    );
  }
  const from = props.dir > 0 ? 1080 : -80;
  return (
    <g>
      <g fill="none" stroke="#fbf5e6" strokeLinecap="round" opacity="0.75">
        {streaks}
      </g>
      <g className={styles.deckBirds} style={{ ['--od-bx' as string]: `${-props.dir * 1250}px` } as React.CSSProperties}>
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${from + i * 34 * props.dir} ${150 + i * 22} q7 -8 14 0 q7 -8 14 0`}
            fill="none"
            stroke="#1a2940"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </g>
  );
}

/** White water thrown up at the bow when the ship turns. */
function Spray(props: { dir: -1 | 1 }): React.ReactElement {
  const d = props.dir;
  return (
    <g className={styles.deckSplash} fill="#fbf5e6" stroke="#fbf5e6" strokeLinecap="round">
      <path d={`M${500 + d * 20} 470 q${d * 34} -18 ${d * 72} -6 M${500 + d * 30} 488 q${d * 46} -14 ${d * 96} 0`} fill="none" strokeWidth="5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={500 + d * (40 + i * 18)} cy={456 - (i % 3) * 10} r={3 + (i % 2)} stroke="none" />
      ))}
    </g>
  );
}

export function Deck(props: { islands: Island[] }): React.ReactElement {
  const game = useGame();
  const { strings, t, navigate, player } = game;
  const islands = props.islands;
  const reduceMotion = React.useMemo(() => !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const [current, setCurrent] = React.useState(() => {
    const stage = nextStage(game);
    const index = stage ? islands.indexOf(stage.island) : 0;
    return index >= 0 ? index : 0;
  });
  // Direction of the last turn: drives the roll of the bow and where the sign slides in from.
  const [turn, setTurn] = React.useState<{ dir: -1 | 1; n: number } | undefined>(undefined);
  const [docking, setDocking] = React.useState(false);
  // True while the ship is under way to the next island; drives the extra effects of the voyage.
  const [sailing, setSailing] = React.useState(false);
  const sailTimer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(sailTimer.current), []);

  if (islands.length === 0) return <></>;
  const island = islands[Math.min(current, islands.length - 1)];
  const progress = islandProgress(game, island.id);
  const done = progress.total > 0 && progress.completed === progress.total;
  const preview = isPreview(game, island);
  const guide = guideById(player.profile.guide);

  const goTo = (next: number): void => {
    if (next < 0 || next >= islands.length || next === current) return;
    const dir = next < current ? -1 : 1;
    setCurrent(next);
    setTurn({ dir, n: turn ? turn.n + 1 : 1 });
    setSailing(true);
    window.clearTimeout(sailTimer.current);
    sailTimer.current = window.setTimeout(() => setSailing(false), 1600);
  };
  const steer = (dir: -1 | 1): void => goTo(current + dir);

  // A swipe across the scene steers as well, the way a carousel works on a phone.
  const touchStart = React.useRef<{ x: number; y: number } | undefined>(undefined);
  const onTouchStart = (event: React.TouchEvent): void => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent): void => {
    const start = touchStart.current;
    touchStart.current = undefined;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(touch.clientY - start.y) * 1.5) steer(dx < 0 ? 1 : -1);
  };

  const dock = (): void => {
    if (reduceMotion) {
      navigate({ name: 'island', islandId: island.id });
      return;
    }
    setDocking(true);
    window.setTimeout(() => navigate({ name: 'island', islandId: island.id }), 750);
  };

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      steer(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      steer(1);
    }
  };

  let status: string;
  if (preview) status = strings.deckPreview;
  else if (progress.total === 0) status = strings.deckSoon;
  else if (done) status = strings.statusCompleted;
  else if (progress.completed > 0) status = format(strings.deckStagesDone, { done: progress.completed, total: progress.total });
  else status = format(strings.deckStages, { total: progress.total });

  const left = islands[current - 1];
  const right = islands[current + 1];
  const sway = turn ? (turn.n % 2 === 0 ? (turn.dir < 0 ? styles.deckSwayLeftB : styles.deckSwayRightB) : turn.dir < 0 ? styles.deckSwayLeft : styles.deckSwayRight) : '';
  // The horizon leans against the roll of the bow, as it does from a ship that changes course.
  const tilt =
    turn && !reduceMotion ? (turn.n % 2 === 0 ? (turn.dir < 0 ? styles.deckTiltLeftB : styles.deckTiltRightB) : turn.dir < 0 ? styles.deckTiltLeft : styles.deckTiltRight) : '';
  const signClass = turn ? `${styles.plaque} ${turn.dir < 0 ? styles.plaqueFromLeft : styles.plaqueFromRight}` : styles.plaque;

  return (
    <section
      className={docking ? `${styles.deck} ${styles.deckDocking}` : styles.deck}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={strings.viewDeck}
      data-tour="deck"
    >
      <svg className={styles.deckScene} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="od-deck-dots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="2" fill="#f8cf72" />
          </pattern>
          <clipPath id="od-deck-sky">
            <rect x="-200" y="-200" width="1400" height={HORIZON + 201} />
          </clipPath>
        </defs>
        <g className={`${styles.deckWorld} ${tilt}`}>
          <rect x="-200" y="-200" width="1400" height={HORIZON + 202} fill="#f5e0b0" />
          <g clipPath="url(#od-deck-sky)">
            <SunRays />
            {/* Sky and sun drift a little against the turn, which makes steering feel like a change of course. */}
            <g className={styles.deckParallax} style={{ transform: `translateX(${-current * 8}px)` }}>
              <circle cx="500" cy={HORIZON} r="128" fill="#f0a537" />
              <circle cx="500" cy={HORIZON} r="128" fill="url(#od-deck-dots)" opacity="0.55" />
            </g>
          </g>
          <g className={styles.deckParallax} style={{ transform: `translateX(${-current * 36}px)` }}>
            <g className={styles.deckCloud} fill="#fbf4e4">
              <rect x="80" y="118" width="180" height="26" rx="13" />
              <rect x="122" y="96" width="92" height="30" rx="15" />
              <rect x="720" y="74" width="150" height="22" rx="11" />
              <rect x="760" y="56" width="70" height="26" rx="13" />
              <rect x="1180" y="104" width="160" height="24" rx="12" />
              <rect x="1214" y="84" width="80" height="26" rx="13" />
              <rect x="1520" y="66" width="140" height="22" rx="11" />
            </g>
          </g>
          <rect x="-200" y={HORIZON} width="1400" height={600 - HORIZON + 200} fill="#1f5f8b" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={500 - (170 - i * 24) / 2} y={HORIZON + 10 + i * 13} width={170 - i * 24} height="4" rx="2" fill="#f8cf72" opacity={(0.7 - i * 0.09).toFixed(2)} />
          ))}
          <Waves />
          <g className={styles.deckIslands}>
            {islands.map((isl, i) => {
              const off = i - current;
              const step = Math.min(Math.abs(off), 3);
              const x = 500 + Math.sign(off) * OFFSETS[step];
              const y = HORIZON + (step === 0 ? 10 : 2);
              const islProgress = islandProgress(game, isl.id);
              const islDone = islProgress.total > 0 && islProgress.completed === islProgress.total;
              return (
                <g
                  key={isl.id}
                  className={step === 0 ? `${styles.deckIsland} ${styles.deckIslandCurrent}` : styles.deckIsland}
                  style={{ transform: `translate(${x}px, ${y}px) scale(${SCALES[step]})`, opacity: OPACITY[step] * (isPreview(game, isl) ? 0.85 : 1) }}
                  // Pointer shortcut only; the buttons below do the same for keyboards and screen readers.
                  onClick={() => (off === 0 ? dock() : goTo(i))}
                >
                  <title>{off === 0 ? `${strings.dock}: ${t(isl.name)}` : format(strings.steerTo, { name: t(isl.name) })}</title>
                  <path d={islandSilhouette(isl.landmark)} transform="scale(1 -0.3)" fill="#164a70" opacity="0.28" />
                  <PosterIsland landmark={isl.landmark} color={isl.color} flag={islDone} />
                </g>
              );
            })}
          </g>
          {turn && sailing && !reduceMotion && <Voyage key={turn.n} dir={turn.dir} />}
        </g>
        {turn && sailing && !reduceMotion && <Spray key={`spray-${turn.n}`} dir={turn.dir} />}
        <Bow sway={sway} />
      </svg>
      <div className={styles.deckGrain} />

      <div key={current} className={signClass}>
        <div className={styles.plaqueTop}>
          <span>{format(strings.deckIslandOf, { n: current + 1, total: islands.length })}</span>
          {island.license === 'premium' ? <span className={styles.plaqueChipPremium}>Premium</span> : <span className={styles.plaqueChip}>Basic</span>}
          {done && <span className={styles.plaqueChipDone}>{strings.statusCompleted}</span>}
        </div>
        <h2 className={styles.plaqueName}>{t(island.name)}</h2>
        <p className={styles.plaqueTool}>
          {t(island.tool)} · {status}
        </p>
        <div className={styles.route}>
          {islands.map((isl, i) => {
            const p = islandProgress(game, isl.id);
            const cls = i === current ? styles.routeCurrent : p.total > 0 && p.completed === p.total ? styles.routeDone : undefined;
            return (
              <button
                type="button"
                key={isl.id}
                className={cls}
                onClick={() => goTo(i)}
                title={t(isl.name)}
                aria-label={format(strings.steerTo, { name: t(isl.name) })}
                aria-current={i === current ? 'true' : undefined}
              />
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.steer} ${styles.steerLeft}`}
        onClick={() => steer(-1)}
        disabled={!left}
        aria-label={left ? format(strings.steerTo, { name: t(left.name) }) : strings.steerFirst}
      >
        <span className={styles.steerArrow}>
          <ArrowIcon dir={-1} />
        </span>
        <span className={styles.steerCaption}>{left ? t(left.name) : strings.steerStart}</span>
      </button>
      <button
        type="button"
        className={`${styles.steer} ${styles.steerRight}`}
        onClick={() => steer(1)}
        disabled={!right}
        aria-label={right ? format(strings.steerTo, { name: t(right.name) }) : strings.steerLast}
        data-tour="steer"
      >
        <span className={styles.steerArrow}>
          <ArrowIcon dir={1} />
        </span>
        <span className={styles.steerCaption}>{right ? t(right.name) : strings.steerEnd}</span>
      </button>

      <div className={styles.deckGuide}>
        <GuidePortrait id={guide.id} className={styles.deckGuidePortrait} />
        <p>
          <b>{t(guide.name)}</b>
          {t(island.summary)}
        </p>
      </div>

      <button type="button" className={styles.dock} onClick={dock} data-tour="dock">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="5" r="2.3" />
          <path d="M12 7.3V21M7 11h10M4 14c1 4 4 7 8 7s7-3 8-7" />
        </svg>
        {done ? strings.dockAgain : preview ? strings.dockPreview : strings.dock}
      </button>
    </section>
  );
}
