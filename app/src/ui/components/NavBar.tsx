import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** The fixed menu at the bottom: every button has a word, not only a symbol. */
export function NavBar(props: { onOpenHelp: () => void; onOpenSettings: () => void; active: 'journey' | 'cheatsheet' | 'passport' | 'help' | 'settings' }): React.ReactElement {
  const { content, strings, theme, t, navigate } = useGame();
  const item = (id: typeof props.active, label: string, icon: React.ReactElement, onClick: () => void, tour: string): React.ReactElement => (
    <button type="button" className={styles.navButton} aria-current={props.active === id ? 'page' : undefined} onClick={onClick} data-tour={tour}>
      {icon}
      <span>{label}</span>
    </button>
  );
  const svg = (children: React.ReactNode): React.ReactElement => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );

  return (
    <nav className={styles.navBar} aria-label={strings.menu}>
      {item(
        'journey',
        strings.navJourney,
        svg(
          <>
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M4.9 19.1l2.5-2.5M16.6 7.4l2.5-2.5" />
          </>
        ),
        () => navigate({ name: 'map' }),
        'nav-journey'
      )}
      {(content.prompts || []).length > 0 &&
        item(
          'cheatsheet',
          strings.cheatsheet,
          svg(
            <>
              <path d="M6 3h9l4 4v14H6z" />
              <path d="M15 3v4h4M9 11h7M9 15h7M9 19h4" />
            </>
          ),
          () => navigate({ name: 'cheatsheet' }),
          'nav-cheatsheet'
        )}
      {item(
        'passport',
        t(theme.terms.passport),
        svg(
          <>
            <rect x="5" y="2.5" width="14" height="19" rx="2" />
            <circle cx="12" cy="10" r="3.5" />
            <path d="M8.5 10h7M12 6.5c1.4 1.8 1.4 5.2 0 7M9 17h6" />
          </>
        ),
        () => navigate({ name: 'passport' }),
        'nav-passport'
      )}
      {item(
        'help',
        strings.help,
        svg(
          <>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M5.6 18.4l3.6-3.6M14.8 9.2l3.6-3.6" strokeWidth="3" />
          </>
        ),
        props.onOpenHelp,
        'nav-help'
      )}
      {item(
        'settings',
        strings.settings,
        svg(
          <>
            <path d="M10.3 2.5h3.4l.5 2.6 1.6.9 2.5-.9 1.7 2.9-2 1.8v1.9l2 1.7-1.7 3-2.5-.9-1.6.9-.5 2.6h-3.4l-.5-2.6-1.6-.9-2.5.9-1.7-3 2-1.7v-1.9l-2-1.8 1.7-2.9 2.5.9 1.6-.9z" />
            <circle cx="12" cy="12" r="3" />
          </>
        ),
        props.onOpenSettings,
        'nav-settings'
      )}
    </nav>
  );
}
