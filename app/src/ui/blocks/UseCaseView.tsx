import * as React from 'react';

import { UseCaseBlock } from '../../core/content/types';
import { Frequency, saveUseCase } from '../../core/progress/state';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { BlockViewProps } from './BlockViewProps';

const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'rarely'];

export function UseCaseView(props: BlockViewProps<UseCaseBlock>): React.ReactElement {
  const { strings, t, apply } = useGame();
  const { block, moduleId } = props;
  const [task, setTask] = React.useState('');
  const [frequency, setFrequency] = React.useState<Frequency>('weekly');
  const [minutes, setMinutes] = React.useState('30');
  const [prompt, setPrompt] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const id = (name: string): string => `od-${block.id}-${name}`;
  const minutesValue = parseInt(minutes, 10);
  const valid = task.trim().length > 0 && minutesValue > 0;

  const save = (): void => {
    if (!valid) return;
    apply((s) => saveUseCase(s, moduleId, block.id, { task: task.trim(), frequency, minutesPerTime: minutesValue, prompt: prompt.trim() }, new Date()));
    setSaved(true);
  };

  if (saved) {
    return (
      <div className={`${styles.actionBar} ${styles.actionBarGood}`} aria-live="polite">
        <div className={styles.actionFeedback}>
          <span className={styles.actionIcon} aria-hidden="true">
            ✓
          </span>
          <strong>{strings.useCaseSaved}</strong>
        </div>
        <button type="button" className={`${styles.buttonSuccess} ${styles.buttonWide}`} onClick={props.onDone}>
          {strings.continue}
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.blockTitle}>{strings.useCaseTitle}</h2>
      <p className={styles.muted}>{strings.useCaseExplained}</p>
      <p className={styles.scenario}>{t(block.intro)}</p>

      <label htmlFor={id('task')} className={styles.label}>
        {strings.useCaseTask}
      </label>
      <textarea id={id('task')} className={styles.textarea} rows={3} value={task} placeholder={strings.useCaseTaskPlaceholder} onChange={(e) => setTask(e.target.value)} />

      <div className={styles.formRow}>
        <div>
          <label htmlFor={id('frequency')} className={styles.label}>
            {strings.useCaseFrequency}
          </label>
          <select id={id('frequency')} className={styles.input} value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {strings[`frequency_${f}` as 'frequency_daily']}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={id('minutes')} className={styles.label}>
            {strings.useCaseMinutes}
          </label>
          <input id={id('minutes')} className={styles.input} type="number" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
      </div>

      <label htmlFor={id('prompt')} className={styles.label}>
        {strings.useCasePrompt}
      </label>
      <textarea id={id('prompt')} className={styles.textarea} rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      <div className={styles.actionBar}>
        <button type="button" className={`${styles.buttonPrimary} ${styles.buttonWide}`} disabled={!valid} onClick={save}>
          {strings.useCaseSave}
        </button>
      </div>
    </>
  );
}
