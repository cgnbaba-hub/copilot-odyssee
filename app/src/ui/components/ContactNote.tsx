import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** Points to the people behind the app for questions the content does not answer. */
export function ContactNote(): React.ReactElement {
  const { content, strings } = useGame();
  if (!content.contact) return <></>;
  return (
    <p className={styles.contactNote}>
      {strings.contactNote} <a href={`mailto:${content.contact}`}>{content.contact}</a>
    </p>
  );
}
