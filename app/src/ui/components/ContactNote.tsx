import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** Under every screen: where to send questions the content does not answer, and the way to give feedback. */
export function ContactNote(props: { onFeedback: () => void }): React.ReactElement {
  const { content, strings } = useGame();
  return (
    <div className={styles.contactNote}>
      {content.contact && (
        <p>
          {strings.contactNote} <a href={`mailto:${content.contact}`}>{content.contact}</a>
        </p>
      )}
      <p>
        {strings.feedbackPrompt}{' '}
        <button type="button" className={styles.linkButton} onClick={props.onFeedback}>
          {strings.feedbackOpen}
        </button>
      </p>
    </div>
  );
}
