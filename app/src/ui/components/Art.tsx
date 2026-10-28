import * as React from 'react';

import { Island, Landmark } from '../../core/content/types';
import { SouvenirId } from '../../core/progress/achievements';

/**
 * Illustrations drawn as inline SVG, so they scale crisply and need no
 * image files. Colours come from the content (island colour) or the theme
 * tokens via CSS custom properties.
 */

const INK = 'var(--od-ink)';
const SAND = 'var(--od-sand)';
const ACCENT = 'var(--od-accent)';
const FOLIAGE_DARK = '#2E6B3F';
const FOLIAGE_LIGHT = '#7DAA4F';
const DOME = '#1F6FD1';

/** Small deterministic random generator, so every island always looks the same. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function LandmarkShape(props: { landmark?: Landmark }): React.ReactElement {
  const stroke = { stroke: INK, strokeWidth: 0.9, strokeLinejoin: 'round' as const };
  switch (props.landmark) {
    case 'rocks':
      return (
        <g {...stroke}>
          <path d="M-15 14 L-9 -5 L-3 14Z" fill="#8D99A6" />
          <path d="M-5 14 L3 -11 L12 14Z" fill="#A7B2BD" />
          <path d="M3 -11 L12 14 L6 14Z" fill="#7C8894" />
          <path d="M8 14 L12 4 L16 14Z" fill="#7C8894" />
        </g>
      );
    case 'wind':
      return (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round">
          <path d="M-15 -2 h16 a5 5 0 1 0 -5 -5" />
          <path d="M-11 6 h21 a4 4 0 1 1 -4 4" />
        </g>
      );
    case 'temple':
      return (
        <g {...stroke} fill="#FFFFFF">
          <path d="M-16 -3 L0 -13 L16 -3Z" />
          <rect x="-14" y="-3" width="28" height="3" />
          <rect x="-12" y="0" width="3" height="11" />
          <rect x="-5" y="0" width="3" height="11" />
          <rect x="2" y="0" width="3" height="11" />
          <rect x="9" y="0" width="3" height="11" />
          <rect x="-15" y="11" width="30" height="3" />
        </g>
      );
    case 'letter':
      return (
        <g {...stroke}>
          <path d="M8 -10 c6 -4 10 -2 12 2 c-5 -1 -8 0 -12 3z" fill="#FFFFFF" />
          <rect x="-12" y="-6" width="22" height="15" rx="1.5" fill="#FFFFFF" />
          <path d="M-12 -6 L-1 3 L10 -6" fill="none" />
        </g>
      );
    case 'amphora':
      return (
        <g {...stroke}>
          <path d="M-4 -13 h8 v3 c7 3 9 11 4 19 c-2 4 -14 4 -16 0 c-5 -8 -3 -16 4 -19z" fill="#C9743F" />
          <path d="M-4 -9 c-6 0 -7 6 -3 8 M4 -9 c6 0 7 6 3 8" fill="none" />
          <path d="M-8 1 h16" stroke={INK} strokeWidth="1.6" />
        </g>
      );
    case 'loom':
      return (
        <g {...stroke}>
          <rect x="-12" y="-13" width="24" height="25" fill="#FFFFFF" />
          <rect x="-12" y="-2" width="24" height="7" fill={ACCENT} />
          <path d="M-8 -13 v25 M-4 -13 v25 M0 -13 v25 M4 -13 v25 M8 -13 v25" fill="none" strokeWidth="0.6" />
          <path d="M-15 -13 h30 M-15 12 h30" fill="none" stroke="#8B5A2B" strokeWidth="2.4" />
        </g>
      );
    case 'cave':
      return (
        <g {...stroke}>
          <path d="M-16 14 C -16 -10, 16 -10, 16 14Z" fill="#7A6A58" />
          <path d="M-8 14 C -8 1, 8 1, 8 14Z" fill="#231F1B" />
          <circle cx="12" cy="11" r="3" fill="#FFFFFF" />
          <circle cx="17" cy="12" r="2.5" fill="#FFFFFF" />
        </g>
      );
    case 'tower':
      return (
        <g {...stroke}>
          <rect x="-5" y="-12" width="10" height="26" fill="#FFFFFF" />
          <path d="M-8 -12 L0 -22 L8 -12Z" fill="#7B4FB2" />
          <rect x="-1.5" y="-6" width="3" height="5" fill={INK} />
          <circle cx="-12" cy="-14" r="1.6" fill={ACCENT} stroke="none" />
          <circle cx="12" cy="-6" r="1.2" fill={ACCENT} stroke="none" />
          <circle cx="10" cy="-18" r="1" fill={ACCENT} stroke="none" />
        </g>
      );
    case 'eye':
      return (
        <g {...stroke}>
          <path d="M-15 0 C -7 -11, 7 -11, 15 0 C 7 11, -7 11, -15 0Z" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="5.5" fill="var(--od-primary)" />
          <circle cx="0" cy="0" r="2.2" fill={INK} />
        </g>
      );
    case 'anvil':
      return (
        <g {...stroke}>
          <path d="M9 -4 c-5 -6 1 -10 0 -17 c7 5 9 11 4 17z" fill={ACCENT} />
          <path d="M-15 -4 h21 c0 4 -4 6 -8 6 v6 h6 v5 h-20 v-5 h6 v-6 c-3 0 -5 -3 -5 -6z" fill="#4B5563" />
        </g>
      );
    default:
      return <g />;
  }
}

const LAND_SHAPES = [
  'M30 82 C 36 54, 62 42, 82 48 C 100 36, 128 48, 132 82 Z',
  'M28 82 C 30 62, 50 44, 70 48 C 80 32, 104 32, 112 50 C 124 52, 134 66, 134 82 Z',
  'M34 82 C 40 58, 58 52, 74 54 C 90 40, 116 42, 128 62 C 132 70, 132 76, 130 82 Z'
];

function Cypress(props: { x: number; y: number; h: number }): React.ReactElement {
  return (
    <g>
      <path d={`M${props.x} ${props.y} v3`} stroke="#5B3A20" strokeWidth="1.4" />
      <ellipse cx={props.x} cy={props.y - props.h / 2} rx={props.h / 5} ry={props.h / 2} fill={FOLIAGE_DARK} stroke={INK} strokeWidth="0.7" />
    </g>
  );
}

function Olive(props: { x: number; y: number; r: number }): React.ReactElement {
  return (
    <g>
      <path d={`M${props.x} ${props.y} v4`} stroke="#5B3A20" strokeWidth="1.4" />
      <circle cx={props.x} cy={props.y - props.r} r={props.r} fill={FOLIAGE_LIGHT} stroke={INK} strokeWidth="0.7" />
      <circle cx={props.x - props.r / 3} cy={props.y - props.r * 1.3} r={props.r / 3} fill="rgba(255,255,255,0.25)" />
    </g>
  );
}

function House(props: { x: number; y: number; dome: boolean }): React.ReactElement {
  return (
    <g stroke={INK} strokeWidth="0.7">
      {props.dome && <path d={`M${props.x + 1} ${props.y - 7} a4 4 0 0 1 8 0z`} fill={DOME} />}
      <rect x={props.x} y={props.y - 7} width="10" height="8" fill="#FFFFFF" />
      <rect x={props.x + 3.5} y={props.y - 4} width="3" height="5" fill={DOME} />
    </g>
  );
}

/** The island drawing as an SVG group (viewBox 0 0 160 110), for use inside a larger SVG. */
export function IslandShape(props: { id: string; color: string; landmark?: Landmark; home?: boolean }): React.ReactElement {
  const random = seededRandom(props.id);
  const variant = Math.floor(random() * LAND_SHAPES.length);
  const land = LAND_SHAPES[variant];
  const trees: React.ReactElement[] = [];
  const treeCount = 2 + Math.floor(random() * 3);
  for (let i = 0; i < treeCount; i++) {
    const x = 46 + random() * 70;
    if (x > 66 && x < 94) continue; // keep the centre free for the landmark
    const y = 70 + random() * 6;
    trees.push(random() > 0.5 ? <Cypress key={i} x={x} y={y} h={12 + random() * 6} /> : <Olive key={i} x={x} y={y} r={4 + random() * 2} />);
  }
  const houseCount = props.home ? 3 : Math.floor(random() * 3);
  const houses: React.ReactElement[] = [];
  for (let i = 0; i < houseCount; i++) {
    houses.push(<House key={i} x={52 + i * 14 + (i > 0 ? 18 : 0)} y={80} dome={props.home ? i === 1 : random() > 0.6} />);
  }

  return (
    <g>
      <ellipse cx="80" cy="90" rx="72" ry="15" fill="rgba(4,40,70,0.22)" />
      <ellipse cx="80" cy="85" rx="70" ry="17" fill="rgba(126,220,230,0.55)" />
      <ellipse cx="80" cy="86" rx="72" ry="18" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" />
      <ellipse cx="80" cy="82" rx="58" ry="12" fill={SAND} stroke={INK} strokeWidth="1.2" />
      <path d={land} fill={props.color} stroke={INK} strokeWidth="1.3" />
      <path d={land} fill="url(#od-island-light)" />
      {trees}
      {houses}
      <ellipse cx="38" cy="84" rx="4" ry="2" fill="#9AA5AF" stroke={INK} strokeWidth="0.6" />
      <ellipse cx="124" cy="85" rx="3" ry="1.6" fill="#9AA5AF" stroke={INK} strokeWidth="0.6" />
      <g transform="translate(80 40) scale(1.15)">
        <LandmarkShape landmark={props.landmark} />
      </g>
    </g>
  );
}

