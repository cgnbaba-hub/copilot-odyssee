import * as React from 'react';

import { SUPPORTED_LANGS } from '../../core/i18n/locale';
import { levelProgress } from '../../core/progress/levels';
import { updateProfile } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { rankFor } from '../theme/types';

export function Header(props: { onOpenSettings: () => void }): React.ReactElement {
  const { player, lang, strings, theme, t, update, navigate } = useGame();
  const progress = levelProgress(player.xp);
  const percent = Math.round((progress.current / progress.required) * 100);

  return (
    <header className={styles.header}>
      <button type="button" className={styles.brand} onClick={() => navigate({ name: 'map' })}>
        <span className={styles.brandTitle}>{t(theme.terms.appTitle)}</span>
        <span className={styles.brandTagline}>{t(theme.terms.tagline)}</span>
      </button>

      <div className={styles.xpBox} aria-label={`${player.xp} ${t(theme.terms.xp)}`}>
        <div className={styles.xpLine}>
          <strong>{player.xp}</strong> {t(theme.terms.xp)}
          <span className={styles.xpRank}>
            {t(rankFor(theme, progress.level))} · {strings.level} {progress.level}
          </span>
        </div>
        <div className={styles.xpBar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <div className={styles.xpBarFill} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className={styles.headerActions}>
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
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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
