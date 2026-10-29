import * as React from 'react';

import { useGame } from '../GameContext';
import { GUIDES, GuidePortrait, guideById } from '../guides';
import styles from '../styles.module.scss';

/** Choice cards for the companion who explains and leads the tour. */
export function GuidePicker(props: { value: string | undefined; onChange: (guide: string) => void }): React.ReactElement {
  const { strings, t } = useGame();
  const selected = guideById(props.value).id;
  return (
    <div className={styles.guideGrid} role="radiogroup" aria-label={strings.guideQuestion}>
      {GUIDES.map((guide) => (
        <button
          type="button"
          role="radio"
          aria-checked={selected === guide.id}
          key={guide.id}
          className={`${styles.guideChoice} ${selected === guide.id ? styles.guideChoiceSelected : ''}`}
          onClick={() => props.onChange(guide.id)}
          title={t(guide.why)}
        >
          <GuidePortrait id={guide.id} className={styles.guideChoicePortrait} />
          <span className={styles.guideChoiceText}>
            <strong>{t(guide.name)}</strong>
            <span>{t(guide.kind)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
