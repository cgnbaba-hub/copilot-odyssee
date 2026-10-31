import * as React from 'react';

import { Localized } from '../core/content/types';

/**
 * The companions a player can choose. They explain, encourage and lead the
 * tour. All of them belong to the sea or to the Greek gods, so they fit the
 * journey without anyone having to know the Odyssey.
 */
export interface GuideDef {
  id: string;
  name: Localized;
  kind: Localized;
  /** One sentence on why this companion suits the journey. */
  why: Localized;
}

export const GUIDES: GuideDef[] = [
  {
    id: 'adler',
    name: { de: 'Aetos', en: 'Aetos' },
    kind: { de: 'Adler des Zeus', en: 'Eagle of Zeus' },
    why: {
      de: 'Der Adler ist das Tier des Zeus, des obersten Gottes. Er behält aus grosser Höhe den Überblick.',
      en: 'The eagle is the animal of Zeus, king of the gods. From high above it keeps the overview.'
    }
  },
  {
    id: 'moewe',
    name: { de: 'Mira', en: 'Mira' },
    kind: { de: 'Möwe', en: 'Seagull' },
    why: { de: 'Möwen sind immer dort, wo Schiffe sind, und sehen von oben, wo es langgeht.', en: 'Seagulls are always where ships are and see from above where to go.' }
  },
  {
    id: 'delfin',
    name: { de: 'Fino', en: 'Fino' },
    kind: { de: 'Delfin', en: 'Dolphin' },
    why: { de: 'In den alten Sagen begleiten Delfine Schiffe sicher in den Hafen.', en: 'In the old myths, dolphins guide ships safely into harbour.' }
  },
  {
    id: 'lotsin',
    name: { de: 'Nora', en: 'Nora' },
    kind: { de: 'Lotsin', en: 'Harbour pilot' },
    why: {
      de: 'Eine Lotsin bringt Schiffe sicher durch schwierige Gewässer, so wie ein Co-Pilot.',
      en: 'A harbour pilot brings ships safely through tricky waters, just like a co-pilot.'
    }
  }
];

export const DEFAULT_GUIDE = 'adler';

export function guideById(id: string | undefined): GuideDef {
  return GUIDES.filter((g) => g.id === id)[0] || GUIDES.filter((g) => g.id === DEFAULT_GUIDE)[0];
}

const INK = '#1a2940';
const SUN = '#f2b13a';
const CREAM = '#fffaf0';
const line = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Seagull(): React.ReactElement {
  return (
    <>
      <path d="M44 78l-2 12M55 78l2 12M38 90h8M53 90h8" stroke="#e8892b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M26 60 L10 53 L13 66 L26 70 Z" fill="#8e9ba6" {...line} />
      <path d="M22 62 C22 46 38 39 54 41 C66 42 73 49 74 57 C76 69 64 80 46 80 C32 80 22 72 22 62 Z" fill={CREAM} {...line} />
      <path d="M30 57 C40 49 56 51 63 59 C55 67 40 69 30 65 Z" fill="#a9b6c0" {...line} />
      <path d="M30 57 L21 55 L30 65 Z" fill={INK} />
      <circle cx="64" cy="34" r="13" fill={CREAM} {...line} />
      <path d="M75 33 L92 37 L75 41 Z" fill={SUN} {...line} />
      <circle cx="85" cy="38.6" r="1.8" fill="#c94f33" />
      <circle className="od-eyes" cx="68" cy="31" r="2.6" fill={INK} />
      <path d="M63 25.5 L72 27.5" {...line} />
    </>
  );
}

function Eagle(): React.ReactElement {
  return (
    <>
      <path d="M26 66 L10 76 L16 81 L30 72 Z" fill="#5c3a22" {...line} />
      <path d="M24 64 C22 48 34 38 50 38 C64 38 72 48 72 60 C72 74 60 82 46 82 C34 82 26 76 24 64 Z" fill="#8a5a34" {...line} />
      <path d="M52 46 C61 49 66 57 64 68 C62 76 55 80 49 80 C55 71 55 58 52 46 Z" fill="#b07a45" />
      <path d="M28 56 C36 44 52 46 58 58 C52 68 40 72 28 66 Z" fill="#6b4228" {...line} />
      <path d="M44 80 v7 M54 80 v7" stroke="#e8a23b" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 89 L47 84 L45 88 L60 85 L49 94 L51 90 Z" fill="#f7cd62" {...line} strokeWidth={2} />
      <circle cx="62" cy="31" r="13" fill="#c9913f" {...line} />
      <path d="M71 29 C80 29 87 33 85 40 C83 38 79 37 74 38 Z" fill={SUN} {...line} />
      <g className="od-eyes">
        <circle cx="65.5" cy="29.5" r="2.6" fill={INK} />
        <circle cx="66.3" cy="28.7" r="0.8" fill={CREAM} />
      </g>
      <path d="M60 24.5 L70 25.5" {...line} />
    </>
  );
}

