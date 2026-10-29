import * as React from 'react';

import { Island, Landmark } from '../../core/content/types';
import { SouvenirId } from '../../core/progress/achievements';
import { PosterIsland } from './PosterArt';

/**
 * Illustrations drawn as inline SVG, so they scale crisply and need no
 * image files. Colours come from the content (island colour) or the theme
 * tokens via CSS custom properties.
 */

const INK = 'var(--od-ink)';
const ACCENT = 'var(--od-accent)';

/** The island drawing as an SVG group (viewBox 0 0 160 110), for use inside a larger SVG. */
export function IslandShape(props: { id: string; color: string; landmark?: Landmark; home?: boolean; flag?: boolean }): React.ReactElement {
  return (
    <g transform="translate(80 102) scale(0.46)">
      <PosterIsland landmark={props.landmark} color={props.color} flag={props.flag} />
    </g>
  );
}

export function IslandArt(props: { island: Pick<Island, 'id' | 'color' | 'landmark' | 'home'>; muted?: boolean; flag?: boolean; className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 160 110" className={props.className} aria-hidden="true" style={props.muted ? { filter: 'saturate(0.35)', opacity: 0.75 } : undefined}>
      <rect x="0" y="101" width="160" height="9" fill="var(--od-sea-deep)" />
      <IslandShape id={props.island.id} color={props.island.color} landmark={props.island.landmark} flag={props.flag} />
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
        <g transform="translate(20 30) scale(0.11)">
          <PosterIsland landmark="temple" color="#e9a23b" />
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
