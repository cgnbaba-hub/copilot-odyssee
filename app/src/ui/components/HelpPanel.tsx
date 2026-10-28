import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { Drawer } from './Drawer';
import { Guide } from './Guide';
import { LicenseMockup } from './LicenseMockup';
import { RichText } from './RichText';

/** Questions and answers from content/help.json, as a panel that opens over the game. */
export function HelpPanel(props: { onClose: () => void; initialTopic?: string }): React.ReactElement {
  const { content, player, strings, t } = useGame();
  const topics = content.help || [];
  const [open, setOpen] = React.useState<string | undefined>(props.initialTopic);

  return (
    <Drawer id="od-help-title" title={strings.help} onClose={props.onClose}>
      <Guide text={strings.helpGuide} compact />
      {topics.length === 0 && <p className={styles.muted}>{strings.helpEmpty}</p>}
      <ul className={styles.faq}>
        {topics.map((topic) => {
          const expanded = open === topic.id;
          return (
            <li key={topic.id} className={expanded ? `${styles.faqItem} ${styles.faqItemOpen}` : styles.faqItem}>
              <button type="button" className={styles.faqQuestion} aria-expanded={expanded} onClick={() => setOpen(expanded ? undefined : topic.id)}>
                <span>{t(topic.question)}</span>
                <span className={styles.faqChevron} aria-hidden="true">
                  ›
                </span>
              </button>
              {expanded && (
                <div className={styles.faqAnswer}>
                  <RichText text={t(topic.answer)} />
                  {topic.illustration === 'license' && <LicenseMockup highlight={player.profile.license} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
}
