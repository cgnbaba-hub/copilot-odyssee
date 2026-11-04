import * as React from 'react';

import { findModule } from '../../core/content/bundle';
import { MissionApp, PromptTemplate } from '../../core/content/types';
import { APP_NAMES } from '../copilot';
import { isPromptSaved, toggleSavedPrompt, updateProfile } from '../../core/progress/state';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import { licenseCovers, playerArea, templatesFor } from '../progressHelpers';
import styles from '../styles.module.scss';
import { Guide } from './Guide';
import { PromptCard } from './PromptCard';
import { SheetTabs } from './SheetTabs';

const ALL_AREAS = '';
const FIRST_TEMPLATES = 6;
type AppFilter = 'all' | 'chat' | MissionApp;
const APP_FILTERS: AppFilter[] = ['all', 'chat', 'outlook', 'teams', 'word', 'excel', 'powerpoint'];
const FILTER_KEY = 'odyssee.sheetArea';

/** The area last picked here; it counts only while the profile area is still the one it was picked under. */
function savedFilter(profileArea: string): string | undefined {
  try {
    const raw = window.localStorage.getItem(FILTER_KEY);
    const saved = raw ? (JSON.parse(raw) as { profile: string; filter: string }) : undefined;
    return saved && saved.profile === profileArea ? saved.filter : undefined;
  } catch {
    return undefined;
  }
}

function saveFilter(profileArea: string, filter: string): void {
  try {
    window.localStorage.setItem(FILTER_KEY, JSON.stringify({ profile: profileArea, filter }));
  } catch {
    // The choice is then simply not remembered.
  }
}

/**
 * Prompts to copy into Copilot: saved templates, the player's own prompts
 * from their use case cards, and the templates for their field of work.
 */
export function CheatSheet(): React.ReactElement {
  const game = useGame();
  const { content, player, strings, t, update, navigate, pinboard } = game;
  const area = playerArea(game);
  const profileArea = area ? area.id : ALL_AREAS;
  // A change of area in the settings wins over an earlier pick here, also while this page is open.
  const [picked, setPicked] = React.useState<string | undefined>(() => savedFilter(profileArea));
  React.useEffect(() => setPicked(savedFilter(profileArea)), [profileArea]);
  const filter = picked !== undefined ? picked : profileArea;
  const setFilter = (next: string): void => {
    setPicked(next);
    saveFilter(profileArea, next);
  };
  const pickedArea = (content.areas || []).filter((a) => a.id === filter)[0];
  // Templates by app, the first few at once; Premium ones folded away for Basic.
  const [app, setApp] = React.useState<AppFilter>('all');
  const [showAll, setShowAll] = React.useState(false);
  const forArea = templatesFor(game, filter || undefined);
  const apps = APP_FILTERS.filter((a) => a === 'all' || forArea.some((p) => (p.app || 'chat') === a));
  const inApp = forArea.filter((p) => app === 'all' || (p.app || 'chat') === app);
  const usable = inApp.filter((p) => licenseCovers(game, p.license));
  const premiumOnly = inApp.filter((p) => !licenseCovers(game, p.license));
  const shown = showAll ? usable : usable.slice(0, FIRST_TEMPLATES);
  const saved = (content.prompts || []).filter((p) => isPromptSaved(player, p.id));
  // All use case cards: those without a prompt yet lead to the workshop.
  const own = player.useCases.slice().reverse();

  const templateCard = (p: PromptTemplate): React.ReactElement => (
    <PromptCard
      key={p.id}
      title={t(p.title)}
      text={t(p.prompt)}
      app={p.app}
      premium={p.license === 'premium'}
      saved={isPromptSaved(player, p.id)}
      onToggleSave={() => update((s) => toggleSavedPrompt(s, p.id))}
    />
  );

  return (
    <section className={styles.panel}>
      <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToOverview}
      </button>
      <SheetTabs active="cheatsheet" />
      <h1 className={styles.pageTitle}>{strings.cheatsheetTitle}</h1>
      <Guide text={strings.cheatsheetGuide} />

      <h2 className={styles.sectionTitle}>{strings.cheatsheetSaved}</h2>
      {saved.length > 0 ? <ul className={styles.promptList}>{saved.map(templateCard)}</ul> : <p className={styles.muted}>{strings.cheatsheetSavedEmpty}</p>}

      {own.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>{strings.cheatsheetOwn}</h2>
          <ul className={styles.promptList}>
            {own.map((card) => {
              const module = findModule(content, card.moduleId);
              if (card.prompt.trim().length === 0) {
                return (
                  <li key={card.id} className={styles.promptCard}>
                    {module && <p className={styles.eyebrow}>{t(module.title)}</p>}
                    <div className={styles.promptCardHead}>
                      <h3>{card.task}</h3>
                    </div>
                    <p className={styles.muted}>{strings.cheatsheetOwnNoPrompt}</p>
                    <div className={styles.promptCardActions}>
                      <button type="button" className={styles.buttonPrimary} onClick={() => navigate({ name: 'workshop', task: card.task })}>
                        🛠 {strings.cheatsheetOwnWrite}
                      </button>
                    </div>
                  </li>
                );
              }
              return (
                <PromptCard
                  key={card.id}
                  eyebrow={module ? t(module.title) : undefined}
                  title={card.task}
                  text={card.prompt}
                  shareLabel={pinboard ? strings.pinboardShareOwn : undefined}
                  onShare={pinboard ? () => navigate({ name: 'pinboard', draft: { title: card.task, prompt: card.prompt } }) : undefined}
                />
              );
            })}
          </ul>
        </>
      )}

      <div className={styles.sectionHeadRow}>
        <h2 className={styles.sectionTitle}>{strings.cheatsheetTemplates}</h2>
        {(content.areas || []).length > 0 && (
          <label className={styles.filterLabel}>
            {strings.cheatsheetFilter}
            <select className={styles.input} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value={ALL_AREAS}>{strings.allAreas}</option>
              {(content.areas || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {t(a.name)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {pickedArea && pickedArea.id !== profileArea && (
        <p className={styles.areaOffer}>
          {format(strings.areaOfferText, { area: t(pickedArea.name) })}{' '}
          <button type="button" className={styles.linkButton} onClick={() => update((s) => updateProfile(s, { area: pickedArea.id }))}>
            {strings.areaOfferSave}
          </button>
        </p>
      )}
      <div className={styles.appChips} role="group" aria-label={strings.cheatsheetAppFilter}>
        {apps.map((a) => (
          <button
            type="button"
            key={a}
            className={a === app ? `${styles.appChip} ${styles.appChipActive}` : styles.appChip}
            aria-pressed={a === app}
            onClick={() => {
              setApp(a);
              setShowAll(false);
            }}
          >
            {a === 'all' ? strings.allApps : a === 'chat' ? strings.appChat : APP_NAMES[a]}
          </button>
        ))}
      </div>
      <ul className={styles.promptList}>{shown.map(templateCard)}</ul>
      {usable.length > shown.length && (
        <button type="button" className={`${styles.button} ${styles.showMore}`} onClick={() => setShowAll(true)}>
          {format(strings.showAllTemplates, { count: usable.length })}
        </button>
      )}
      {premiumOnly.length > 0 && (
        <details className={styles.premiumFold}>
          <summary>{format(strings.premiumTemplates, { count: premiumOnly.length })}</summary>
          <ul className={styles.promptList}>{premiumOnly.map(templateCard)}</ul>
        </details>
      )}
    </section>
  );
}
