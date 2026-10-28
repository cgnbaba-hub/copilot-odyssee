import * as React from 'react';

import { Localized } from '../../core/content/types';
import { SouvenirId } from '../../core/progress/achievements';
import { levelFromXp, xpRequiredForLevel } from '../../core/progress/levels';

/**
 * A theme bundles look and wording. The game logic never refers to theme
 * terms directly, so a different theme can rename "Seemeilen", ranks or
 * souvenirs without touching the engine.
 */
export interface Theme {
  id: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    line: string;
    /** Dark brand colour for the header and strong accents. */
    ink: string;
    primary: string;
    onPrimary: string;
    /** Highlights such as progress and rewards. */
    accent: string;
    sand: string;
    success: string;
    danger: string;
    sea: string;
    seaDeep: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  terms: {
    appTitle: Localized;
    tagline: Localized;
    /** Name of the XP currency. */
    xp: Localized;
    mapTitle: Localized;
    preview: Localized;
    passport: Localized;
    stamps: Localized;
    souvenirs: Localized;
  };
  /** Sorted by minLevel, the first entry starts at level 1. */
  ranks: { minLevel: number; name: Localized }[];
  souvenirs: Record<SouvenirId, { name: Localized; hint: Localized }>;
}

export interface RankProgress {
  /** Index into theme.ranks. */
  index: number;
  rank: Localized;
  next?: Localized;
  /** XP still needed for the next rank. */
  xpToNext: number;
  /** 0–100 within the current rank. */
  percent: number;
}

export function rankProgress(theme: Theme, xp: number): RankProgress {
  const level = levelFromXp(xp);
  let index = 0;
  theme.ranks.forEach((r, i) => {
    if (level >= r.minLevel) index = i;
  });
  const current = theme.ranks[index];
  const next = theme.ranks[index + 1];
  if (!next) return { index, rank: current.name, xpToNext: 0, percent: 100 };

  const from = xpRequiredForLevel(current.minLevel);
  const to = xpRequiredForLevel(next.minLevel);
  return {
    index,
    rank: current.name,
    next: next.name,
    xpToNext: to - xp,
    percent: Math.max(0, Math.min(100, Math.round(((xp - from) / (to - from)) * 100)))
  };
}

/** CSS custom properties consumed by the *.module.scss files. */
export function themeVariables(theme: Theme): React.CSSProperties {
  const c = theme.colors;
  return {
    '--od-background': c.background,
    '--od-surface': c.surface,
    '--od-surface-alt': c.surfaceAlt,
    '--od-text': c.text,
    '--od-text-muted': c.textMuted,
    '--od-line': c.line,
    '--od-ink': c.ink,
    '--od-primary': c.primary,
    '--od-on-primary': c.onPrimary,
    '--od-accent': c.accent,
    '--od-sand': c.sand,
    '--od-success': c.success,
    '--od-danger': c.danger,
    '--od-sea': c.sea,
    '--od-sea-deep': c.seaDeep,
    '--od-font-display': theme.fonts.display,
    '--od-font-body': theme.fonts.body
  } as React.CSSProperties;
}
