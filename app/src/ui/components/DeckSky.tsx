import * as React from 'react';

import styles from '../styles.module.scss';
import { SkyMood } from '../sky';

/**
 * What moves in the sky and on the water seen from the deck: it follows the
 * time of day and the weather of the day (see sky.ts). Everything here is
 * decoration, hidden from screen readers by the surrounding SVG.
 */

const INK = '#1a2940';
const FOAM = '#fbf5e6';

/** Small, fixed pseudo-random numbers, so the stars do not jump between renders. */
function seeded(n: number): () => number {
  let s = n;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const STARS = ((): { x: number; y: number; r: number; delay: number }[] => {
  const rnd = seeded(7);
  const stars: { x: number; y: number; r: number; delay: number }[] = [];
  while (stars.length < 46) {
    const x = rnd() * 1000;
    const y = 10 + rnd() * 250;
    // Keep the middle above the islands free.
    if (x > 300 && x < 700 && y > 120) continue;
    stars.push({ x, y, r: 0.9 + rnd() * 1.8, delay: rnd() * 4 });
  }
  return stars;
})();

export const MOON = { x: 690, y: 118 };

export function SkyDefs(props: { mood: SkyMood }): React.ReactElement {
  const { mood } = props;
  return (
    <>
      <linearGradient id="od-deck-sky-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mood.skyTop} />
        <stop offset="1" stopColor={mood.skyLow} />
      </linearGradient>
      <mask id="od-deck-moon">
        <circle cx={MOON.x} cy={MOON.y} r="36" fill="#fff" />
        <circle cx={MOON.x + 15} cy={MOON.y - 9} r="31" fill="#000" />
      </mask>
      <linearGradient id="od-deck-meteor" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
    </>
  );
}

/** The arcs of a rainbow, drawn in one after the other. */
const BANDS = ['#e05a47', '#f08a3c', '#f5c94a', '#6dbb7a', '#4f9fd1', '#8a6fc0'];

export function Rainbow(): React.ReactElement {
  return (
    <g fill="none" strokeWidth="11" opacity="0.62">
      {BANDS.map((color, i) => {
        const r = 430 - i * 11;
        return (
          <path
            key={color}
            className={styles.deckRainbow}
            d={`M${500 - r} ${340 + 60} A${r} ${r} 0 0 1 ${500 + r} ${340 + 60}`}
            stroke={color}
            pathLength={100}
            style={{ animationDelay: `${i * 90}ms` }}
          />
        );
      })}
    </g>
  );
}

export function Stars(): React.ReactElement {
  return (
    <g fill="#fdf6dc">
      {STARS.map((s, i) => (
        <circle key={i} className={styles.deckStar} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(1)} style={{ animationDelay: `${s.delay.toFixed(2)}s` }} />
      ))}
    </g>
  );
}

export function Moon(props: { color: string }): React.ReactElement {
  return (
    <g>
      <circle cx={MOON.x} cy={MOON.y} r="62" fill={props.color} opacity="0.12" className={styles.deckMoonGlow} />
      <circle cx={MOON.x} cy={MOON.y} r="36" fill={props.color} mask="url(#od-deck-moon)" />
    </g>
  );
}

/** Now and then a shooting star crosses the night sky. */
export function Meteors(): React.ReactElement {
  return (
    <g stroke="url(#od-deck-meteor)" strokeWidth="2.6" strokeLinecap="round" fill="none">
      <path className={styles.deckMeteor} d="M150 40 L330 118" pathLength={100} />
      <path className={styles.deckMeteor} d="M640 30 L820 96" pathLength={100} style={{ animationDelay: '7.5s' }} />
    </g>
  );
}

/** More and heavier clouds on a cloudy day. */
export function ExtraClouds(props: { color: string }): React.ReactElement {
  return (
    <g className={styles.deckCloudSlow} fill={props.color}>
      <rect x="300" y="40" width="210" height="28" rx="14" opacity="0.9" />
      <rect x="350" y="16" width="110" height="32" rx="16" opacity="0.9" />
      <rect x="-60" y="196" width="150" height="20" rx="10" opacity="0.8" />
      <rect x="880" y="170" width="170" height="22" rx="11" opacity="0.85" />
      <rect x="920" y="150" width="80" height="26" rx="13" opacity="0.85" />
    </g>
  );
}

