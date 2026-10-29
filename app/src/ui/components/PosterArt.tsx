import * as React from 'react';

import { Landmark } from '../../core/content/types';

/**
 * Islands in the style of an old travel poster: flat colour fields, an ink
 * outline and one landmark each. Drawn around (0, 0) on the waterline,
 * about 300 units wide and up to 180 units high, so a scene can place and
 * scale them freely.
 */

const INK = '#1a2940';
const WHITE = '#fbf5e6';
const SAND = '#d9b57c';
const ROOF = '#c65b3b';
const DOME = '#2c5da6';
const CYPRESS = '#3d5a2a';
const HILL = '#7f9a4e';
const HILL_SHADE = '#5e7838';

const line = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const };

export const SHAPE_HILL = 'M-150 0 C-120 -18 -95 -52 -55 -66 C-20 -78 20 -76 55 -60 C90 -44 120 -16 150 0 Z';
const SHAPE_HILL_SHADE = 'M18 -76 C38 -72 48 -66 55 -60 C90 -44 120 -16 150 0 L64 0 C70 -24 52 -52 18 -76 Z';
const SHAPE_BEACH = 'M-150 0 C-128 -9 -108 -12 -86 -11 L86 -11 C108 -12 128 -9 150 0 Z';
const SHAPE_ROCKS = 'M-145 0 L-110 -38 L-92 -26 L-62 -92 L-38 -48 L-10 -118 L18 -52 L44 -80 L74 -34 L96 -48 L145 0 Z';
const SHAPE_CAVE = 'M-150 0 C-120 -30 -100 -96 -40 -108 C10 -116 60 -96 90 -60 C110 -36 130 -12 150 0 Z';
const SHAPE_VOLCANO = 'M-150 0 C-110 -20 -70 -60 -38 -112 L38 -112 C70 -60 110 -20 150 0 Z';

/** Outline of the land, e.g. for a reflection in the water. */
export function islandSilhouette(landmark?: Landmark): string {
  if (landmark === 'rocks') return SHAPE_ROCKS;
  if (landmark === 'cave') return SHAPE_CAVE;
  if (landmark === 'anvil') return SHAPE_VOLCANO;
  return SHAPE_HILL;
}