/** Shared gradient for the light from the upper left on every island. */
function IslandDefs(): React.ReactElement {
  return (
    <defs>
      <linearGradient id="od-island-light" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="rgba(255,255,255,0.35)" />
        <stop offset="0.5" stopColor="rgba(255,255,255,0)" />
        <stop offset="1" stopColor="rgba(4,24,48,0.25)" />
      </linearGradient>
    </defs>
  );
}

export function IslandArt(props: { island: Pick<Island, 'id' | 'color' | 'landmark' | 'home'>; muted?: boolean; className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 160 110" className={props.className} aria-hidden="true" style={props.muted ? { filter: 'saturate(0.35)', opacity: 0.75 } : undefined}>
      <IslandDefs />
      <IslandShape id={props.island.id} color={props.island.color} landmark={props.island.landmark} home={props.island.home} />
    </svg>
  );
}

export function Ship(props: { className?: string; size?: number }): React.ReactElement {
  return (
    <svg viewBox="0 0 48 48" width={props.size} height={props.size} className={props.className} aria-hidden="true">
      <path d="M23 6 v28" stroke={INK} strokeWidth="2" />
      <path d="M23 4 l9 3 -9 3z" fill={ACCENT} />
      <path d="M25 10 c8 5 11 13 11 22 h-11z" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
      <path d="M25 18 c4 0 8 1 10 3 v4 c-3 -2 -6 -3 -10 -3z" fill="var(--od-primary)" />
      <path d="M21 12 c-6 4 -9 11 -9 20 h9z" fill="#FFFFFF" stroke={INK} strokeWidth="1.2" />
      <path d="M6 34 h36 l-5 8 h-26z" fill={INK} />
      <path d="M9 37 h30" stroke={ACCENT} strokeWidth="1.5" />
      <path d="M2 44 q5 -3 10 0 t10 0 t10 0 t10 0" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" />
    </svg>
  );
}