function Dolphin(): React.ReactElement {
  return (
    <>
      <path d="M6 84 q8 -7 16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
      <path d="M22 70 C14 64 8 64 4 66 C10 70 12 75 10 81 C16 77 20 75 23 72 Z" fill="#2f6496" {...line} />
      <path d="M50 33 C52 22 58 17 63 17 C59 24 58 28 60 31 Z" fill="#2f6496" {...line} />
      <path d="M20 67 C30 45 44 32 60 30 C70 29 78 32 83 38 L94 43 C92 46 86 47 82 46 C72 50 62 56 52 60 C40 65 30 70 24 73 Z" fill="#3e7cb1" {...line} />
      <path d="M81 47 C72 51 62 56 52 60 C46 62 42 64 38 65 C48 55 63 49 81 47 Z" fill="#a9d1ea" />
      <path d="M60 54 C58 62 54 66 49 68 C51 62 53 58 55 55 Z" fill="#2f6496" {...line} />
      <circle className="od-eyes" cx="77" cy="38" r="2.4" fill={INK} />
      <path d="M87 45.5 q-3 1.6 -6 .6" fill="none" {...line} strokeWidth={1.8} />
    </>
  );
}

function Pilot(): React.ReactElement {
  return (
    <>
      <path d="M28 44 C28 25 72 25 72 44 L72 64 C66 68 60 66 58 61 L42 61 C40 66 34 68 28 64 Z" fill="#3b2a22" {...line} />
      <path d="M44 60 h12 v13 h-12 Z" fill="#d49a72" {...line} />
      <path d="M17 100 C17 80 31 71 50 71 C69 71 83 80 83 100 Z" fill="#1f3a60" {...line} />
      <path d="M41 71 L50 84 L59 71" fill={CREAM} {...line} />
      <circle cx="50" cy="90" r="2.2" fill={SUN} />
      <ellipse cx="50" cy="48" rx="16" ry="18" fill="#e2ae86" {...line} />
      <path d="M27 33 C29 17 71 17 73 33 L71 38 L29 38 Z" fill={CREAM} {...line} />
      <path d="M29 35 h42 v6 h-42 Z" fill="#1f3a60" {...line} />
      <path d="M30 41 C40 47 60 47 70 41 L72 43 C60 51 40 51 28 43 Z" fill={INK} />
      <circle cx="50" cy="27" r="4.5" fill={SUN} stroke={INK} strokeWidth="1.5" />
      <g className="od-eyes">
        <circle cx="44" cy="52" r="2" fill={INK} />
        <circle cx="56" cy="52" r="2" fill={INK} />
      </g>
      <path d="M45 58.5 q5 4 10 0" fill="none" {...line} strokeWidth={2} />
    </>
  );
}

/** Round portrait of a companion on a sun disc. */
export function GuidePortrait(props: { id?: string; className?: string }): React.ReactElement {
  const guide = guideById(props.id);
  const clipId = `od-guide-clip-${guide.id}`;
  const body = guide.id === 'adler' ? <Eagle /> : guide.id === 'delfin' ? <Dolphin /> : guide.id === 'lotsin' ? <Pilot /> : <Seagull />;
  return (
    <svg viewBox="0 0 100 100" className={props.className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="47" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill={guide.id === 'delfin' ? '#7fb3d8' : SUN} stroke={INK} strokeWidth="2.5" />
      <g clipPath={`url(#${clipId})`}>
        {/* The companion sways a little and blinks now and then, so it feels alive. */}
        <g className="od-guide-body">{body}</g>
      </g>
    </svg>
  );
}
