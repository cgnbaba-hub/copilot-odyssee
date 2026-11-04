import * as React from 'react';

import { Game, useGame } from '../GameContext';
import { format, Strings } from '../i18n/strings';
import { compassProgress } from '../progressHelpers';
import styles from '../styles.module.scss';
import { InfoTip } from './InfoTip';

/**
 * The words of the journey in one place: shown at the end of the onboarding,
 * in the help and in the passport. The info buttons use the same texts, so
 * the explanations never drift apart.
 */
export type Term = 'miles' | 'rank' | 'stage' | 'island' | 'exam' | 'stamp' | 'souvenir' | 'home' | 'compass';

export const TERMS: Term[] = ['miles', 'rank', 'stage', 'island', 'exam', 'stamp', 'souvenir', 'home', 'compass'];

const ICONS: Record<Term, string> = {
  miles: '⚓',
  rank: '▲',
  stage: '➤',
  island: '⛰',
  exam: '✎',
  stamp: '✪',
  souvenir: '★',
  home: '⌂',
  compass: '✧'
};

const NAMES: Record<Term, keyof Strings> = {
  miles: 'termMiles',
  rank: 'termRank',
  stage: 'termStage',
  island: 'termIsland',
  exam: 'termExam',
  stamp: 'termStamp',
  souvenir: 'termSouvenir',
  home: 'termHome',
  compass: 'termCompass'
};

const TEXTS: Record<Term, keyof Strings> = {
  miles: 'termMilesText',
  rank: 'termRankText',
  stage: 'termStageText',
  island: 'termIslandText',
  exam: 'termExamText',
  stamp: 'termStampText',
  souvenir: 'termSouvenirText',
  home: 'termHomeText',
  compass: 'termCompassText'
};

export function termName(strings: Strings, term: Term): string {
  return strings[NAMES[term]] as string;
}

export function termText(game: Game, term: Term): string {
  const text = game.strings[TEXTS[term]] as string;
  if (term !== 'compass') return text;
  const compass = compassProgress(game);
  return format(text, { count: compass.total, minutes: compass.minutes });
}

export function Legend(props: { terms?: Term[]; compact?: boolean }): React.ReactElement {
  const game = useGame();
  const { strings } = game;
  // The compass course only shows up when the content has one.
  const terms = (props.terms || TERMS).filter((term) => term !== 'compass' || compassProgress(game).total > 0);
  return (
    <dl className={props.compact ? `${styles.legend} ${styles.legendCompact}` : styles.legend}>
      {terms.map((term) => (
        <div key={term} className={styles.legendItem}>
          <dt>
            <span className={styles.legendIcon} aria-hidden="true">
              {ICONS[term]}
            </span>
            {termName(strings, term)}
          </dt>
          <dd>{termText(game, term)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** An info button for one term, with the same text as the legend. */
export function TermTip(props: { term: Term; light?: boolean; align?: 'left' | 'right' }): React.ReactElement {
  const game = useGame();
  return <InfoTip text={termText(game, props.term)} label={format(game.strings.infoAbout, { term: termName(game.strings, props.term) })} light={props.light} align={props.align} />;
}