/** Athene, the little owl that guides the player. */
export function Owl(props: { className?: string; cheer?: boolean }): React.ReactElement {
  return (
    <svg viewBox="0 0 100 100" className={props.className} aria-hidden="true">
      <ellipse cx="50" cy="94" rx="26" ry="4" fill="rgba(15,44,71,0.15)" />
      {props.cheer ? (
        <g fill="#8A5E37" stroke={INK} strokeWidth="1.5">
          <path d="M22 58 C 8 48, 6 30, 12 22 C 18 34, 24 42, 30 48Z" />
          <path d="M78 58 C 92 48, 94 30, 88 22 C 82 34, 76 42, 70 48Z" />
        </g>
      ) : (
        <g fill="#8A5E37" stroke={INK} strokeWidth="1.5">
          <path d="M24 50 C 14 62, 16 78, 26 86 C 28 72, 30 62, 32 54Z" />
          <path d="M76 50 C 86 62, 84 78, 74 86 C 72 72, 70 62, 68 54Z" />
        </g>
      )}
      <path d="M50 14 C 72 14, 80 32, 80 54 C 80 76, 68 90, 50 90 C 32 90, 20 76, 20 54 C 20 32, 28 14, 50 14Z" fill="#A87A4F" stroke={INK} strokeWidth="1.6" />
      <path d="M50 46 C 64 46, 70 58, 70 70 C 70 82, 62 88, 50 88 C 38 88, 30 82, 30 70 C 30 58, 36 46, 50 46Z" fill="#EBD7B5" />
      <g fill="none" stroke="#B88A5C" strokeWidth="1.6" strokeLinecap="round">
        <path d="M42 62 l4 3 4 -3 M50 62 l4 3 4 -3" />
        <path d="M38 72 l4 3 4 -3 M46 72 l4 3 4 -3 M54 72 l4 3 4 -3" />
        <path d="M42 81 l4 3 4 -3 M50 81 l4 3 4 -3" />
      </g>
      <g fill="#EBD7B5">
        <circle cx="30" cy="34" r="1.6" />
        <circle cx="70" cy="34" r="1.6" />
        <circle cx="26" cy="46" r="1.6" />
        <circle cx="74" cy="46" r="1.6" />
        <circle cx="50" cy="20" r="1.6" />
        <circle cx="42" cy="22" r="1.3" />
        <circle cx="58" cy="22" r="1.3" />
      </g>
      <circle cx="37" cy="38" r="12" fill="#FFFFFF" stroke={INK} strokeWidth="1.4" />
      <circle cx="63" cy="38" r="12" fill="#FFFFFF" stroke={INK} strokeWidth="1.4" />
      <circle cx="38" cy="39" r="7" fill={ACCENT} />
      <circle cx="62" cy="39" r="7" fill={ACCENT} />
      <circle cx="38.5" cy="39.5" r="4" fill={INK} />
      <circle cx="61.5" cy="39.5" r="4" fill={INK} />
      <circle cx="40" cy="37.5" r="1.5" fill="#FFFFFF" />
      <circle cx="63" cy="37.5" r="1.5" fill="#FFFFFF" />
      <path d="M46 48 L50 55 L54 48Z" fill="#E8913A" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
      <g fill="#E8913A" stroke={INK} strokeWidth="1">
        <path d="M40 88 l-3 5 h4 l1 -2 1 2 h4 l-2 -5z" />
        <path d="M54 88 l-2 5 h4 l1 -2 1 2 h4 l-3 -5z" />
      </g>
    </svg>
  );
}

