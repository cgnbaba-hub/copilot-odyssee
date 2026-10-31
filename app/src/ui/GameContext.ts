import * as React from 'react';

import { ContentBundle, Localized } from '../core/content/types';
import { Lang } from '../core/i18n/locale';
import { Outcome, PlayerState } from '../core/progress/state';
import { Strings } from './i18n/strings';
import { Theme } from './theme/types';

export type View =
  | { name: 'map' }
  | { name: 'passport'; stamp?: string }
  | { name: 'cheatsheet' }
  | { name: 'admin' }
  | { name: 'island'; islandId: string }
  | { name: 'module'; moduleId: string };

export interface Game {
  content: ContentBundle;
  player: PlayerState;
  lang: Lang;
  strings: Strings;
  theme: Theme;
  showDrafts: boolean;
  /** Text of the current language. */
  t: (text: Localized) => string;
  /** Applies a state change, saves it and celebrates earned XP. */
  apply: <T extends Outcome>(change: (state: PlayerState) => T) => T;
  /** Changes the state without XP, e.g. profile settings. */
  update: (change: (state: PlayerState) => PlayerState) => PlayerState;
  navigate: (view: View) => void;
}

export const GameContext = React.createContext<Game | undefined>(undefined);

export function useGame(): Game {
  const game = React.useContext(GameContext);
  if (!game) throw new Error('useGame must be used inside <GameContext.Provider>');
  return game;
}
