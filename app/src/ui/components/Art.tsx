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

function LandmarkShape(props: { landmark?: Landmark }): React.ReactElement {
  const stroke = { stroke: INK, strokeWidth: 0.9, strokeLinejoin: 'round' as const };
  switch (props.landmark) {
    case 'rocks':
      return (
        <g {...stroke}>
          <path d="M-15 14 L-9 -5 L-3 14Z" fill="#8D99A6" />
          <path d="M-5 14 L3 -11 L12 14Z" fill="#A7B2BD" />
          <path d="M8 14 L12 4 L16 14Z" fill="#7C8894" />
        </g>
      );
    case 'wind':
      return (
        <g fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round">
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

/** An island seen from above at an angle: surf, beach, two hills and its landmark. */
export function IslandArt(props: { island: Pick<Island, 'color' | 'landmark'>; muted?: boolean; className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 120 84" className={props.className} aria-hidden="true" style={props.muted ? { opacity: 0.55, filter: 'saturate(0.4)' } : undefined}>
      <ellipse cx="60" cy="66" rx="52" ry="12" fill="rgba(4,24,48,0.28)" />
      <ellipse cx="60" cy="62" rx="52" ry="13" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
      <ellipse cx="60" cy="60" rx="47" ry="11" fill={SAND} stroke={INK} strokeWidth="1.2" />
      <path d="M17 60 C 24 34, 48 26, 62 34 C 76 25, 98 34, 104 60 Z" fill={props.island.color} stroke={INK} strokeWidth="1.2" />
      <path d="M62 34 C 76 25, 98 34, 104 60 L 78 60 C 80 48, 74 40, 62 34 Z" fill="rgba(4,24,48,0.18)" />
      <path d="M28 60 C 34 46, 52 42, 64 48 C 74 44, 88 50, 94 60 Z" fill={props.island.color} stroke={INK} strokeWidth="1" />
      <path d="M28 60 C 34 46, 52 42, 64 48 C 56 47, 44 50, 38 60 Z" fill="rgba(255,255,255,0.22)" />
      <g transform="translate(60 30)">
        <LandmarkShape landmark={props.island.landmark} />
      </g>
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
    </svg>
  );
}

export function CompassRose(props: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 64 64" className={props.className} aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" strokeDasharray="2 2" />
      <path d="M32 8 L36 32 L32 56 L28 32Z" fill="rgba(255,255,255,0.85)" />
      <path d="M8 32 L32 28 L56 32 L32 36Z" fill="rgba(255,255,255,0.55)" />
      <path d="M32 8 L36 32 L32 32Z" fill={ACCENT} />
      <text x="32" y="6" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontFamily="var(--od-font-display)">
        N
      </text>
    </svg>
  );
}

/** Sea, sun and a ship sailing towards distant islands. */
export function SeaScene(props: { className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 640 220" className={props.className} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="od-scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE6F5" />
          <stop offset="1" stopColor="#F6F1E1" />
        </linearGradient>
        <linearGradient id="od-scene-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--od-sea)" />
          <stop offset="1" stopColor="var(--od-sea-deep)" />
        </linearGradient>
      </defs>
      <rect width="640" height="220" fill="url(#od-scene-sky)" />
      <circle cx="510" cy="70" r="34" fill={ACCENT} opacity="0.9" />
      <path d="M0 122 C 120 112, 260 128, 400 118 S 580 112, 640 120 V220 H0Z" fill="url(#od-scene-sea)" />
      <g transform="translate(70 92) scale(0.9)">
        <IslandArtShape color="#8E7CC3" landmark="rocks" />
      </g>
      <g transform="translate(420 96) scale(0.75)">
        <IslandArtShape color="#E9A23B" landmark="temple" />
      </g>
      <path d="M0 160 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
      <path d="M20 190 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      <g transform="translate(270 92)">
        <Ship size={80} />
      </g>
    </svg>
  );
}

/** The island drawing as an SVG group, for use inside a larger SVG. */
function IslandArtShape(props: { color: string; landmark?: Landmark }): React.ReactElement {
  return (
    <g>
      <ellipse cx="60" cy="62" rx="52" ry="13" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
      <ellipse cx="60" cy="60" rx="47" ry="11" fill={SAND} stroke={INK} strokeWidth="1.2" />
      <path d="M17 60 C 24 34, 48 26, 62 34 C 76 25, 98 34, 104 60 Z" fill={props.color} stroke={INK} strokeWidth="1.2" />
      <path d="M28 60 C 34 46, 52 42, 64 48 C 74 44, 88 50, 94 60 Z" fill={props.color} stroke={INK} strokeWidth="1" />
      <g transform="translate(60 30)">
        <LandmarkShape landmark={props.landmark} />
      </g>
    </g>
  );
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** A coin-like medallion with the rank number in Roman numerals. */
export function RankEmblem(props: { index: number; className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 48 48" className={props.className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill={ACCENT} stroke={INK} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="17" fill="none" stroke={INK} strokeWidth="0.8" strokeDasharray="1.5 2" />
      <path d="M11 30 c-3 -6 -2 -12 2 -16 M37 30 c3 -6 2 -12 -2 -16" fill="none" stroke={INK} strokeWidth="1" />
      <text x="24" y="29" textAnchor="middle" fontSize="14" fill={INK} fontFamily="var(--od-font-display)">
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
          <text fontSize="11" fill={color} fontFamily="var(--od-font-display)" letterSpacing="1">
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {props.label.toUpperCase()}
            </textPath>
          </text>
          <g transform="translate(27 40) scale(0.55)">
            <IslandArtShape color={props.color} landmark={props.landmark} />
          </g>
          <text x="60" y="98" textAnchor="middle" fontSize="9" fill={color} fontFamily="var(--od-font-display)">
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
      break;
  }
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      {shape}
    </svg>
  );
}
