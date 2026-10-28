import * as React from 'react';

import { SUPPORTED_LANGS } from '../../core/i18n/locale';
import { passportStamps } from '../../core/progress/achievements';
import { updateProfile } from '../../core/progress/state';
import { formatNumber } from '../format';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { rankProgress } from '../theme/types';
import { RankEmblem, Ship } from './Art';

export function Header(props: { onOpenSettings: () => void; onOpenHelp: () => void }): React.ReactElement {
  const { content, player, lang, strings, theme, t, update, navigate, showDrafts } = useGame();
  const rank = rankProgress(theme, player.xp);
  const stamps = passportStamps(content, player, { showDrafts }).length;
  const onboarded = player.profile.onboarded;
  const license = player.profile.license;
  const versionLabel = license === 'premium' ? strings.versionPremium : license === 'basic' ? strings.versionBasic : strings.versionUnknown;

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => navigate({ name: 'map' })}>
        <span className={styles.brandShipWrap}>
          <Ship className={styles.brandShip} />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>{t(theme.terms.appTitle)}</span>
        </span>
      </button>

      {onboarded && (
        <div
          className={styles.status}
          title={rank.next ? format(strings.toNextRank, { xp: formatNumber(lang, rank.xpToNext), xpName: t(theme.terms.xp), rank: t(rank.next) }) : strings.topRank}
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
            <span className={styles.versionPillLabel}>{strings.yourVersion}</span>
            <span>{versionLabel}</span>
          </button>
        </div>
      )}

      <nav className={styles.headerActions} aria-label={strings.settings}>
        {onboarded && (
          <button type="button" className={styles.headerButton} onClick={() => navigate({ name: 'passport' })}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="11" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 17 h6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className={styles.hidePhone}>{t(theme.terms.passport)}</span>
            <span className={styles.headerCount}>{stamps}</span>
          </button>
        )}
        {onboarded && (content.prompts || []).length > 0 && (
          <button type="button" className={styles.headerButton} onClick={() => navigate({ name: 'cheatsheet' })} aria-label={strings.cheatsheet}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M14 3v4h4M10 12h5M10 16h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className={styles.hidePhone}>{strings.cheatsheet}</span>
          </button>
        )}
        <button type="button" className={styles.headerButton} onClick={props.onOpenHelp}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9.5 9.5 a2.5 2.5 0 1 1 3.5 2.3 c-0.7 0.3 -1 0.8 -1 1.5 v0.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1.1" fill="currentColor" />
          </svg>
          <span>{strings.help}</span>
        </button>
        {/* Before onboarding the language is chosen here; afterwards it lives in the settings. */}
        {!onboarded && (
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
        )}
        <button type="button" className={styles.headerButton} onClick={props.onOpenSettings} aria-label={strings.settings} title={strings.settings}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.6 4.9-.1-1.4 2-1.6-2-3.4-2.4.9a7.8 7.8 0 0 0-2.4-1.4L15.3 4h-3.9l-.4 2.5c-.9.3-1.7.8-2.4 1.4l-2.4-.9-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-.9c.7.6 1.5 1.1 2.4 1.4l.4 2.5h3.9l.4-2.5c.9-.3 1.7-.8 2.4-1.4l2.4.9 2-3.4-2-1.6c.1-.4.1-.9.1-1.4Z"
            />
          </svg>
        </button>
      </nav>
    </header>
  );
}
