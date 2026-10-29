import * as React from 'react';

import { HelpTopic } from '../../core/content/types';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { Drawer } from './Drawer';
import { Guide } from './Guide';
import { LicenseMockup } from './LicenseMockup';
import { RichText } from './RichText';

/** Lower-case words of a search, without the punctuation people tend to type. */
export function searchWords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9äöüàâçéèêëîïôûùñ]+/)
    .filter((w) => w.length > 1);
}

/** Questions and answers from content/help.json, grouped and searchable, as a panel over the game. */
export function HelpPanel(props: { onClose: () => void; initialTopic?: string }): React.ReactElement {
  const { content, player, strings, t } = useGame();
  const topics = content.help || [];
  const groups = content.helpGroups || [];
  const [open, setOpen] = React.useState<string | undefined>(props.initialTopic);
  const [query, setQuery] = React.useState('');

  const words = searchWords(query);
  const matches = (topic: HelpTopic): boolean => {
    const text = `${t(topic.question)} ${t(topic.answer)}`.toLowerCase();
    return words.every((w) => text.indexOf(w) >= 0);
  };

  const renderTopic = (topic: HelpTopic): React.ReactElement => {
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
  };

  let list: React.ReactNode;
  if (words.length > 0) {
    const found = topics.filter(matches);
    list = found.length > 0 ? <ul className={styles.faq}>{found.map(renderTopic)}</ul> : <p className={styles.muted}>{strings.helpNoMatch}</p>;
  } else {
    const groupIds = groups.map((g) => g.id);
    const ungrouped = topics.filter((x) => !x.group || groupIds.indexOf(x.group) < 0);
    list = (
      <>
        {groups.map((g) => {
          const items = topics.filter((x) => x.group === g.id);
          if (items.length === 0) return null;
          return (
            <section key={g.id} className={styles.faqGroup}>
              <h3 className={styles.faqGroupTitle}>{t(g.title)}</h3>
              <ul className={styles.faq}>{items.map(renderTopic)}</ul>
            </section>
          );
        })}
        {ungrouped.length > 0 && (
          <section className={styles.faqGroup}>
            {groups.length > 0 && <h3 className={styles.faqGroupTitle}>{strings.helpMore}</h3>}
            <ul className={styles.faq}>{ungrouped.map(renderTopic)}</ul>
          </section>
        )}
      </>
    );
  }

  return (
    <Drawer id="od-help-title" title={strings.help} onClose={props.onClose}>
      <Guide text={strings.helpGuide} compact />
      {topics.length === 0 ? (
        <p className={styles.muted}>{strings.helpEmpty}</p>
      ) : (
        <>
          <label className={styles.faqSearch}>
            <span>{strings.helpSearch}</span>
            <input type="search" value={query} placeholder={strings.helpSearchPlaceholder} onChange={(e) => setQuery(e.target.value)} />
          </label>
          {list}
        </>
      )}
      {content.contact && (
        <div className={styles.faqContact}>
          <strong>{strings.helpContactTitle}</strong>
          <p>
            {strings.helpContactText.split('{mail}')[0]}
            <a href={`mailto:${content.contact}`}>{content.contact}</a>
            {strings.helpContactText.split('{mail}')[1]}
          </p>
        </div>
      )}
    </Drawer>
  );
}
