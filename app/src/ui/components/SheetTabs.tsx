import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** Switches between the personal cheat sheet and the shared harbour board, when the board is there. */
export function SheetTabs(props: { active: 'cheatsheet' | 'pinboard' }): React.ReactElement {
  const { strings, pinboard, navigate } = useGame();
  if (!pinboard) return <></>;
  return (
    <div className={`${styles.viewSwitch} ${styles.sheetTabs}`} role="group" aria-label={strings.sheetTabsLabel}>
      <button
        type="button"
        aria-pressed={props.active === 'cheatsheet'}
        className={props.active === 'cheatsheet' ? styles.viewSwitchActive : undefined}
        onClick={() => navigate({ name: 'cheatsheet' })}
      >
        {strings.sheetTab}
      </button>
      <button
        type="button"
        aria-pressed={props.active === 'pinboard'}
        className={props.active === 'pinboard' ? styles.viewSwitchActive : undefined}
        onClick={() => navigate({ name: 'pinboard' })}
      >
        <span aria-hidden="true">📌</span> {strings.pinboardTab}
      </button>
    </div>
  );
}
