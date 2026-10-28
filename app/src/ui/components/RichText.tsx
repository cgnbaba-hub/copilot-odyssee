import * as React from 'react';

import styles from '../styles.module.scss';

/**
 * Renders the small markup allowed in briefings: paragraphs separated by a
 * blank line, lines starting with "- " as a list, and **bold**.
 */
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.indexOf('**') === 0 && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

export function RichText(props: { text: string }): React.ReactElement {
  const paragraphs = props.text.split(/\n\s*\n/);
  return (
    <div className={styles.richText}>
      {paragraphs.map((paragraph, i) => {
        const lines = paragraph.split('\n');
        const items = lines.filter((l) => l.indexOf('- ') === 0);
        const intro = lines.filter((l) => l.indexOf('- ') !== 0);
        return (
          <React.Fragment key={i}>
            {intro.length > 0 && <p>{inline(intro.join(' '))}</p>}
            {items.length > 0 && (
              <ul>
                {items.map((item, j) => (
                  <li key={j}>{inline(item.slice(2))}</li>
                ))}
              </ul>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