export function CompassRose(props: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 64 64" className={props.className} aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" strokeDasharray="2 2" />
      <path d="M32 6 L36 32 L32 58 L28 32Z" fill="rgba(255,255,255,0.9)" />
      <path d="M6 32 L32 28 L58 32 L32 36Z" fill="rgba(255,255,255,0.6)" />
      <path d="M32 6 L36 32 L32 32Z" fill={ACCENT} />
      <circle cx="32" cy="32" r="2.5" fill={INK} />
      <text x="32" y="4.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#FFFFFF" fontFamily="var(--od-font-display)">
        N
      </text>
    </svg>
  );
}

function Cloud(props: { x: number; y: number; scale: number }): React.ReactElement {
  return (
    <g transform={`translate(${props.x} ${props.y}) scale(${props.scale})`} fill="#FFFFFF" opacity="0.92">
      <ellipse cx="0" cy="10" rx="34" ry="10" />
      <circle cx="-12" cy="4" r="12" />
      <circle cx="8" cy="0" r="16" />
      <circle cx="24" cy="7" r="9" />
    </g>
  );
}

/** Wide scene for the start screens: sky, sun, mountains, sea, islands and a ship. */
export function SeaScene(props: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 1000 300" className={props.className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="od-scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD8F2" />
          <stop offset="0.75" stopColor="#E9F6FB" />
          <stop offset="1" stopColor="#FFF6E2" />
        </linearGradient>
        <linearGradient id="od-scene-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38C3D9" />
          <stop offset="0.45" stopColor="var(--od-sea)" />
          <stop offset="1" stopColor="var(--od-sea-deep)" />
        </linearGradient>
        <radialGradient id="od-scene-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset="0.45" stopColor={ACCENT} />
          <stop offset="1" stopColor="rgba(255,194,61,0)" />
        </radialGradient>
      </defs>
      <IslandDefs />
      <rect width="1000" height="300" fill="url(#od-scene-sky)" />
      <circle cx="790" cy="92" r="90" fill="url(#od-scene-sun)" />
      <circle cx="790" cy="92" r="40" fill="#FFD567" />
      <Cloud x={160} y={60} scale={1.2} />
      <Cloud x={480} y={44} scale={0.8} />
      <Cloud x={930} y={70} scale={1} />
      <path d="M0 170 L80 142 L150 158 L240 128 L330 160 L420 150 L520 170Z" fill="#BCD9E8" />
      <path d="M560 170 L640 150 L720 162 L820 136 L920 158 L1000 150 L1000 170Z" fill="#C9E1EC" />
      <path d="M0 168 C 200 160, 380 174, 560 166 S 860 160, 1000 168 V300 H0Z" fill="url(#od-scene-sea)" />
      <path d="M700 176 h120 M720 186 h90 M740 196 h60" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(40 150) scale(1.15)">
        <IslandShape id="scene-left" color="#8E7CC3" landmark="rocks" />
      </g>
      <g transform="translate(800 162) scale(0.95)">
        <IslandShape id="scene-right" color="#E9A23B" landmark="temple" home />
      </g>
      <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M0 236 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" />
        <path d="M-25 270 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" />
      </g>
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <path d="M560 96 q6 -6 12 0 q6 -6 12 0" />
        <path d="M600 74 q5 -5 10 0 q5 -5 10 0" />
      </g>
      <g transform="translate(430 150)">
        <Ship size={110} />
      </g>
    </svg>
  );
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** A coin-like medallion with the rank number in Roman numerals. */
export function RankEmblem(props: { index: number; className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 48 48" className={props.className} aria-hidden="true">
      <circle cx="24" cy="25" r="22" fill="#D99A1E" />
      <circle cx="24" cy="23" r="22" fill={ACCENT} stroke={INK} strokeWidth="1.5" />
      <circle cx="24" cy="23" r="17" fill="none" stroke={INK} strokeWidth="0.8" strokeDasharray="1.5 2" />
      <path d="M11 29 c-3 -6 -2 -12 2 -16 M37 29 c3 -6 2 -12 -2 -16" fill="none" stroke={INK} strokeWidth="1" />
      <text x="24" y="28" textAnchor="middle" fontSize="14" fill={INK} fontFamily="var(--od-font-logo)">
        {ROMAN[props.index] || String(props.index + 1)}
      </text>
    </svg>
  );
}

