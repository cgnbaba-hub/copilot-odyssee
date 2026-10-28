import * as React from 'react';

import { findIsland, moduleLicense, modulesOfIsland } from '../../core/content/bundle';
import { moduleStatus } from '../../core/progress/state';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { isPreview } from '../progressHelpers';
import styles from '../styles.module.scss';
import { CheckIcon, IslandArt } from './Art';
import { Guide } from './Guide';
import { LicenseChip } from './LicenseChip';
import { UseCaseCards } from './UseCaseCards';

export function IslandView(props: { islandId: string }): React.ReactElement {
  const game = useGame();
  const { content, player, strings, t, navigate, showDrafts } = game;
  const island = findIsland(content, props.islandId);
  if (!island) return <p>{props.islandId}</p>;

  const modules = modulesOfIsland(content, island.id, { showDrafts });
  const statusLabel = { new: strings.statusNew, inProgress: strings.statusInProgress, completed: strings.statusCompleted };
  const actionLabel = { new: strings.start, inProgress: strings.resume, completed: strings.repeat };
  const preview = isPreview(game, island);

  return (
    <section className={styles.panel} style={{ ['--od-island' as string]: island.color } as React.CSSProperties}>
      <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToOverview}
      </button>

      <div className={styles.islandHero}>
        <IslandArt island={island} className={styles.islandHeroArt} />
        <div className={styles.islandHeroText}>
          <p className={styles.eyebrowLight}>{t(island.tool)}</p>
          <h1 className={styles.islandHeroTitle}>{t(island.name)}</h1>
          <p>{t(island.summary)}</p>
          <LicenseChip license={island.license} />
        </div>
      </div>

      <Guide text={modules.length === 0 ? strings.islandGuideEmpty : preview ? strings.islandGuidePreview : strings.islandGuide} />

      <blockquote className={styles.motif}>{t(island.motif)}</blockquote>

      <h2 className={styles.sectionTitle}>{strings.modules}</h2>
      {modules.length === 0 ? (
        <p className={styles.muted}>{strings.noModules}</p>
      ) : (
        <ol className={styles.stageRoute}>
          {modules.map((m, index) => {
            const status = moduleStatus(player, m);
            return (
              <li key={m.id} className={`${styles.stage} ${status === 'completed' ? styles.stageCompleted : status === 'inProgress' ? styles.stageActive : ''}`}>
                <span className={styles.stageNode} aria-hidden="true">
                  {status === 'completed' ? <CheckIcon /> : index + 1}
                </span>
                <div className={styles.stageCard}>
                  <div className={styles.stageText}>
                    <h3>
                      {t(m.title)} {m.status === 'draft' && <span className={styles.chipDraft}>{strings.draft}</span>}
                    </h3>
                    <p>{t(m.summary)}</p>
                    <p className={styles.stageMeta}>
                      <span>{statusLabel[status]}</span>
                      <span>{format(strings.aboutMinutes, { minutes: m.estimatedMinutes })}</span>
                      {m.license && m.license !== island.license && <LicenseChip license={moduleLicense(content, m)} />}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={status === 'completed' ? styles.button : styles.buttonPrimary}
                    onClick={() => navigate({ name: 'module', moduleId: m.id })}
                  >
                    {actionLabel[status]}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {island.home && <UseCaseCards />}
    </section>
  );
}