/** A sail far out on the horizon, slowly crossing the view. */
export function DistantSail(props: { y: number }): React.ReactElement {
  return (
    <g className={styles.deckFarSail}>
      <g transform={`translate(130 ${props.y})`}>
        <path d="M-12 0 L12 0 L8 5 L-8 5 Z" fill={INK} />
        <path d="M-1 -2 L-1 -26 L10 -3 Z" fill={FOAM} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M-3 -4 L-3 -20 L-11 -4 Z" fill={FOAM} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
    </g>
  );
}

/** Gulls gliding across the sky with a slow beat of their wings. */
export function Gulls(props: { count: number }): React.ReactElement {
  const gulls = [
    { y: 150, dur: 44, delay: -8, s: 1 },
    { y: 118, dur: 52, delay: -30, s: 0.75 },
    { y: 196, dur: 38, delay: -19, s: 0.6 },
    { y: 92, dur: 60, delay: -46, s: 0.55 }
  ].slice(0, props.count);
  return (
    <g fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
      {gulls.map((g, i) => (
        <g key={i} className={styles.deckGull} style={{ animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}>
          <g transform={`translate(0 ${g.y}) scale(${g.s})`}>
            <path className={styles.deckGullWing} d="M0 0 q9 -10 18 0 q9 -10 18 0" strokeWidth="3" style={{ animationDelay: `${i * 0.37}s` }} />
          </g>
        </g>
      ))}
    </g>
  );
}

const DOLPHIN = 'M-31 4 C-20 -8 4 -12 22 -6 L31 -11 L29 -2 L34 4 L22 2 C6 10 -16 12 -31 4 Z M-6 -9 L1 -20 L6 -8 Z';

/**
 * A dolphin leaps out of the water and dives back in. It turns about a
 * point below the surface; the clip hides everything under the waterline.
 */
function Leap(props: { id: string; x: number; y: number; scale: number; delay: number; color: string }): React.ReactElement {
  const { id, x, y, scale, delay, color } = props;
  const timing = { animationDelay: `${delay}s` };
  return (
    <g transform={`translate(${x} ${y + 40 * scale}) scale(${scale})`}>
      <clipPath id={id}>
        <rect x="-200" y="-300" width="400" height="260" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <g className={styles.deckDolphin} style={timing}>
          <path d={DOLPHIN} transform="translate(0 -80)" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      </g>
      <g fill="none" stroke={FOAM} strokeWidth="4" strokeLinecap="round">
        <ellipse className={styles.deckSplashIn} cx="-69" cy="-40" rx="22" ry="5" style={timing} />
        <ellipse className={styles.deckSplashOut} cx="69" cy="-40" rx="22" ry="5" style={timing} />
      </g>
    </g>
  );
}

export function Dolphins(props: { color: string }): React.ReactElement {
  return (
    <g>
      <Leap id="od-leap-a" x={205} y={384} scale={0.85} delay={1.5} color={props.color} />
      <Leap id="od-leap-b" x={262} y={392} scale={0.75} delay={1.9} color={props.color} />
      <Leap id="od-leap-c" x={672} y={372} scale={0.6} delay={8} color={props.color} />
    </g>
  );
}

/** White crests that come and go when a fresh breeze blows. */
export function Whitecaps(): React.ReactElement {
  const caps: React.ReactElement[] = [];
  const rnd = seeded(3);
  for (let i = 0; i < 18; i++) {
    const y = 352 + Math.pow(rnd(), 1.4) * 150;
    const x = rnd() * 1000;
    const w = 6 + ((y - 340) / 160) * 18;
    caps.push(
      <path
        key={i}
        className={styles.deckCap}
        d={`M${x.toFixed(0)} ${y.toFixed(0)} q${(w / 2).toFixed(1)} ${(-w / 3).toFixed(1)} ${w.toFixed(1)} 0`}
        style={{ animationDelay: `${(rnd() * 5).toFixed(2)}s` }}
      />
    );
  }
  return (
    <g fill="none" stroke={FOAM} strokeWidth="2.6" strokeLinecap="round">
      {caps}
    </g>
  );
}

/** Snow falling on the deck on a winter day. */
export function Snow(): React.ReactElement {
  const rnd = seeded(11);
  const flakes: React.ReactElement[] = [];
  for (let i = 0; i < 54; i++) {
    const x = rnd() * 1040 - 20;
    const y = rnd() * 600;
    const r = 1.6 + rnd() * 2.8;
    const style = {
      ['--od-from' as string]: `${(-y - 20).toFixed(0)}px`,
      ['--od-to' as string]: `${(620 - y).toFixed(0)}px`,
      ['--od-drift' as string]: `${(rnd() * 80 - 40).toFixed(0)}px`,
      animationDuration: `${(7 + rnd() * 8).toFixed(1)}s`,
      animationDelay: `${(-rnd() * 14).toFixed(1)}s`
    } as React.CSSProperties;
    flakes.push(<circle key={i} className={styles.deckSnow} cx={x.toFixed(0)} cy={y.toFixed(0)} r={r.toFixed(1)} style={style} />);
  }
  return (
    <g fill="#fffdf6" stroke="rgba(26, 41, 64, 0.35)" strokeWidth="0.9">
      {flakes}
    </g>
  );
}

const BURSTS: Record<'nationalday' | 'newyear', string[]> = {
  nationalday: ['#e40028', '#ffffff', '#e40028', '#ffffff'],
  newyear: ['#f5c94a', '#ff7a8a', '#7fd6c2', '#ffffff']
};

/** Fireworks over the sea on National Day and at New Year. */
export function Fireworks(props: { kind: 'nationalday' | 'newyear' }): React.ReactElement {
  const colors = BURSTS[props.kind];
  const spots = [
    { x: 380, y: 90, d: 0 },
    { x: 880, y: 190, d: 1.1 },
    { x: 230, y: 235, d: 2.0 },
    { x: 610, y: 195, d: 2.7 }
  ];
  return (
    <g strokeLinecap="round" strokeWidth="3.4">
      {spots.map((s, i) => {
        const rays: string[] = [];
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2;
          rays.push(
            `M${(s.x + Math.cos(a) * 10).toFixed(1)} ${(s.y + Math.sin(a) * 10).toFixed(1)} L${(s.x + Math.cos(a) * 52).toFixed(1)} ${(s.y + Math.sin(a) * 52).toFixed(1)}`
          );
        }
        return (
          <g key={i} className={styles.deckBurst} style={{ animationDelay: `${s.d}s` }}>
            <path d={rays.join(' ')} stroke={colors[i % colors.length]} fill="none" />
            <circle cx={s.x} cy={s.y} r="5" fill={colors[(i + 1) % colors.length]} />
          </g>
        );
      })}
    </g>
  );
}