/** A round passport stamp with the island name along the rim. */
export function Stamp(props: { id: string; label: string; date: string; color: string; landmark?: Landmark; empty?: boolean }): React.ReactElement {
  const pathId = `od-stamp-${props.id}`;
  const color = props.empty ? 'var(--od-line)' : props.color;
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <IslandDefs />
      <defs>
        <path id={pathId} d="M 20 60 A 40 40 0 0 1 100 60" />
      </defs>
      <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="60" cy="60" r="46" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray={props.empty ? '3 3' : undefined} />
      {!props.empty && (
        <>
          <text fontSize="11" fill={color} fontFamily="var(--od-font-display)" fontWeight="800" letterSpacing="1">
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {props.label.toUpperCase()}
            </textPath>
          </text>
          <g transform="translate(32 44) scale(0.35)">
            <IslandShape id={props.id} color={props.color} landmark={props.landmark} />
          </g>
          <text x="60" y="100" textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="var(--od-font-display)">
            {props.date}
          </text>
        </>
      )}
    </svg>
  );
}

export function SouvenirIcon(props: { id: SouvenirId }): React.ReactElement {
  const s = { fill: 'none', stroke: INK, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let shape: React.ReactElement;
  switch (props.id) {
    case 'first-postcard':
      shape = (
        <g {...s}>
          <rect x="6" y="11" width="28" height="19" rx="1.5" fill="#FFFFFF" />
          <rect x="25" y="14" width="6" height="7" fill={ACCENT} />
          <path d="M10 18 h10 M10 22 h10 M10 26 h7" />
        </g>
      );
      break;
    case 'island-hopper':
      shape = (
        <g {...s}>
          <path d="M8 30 C 14 14, 22 30, 28 16 S 34 10, 34 10" strokeDasharray="2 3" />
          <circle cx="8" cy="30" r="3.5" fill={ACCENT} />
          <circle cx="20" cy="22" r="3.5" fill="#FFFFFF" />
          <circle cx="33" cy="10" r="3.5" fill="#FFFFFF" />
        </g>
      );
      break;
    case 'aeolus-bag':
      shape = (
        <g {...s}>
          <path d="M14 12 h12 l-2 4 c7 3 9 14 2 17 h-12 c-7 -3 -5 -14 2 -17z" fill="#D9B98A" />
          <path d="M14 26 h8 a3 3 0 1 0 -3 -3" />
        </g>
      );
      break;
    case 'siren-proof':
      shape = (
        <g {...s}>
          <path d="M16 28 v-16 l12 -3 v15" />
          <circle cx="13" cy="28" r="3" fill={INK} />
          <circle cx="25" cy="24" r="3" fill={INK} />
          <path d="M7 33 L33 7" stroke="var(--od-danger)" strokeWidth="2.2" />
        </g>
      );
      break;
    case 'homecoming':
      shape = (
        <g transform="translate(20 21)">
          <LandmarkShape landmark="temple" />
        </g>
      );
      break;
    default:
      shape = (
        <g {...s}>
          <path d="M28 14 a10 10 0 0 0 -17 3" />
          <path d="M12 26 a10 10 0 0 0 17 -3" />
          <path d="M28 8 v6 h-6 M12 32 v-6 h6" />
        </g>
      );
  }
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      {shape}
    </svg>
  );
}

/** Small lock for Premium content. */
export function LockIcon(props: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" className={props.className} aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
      <path d="M5 7 V5 a3 3 0 0 1 6 0 V7" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CheckIcon(props: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" className={props.className} aria-hidden="true">
      <path d="M3 8.5 L6.5 12 L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
