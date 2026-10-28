import * as React from 'react';

import { findIsland, modulesOfIsland } from '../../core/content/bundle';
import { moduleStatus } from '../../core/progress/state';
import { useGame } from '../GameContext';
import { isPreview } from '../progressHelpers';
import styles from '../styles.module.scss';
import { UseCaseCards } from './UseCaseCards';

export function IslandView(props: { islandId: string }): React.ReactElement {
  const game = useGame();
  const { content, player, strings, theme, t, navigate, showDrafts } = game;
  const island = findIsland(content, props.islandId);
  if (!island) return <p>{props.islandId}</p>;

  const modules = modulesOfIsland(content, island.id, { showDrafts });
  const statusLabel = { new: strings.statusNew, inProgress: strings.statusInProgress, completed: strings.statusCompleted };
  const actionLabel = { new: strings.start, inProgress: strings.resume, completed: strings.repeat };

  return (
    <section className={styles.panel} style={{ ['--od-island' as string]: island.color } as React.CSSProperties}>
      <button type="button" className={styles.linkButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToMap}
      </button>

      <div className={styles.islandHeader}>
        <span className={styles.islandShapeLarge} aria-hidden="true" />
        <div>
          <p className={styles.eyebrow}>
            {t(island.tool)} · {island.license === 'premium' ? strings.premiumOnly : strings.forEveryone}
          </p>
          <h1 className={styles.panelTitle}>{t(island.name)}</h1>
          <p>{t(island.summary)}</p>
        </div>
      </div>

      <blockquote className={styles.motif}>{t(island.motif)}</blockquote>

      {isPreview(game, island) && (
        <p className={styles.notice}>
          <span className={styles.tagPreview}>{t(theme.terms.preview)}</span> {strings.previewNote}
        </p>
      )}

      <h2 className={styles.sectionTitle}>{strings.modules}</h2>
      {modules.length === 0 ? (
        <p className={styles.muted}>{strings.noModules}</p>
      ) : (
        <ol className={styles.moduleList}>
          {modules.map((m) => {
            const status = moduleStatus(player, m);
            return (
              <li key={m.id} className={styles.moduleCard}>
                <div>
                  <h3>
                    {t(m.title)} {m.status === 'draft' && <span className={styles.tagDraft}>{strings.draft}</span>}
                  </h3>
                  <p>{t(m.summary)}</p>
                  <p className={styles.muted}>
                    {statusLabel[status]} · {m.estimatedMinutes} {strings.minutes}
                  </p>
                </div>
                <button type="button" className={status === 'completed' ? styles.button : styles.buttonPrimary} onClick={() => navigate({ name: 'module', moduleId: m.id })}>
                  {actionLabel[status]}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {island.home && <UseCaseCards />}
    </section>
  );
}
