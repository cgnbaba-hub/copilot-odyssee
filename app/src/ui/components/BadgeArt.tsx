import * as React from 'react';

import { BadgeId } from '../../core/progress/badges';

/**
 * The two completion badges as medals in the poster look of the app: the
 * ship under the sun for Basic, under moon and stars for Premium, both with
 * the red DERTOUR banner. Drawn with system fonts only,
 * so the picture looks the same when it is saved as an image.
 */

const INK = '#1a2940';
const PAPER = '#fbf6e8';
const RED = '#e40028';
const GOLD = '#f2b13a';
const FONT = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";

const LOOK: Record<BadgeId, { rim: string; rimText: string; skyTop: string; skyLow: string; sea: string; wave: string; label: string }> = {
  basic: { rim: GOLD, rimText: INK, skyTop: '#f3d08a', skyLow: '#fbe9c2', sea: '#1f5f8b', wave: '#6fb0d6', label: 'BASIC' },
  premium: { rim: '#3a2f6b', rimText: '#f6d98a', skyTop: '#141d3a', skyLow: '#3a3272', sea: '#102c4f', wave: '#4d7fb0', label: 'PREMIUM' }
};

let instances = 0;

/** A round edge with small bumps, like a seal. */
function sealEdge(bumps: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < bumps * 2; i++) {
    const a = (i / (bumps * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    points.push(`${(120 + Math.cos(a) * r).toFixed(1)} ${(120 + Math.sin(a) * r).toFixed(1)}`);
  }
  // Rounded corners between the points make bumps instead of spikes.
  let d = '';
  for (let i = 0; i < points.length; i += 2) {
    const next = points[(i + 2) % points.length];
    d += `${i === 0 ? `M${points[0]}` : ''} Q${points[i + 1]} ${next}`;
  }
  return `${d} Z`;
}

function star(cx: number, cy: number, r: number): string {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    p.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${p.join(' L')} Z`;
}

/** The ref goes to the SVG root, so the badge can be saved as an image. */
export const BadgeArt = React.forwardRef<SVGSVGElement, { id: BadgeId; earned: boolean; className?: string }>(function BadgeArt(props, ref) {
  const { id } = props;
  const look = LOOK[id];
  const premium = id === 'premium';
  // Every drawing gets its own ids: a second copy on the page (card and certificate) may be hidden,
  // and gradients or clip paths looked up in a hidden copy are not drawn.
  const uid = React.useRef(`od-badge-${id}-${++instances}`).current;
  const rays: string[] = [];
  for (let i = 0; i < 12; i++) {
    const a1 = (i / 12) * Math.PI * 2;
    const a2 = a1 + Math.PI / 24;
    rays.push(
      `M120 128 L${(120 + Math.cos(a1) * 140).toFixed(0)} ${(128 + Math.sin(a1) * 140).toFixed(0)} L${(120 + Math.cos(a2) * 140).toFixed(0)} ${(128 + Math.sin(a2) * 140).toFixed(0)} Z`
    );
  }

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 240"
      className={props.className}
      role="img"
      aria-label={`Copilot Odyssee ${look.label}`}
      // A badge not yet earned is shown as a pale outline of itself.
      style={props.earned ? undefined : { filter: 'grayscale(1)', opacity: 0.45 }}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.skyTop} />
          <stop offset="1" stopColor={look.skyLow} />
        </linearGradient>
        <clipPath id={`${uid}-disc`}>
          <circle cx="120" cy="120" r="74" />
        </clipPath>
        <path id={`${uid}-top`} d="M34 120 A86 86 0 0 1 206 120" />
        <path id={`${uid}-bottom`} d="M27 120 A93 93 0 0 0 213 120" />
      </defs>

      {/* Seal edge and rim */}
      <path d={sealEdge(28, 117, 110)} fill={INK} />
      <circle cx="120" cy="120" r="104" fill={look.rim} stroke={INK} strokeWidth="3" />
      <circle cx="120" cy="120" r="98" fill="none" stroke={premium ? '#f6d98a' : PAPER} strokeWidth="1.5" strokeDasharray="1.5 5" strokeLinecap="round" opacity="0.8" />

      {/* The scene in the middle */}
      <circle cx="120" cy="120" r="77" fill={INK} />
      <g clipPath={`url(#${uid}-disc)`}>
        <rect x="40" y="40" width="160" height="160" fill={`url(#${uid}-sky)`} />
        {premium ? (
          <>
            {[
              [78, 76, 3],
              [100, 62, 2],
              [150, 64, 2],
              [178, 108, 1.8],
              [64, 104, 1.8],
              [132, 56, 1.6]
            ].map(([x, y, r], i) => (
              <path key={i} d={star(x, y, r * 1.8)} fill="#fdf6dc" />
            ))}
            <circle cx="166" cy="82" r="14" fill="#f6ecc8" />
            <circle cx="172" cy="78" r="12" fill={look.skyTop} />
          </>
        ) : (
          <>
            <path d={rays.join(' ')} fill={PAPER} opacity="0.55" />
            <circle cx="120" cy="128" r="34" fill="#f0a537" stroke={INK} strokeWidth="2" />
          </>
        )}
        <rect x="40" y="128" width="160" height="80" fill={look.sea} />
        <path d="M40 128 H200" stroke={INK} strokeWidth="2" />
        <g stroke={look.wave} strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M56 140 h16 M92 137 h10 M150 139 h18 M180 146 h10 M66 150 h10" />
        </g>
        {/* The ship */}
        <g stroke={INK} strokeLinejoin="round">
          <path d="M120 74 V124" strokeWidth="2.6" />
          <path d="M123 80 L150 120 H123 Z" fill={PAPER} strokeWidth="2.2" />
          <path d="M117 88 L96 120 H117 Z" fill={premium ? '#f6d98a' : GOLD} strokeWidth="2.2" />
          <path d="M120 74 L136 79 L120 84 Z" fill={RED} strokeWidth="1.8" />
          <path d="M92 124 H148 L141 137 Q120 142 99 137 Z" fill="#8a5a36" strokeWidth="2.4" />
          <path d="M96 129 H144" stroke={PAPER} strokeWidth="1.6" opacity="0.7" />
        </g>
      </g>
      <circle cx="120" cy="120" r="75.5" fill="none" stroke={INK} strokeWidth="3" />

      {/* Words on the rim */}
      <text fontFamily={FONT} fontWeight="700" fontSize="17" letterSpacing="2.4" fill={look.rimText} textAnchor="middle">
        <textPath href={`#${uid}-top`} startOffset="50%">
          COPILOT ODYSSEE
        </textPath>
      </text>
      <text fontFamily={FONT} fontWeight="700" fontSize="11" letterSpacing="2.8" fill={look.rimText} textAnchor="middle" opacity="0.9">
        <textPath href={`#${uid}-bottom`} startOffset="50%">
          DERTOUR SUISSE
        </textPath>
      </text>
      <path d={star(30, 120, 5)} fill={look.rimText} />
      <path d={star(210, 120, 5)} fill={look.rimText} />

      {/* The red banner with the level */}
      <g stroke={INK} strokeWidth="2.6" strokeLinejoin="round">
        <path d="M30 156 L18 150 L24 166 L16 180 L42 178 Z" fill="#a8001d" />
        <path d="M210 156 L222 150 L216 166 L224 180 L198 178 Z" fill="#a8001d" />
        <path d="M30 152 Q120 140 210 152 V180 Q120 168 30 180 Z" fill={RED} />
      </g>
      <text x="120" y="171" fontFamily={FONT} fontWeight="700" fontSize={premium ? 20 : 22} letterSpacing="3.2" fill={PAPER} textAnchor="middle">
        {look.label}
      </text>
      {premium && (
        <g fill="#f6d98a" stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
          <path d={star(120, 196, 7)} />
          <path d={star(102, 193, 4.5)} />
          <path d={star(138, 193, 4.5)} />
        </g>
      )}
    </svg>
  );
});
