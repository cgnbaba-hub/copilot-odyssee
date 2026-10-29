import * as React from 'react';

import { SUPPORTED_LANGS } from '../../core/i18n/locale';
import { updateProfile } from '../../core/progress/state';
import { formatNumber } from '../format';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { rankProgress } from '../theme/types';
import { CompassRose, RankEmblem } from './Art';

export function Header(props: { onOpenSettings: () => void; onOpenHelp: () => void }): React.ReactElement {
  const { player, lang, strings, theme, t, update, navigate } = useGame();
  const rank = rankProgress(theme, player.xp);
  const onboarded = player.profile.onboarded;
  const license = player.profile.license;
  const versionLabel = license === 'premium' ? strings.versionPremium : license === 'basic' ? strings.versionBasic : strings.versionUnknown;
  // The short name keeps the header in one row; the tooltip and the settings give the full name.
  const versionShort = license === 'premium' ? strings.versionShortPremium : license === 'basic' ? strings.versionShortBasic : strings.versionUnknown;

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => navigate({ name: 'map' })}>
        <CompassRose className={styles.brandCompass} />
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>{t(theme.terms.appTitle)}</span>
        </span>
      </button>

      {onboarded && (
        <div
          className={styles.status}
          title={`${t(rank.rank)}: ${rank.next ? format(strings.toNextRank, { xp: formatNumber(lang, rank.xpToNext), xpName: t(theme.terms.xp), rank: t(rank.next) }) : strings.topRank}`}
        >
          <RankEmblem index={rank.index} className={styles.statusEmblem} />
          <div className={styles.statusText}>
            <div className={styles.statusLine}>
              <strong>{t(rank.rank)}</strong>
              <span>
                {formatNumber(lang, player.xp)} {t(theme.terms.xp)}
              </span>
            </div>
            <div className={styles.statusBar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rank.percent} aria-label={t(theme.terms.xp)}>
              <div className={styles.statusBarFill} style={{ width: `${rank.percent}%` }} />
            </div>
          </div>
          <button
            type="button"
            className={`${styles.versionPill} ${license === 'premium' ? styles.versionPillPremium : license === 'unknown' ? styles.versionPillUnknown : ''}`}
            onClick={props.onOpenSettings}
            title={`${strings.yourVersion}: ${versionLabel} (${strings.change})`}
          >
            <span className={styles.versionPillLabel}>{strings.yourCopilot}</span>
            <span>{versionShort}</span>
          </button>
        </div>
      )}

      {/* Before onboarding the menu at the bottom is hidden, so help and language are up here. */}
      {!onboarded && (
        <nav className={styles.headerActions} aria-label={strings.menu}>
          <button type="button" className={styles.headerButton} onClick={props.onOpenHelp}>
            {strings.help}
          </button>
          <div className={styles.langSwitch} role="group" aria-label={strings.language}>
            {SUPPORTED_LANGS.map((l) => (
              <button
                type="button"
                key={l}
                aria-pressed={l === lang}
                className={l === lang ? styles.langActive : undefined}
                onClick={() => update((s) => updateProfile(s, { lang: l }))}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
