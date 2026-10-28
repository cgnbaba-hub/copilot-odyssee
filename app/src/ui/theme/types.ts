import * as React from 'react';

import { Localized } from '../../core/content/types';

/**
 * A theme bundles look and wording. The game logic never refers to theme
 * terms directly, so a different theme can rename "Seemeilen" and ranks
 * without touching the engine.
 */
export interface Theme {
  id: string;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    onPrimary: string;
    accent: string;
    success: string;
    danger: string;
    sea: string;
    seaDeep: string;
  };
  terms: {
    appTitle: Localized;
    tagline: Localized;
    /** Name of the XP currency. */
    xp: Localized;
    mapTitle: Localized;
    preview: Localized;
  };
  /** Sorted by minLevel, the first entry starts at level 1. */
  ranks: { minLevel: number; name: Localized }[];
}

export function rankFor(theme: Theme, level: number): Localized {
  let rank = theme.ranks[0].name;
  theme.ranks.forEach((r) => {
    if (level >= r.minLevel) rank = r.name;
  });
  return rank;
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
    '--od-border': c.border,
    '--od-primary': c.primary,
    '--od-on-primary': c.onPrimary,
    '--od-accent': c.accent,
    '--od-success': c.success,
    '--od-danger': c.danger,
    '--od-sea': c.sea,
    '--od-sea-deep': c.seaDeep
  } as React.CSSProperties;
}