/** A string of lanterns along the rigging in Advent. */
export function Lanterns(): React.ReactElement {
  const lights: React.ReactElement[] = [];
  const glow = ['#ffd36b', '#ff8a5c', '#fff1b0'];
  [-1, 1].forEach((side) => {
    for (let k = 1; k <= 8; k++) {
      const t = k / 9;
      const x = 500 + side * 460 * t;
      // The rope sags a little between mast and rail.
      const y = 374 + 226 * t + Math.sin(t * Math.PI) * 10;
      const i = lights.length;
      lights.push(
        <g key={i} className={styles.deckLantern} style={{ animationDelay: `${((i * 0.37) % 2.2).toFixed(2)}s` }}>
          <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="9" fill={glow[i % 3]} opacity="0.35" />
          <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="4.2" fill={glow[i % 3]} stroke={INK} strokeWidth="1.4" />
        </g>
      );
    }
  });
  return <g>{lights}</g>;
}

const FLAGS: Record<'nationalday' | 'newyear', string[]> = {
  nationalday: ['#e40028', '#ffffff'],
  newyear: ['#f5c94a', '#e4572e', '#7fd6c2', '#8a6fc0']
};

/** Little flags along the rigging on a day to celebrate. */
export function Bunting(props: { kind: 'nationalday' | 'newyear' }): React.ReactElement {
  const colors = FLAGS[props.kind];
  const flags: React.ReactElement[] = [];
  [-1, 1].forEach((side) => {
    for (let k = 1; k <= 10; k++) {
      const t = k / 11;
      const x = 500 + side * 460 * t;
      const y = 374 + 226 * t + Math.sin(t * Math.PI) * 10;
      const w = 7 + t * 9;
      const i = flags.length;
      flags.push(
        <path
          key={i}
          className={styles.deckFlag}
          d={`M${(x - w / 2).toFixed(1)} ${y.toFixed(1)} L${(x + w / 2).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + w * 1.2).toFixed(1)} Z`}
          fill={colors[i % colors.length]}
          stroke={INK}
          strokeWidth="1.3"
          strokeLinejoin="round"
          style={{ animationDelay: `${((k * 0.21) % 1.4).toFixed(2)}s` }}
        />
      );
    }
  });
  return <g>{flags}</g>;
}
