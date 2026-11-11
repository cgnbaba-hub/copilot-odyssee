import * as React from 'react';

import { weekKey } from '../../core/challenge/challenge';
import { CrewRow, MIN_TEAM, RegattaChoice, RegattaEntry, RegattaPeriod, reportOf, standing } from '../../core/regatta/regatta';
import { PlayerState, updateProfile } from '../../core/progress/state';
import { formatNumber } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

const CHOICES: RegattaChoice[] = ['team', 'name', 'off'];

/** The three ways to take part, as a radio group; used when joining and to change one's mind. */
function ChoiceList(props: { value?: RegattaChoice; busy: boolean; onChoose: (choice: RegattaChoice) => void }): React.ReactElement {
  const { strings } = useGame();
  const text: Record<RegattaChoice, [string, string]> = {
    team: [strings.regattaChoiceTeam, strings.regattaChoiceTeamHint],
    name: [strings.regattaChoiceName, strings.regattaChoiceNameHint],
    off: [strings.regattaChoiceOff, strings.regattaChoiceOffHint]
  };
  return (
    <div className={`${styles.choiceList} ${styles.regattaChoices}`} role="radiogroup" aria-label={strings.regattaJoinTitle}>
      {CHOICES.map((choice) => (
        <button
          type="button"
          role="radio"
          aria-checked={props.value === choice}
          key={choice}
          disabled={props.busy}
          className={`${styles.choice} ${props.value === choice ? styles.choiceSelected : ''}`}
          onClick={() => props.onChoose(choice)}
        >
          <span className={styles.radioDot} aria-hidden="true" />
          <span className={styles.choiceText}>
            <strong>{text[choice][0]}</strong>
            <span className={styles.choiceHint}>{text[choice][1]}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * The regatta: how the fields of work compare, and the fastest crews. Only
 * people who chose to take part are counted; the choice is made here.
 */
export function Regatta(): React.ReactElement {
  const game = useGame();
  const { strings, player, lang, t, content, regatta, update } = game;
  const [entries, setEntries] = React.useState<RegattaEntry[] | undefined>(undefined);
  const [failed, setFailed] = React.useState(false);
  const [saveFailed, setSaveFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [period, setPeriod] = React.useState<RegattaPeriod>('week');
  const alive = React.useRef(true);
  React.useEffect(
    () => () => {
      alive.current = false;
    },
    []
  );

  const week = weekKey(new Date());
  const choice = player.profile.regatta;
  const unit = strings.regattaUnit;

  /** Brings the own line up to date, then reads everyone's. */
  const refresh = async (state: PlayerState, changed: boolean): Promise<void> => {
    if (!regatta) return;
    const report = reportOf(content, state, { showDrafts: game.showDrafts }, week);
    try {
      // Leaving is only sent when the person just chose it; otherwise there is no line to remove.
      if (report || changed) await regatta.push(report);
      if (alive.current) setSaveFailed(false);
    } catch {
      if (alive.current) setSaveFailed(true);
    }
    try {
      const loaded = await regatta.source.load();
      if (!alive.current) return;
      setEntries(loaded);
      setFailed(false);
    } catch {
      if (alive.current) setFailed(true);
    }
  };

  React.useEffect(() => {
    refresh(player, false).catch(() => undefined);
    // Loaded once when the view opens; later changes go through choose().
  }, []);

  const choose = (next: RegattaChoice): void => {
    if (next === choice || busy) return;
    setBusy(true);
    const state = update((s) => updateProfile(s, { regatta: next }));
    refresh(state, true)
      .catch(() => undefined)
      .then(() => {
        if (alive.current) setBusy(false);
      })
      .catch(() => undefined);
  };

  const areaName = (id: string): string => {
    const area = (content.areas || []).filter((a) => a.id === id)[0];
    return area ? t(area.name) : id;
  };
  const miles = (value: number): string => `${formatNumber(lang, value)} ${unit}`;

  const result = entries ? standing(entries, period, week) : undefined;
  const myTeam = result ? result.teams.filter((team) => team.mine)[0] : undefined;
  const best = result && result.teams.length > 0 ? Math.max(1, result.teams[0].average) : 1;
  const listed = result ? result.crews : [];
  // The own line is added below the list when it is further back.
  const meBelow = result && result.me && result.me.score > 0 && !listed.some((c) => c.mine) ? result.me : undefined;

  const crewLine = (crew: CrewRow, key: string): React.ReactElement => (
    <li key={key} className={crew.mine ? `${styles.regattaCrew} ${styles.regattaMine}` : styles.regattaCrew}>
      <span className={crew.rank <= 3 ? `${styles.regattaRank} ${styles.regattaRankTop}` : styles.regattaRank} aria-label={format(strings.regattaPlace, { rank: crew.rank })}>
        {crew.rank}
      </span>
      <span className={styles.regattaCrewName}>
        <strong>
          {crew.mine ? (crew.name || game.userName ? `${strings.regattaYou} · ${crew.name || game.userName}` : strings.regattaYou) : crew.name || strings.regattaAnonymous}
        </strong>
        {crew.area && <span className={styles.muted}>{areaName(crew.area)}</span>}
      </span>
      <span className={styles.regattaScore}>{miles(crew.score)}</span>
    </li>
  );

  return (
    <section className={`${styles.panel} ${styles.regatta}`}>
      <h1 className={styles.pageTitle}>
        <span aria-hidden="true">⛵</span> {strings.regattaTitle}
      </h1>
      <p className={styles.muted}>{strings.regattaIntro}</p>
      {regatta && regatta.source.sample && <p className={styles.pinDemo}>{strings.regattaDemo}</p>}

      {choice === undefined && (
        <div className={styles.regattaJoin}>
          <h2 className={styles.regattaJoinTitle}>{strings.regattaJoinTitle}</h2>
          <p>{strings.regattaJoinText}</p>
          <ChoiceList busy={busy} onChoose={choose} />
          <p className={styles.muted}>{strings.regattaPrivacy}</p>
        </div>
      )}
      {saveFailed && (
        <p className={styles.regattaError} role="alert">
          {strings.regattaSaveFailed}
        </p>
      )}

      <div className={`${styles.viewSwitch} ${styles.regattaPeriod}`} role="group" aria-label={strings.regattaPeriodLabel}>
        <button type="button" aria-pressed={period === 'week'} className={period === 'week' ? styles.viewSwitchActive : undefined} onClick={() => setPeriod('week')}>
          {strings.regattaWeek}
        </button>
        <button type="button" aria-pressed={period === 'total'} className={period === 'total' ? styles.viewSwitchActive : undefined} onClick={() => setPeriod('total')}>
          {strings.regattaTotal}
        </button>
      </div>
      {period === 'week' && <p className={`${styles.muted} ${styles.regattaNote}`}>{strings.regattaWeekNote}</p>}

      {failed && !result && (
        <p className={styles.regattaError} role="alert">
          {strings.regattaLoadFailed}{' '}
          <button type="button" className={styles.button} onClick={() => refresh(player, false).catch(() => undefined)}>
            {strings.pinboardRetry}
          </button>
        </p>
      )}
      {!result && !failed && <p className={styles.muted}>{strings.regattaLoading}</p>}

      {result && (
        <>
          {result.me && (choice === 'team' || choice === 'name') && (
            <div className={styles.regattaMe}>
              <p className={styles.regattaMeLabel}>{strings.regattaMyTitle}</p>
              {result.me.score > 0 ? (
                <p className={styles.regattaMeRank}>
                  <strong>{format(strings.regattaMyRank, { rank: result.me.rank })}</strong>
                  <span>
                    {format(strings.regattaOfCount, { count: result.participants })} · {miles(result.me.score)}
                  </span>
                </p>
              ) : (
                <p>{period === 'week' ? strings.regattaMyNoneWeek : strings.regattaMyNoneTotal}</p>
              )}
              <p className={styles.regattaMeTeam}>
                {myTeam
                  ? format(strings.regattaMyTeam, { area: areaName(myTeam.area), rank: myTeam.rank, count: result.teams.length })
                  : result.myTeamHidden
                    ? format(strings.regattaMyTeamHidden, { min: MIN_TEAM })
                    : strings.regattaMyNoArea}
              </p>
            </div>
          )}

          <h2 className={styles.sectionTitle}>{strings.regattaTeamsTitle}</h2>
          <p className={styles.muted}>{strings.regattaTeamsHint}</p>
          {result.teams.length === 0 ? (
            <p>{format(strings.regattaTeamsEmpty, { min: MIN_TEAM })}</p>
          ) : (
            <ol className={styles.regattaTeams}>
              {result.teams.map((team) => (
                <li key={team.area} className={team.mine ? `${styles.regattaTeam} ${styles.regattaMine}` : styles.regattaTeam}>
                  <span
                    className={team.rank <= 3 ? `${styles.regattaRank} ${styles.regattaRankTop}` : styles.regattaRank}
                    aria-label={format(strings.regattaPlace, { rank: team.rank })}
                  >
                    {team.rank}
                  </span>
                  <span className={styles.regattaTeamName}>
                    <strong>{areaName(team.area)}</strong>
                    {team.mine && <span className={styles.regattaYours}>{strings.regattaYourTeam}</span>}
                  </span>
                  <span className={styles.regattaScore}>{miles(team.average)}</span>
                  <span className={styles.regattaTrack} aria-hidden="true">
                    <span className={styles.regattaFill} style={{ width: `${Math.max(2, Math.round((team.average / best) * 100))}%` }} />
                  </span>
                  <span className={`${styles.muted} ${styles.regattaTeamMeta}`}>
                    {format(strings.regattaTeamCrews, { count: team.crews })} · {format(strings.regattaTeamCompass, { share: team.compassShare })}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {result.smallTeams > 0 && (
            <p className={`${styles.muted} ${styles.regattaNote}`}>
              {result.smallTeams === 1 ? format(strings.regattaSmallTeam, { min: MIN_TEAM }) : format(strings.regattaSmallTeams, { count: result.smallTeams, min: MIN_TEAM })}
            </p>
          )}

          <h2 className={styles.sectionTitle}>{strings.regattaCrewsTitle}</h2>
          <p className={styles.muted}>{strings.regattaCrewsHint}</p>
          {listed.length === 0 ? (
            <p>{period === 'week' ? strings.regattaCrewsEmptyWeek : strings.regattaCrewsEmptyTotal}</p>
          ) : (
            <ol className={styles.regattaCrews}>
              {listed.map((crew, index) => crewLine(crew, `c${index}`))}
              {meBelow && (
                <>
                  <li className={styles.regattaGap} aria-hidden="true">
                    …
                  </li>
                  {crewLine(meBelow, 'me')}
                </>
              )}
            </ol>
          )}
          <p className={`${styles.muted} ${styles.regattaNote}`}>
            {format(strings.regattaTogether, { count: formatNumber(lang, result.participants), miles: miles(result.totalScore) })}
          </p>
        </>
      )}

      {choice !== undefined && (
        <details className={styles.advanced}>
          <summary>{strings.regattaSettingsTitle}</summary>
          <ChoiceList value={choice} busy={busy} onChoose={choose} />
          <p className={styles.muted}>{strings.regattaPrivacy}</p>
        </details>
      )}
    </section>
  );
}
