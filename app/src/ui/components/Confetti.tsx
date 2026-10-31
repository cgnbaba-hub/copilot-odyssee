import * as React from 'react';

import styles from '../styles.module.scss';

const COLORS = ['#E40028', '#F2B13A', '#1F5F8B', '#2E9B58', '#FBF6E8', '#7A6FF0', '#3D9BE9'];
const PIECES = 64;

/** A burst of confetti for completed stages: it shoots up from the middle and flutters down. Hidden for reduced motion. */
export function Confetti(): React.ReactElement {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: PIECES }, (_unused, i) => {
        const angle = (i / PIECES) * Math.PI * 2 + (i % 3) * 0.3;
        const power = 140 + ((i * 53) % 160);
        return {
          dx: `${Math.round(Math.cos(angle) * power)}px`,
          dy: `${Math.round(-Math.abs(Math.sin(angle)) * power - 60)}px`,
          fall: `${260 + ((i * 29) % 220)}px`,
          spin: `${((i * 97) % 720) - 360}deg`,
          delay: `${(i % 8) * 0.03}s`,
          duration: `${1.9 + (i % 5) * 0.22}s`,
          color: COLORS[i % COLORS.length],
          round: i % 4 === 0
        };
      }),
    []
  );
  return (
    <div className={styles.confetti} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={p.round ? styles.confettiRound : undefined}
          style={
            {
              background: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              ['--dx' as string]: p.dx,
              ['--dy' as string]: p.dy,
              ['--fall' as string]: p.fall,
              ['--spin' as string]: p.spin
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
