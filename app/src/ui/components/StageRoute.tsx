import * as React from 'react';

import { Block, Island, LearningModule } from '../../core/content/types';
import { moduleStatus } from '../../core/progress/state';
import { BlockKindIcon, blockKindNames } from '../blockKinds';
import { useGame } from '../GameContext';
import { GuidePortrait } from '../guides';
import { format } from '../i18n/strings';
import { isModulePreview } from '../progressHelpers';
import styles from '../styles.module.scss';
import { LockIcon } from './Art';
import { mixColor } from './PosterArt';

/** The trail across the island in a 600 × 170 drawing, from the beach up to the summit. */
const TRAIL: [number, number][] = [
  [52, 116],
  [120, 104],
  [190, 98],
  [255, 94],
  [315, 82],
  [370, 66],
  [420, 52],
  [468, 44]
];
const W = 600;
const H = 170;

/** Evenly spaced points along the trail, one per step. */
function stations(count: number): [number, number][] {
  const lengths = [0];
  for (let i = 1; i < TRAIL.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(TRAIL[i][0] - TRAIL[i - 1][0], TRAIL[i][1] - TRAIL[i - 1][1]));
  }
  const total = lengths[lengths.length - 1];
  return Array.from({ length: count }, (_unused, i) => {
    const target = count === 1 ? total / 2 : (total * i) / (count - 1);
    let k = 1;
    while (k < lengths.length - 1 && lengths[k] < target) k++;
    const f = (target - lengths[k - 1]) / (lengths[k] - lengths[k - 1] || 1);
    return [TRAIL[k - 1][0] + (TRAIL[k][0] - TRAIL[k - 1][0]) * f, TRAIL[k - 1][1] + (TRAIL[k][1] - TRAIL[k - 1][1]) * f];
  });
}

const pct = (x: number, y: number): React.CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

/** One station on the trail. */
interface TrailStop {
  id: string;
  /** Short name under the station. */
  label: string;
  /** Read out for screen readers. */
  spoken: string;
  icon: React.ReactNode;
  state: 'done' | 'current' | 'next' | 'locked';
}

