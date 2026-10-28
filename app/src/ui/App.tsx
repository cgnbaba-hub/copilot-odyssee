import * as React from 'react';

import { ContentBundle, Localized } from '../core/content/types';
import { Lang, localize } from '../core/i18n/locale';
import { earnedSouvenirs } from '../core/progress/achievements';
import { initialState, Outcome, PlayerState } from '../core/progress/state';
import { ProgressStore } from '../core/progress/store';
import { Header } from './components/Header';
import { HelpPanel } from './components/HelpPanel';
import { Home } from './components/Home';
import { IslandView } from './components/IslandView';
import { ModulePlayer } from './components/ModulePlayer';
import { Onboarding } from './components/Onboarding';
import { Passport } from './components/Passport';
import { RankUp } from './components/RankUp';
import { Settings } from './components/Settings';
import { Game, GameContext, View } from './GameContext';
import { format, stringsFor } from './i18n/strings';
import styles from './styles.module.scss';
import { odysseeTheme } from './theme/odyssee';
import { rankProgress, Theme, themeVariables } from './theme/types';

export interface AppProps {
  content: ContentBundle;
  store: ProgressStore;
  /** Language before the player picks one. */
  initialLang: Lang;
  showDrafts: boolean;
  /** Where progress is saved; anything but SharePoint is pointed out to the player. */
  storage: 'demo' | 'browser' | 'sharepoint';
  theme?: Theme;
}

interface Toast {
  id: number;
  text: string;
  kind: 'xp' | 'souvenir';
}

const TOAST_MS = 2600;
const MAX_TOASTS = 3;

export function App(props: AppProps): React.ReactElement {
  const theme = props.theme || odysseeTheme;
  const [player, setPlayer] = React.useState<PlayerState | undefined>(undefined);
  const [view, setView] = React.useState<View>({ name: 'map' });
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [rankUp, setRankUp] = React.useState<number | undefined>(undefined);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const playerRef = React.useRef<PlayerState | undefined>(undefined);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let active = true;
    const begin = (saved: PlayerState | undefined): void => {
      if (!active) return;
      const state = saved || initialState(props.initialLang);
      playerRef.current = state;
      setPlayer(state);
    };
    props.store.load().then(begin, () => begin(undefined));
    return () => {
      active = false;
    };
  }, [props.store]);

  if (!player) {
    return <div className={styles.app}>{stringsFor(props.initialLang).loading}</div>;
  }

  const lang = player.profile.lang;
  const strings = stringsFor(lang);
  const t = (text: Localized): string => localize(text, lang);

  const commit = (next: PlayerState): void => {
    playerRef.current = next;
    setPlayer(next);
    props.store.save(next).catch(() => undefined);
  };

  const toast = (text: string, kind: Toast['kind']): void => {
    const id = Date.now() + Math.random();
    setToasts((current) => current.concat([{ id, text, kind }]).slice(-MAX_TOASTS));
    window.setTimeout(() => setToasts((current) => current.filter((x) => x.id !== id)), TOAST_MS);
  };

  const scrollToTop = (): void => {
    if (rootRef.current && rootRef.current.scrollIntoView) rootRef.current.scrollIntoView({ block: 'start' });
  };

  const game: Game = {
    content: props.content,
    player,
    lang,
    strings,
    theme,
    showDrafts: props.showDrafts,
    t,
    apply: <T extends Outcome>(change: (state: PlayerState) => T): T => {
      const before = playerRef.current as PlayerState;
      const outcome = change(before);
      commit(outcome.state);
      if (outcome.xpGained > 0) {
        toast(`+${outcome.xpGained} ${t(theme.terms.xp)}`, 'xp');
        const oldRank = rankProgress(theme, before.xp).index;
        const newRank = rankProgress(theme, outcome.state.xp).index;
        if (newRank > oldRank) setRankUp(newRank);
      }
      const known = earnedSouvenirs(props.content, before);
      earnedSouvenirs(props.content, outcome.state)
        .filter((id) => known.indexOf(id) < 0)
        .forEach((id) => toast(format(strings.souvenirFound, { name: t(theme.souvenirs[id].name) }), 'souvenir'));
      return outcome;
    },
    update: (change) => {
      const next = change(playerRef.current as PlayerState);
      commit(next);
      return next;
    },
    navigate: (next) => {
      setView(next);
      scrollToTop();
    }
  };

  const reset = (): void => {
    props.store.clear().catch(() => undefined);
    commit(initialState(lang));
    setSettingsOpen(false);
    setView({ name: 'map' });
  };

  let main: React.ReactElement;
  if (!player.profile.onboarded) main = <Onboarding />;
  // Keys give every island and stage a fresh screen, so no state carries over from the previous one.
  else if (view.name === 'island') main = <IslandView key={view.islandId} islandId={view.islandId} />;
  else if (view.name === 'module') main = <ModulePlayer key={view.moduleId} moduleId={view.moduleId} />;
  else if (view.name === 'passport') main = <Passport />;
  else main = <Home />;

  return (
    <GameContext.Provider value={game}>
      <div ref={rootRef} className={styles.app} style={themeVariables(theme)} lang={lang === 'de' ? 'de-CH' : 'en'}>
        {props.storage === 'demo' && <p className={styles.demoBanner}>{strings.demoBanner}</p>}
        {props.storage === 'browser' && <p className={styles.demoBanner}>{strings.browserStorageBanner}</p>}
        <Header onOpenSettings={() => setSettingsOpen(true)} onOpenHelp={() => setHelpOpen(true)} />
        <main className={styles.main}>{main}</main>
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} onReset={reset} />}
        {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} />}
        {/* A new status is celebrated outside of stages, so it never interrupts a task. */}
        {rankUp !== undefined && view.name !== 'module' && <RankUp index={rankUp} onClose={() => setRankUp(undefined)} />}
        <div className={styles.toasts} aria-live="polite">
          {toasts.map((x) => (
            <div key={x.id} className={x.kind === 'souvenir' ? `${styles.toast} ${styles.toastSouvenir}` : styles.toast}>
              {x.text}
            </div>
          ))}
        </div>
      </div>
    </GameContext.Provider>
  );
}
