import * as React from 'react';

import { findIsland, findModule } from '../core/content/bundle';
import { AdminSource } from '../core/admin/source';
import { ContentBundle, Localized } from '../core/content/types';
import { FeedbackSender } from '../core/feedback/feedback';
import { Lang, localize } from '../core/i18n/locale';
import { earnedSouvenirs, SouvenirId } from '../core/progress/achievements';
import { initialState, Outcome, PlayerState, updateProfile } from '../core/progress/state';
import { ProgressStore } from '../core/progress/store';
import { AdminView } from './components/AdminView';
import { SouvenirIcon } from './components/Art';
import { Loading } from './components/Loading';
import { CheatSheet } from './components/CheatSheet';
import { ContactNote } from './components/ContactNote';
import { FeedbackPanel } from './components/FeedbackPanel';
import { Header } from './components/Header';
import { HelpPanel } from './components/HelpPanel';
import { Home } from './components/Home';
import { IslandView } from './components/IslandView';
import { ModulePlayer } from './components/ModulePlayer';
import { NavBar } from './components/NavBar';
import { Onboarding } from './components/Onboarding';
import { Passport } from './components/Passport';
import { RankUp } from './components/RankUp';
import { Settings } from './components/Settings';
import { Tour } from './components/Tour';
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
  /** Where feedback goes; without it the app points to the contact address. */
  feedback?: FeedbackSender;
  /** Evaluation data; only given to people who may see every entry. */
  admin?: AdminSource;
}

interface Toast {
  id: number;
  kind: 'xp' | 'souvenir';
  /** Nautical miles of an xp toast; quick gains add up in one toast. */
  xp?: number;
  /** Text of a souvenir toast. */
  text?: string;
  /** Which souvenir was found, for its icon. */
  souvenir?: SouvenirId;
}

const TOAST_MS = 2600;
/** How long pressing a new stamp into the passport takes. */
const STAMP_PRESS_MS = 2600;
const MAX_TOASTS = 3;

