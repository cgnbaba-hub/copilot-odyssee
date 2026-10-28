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

export function Header(props: { onOpenSettings: () => void }): React.ReactElement {
  const { content, player, lang, strings, theme, t, update, navigate, showDrafts } = useGame();
  const rank = rankProgress(theme, player.xp);
  const stamps = passportStamps(content, player, { showDrafts }).length;
  const onboarded = player.profile.onboarded;

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => navigate({ name: 'map' })}>
        <Ship className={styles.brandShip} />
        <span className={styles.brandText}>
          <span className={styles.brandTitle}>{t(theme.terms.appTitle)}</span>
          <span className={styles.brandTagline}>{t(theme.terms.tagline)}</span>
        </span>
      </button>

      {onboarded && (
        <div className={styles.status}>
          <RankEmblem index={rank.index} className={styles.statusEmblem} />
          <div className={styles.statusText}>
            <div className={styles.statusLine}>
              <strong>{t(rank.rank)}</strong>
              <span>
                {formatNumber(lang, player.xp)} {t(theme.terms.xp)}
              </span>
            </div>
            <div className={styles.statusBar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rank.percent}>
              <div className={styles.statusBarFill} style={{ width: `${rank.percent}%` }} />
            </div>
            <div className={styles.statusNext}>
              {rank.next
                ? format(strings.toNextRank, { xp: formatNumber(lang, rank.xpToNext), xpName: t(theme.terms.xp), rank: t(rank.next) })
                : strings.topRank}
            </div>
          </div>
        </div>
      )}

      <div className={styles.headerActions}>
        {onboarded && (
          <button type="button" className={styles.passportButton} onClick={() => navigate({ name: 'passport' })} title={strings.openPassport}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="11" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 17 h6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>{t(theme.terms.passport)}</span>
            <span className={styles.passportCount}>{stamps}</span>
          </button>
        )}
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
        <button type="button" className={styles.iconButton} onClick={props.onOpenSettings} aria-label={strings.settings} title={strings.settings}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.6 4.9-.1-1.4 2-1.6-2-3.4-2.4.9a7.8 7.8 0 0 0-2.4-1.4L15.3 4h-3.9l-.4 2.5c-.9.3-1.7.8-2.4 1.4l-2.4-.9-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2.8l-2 1.6 2 3.4 2.4-.9c.7.6 1.5 1.1 2.4 1.4l.4 2.5h3.9l.4-2.5c.9-.3 1.7-.8 2.4-1.4l2.4.9 2-3.4-2-1.6c.1-.4.1-.9.1-1.4Z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
