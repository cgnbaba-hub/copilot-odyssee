import * as React from 'react';

import { findIsland, moduleLicense, modulesOfIsland, sortedIslands } from '../../core/content/bundle';
import { moduleStatus } from '../../core/progress/state';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { islandProgress, isPreview } from '../progressHelpers';
import styles from '../styles.module.scss';
import { Guide } from './Guide';
import { LicenseChip } from './LicenseChip';
import { mixColor, PosterIsland } from './PosterArt';
import { UseCaseCards } from './UseCaseCards';

export function IslandView(props: { islandId: string }): React.ReactElement {
  const game = useGame();
  const { content, player, strings, t, navigate, showDrafts } = game;
  const island = findIsland(content, props.islandId);
  if (!island) return <p>{props.islandId}</p>;

  const modules = modulesOfIsland(content, island.id, { showDrafts });
  const actionLabel = { new: strings.go, inProgress: strings.resumeShort, completed: strings.repeat };
  const preview = isPreview(game, island);
  const progress = islandProgress(game, island.id);
  const done = progress.total > 0 && progress.completed === progress.total;
  const number = sortedIslands(content).indexOf(island) + 1;
  // The first open stage gets the attention; done ones carry a stamp.
  const firstOpen = modules.filter((m) => moduleStatus(player, m) !== 'completed')[0];

  return (
    <section className={styles.islandPage} style={{ ['--od-island' as string]: island.color } as React.CSSProperties}>
      <header className={styles.islandBand} style={{ background: mixColor(island.color, '#1a2940', 0.45) }}>
        <button type="button" className={styles.islandBack} onClick={() => navigate({ name: 'map' })}>
          ← {strings.backToDeck}
        </button>
        <svg className={styles.islandBandArt} viewBox="-180 -190 360 230" aria-hidden="true">
          <circle cx="0" cy="-60" r="98" fill="#f2b13a" />
          <rect x="-180" y="0" width="360" height="40" fill="#1f5f8b" />
          <PosterIsland landmark={island.landmark} color={island.color} flag={done} />
        </svg>
        <div className={styles.islandBandText}>
          <p className={styles.islandBandEyebrow}>
            {format(strings.islandNumber, { n: number })} · {t(island.tool)}
          </p>
          <h1 className={styles.islandBandTitle}>{t(island.name)}</h1>
          <p>{t(island.summary)}</p>
          <LicenseChip license={island.license} />
        </div>
      </header>

      <div className={styles.islandBody}>
        <Guide text={modules.length === 0 ? strings.islandGuideEmpty : preview ? strings.islandGuidePreview : strings.islandGuide} />

        <blockquote className={styles.motif}>{t(island.motif)}</blockquote>

        <h2 className={styles.sectionTitle}>{strings.modules}</h2>
        {modules.length === 0 ? (
          <p className={styles.muted}>{strings.noModules}</p>
        ) : (
          <ol className={styles.tickets}>
            {modules.map((m, index) => {
              const status = moduleStatus(player, m);
              const isDone = status === 'completed';
              return (
                <li key={m.id} className={isDone ? `${styles.ticket} ${styles.ticketDone}` : m === firstOpen ? `${styles.ticket} ${styles.ticketNext}` : styles.ticket}>
                  <div className={styles.ticketMain}>
                    <p className={styles.ticketEyebrow}>
                      {format(strings.stageNumber, { n: index + 1 })} {m.status === 'draft' && <span className={styles.chipDraft}>{strings.draft}</span>}
                    </p>
                    <h3 className={styles.ticketTitle}>{t(m.title)}</h3>
                    <p className={styles.ticketSummary}>{t(m.summary)}</p>
                    <p className={styles.ticketMeta}>
                      <span>{format(strings.aboutMinutes, { minutes: m.estimatedMinutes })}</span>
                      {status === 'inProgress' && <span>{strings.statusInProgress}</span>}
                      {m.license && m.license !== island.license && <LicenseChip license={moduleLicense(content, m)} />}
                    </p>
                  </div>
                  <div className={styles.ticketStub}>
                    {isDone ? <span className={styles.ticketStamp}>{strings.statusCompleted}</span> : <span className={styles.ticketStubLabel}>{strings.boarding}</span>}
                    <button
                      type="button"
                      className={isDone ? styles.ticketAgain : styles.ticketGo}
                      onClick={() => navigate({ name: 'module', moduleId: m.id })}
                      aria-label={`${actionLabel[status]}: ${t(m.title)}`}
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
      </div>
    </section>
  );
}