export function App(props: AppProps): React.ReactElement {
  const theme = props.theme || odysseeTheme;
  const [player, setPlayer] = React.useState<PlayerState | undefined>(undefined);
  const [view, setView] = React.useState<View>({ name: 'map' });
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [rankUp, setRankUp] = React.useState<number | undefined>(undefined);
  // While a new stamp is pressed into the passport, a new status waits until the stamp is in.
  const [stampSeen, setStampSeen] = React.useState(true);
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

  const stampFor = view.name === 'passport' ? view.stamp : undefined;
  React.useEffect(() => {
    if (!stampFor) return undefined;
    setStampSeen(false);
    const timer = window.setTimeout(() => setStampSeen(true), STAMP_PRESS_MS);
    return () => window.clearTimeout(timer);
  }, [stampFor]);

  if (!player) {
    return (
      <div className={styles.app} style={themeVariables(theme)}>
        <Loading text={stringsFor(props.initialLang).loading} />
      </div>
    );
  }

  const lang = player.profile.lang;
  const strings = stringsFor(lang);
  const t = (text: Localized): string => localize(text, lang);

  const commit = (next: PlayerState): void => {
    playerRef.current = next;
    setPlayer(next);
    props.store.save(next).catch(() => undefined);
  };

  const showToast = (entry: Omit<Toast, 'id'>): void => {
    const id = Date.now() + Math.random();
    setToasts((current) => {
      // Miles earned in quick succession are added to the visible miles toast instead of stacking up.
      const shown = current.filter((x) => x.kind === 'xp')[0];
      if (entry.kind === 'xp' && shown) {
        return current.map((x) => (x === shown ? { id, kind: 'xp', xp: (shown.xp || 0) + (entry.xp || 0) } : x));
      }
      return current.concat([{ id, ...entry }]).slice(-MAX_TOASTS);
    });
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
        showToast({ kind: 'xp', xp: outcome.xpGained });
        const oldRank = rankProgress(theme, before.xp).index;
        const newRank = rankProgress(theme, outcome.state.xp).index;
        if (newRank > oldRank) setRankUp(newRank);
      }
      const known = earnedSouvenirs(props.content, before);
      earnedSouvenirs(props.content, outcome.state)
        .filter((id) => known.indexOf(id) < 0)
        .forEach((id) => showToast({ kind: 'souvenir', souvenir: id, text: format(strings.souvenirFound, { name: t(theme.souvenirs[id].name) }) }));
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

  const onboarded = player.profile.onboarded;
  // Sent along with feedback so the team knows which screen it is about.
  const pageLabel = ((): string => {
    if (view.name === 'module') {
      const module = findModule(props.content, view.moduleId);
      return format(strings.pageStage, { name: module ? t(module.title) : view.moduleId });
    }
    if (view.name === 'island') {
      const island = findIsland(props.content, view.islandId);
      return format(strings.pageIsland, { name: island ? t(island.name) : view.islandId });
    }
    if (view.name === 'passport') return t(theme.terms.passport);
    if (view.name === 'cheatsheet') return strings.cheatsheet;
    if (view.name === 'admin') return strings.adminTitle;
    return strings.pageHome;
  })();
  const openFeedback = (): void => {
    setHelpOpen(false);
    setFeedbackOpen(true);
  };
  const navActive = helpOpen
    ? 'help'
    : settingsOpen
      ? 'settings'
      : view.name === 'passport'
        ? 'passport'
        : view.name === 'cheatsheet'
          ? 'cheatsheet'
          : view.name === 'admin'
            ? 'admin'
            : 'journey';
  // The tour explains the start screen, so it waits until the player is there and nothing else is open.
  const showTour = onboarded && !player.profile.toured && view.name === 'map' && !helpOpen && !settingsOpen && !feedbackOpen && rankUp === undefined;
  const finishTour = (): void => {
    game.update((s) => updateProfile(s, { toured: true }));
  };
  const restartTour = (): void => {
    setSettingsOpen(false);
    setView({ name: 'map' });
    game.update((s) => updateProfile(s, { toured: false }));
  };

  let main: React.ReactElement;
  if (!onboarded) main = <Onboarding />;
  // Keys give every island and stage a fresh screen, so no state carries over from the previous one.
  else if (view.name === 'island') main = <IslandView key={view.islandId} islandId={view.islandId} />;
  else if (view.name === 'module') main = <ModulePlayer key={view.moduleId} moduleId={view.moduleId} />;
  else if (view.name === 'passport') main = <Passport stamp={view.stamp} />;
  else if (view.name === 'cheatsheet') main = <CheatSheet />;
  else if (view.name === 'admin' && props.admin) main = <AdminView source={props.admin} />;
  else main = <Home />;

  return (
    <GameContext.Provider value={game}>
      <div ref={rootRef} className={styles.app} style={themeVariables(theme)} lang={lang === 'de' ? 'de-CH' : 'en'}>
        {props.storage === 'demo' && <p className={styles.demoBanner}>{strings.demoBanner}</p>}
        {props.storage === 'browser' && <p className={styles.demoBanner}>{strings.browserStorageBanner}</p>}
        <Header onOpenSettings={() => setSettingsOpen(true)} onOpenHelp={() => setHelpOpen(true)} />
        <main className={styles.main}>{main}</main>
        <ContactNote onFeedback={openFeedback} />
        {onboarded && <NavBar onOpenHelp={() => setHelpOpen(true)} onOpenSettings={() => setSettingsOpen(true)} admin={!!props.admin} active={navActive} />}
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} onReset={reset} onRestartTour={restartTour} />}
        {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} onFeedback={openFeedback} />}
        {feedbackOpen && <FeedbackPanel sender={props.feedback} demo={props.storage === 'demo'} page={pageLabel} onClose={() => setFeedbackOpen(false)} />}
        {showTour && <Tour getRoot={() => rootRef.current || undefined} onDone={finishTour} />}
        {/* A new status is celebrated outside of stages and after a new stamp, so it never interrupts either. */}
        {rankUp !== undefined && view.name !== 'module' && !(view.name === 'passport' && view.stamp && !stampSeen) && (
          <RankUp index={rankUp} onClose={() => setRankUp(undefined)} />
        )}
        <div className={styles.toasts} aria-live="polite">
          {toasts.map((x) => (
            <div key={x.id} className={x.kind === 'souvenir' ? `${styles.toast} ${styles.toastSouvenir}` : styles.toast}>
              <span className={styles.toastIcon} aria-hidden="true">
                {x.souvenir ? (
                  <SouvenirIcon id={x.souvenir} />
                ) : (
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#f2b13a" stroke="#1a2940" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="6.6" fill="none" stroke="#1a2940" strokeWidth="1.2" strokeDasharray="2 1.6" />
                    <path d="M12 8.2v7.6M9.4 10.4h5.2M8.8 13.6c.8 1.6 2 2.2 3.2 2.2s2.4-.6 3.2-2.2" fill="none" stroke="#1a2940" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span>{x.kind === 'xp' ? `+${x.xp || 0} ${t(theme.terms.xp)}` : x.text}</span>
            </div>
          ))}
        </div>
      </div>
    </GameContext.Provider>
  );
}
