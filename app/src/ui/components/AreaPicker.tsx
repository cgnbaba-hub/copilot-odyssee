import * as React from 'react';

import { useGame } from '../GameContext';
import styles from '../styles.module.scss';

/** Large choice cards for the field of work, from content/areas.json. */
export function AreaPicker(props: { value: string | undefined; onChange: (area: string) => void }): React.ReactElement {
  const { content, strings, t } = useGame();
  return (
    <div className={`${styles.choiceList} ${styles.areaGrid}`} role="radiogroup" aria-label={strings.areaQuestion}>
      {(content.areas || []).map((area) => (
        <button
          type="button"
          role="radio"
          aria-checked={props.value === area.id}
          key={area.id}
          className={`${styles.choice} ${props.value === area.id ? styles.choiceSelected : ''}`}
          onClick={() => props.onChange(area.id)}
        >
          <span className={styles.radioDot} aria-hidden="true" />
          <span className={styles.choiceText}>
            <strong>{t(area.name)}</strong>
            <span className={styles.choiceHint}>{t(area.hint)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
