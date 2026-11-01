import * as React from 'react';

import { FEEDBACK_MAX_LENGTH } from '../../core/feedback/feedback';
import { formatLongDate } from '../format';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';

type Status = 'closed' | 'open' | 'sending' | 'sent' | 'failed';

/**
 * «Stimmt das noch?» under every step: one click reports the step to the
 * feedback list with its stage, step and date, so outdated facts are found
 * by the people who meet them. Without a feedback list it offers an email.
 */
export function FactCheck(props: { stage: string; step: number; stepId: string; asOf?: string }): React.ReactElement {
  const { content, player, lang, strings, feedback } = useGame();
  const [status, setStatus] = React.useState<Status>('closed');
  const [note, setNote] = React.useState('');
  const context = format(strings.factCheckContext, { stage: props.stage, step: props.step, id: props.stepId });
  const message = [note.trim() || strings.factCheckDefault, props.asOf ? `${format(strings.asOf, { date: formatLongDate(lang, props.asOf) })}` : '']
    .filter((x) => !!x)
    .join('\n\n');

  if (!feedback) {
    if (!content.contact) return <></>;
    const mail = `mailto:${content.contact}?subject=${encodeURIComponent(`${strings.factCheckAsk} ${context}`)}&body=${encodeURIComponent(strings.factCheckDefault)}`;
    return (
      <p className={styles.factCheck}>
        <a href={mail}>{strings.factCheckAsk}</a>
      </p>
    );
  }

  if (status === 'sent') {
    return (
      <p className={`${styles.factCheck} ${styles.factCheckDone}`} role="status">
        ✓ {strings.factCheckThanks}
      </p>
    );
  }

  if (status === 'closed') {
    return (
      <p className={styles.factCheck}>
        <button type="button" className={styles.factCheckToggle} aria-expanded={false} onClick={() => setStatus('open')}>
          <span aria-hidden="true">⚑</span> {strings.factCheckAsk}
        </button>
      </p>
    );
  }

  const send = (): void => {
    setStatus('sending');
    const profile = player.profile;
    feedback.send({ kind: 'outdated', message: message.slice(0, FEEDBACK_MAX_LENGTH), context, lang: profile.lang, license: profile.license, area: profile.area }).then(
      () => setStatus('sent'),
      () => setStatus('failed')
    );
  };

  return (
    <form
      className={styles.factCheckForm}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <p className={styles.factCheckTitle}>
        <span aria-hidden="true">⚑</span> {strings.factCheckAsk}
      </p>
      <p className={styles.muted}>{strings.factCheckIntro}</p>
      <label className={styles.feedbackField}>
        <span>{strings.factCheckNote}</span>
        <textarea
          className={styles.textarea}
          rows={3}
          maxLength={FEEDBACK_MAX_LENGTH - 200}
          value={note}
          placeholder={strings.factCheckPlaceholder}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {status === 'failed' && (
        <p className={styles.feedbackBad} role="alert">
          {strings.factCheckFailed}
        </p>
      )}
      <div className={styles.blockActions}>
        <button type="submit" className={styles.buttonPrimary} disabled={status === 'sending'}>
          {status === 'sending' ? strings.factCheckSending : strings.factCheckSend}
        </button>
        <button type="button" className={styles.button} onClick={() => setStatus('closed')}>
          {strings.cancel}
        </button>
      </div>
    </form>
  );
}