const CHECK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/** The island with its trail, stations and the companion standing at `guide` (the flag when past the last). */
function Trail(props: { stops: TrailStop[]; guide: number; finished: boolean; island?: Island; label: string }): React.ReactElement {
  const { player } = useGame();
  const total = props.stops.length;
  const points = stations(total);
  const guideAt = props.guide >= total ? [points[total - 1][0] + 18, points[total - 1][1] - 6] : points[props.guide];
  const land = props.island ? mixColor(props.island.color, '#7f9a4e', 0.55) : '#7f9a4e';
  const shade = mixColor(land, '#1a2940', 0.25);
  const stateClass = { done: styles.stopDone, current: styles.stopCurrent, next: styles.stopNext, locked: `${styles.stopNext} ${styles.stopLocked}` };

  return (
    <div className={styles.trail}>
      <ol className={styles.visuallyHidden} aria-label={props.label}>
        {props.stops.map((stop) => (
          <li key={stop.id} aria-current={stop.state === 'current' ? 'step' : undefined}>
            {stop.spoken}
          </li>
        ))}
      </ol>
      <svg className={styles.trailArt} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <rect x="0" y="122" width={W} height={H - 122} fill="#1f5f8b" />
        <path
          d="M0 132 Q20 126 40 132 T80 132 T120 132 T160 132 T200 132 T240 132 T280 132 T320 132 T360 132 T400 132 T440 132 T480 132 T520 132 T560 132 T600 132"
          fill="none"
          stroke="#fbf6e8"
          strokeWidth="1.5"
          opacity="0.45"
        />
        <path
          d="M14 124 C70 112 150 100 230 96 C300 92 350 70 410 44 C450 26 492 22 520 40 C548 60 570 98 588 124 Z"
          fill={land}
          stroke="#1a2940"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M492 26 C520 32 546 62 566 100 C574 112 582 120 588 124 L540 124 C548 92 530 52 492 26 Z" fill={shade} opacity="0.55" />
        <path d="M14 124 C40 118 70 114 100 116 L520 116 C548 116 572 120 588 124 Z" fill="#e3c88f" stroke="#1a2940" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={TRAIL.map((p) => p.join(',')).join(' ')} fill="none" stroke="#fbf6e8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        <polyline
          points={TRAIL.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#1a2940"
          strokeWidth="2"
          strokeDasharray="2 7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform={`translate(${points[total - 1][0] + 18} ${points[total - 1][1]})`}>
          <path d="M0 0 V-34" stroke="#1a2940" strokeWidth="2.5" />
          <path
            className={props.finished ? styles.trailFlagUp : undefined}
            d="M0 -34 L22 -28 L0 -22 Z"
            fill={props.finished ? '#e40028' : '#fbf6e8'}
            stroke="#1a2940"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      {props.stops.map((stop, i) => {
        const [x, y] = points[i];
        return (
          <span key={stop.id} className={`${styles.trailStop} ${stateClass[stop.state]}`} style={pct(x, y)}>
            <span className={styles.stopIcon}>{stop.state === 'done' ? CHECK : stop.icon}</span>
            <span className={styles.trailLabel} aria-hidden="true">
              {stop.label}
            </span>
          </span>
        );
      })}
      <span className={styles.trailGuide} style={pct(guideAt[0], guideAt[1])} aria-hidden="true">
        <GuidePortrait id={player.profile.guide} />
      </span>
    </div>
  );
}

/**
 * The steps of a stage as stations on a trail across the island. Done ones
 * are ticked, the next ones wait, and the companion walks along to the
 * current step. Screen readers get the same as a plain list.
 */
export function StageRoute(props: { blocks: Block[]; index: number; island?: Island }): React.ReactElement {
  const { strings } = useGame();
  const total = props.blocks.length;
  const current = Math.min(props.index, total);
  const stops: TrailStop[] = props.blocks.map((block, i) => ({
    id: block.id,
    label: blockKindNames(strings, block.type).short,
    spoken: `${format(strings.stepOf, { current: i + 1, total })}: ${blockKindNames(strings, block.type).short}${i < current ? ` (${strings.statusCompleted})` : ''}`,
    icon: <BlockKindIcon type={block.type} />,
    state: i < current ? 'done' : i === current ? 'current' : 'next'
  }));
  return (
    <Trail
      stops={stops}
      guide={Math.min(current, total - 1)}
      finished={current >= total}
      island={props.island}
      label={format(strings.stepOf, { current: Math.min(current + 1, total), total })}
    />
  );
}

/** How long the companion waits before walking on to the next stage. */
const WALK_DELAY_MS = 700;

/**
 * The stages of an island on the same trail, shown when a stage is done:
 * the companion starts at the finished stage and walks on to the next open
 * one, or up to the flag when the island is done.
 */
export function IslandRoute(props: { modules: LearningModule[]; finishedId: string; island?: Island }): React.ReactElement {
  const game = useGame();
  const { strings, player, t } = game;
  const total = props.modules.length;
  const states = props.modules.map((m): TrailStop['state'] =>
    isModulePreview(game, m) && moduleStatus(player, m) !== 'completed' ? 'locked' : moduleStatus(player, m) === 'completed' ? 'done' : 'next'
  );
  const from = Math.max(0, props.modules.map((m) => m.id).indexOf(props.finishedId));
  const open = states.indexOf('next');
  const allDone = states.every((x) => x === 'done');
  // Up to the next open stage; to the flag when all are done; otherwise (only locked ones left) the companion stays.
  const to = open >= 0 ? open : allDone ? total : from;
  const [guide, setGuide] = React.useState(from);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setGuide(to), WALK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [to]);

  const stops: TrailStop[] = props.modules.map((m, i) => ({
    id: m.id,
    label: format(strings.stageNumber, { n: i + 1 }),
    spoken: `${format(strings.stageNumber, { n: i + 1 })}: ${t(m.title)}${states[i] === 'done' ? ` (${strings.statusCompleted})` : states[i] === 'locked' ? ` (${strings.lockedStage})` : ''}`,
    icon: states[i] === 'locked' ? <LockIcon /> : <b className={styles.stopNumber}>{i + 1}</b>,
    state: states[i] === 'next' && i === to ? 'current' : states[i]
  }));
  return <Trail stops={stops} guide={guide} finished={allDone} island={props.island} label={strings.islandRouteLabel} />;
}
