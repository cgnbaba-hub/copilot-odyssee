import * as React from 'react';

import styles from '../styles.module.scss';
import { Sailboat } from './PosterArt';

/** Shown while the app or a stage loads: a small boat rocking on the waves, with the text below. */
export function Loading(props: { text: string; compact?: boolean }): React.ReactElement {
  return (
    <div className={props.compact ? `${styles.loading} ${styles.loadingCompact}` : styles.loading} role="status">
      <svg viewBox="-80 -110 160 140" aria-hidden="true">
        <circle cx="0" cy="-30" r="56" fill="#f2b13a" opacity="0.85" />
        <g className={styles.loadingBoat}>
          <Sailboat />
        </g>
        <path className={styles.loadingWave} d="M-120 12 Q-105 4 -90 12 T-60 12 T-30 12 T0 12 T30 12 T60 12 T90 12 T120 12 T150 12 V30 H-120 Z" fill="#1f5f8b" />
      </svg>
      <p>{props.text}</p>
    </div>
  );
}