/** Mixes two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
export function mixColor(a: string, b: string, t: number): string {
  const parse = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = parse(a);
  const B = parse(b);
  return '#' + A.map((v, i) => ('0' + Math.round(v + (B[i] - v) * t).toString(16)).slice(-2)).join('');
}

function Cypress(props: { x: number; y: number; h?: number }): React.ReactElement {
  const { x, y } = props;
  const h = props.h || 46;
  return (
    <path d={`M${x} ${y} C${x - 8} ${y - h * 0.45} ${x - 4} ${y - h * 0.8} ${x} ${y - h} C${x + 4} ${y - h * 0.8} ${x + 8} ${y - h * 0.45} ${x} ${y}Z`} fill={CYPRESS} {...line} />
  );
}

function Hill(props: { color: string }): React.ReactElement {
  const hill = mixColor(HILL, props.color, 0.22);
  const shade = mixColor(HILL_SHADE, props.color, 0.22);
  return (
    <>
      <path d={SHAPE_HILL} fill={hill} />
      <path d={SHAPE_HILL_SHADE} fill={shade} />
      <path d={SHAPE_BEACH} fill={SAND} />
      <path d={SHAPE_HILL} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    </>
  );
}

function Landmarks(props: { landmark?: Landmark; color: string }): React.ReactElement {
  const { color } = props;
  switch (props.landmark) {
    case 'rocks':
      return (
        <>
          <path d={SHAPE_ROCKS} fill="#8a84a8" />
          <path d="M-62 -92 L-38 -48 L-50 0 L-70 0Z M-10 -118 L18 -52 L10 0 L-12 0Z M44 -80 L74 -34 L70 0 L50 0Z" fill="#6a658c" />
          <path d={SHAPE_ROCKS} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-120 -4 q8 -6 16 0 M-30 -4 q8 -6 16 0 M60 -4 q8 -6 16 0" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'wind':
      return (
        <>
          <Hill color={color} />
          <rect x="40" y="-74" width="24" height="18" fill={WHITE} {...line} />
          <rect x="48" y="-66" width="6" height="10" fill={DOME} />
          <path d="M-20 -66 L-15 -112 L13 -112 L18 -66 Z" fill={WHITE} {...line} />
          <path d="M-18 -112 Q-1 -134 16 -112Z" fill={ROOF} {...line} />
          <path d="M-6 -66 v-11 a5 5 0 0 1 10 0 v11Z" fill={INK} />
          <g transform="translate(-1 -114)">
            <g className="od-sails">
              {[0, 90, 180, 270].map((r) => (
                <path key={r} transform={`rotate(${r})`} d="M0 0 L-3 -44 L13 -38 Z" fill={WHITE} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
              ))}
              <circle r="3.5" fill={INK} />
            </g>
          </g>
        </>
      );
    case 'temple':
      return (
        <>
          <Hill color={color} />
          <path d="M-58 -62 L-52 -80 L52 -80 L58 -62 Z" fill={SAND} />
          <rect x="-48" y="-86" width="96" height="7" fill={WHITE} {...line} />
          {[-40, -22, -4, 14, 32].map((x) => (
            <rect key={x} x={x} y="-118" width="8" height="32" fill={WHITE} {...line} />
          ))}
          <rect x="-48" y="-126" width="96" height="8" fill={WHITE} {...line} />
          <path d="M-52 -126 L0 -146 L52 -126 Z" fill={WHITE} {...line} />
          <Cypress x={84} y={-42} h={44} />
        </>
      );
    case 'letter':
      return (
        <>
          <Hill color={color} />
          <rect x="-64" y="-76" width="24" height="18" fill={WHITE} {...line} />
          <rect x="-56" y="-68" width="6" height="10" fill={DOME} />
          <rect x="16" y="-90" width="28" height="24" fill={WHITE} {...line} />
          <rect x="26" y="-82" width="7" height="9" fill={DOME} />
          <rect x="40" y="-72" width="24" height="18" fill={WHITE} {...line} />
          <rect x="-30" y="-106" width="40" height="34" fill={WHITE} {...line} />
          <path d="M-27 -106 A17 17 0 0 1 7 -106 Z" fill={DOME} {...line} />
          <path d="M-10 -123 v-12 M-15 -129 h10" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M-16 -72 v-14 a6 6 0 0 1 12 0 v14Z" fill={DOME} {...line} />
        </>
      );
    case 'amphora':
      return (
        <>
          <Hill color={color} />
          <rect x="-62" y="-98" width="124" height="26" fill={WHITE} {...line} />
          <rect x="-68" y="-106" width="136" height="8" fill={SAND} {...line} />
          {[-50, -34, -18, -2, 14, 30, 46].map((x) => (
            <rect key={x} x={x} y="-96" width="5" height="22" fill={mixColor(color, WHITE, 0.45)} />
          ))}
          <rect x="-24" y="-122" width="48" height="16" fill={WHITE} {...line} />
          <Cypress x={-86} y={-54} h={40} />
          <Cypress x={86} y={-50} h={42} />
          <Cypress x={102} y={-38} h={34} />
        </>
      );
    case 'loom':
      return (
        <>
          <Hill color={color} />
          <rect x="-26" y="-104" width="52" height="32" fill={WHITE} {...line} />
          <path d="M-32 -104 L0 -128 L32 -104 Z" fill={ROOF} {...line} />
          <path d="M-6 -72 v-14 a6 6 0 0 1 12 0 v14Z" fill={INK} />
          <rect x="-20" y="-98" width="9" height="9" fill={DOME} />
          <rect x="11" y="-98" width="9" height="9" fill={DOME} />
          <rect x="38" y="-90" width="30" height="24" fill="none" stroke={INK} strokeWidth="2.5" />
          <path d="M44 -88 v20 M50 -88 v20" stroke={ROOF} strokeWidth="3" />
          <path d="M56 -88 v20" stroke={DOME} strokeWidth="3" />
          <path d="M62 -88 v20" stroke="#f2b13a" strokeWidth="3" />
          <Cypress x={-66} y={-60} h={46} />
        </>
      );
    case 'cave': {
      const hill = mixColor(HILL, color, 0.22);
      const shade = mixColor(HILL_SHADE, color, 0.22);
      return (
        <>
          <path d={SHAPE_CAVE} fill={hill} />
          <path d="M10 -112 C60 -96 110 -36 150 0 L60 0 C70 -40 50 -90 10 -112 Z" fill={shade} />
          <path d={SHAPE_BEACH} fill={SAND} />
          <path d={SHAPE_CAVE} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-32 0 C-32 -44 32 -44 32 0 Z" fill="#241f2e" {...line} />
          <ellipse cx="44" cy="-8" rx="18" ry="12" fill="#8a84a8" {...line} />
          <ellipse cx="-92" cy="-46" rx="9" ry="6" fill={WHITE} {...line} />
          <circle cx="-82" cy="-48" r="3.5" fill={INK} />
          <ellipse cx="-66" cy="-64" rx="9" ry="6" fill={WHITE} {...line} />
          <circle cx="-56" cy="-66" r="3.5" fill={INK} />
        </>
      );
    }
    case 'tower':
      return (
        <>
          <Hill color={color} />
          <rect x="-2" y="-142" width="28" height="70" fill={WHITE} {...line} />
          <path d="M-7 -142 L12 -170 L31 -142 Z" fill={ROOF} {...line} />
          <path d="M8 -112 v-10 a4 4 0 0 1 8 0 v10Z M8 -90 v-10 a4 4 0 0 1 8 0 v10Z" fill={INK} />
          <path d="M12 -170 v-10" stroke={INK} strokeWidth="2" />
          <path d="M12 -180 L26 -176 L12 -172 Z" fill="#7a6ff0" {...line} />
          <Cypress x={-56} y={-66} h={44} />
          <Cypress x={-36} y={-72} h={36} />
        </>
      );
    case 'eye':
      return (
        <>
          <Hill color={color} />
          <rect x="-44" y="-80" width="56" height="6" fill={WHITE} {...line} />
          <rect x="-38" y="-118" width="9" height="38" fill={WHITE} {...line} />
          <rect x="-6" y="-118" width="9" height="38" fill={WHITE} {...line} />
          <rect x="-44" y="-126" width="56" height="8" fill={WHITE} {...line} />
          <path d="M30 -76 L36 -96 M48 -76 L42 -96 M39 -76 L39 -96" stroke={INK} strokeWidth="2.5" />
          <path d="M28 -100 h22 l-4 7 h-14 Z" fill="#b5651d" {...line} />
          <g className="od-smoke">
            <path d="M39 -104 C33 -114 45 -120 39 -130 C33 -140 45 -146 39 -156" fill="none" stroke={WHITE} strokeWidth="4" strokeLinecap="round" />
          </g>
        </>
      );
    case 'anvil':
      return (
        <>
          <path d={SHAPE_VOLCANO} fill="#6e5248" />
          <path d="M10 -112 L38 -112 C70 -60 110 -20 150 0 L56 0 C60 -40 40 -80 10 -112 Z" fill="#53392f" />
          <path d={SHAPE_BEACH} fill={SAND} />
          <path d={SHAPE_VOLCANO} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M-38 -112 Q0 -100 38 -112 Q0 -122 -38 -112Z" fill="#f08a2b" {...line} />
          <path d="M-6 -108 C-12 -88 4 -70 -6 -36 L2 -36 C12 -70 -2 -90 6 -108Z" fill="#f08a2b" />
          <g className="od-smoke">
            <circle cx="-4" cy="-128" r="12" fill="#c9c0b4" {...line} />
          </g>
          <g className="od-smoke">
            <circle cx="10" cy="-146" r="15" fill="#c9c0b4" {...line} />
          </g>
          <g className="od-smoke">
            <circle cx="-2" cy="-166" r="13" fill="#c9c0b4" {...line} />
          </g>
        </>
      );
    default:
      return (
        <>
          <Hill color={color} />
          <Cypress x={-30} y={-72} h={40} />
          <Cypress x={30} y={-72} h={34} />
        </>
      );
  }
}

/** One island on the waterline at (0, 0). A pennant in the island colour marks a completed island. */
export function PosterIsland(props: { landmark?: Landmark; color: string; flag?: boolean }): React.ReactElement {
  return (
    <g>
      <Landmarks landmark={props.landmark} color={props.color} />
      {props.flag && (
        <g>
          <path d="M-104 -34 V-80" stroke={INK} strokeWidth="2.5" />
          <path d="M-104 -80 L-74 -72 L-104 -64 Z" fill={props.color} {...line} />
        </g>
      )}
    </g>
  );
}

