import * as React from 'react';

import { findIsland, moduleLicense, modulesOfIsland, sortedIslands } from '../../core/content/bundle';
import { examFor, examOpen, examPassed } from '../../core/progress/exam';
import { moduleStatus } from '../../core/progress/state';
import { BlockKindIcon, blockKindNames } from '../blockKinds';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import { islandMinutes, islandProgress, isModulePreview, isPreview } from '../progressHelpers';
import styles from '../styles.module.scss';
import { TermTip } from './Legend';
import { copyText, CopyState } from '../copilot';
import { linkTo } from '../links';
import { skyMood } from '../sky';
import { LockIcon } from './Art';
import { Guide } from './Guide';
import { LicenseChip } from './LicenseChip';
import { IslandFog, mixColor, PosterIsland } from './PosterArt';
import { UseCaseCards } from './UseCaseCards';

export function IslandView(props: { islandId: string }): React.ReactElement {
  const game = useGame();
  const { content, player, strings, t, navigate, showDrafts } = game;
  const island = findIsland(content, props.islandId);
  if (!island) return <p>{props.islandId}</p>;

  const modules = modulesOfIsland(content, island.id, { showDrafts });
  const actionLabel = { new: strings.go, inProgress: strings.resumeShort, completed: strings.repeat };
  const preview = isPreview(game, island);
  const exam = examFor(content, island.id);
  const examIsPassed = examPassed(player, island.id);
  const examIsOpen = examOpen(content, player, island.id, { showDrafts });
  const progress = islandProgress(game, island.id);
  const done = progress.total > 0 && progress.completed === progress.total;
  const number = sortedIslands(content).indexOf(island) + 1;
  // The first open stage gets the attention; done ones carry a stamp.
  // A stage of the compass course goes first, the same one the start screen suggests.
  const open = modules.filter((m) => moduleStatus(player, m) !== 'completed' && !isModulePreview(game, m));
  const firstOpen = open.filter((m) => moduleStatus(player, m) === 'inProgress')[0] || open.filter((m) => !!m.core)[0] || open[0];
  // Touch screens cannot hover, so there the preview of a ticket opens with a tap.
  const [peek, setPeek] = React.useState<string | undefined>(undefined);
  const [linkState, setLinkState] = React.useState<CopyState>('idle');
  // The band over the island shares the light of the deck: evening glow at dusk, moon and stars at night.
  const mood = skyMood(new Date());
  const night = mood.phase === 'night';
  const tint = night ? '#0d1b33' : mood.phase === 'dusk' ? '#6e2a4c' : '#1a2940';
  const tintShare = night ? 0.72 : 0.5;

  return (
    <section className={styles.islandPage} style={{ ['--od-island' as string]: island.color } as React.CSSProperties}>
      <header
        className={styles.islandBand}
        style={
          {
            ['--od-sky' as string]: mixColor(island.color, tint, tintShare),
            ['--od-sky-low' as string]: mixColor(island.color, tint, tintShare - 0.3)
          } as React.CSSProperties
        }
      >
        <button type="button" className={styles.islandBack} onClick={() => navigate({ name: 'map' })}>
          ← {strings.backToDeck}
        </button>
        <button type="button" className={styles.islandShare} onClick={() => copyText(linkTo('insel', island.id), undefined, setLinkState)} title={strings.shareLinkHint}>
          {linkState === 'copied' ? `✓ ${strings.shareLinkCopied}` : `🔗 ${strings.shareLink}`}
        </button>
        <svg className={styles.islandBandArt} viewBox="-180 -190 360 230" aria-hidden="true">
          <g className={styles.islandBandRays} opacity={night ? 0.35 : 1}>
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M0 -60 L-14 -230 L14 -230 Z" fill="#fbf6e8" opacity="0.13" transform={`rotate(${i * 30} 0 -60)`} />
            ))}
          </g>
          {night ? (
            <g>
              <mask id="od-band-moon">
                <circle cx="0" cy="-60" r="70" fill="#fff" />
                <circle cx="30" cy="-80" r="62" fill="#000" />
              </mask>
              <circle cx="0" cy="-60" r="98" fill="#f4ecd2" opacity="0.12" />
              <circle cx="0" cy="-60" r="70" fill="#f4ecd2" mask="url(#od-band-moon)" />
              {[
                [-150, -160],
                [-120, -100],
                [-60, -175],
                [70, -170],
                [130, -130],
                [160, -60],
                [-165, -40]
              ].map(([x, y], i) => (
                <circle key={i} className={styles.deckStar} cx={x} cy={y} r={2 + (i % 3) * 0.6} fill="#fdf6dc" style={{ animationDelay: `${i * 0.45}s` }} />
              ))}
            </g>
          ) : (
            <>
              <circle cx="0" cy="-60" r="98" fill={mood.phase === 'day' ? '#f2b13a' : mood.sun} />
              <circle cx="0" cy="-60" r="80" fill="none" stroke="#fbf6e8" strokeWidth="3" opacity="0.35" />
            </>
          )}
          <PosterIsland landmark={island.landmark} color={island.color} flag={done} />
          {preview && <IslandFog />}
        </svg>
        <div className={styles.islandBandText}>
          <p className={styles.islandBandEyebrow}>
            {format(strings.islandNumber, { n: number })} · {t(island.tool)}
          </p>
          <h1 className={styles.islandBandTitle}>{t(island.name)}</h1>
          <p>{t(island.summary)}</p>
          <div className={styles.islandBandFacts}>
            <LicenseChip license={island.license} />
            {modules.length > 0 && (
              <span className={styles.islandBandProgress}>
                <span className={styles.islandBandDots} aria-hidden="true">
                  {modules.map((m) => (
                    <i key={m.id} className={moduleStatus(player, m) === 'completed' ? styles.dotDone : moduleStatus(player, m) === 'inProgress' ? styles.dotHalf : undefined} />
                  ))}
                </span>
                {format(strings.deckStagesDone, { done: progress.completed, total: progress.total })} · {format(strings.islandMinutes, { minutes: islandMinutes(game, island.id) })}
              </span>
            )}
          </div>
        </div>
        <svg className={styles.islandBandSea} viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 10 Q25 2 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 V24 H0 Z" fill="#1f5f8b" />
          <path d="M0 16 Q25 9 50 16 T100 16 T150 16 T200 16 T250 16 T300 16 T350 16 T400 16" fill="none" stroke="#fbf6e8" strokeWidth="1.6" opacity="0.5" />
        </svg>
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
              const locked = isModulePreview(game, m);
              const ticketClass = locked
                ? `${styles.ticket} ${styles.ticketLocked}`
                : isDone
                  ? `${styles.ticket} ${styles.ticketDone}`
                  : m === firstOpen
                    ? `${styles.ticket} ${styles.ticketNext}`
                    : styles.ticket;
              return (
                <li key={m.id} className={ticketClass}>
                  <div className={styles.ticketMain}>
                    <div className={peek === m.id ? `${styles.ticketPeek} ${styles.ticketPeekOpen}` : styles.ticketPeek}>
                      <p className={styles.ticketPeekTitle}>{strings.ticketLearn}</p>
                      <ul>
                        {m.blocks
                          .filter((b) => b.type === 'briefing' || b.type === 'prompt' || b.type === 'mission')
                          .slice(0, 4)
                          .map((b) => (
                            <li key={b.id}>
                              <BlockKindIcon type={b.type} />
                              {'title' in b ? t(b.title) : ''}
                            </li>
                          ))}
                      </ul>
                    </div>
                    <p className={styles.ticketEyebrow}>
                      {format(strings.stageNumber, { n: index + 1 })} {m.status === 'draft' && game.editor && <span className={styles.chipDraft}>{strings.draft}</span>}
                      {m.core && (
                        <span className={styles.chipCompass}>
                          ✧ {strings.compassBadge} <TermTip term="compass" />
                        </span>
                      )}
                    </p>
                    <h3 className={styles.ticketTitle}>{t(m.title)}</h3>
                    <p className={styles.ticketSummary}>{t(m.summary)}</p>
                    <ul className={styles.ticketKinds} aria-label={strings.ticketContains}>
                      {m.blocks
                        .map((b) => b.type)
                        .filter((type, i, all) => all.indexOf(type) === i)
                        .map((type) => (
                          <li key={type}>
                            <BlockKindIcon type={type} />
                            {blockKindNames(strings, type).short}
                          </li>
                        ))}
                    </ul>
                    <p className={styles.ticketMeta}>
                      <button type="button" className={styles.ticketPeekToggle} aria-expanded={peek === m.id} onClick={() => setPeek(peek === m.id ? undefined : m.id)}>
                        {strings.ticketLearnToggle}
                      </button>
                      <span>{format(strings.aboutMinutes, { minutes: m.estimatedMinutes })}</span>
                      {status === 'inProgress' && <span>{strings.statusInProgress}</span>}
                      {m.license && m.license !== island.license && <LicenseChip license={moduleLicense(content, m)} />}
                    </p>
                  </div>
                  <div className={styles.ticketStub}>
                    {locked ? (
                      <span className={styles.ticketLock}>
                        <LockIcon /> {strings.lockedStage}
                      </span>
                    ) : isDone ? (
                      <span className={styles.ticketStamp}>{strings.statusCompleted}</span>
                    ) : (
                      <span className={styles.ticketStubLabel}>{strings.boarding}</span>
                    )}
                    {!locked && (
                      <button
                        type="button"
                        className={isDone ? styles.ticketAgain : styles.ticketGo}
                        onClick={() => navigate({ name: 'module', moduleId: m.id })}
                        aria-label={`${actionLabel[status]}: ${t(m.title)}`}
                      >
                        {actionLabel[status]}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            {exam && (
              <li className={`${styles.ticket} ${styles.ticketExam} ${examIsPassed ? styles.ticketDone : examIsOpen && !preview ? styles.ticketNext : ''}`}>
                <div className={styles.ticketMain}>
                  <p className={styles.ticketEyebrow}>
                    🏁 {strings.examTicketTitle} <TermTip term="exam" />
                  </p>
                  <h3 className={styles.ticketTitle}>{format(strings.examTitle, { island: t(island.name) })}</h3>
                  <p className={styles.ticketSummary}>{strings.examTicketSummary}</p>
                  <p className={styles.ticketMeta}>
                    <span>{format(strings.examQuestionCount, { n: exam.questions.length })}</span>
                  </p>
                </div>
                <div className={styles.ticketStub}>
                  {examIsPassed ? (
                    <span className={styles.ticketStamp}>{strings.examTicketPassed}</span>
                  ) : examIsOpen && !preview ? (
                    <span className={styles.ticketStubLabel}>{strings.boarding}</span>
                  ) : (
                    <span className={styles.ticketLock}>
                      <LockIcon /> {preview ? strings.lockedStage : strings.examTicketLocked}
                    </span>
                  )}
                  {(examIsPassed || (examIsOpen && !preview)) && (
                    <button type="button" className={examIsPassed ? styles.ticketAgain : styles.ticketGo} onClick={() => navigate({ name: 'exam', islandId: island.id })}>
                      {examIsPassed ? strings.repeat : strings.examGo}
                    </button>
                  )}
                </div>
              </li>
            )}
          </ol>
        )}

        {island.home && <UseCaseCards />}
      </div>
    </section>
  );
}
