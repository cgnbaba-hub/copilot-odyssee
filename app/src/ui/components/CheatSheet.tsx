import * as React from 'react';

import { findModule } from '../../core/content/bundle';
import { PromptTemplate } from '../../core/content/types';
import { isPromptSaved, toggleSavedPrompt } from '../../core/progress/state';
import { useGame } from '../GameContext';
import { playerArea, templatesFor } from '../progressHelpers';
import styles from '../styles.module.scss';
import { Guide } from './Guide';
import { PromptCard } from './PromptCard';
import { SheetTabs } from './SheetTabs';

const ALL_AREAS = '';

/**
 * Prompts to copy into Copilot: saved templates, the player's own prompts
 * from their use case cards, and the templates for their field of work.
 */
export function CheatSheet(): React.ReactElement {
  const game = useGame();
  const { content, player, strings, t, update, navigate, pinboard } = game;
  const area = playerArea(game);
  const [filter, setFilter] = React.useState(area ? area.id : ALL_AREAS);
  const saved = (content.prompts || []).filter((p) => isPromptSaved(player, p.id));
  const own = player.useCases.filter((card) => card.prompt.trim().length > 0).reverse();

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
      <ul className={styles.promptList}>{templatesFor(game, filter || undefined).map(templateCard)}</ul>
    </section>
  );
}