/** A sailing boat seen from the side, drawn around (0, 0) on the waterline. */
function Sailboat(): React.ReactElement {
  return (
    <g>
      <path d="M-46 -6 L46 -6 L34 14 L-34 14 Z" fill="#6b4228" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-40 2 H40" stroke="#b98256" strokeWidth="3" />
      <path d="M0 -6 V-96" stroke={INK} strokeWidth="3" />
      <path d="M4 -90 C34 -62 40 -32 40 -12 L4 -12 Z" fill={WHITE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M-4 -80 C-24 -56 -30 -34 -32 -12 L-4 -12 Z" fill="#f2b13a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M0 -96 L22 -90 L0 -84 Z" fill="#c94f33" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </g>
  );
}

/** Wide poster scene for the welcome screens: sun, islands on the horizon and a boat setting sail. */
export function PosterBanner(props: { className?: string }): React.ReactElement {
  const horizon = 214;
  const rays: string[] = [];
  for (let i = 0; i < 18; i++) {
    const a1 = (i / 18) * Math.PI * 2;
    const a2 = a1 + Math.PI / 36;
    const p = (a: number): string => `${(720 + Math.cos(a) * 900).toFixed(0)} ${(horizon + Math.sin(a) * 900).toFixed(0)}`;
    rays.push(`M720 ${horizon} L${p(a1)} L${p(a2)}Z`);
  }
  const waves: React.ReactElement[] = [];
  for (let i = 0; i < 7; i++) {
    const y = horizon + 10 + i * i * 2.2 + i * 6;
    waves.push(
      <path
        key={i}
        d={`M-50 ${y} H1050`}
        stroke="#3a82b4"
        strokeWidth={1.5 + i * 0.6}
        strokeDasharray={`${14 + i * 10} ${30 + i * 18}`}
        strokeDashoffset={(i * 53) % 90}
        strokeLinecap="round"
      />
    );
  }
  return (
    <svg className={props.className} viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <pattern id="od-banner-dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="2" fill="#f8cf72" />
        </pattern>
        <clipPath id="od-banner-sky">
          <rect x="0" y="0" width="1000" height={horizon} />
        </clipPath>
      </defs>
      <rect width="1000" height={horizon} fill="#f5e0b0" />
      <g clipPath="url(#od-banner-sky)">
        <path d={rays.join(' ')} fill="#f9ebc9" opacity="0.75" />
        <circle cx="720" cy={horizon} r="96" fill="#f0a537" />
        <circle cx="720" cy={horizon} r="96" fill="url(#od-banner-dots)" opacity="0.55" />
      </g>
      <g fill="#fbf4e4">
        <rect x="90" y="58" width="150" height="22" rx="11" />
        <rect x="126" y="40" width="74" height="24" rx="12" />
        <rect x="820" y="40" width="120" height="20" rx="10" />
      </g>
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M430 70 q7 -8 14 0 q7 -8 14 0" />
        <path d="M466 90 q6 -7 12 0 q6 -7 12 0" />
      </g>
      <g transform={`translate(160 ${horizon + 4}) scale(0.55)`}>
        <PosterIsland landmark="rocks" color="#8e7cc3" />
      </g>
      <g transform={`translate(720 ${horizon + 6}) scale(0.5)`}>
        <PosterIsland landmark="wind" color="#3d9be9" />
      </g>
      <g transform={`translate(905 ${horizon + 4}) scale(0.38)`}>
        <PosterIsland landmark="temple" color="#e9a23b" />
      </g>
      <rect x="0" y={horizon} width="1000" height={300 - horizon} fill="#1f5f8b" />
      <g fill="none">{waves}</g>
      <g transform={`translate(430 ${horizon + 44})`}>
        <g className="od-boat">
          <Sailboat />
        </g>
      </g>
    </svg>
  );
}
