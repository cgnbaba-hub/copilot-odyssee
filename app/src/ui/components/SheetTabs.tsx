import * as React from 'react';

import { useGame, View } from '../GameContext';
import styles from '../styles.module.scss';

type Tab = 'cheatsheet' | 'workshop' | 'pinboard';

/** Switches between the cheat sheet, the prompt workshop and, when it is set up, the harbour board. */
export function SheetTabs(props: { active: Tab }): React.ReactElement {
  const { strings, pinboard, navigate } = useGame();
  const tabs: { id: Tab; label: string; view: View }[] = [
    { id: 'cheatsheet', label: strings.sheetTab, view: { name: 'cheatsheet' } },
    { id: 'workshop', label: `🛠 ${strings.workshopTab}`, view: { name: 'workshop' } }
  ];
  if (pinboard) tabs.push({ id: 'pinboard', label: `📌 ${strings.pinboardTab}`, view: { name: 'pinboard' } });
  return (
    <div className={`${styles.viewSwitch} ${styles.sheetTabs}`} role="group" aria-label={strings.sheetTabsLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={props.active === tab.id}
          className={props.active === tab.id ? styles.viewSwitchActive : undefined}
          onClick={() => navigate(tab.view)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
