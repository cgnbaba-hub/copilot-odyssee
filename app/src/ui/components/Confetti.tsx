import * as React from 'react';

import styles from '../styles.module.scss';

const COLORS = ['#FFC23D', '#1FA9C9', '#1167C9', '#23884C', '#E9A23B', '#6A4BC4', '#FFFFFF'];
const PIECES = 36;

/** A short burst of confetti for completed stages. Hidden for reduced motion. */
export function Confetti(): React.ReactElement {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: PIECES }, (_unused, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 9) * 0.07}s`,
        duration: `${1.6 + (i % 5) * 0.25}s`,
        color: COLORS[i % COLORS.length],
        rotate: `${(i * 47) % 360}deg`
      })),
    []
  );
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, background: p.color, transform: `rotate(${p.rotate})` }}
        />
      ))}
    </div>
  );
}
