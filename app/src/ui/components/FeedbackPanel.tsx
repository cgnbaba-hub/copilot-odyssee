import * as React from 'react';

import { cleanMessage, FEEDBACK_KINDS, FEEDBACK_MAX_LENGTH, FeedbackKind, FeedbackSender } from '../../core/feedback/feedback';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';
import styles from '../styles.module.scss';
import { Drawer } from './Drawer';
import { Guide } from './Guide';

type Status = 'editing' | 'sending' | 'sent' | 'failed';

/** Contact address with the text around it, e.g. "Schreib an {mail}." */
function WithMail(props: { text: string; mail: string }): React.ReactElement {
  const [before, after] = props.text.split('{mail}');
  return (
    <>
      {before}
      <a href={`mailto:${props.mail}`}>{props.mail}</a>
      {after}
    </>
  );
}

/** A short form for ideas, problems and corrections; it goes to the team's feedback list. */
export function FeedbackPanel(props: { sender?: FeedbackSender; demo: boolean; page: string; onClose: () => void }): React.ReactElement {
  const { content, player, strings } = useGame();
  const [kind, setKind] = React.useState<FeedbackKind | undefined>(undefined);
  const [message, setMessage] = React.useState('');
  const [withPage, setWithPage] = React.useState(true);
  const [status, setStatus] = React.useState<Status>('editing');
  const mail = content.contact || '';
  const labels: Record<FeedbackKind, string> = {
    idea: strings.feedbackIdea,
    problem: strings.feedbackProblem,
    content: strings.feedbackContent,
    praise: strings.feedbackPraise,
    outdated: strings.feedbackOutdated
  };
  const text = cleanMessage(message);
  const sender = props.sender;

  const send = (): void => {
    if (!sender || !kind || !text) return;
    setStatus('sending');
    const profile = player.profile;
    sender.send({ kind, message: text, context: withPage ? props.page : undefined, lang: profile.lang, license: profile.license, area: profile.area }).then(
      () => setStatus('sent'),
      () => setStatus('failed')
    );
  };

  const again = (): void => {
    setKind(undefined);
    setMessage('');
    setStatus('editing');
  };

  let body: React.ReactElement;
  if (!sender) {
    body = <p>{mail ? <WithMail text={strings.feedbackUnavailable} mail={mail} /> : strings.feedbackUnavailableNoMail}</p>;
  } else if (status === 'sent') {
    body = (
      <div className={styles.feedbackGood} role="status">
        <p>
          <strong>{strings.feedbackThanks}</strong>
        </p>
        {props.demo && <p>{strings.feedbackDemo}</p>}
        <div className={styles.blockActions}>
          <button type="button" className={styles.buttonPrimary} onClick={props.onClose}>
            {strings.close}
          </button>
          <button type="button" className={styles.button} onClick={again}>
            {strings.feedbackAnother}
          </button>
        </div>
      </div>
    );
  } else {
    body = (
      <form
        className={styles.feedbackForm}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <fieldset className={styles.feedbackKinds}>
          <legend>{strings.feedbackKind}</legend>
          <div className={styles.choiceList} role="radiogroup" aria-label={strings.feedbackKind}>
            {FEEDBACK_KINDS.map((k) => (
              <button
                type="button"
                role="radio"
                aria-checked={kind === k}
                key={k}
                className={`${styles.choice} ${kind === k ? styles.choiceSelected : ''}`}
                onClick={() => setKind(k)}
              >
                <span className={styles.radioDot} aria-hidden="true" />
                <span className={styles.choiceText}>
                  <strong>{labels[k]}</strong>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className={styles.feedbackField}>
          <span>{strings.feedbackMessage}</span>
          <textarea
            className={styles.textarea}
            rows={5}
            maxLength={FEEDBACK_MAX_LENGTH}
            value={message}
            placeholder={strings.feedbackPlaceholder}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <label className={styles.feedbackCheck}>
          <input type="checkbox" checked={withPage} onChange={(e) => setWithPage(e.target.checked)} />
          <span>{format(strings.feedbackWithPage, { page: props.page })}</span>
        </label>

        <p className={styles.muted}>{strings.feedbackPrivacy}</p>

        {status === 'failed' && (
          <p className={styles.feedbackBad} role="alert">
            {mail ? <WithMail text={strings.feedbackFailed} mail={mail} /> : strings.feedbackFailedNoMail}
          </p>
        )}

        <div className={styles.blockActions}>
          <button type="submit" className={styles.buttonPrimary} disabled={!kind || !text || status === 'sending'}>
            {status === 'sending' ? strings.feedbackSending : strings.feedbackSend}
          </button>
        </div>
      </form>
    );
  }

  return (
    <Drawer id="od-feedback-title" title={strings.feedbackTitle} onClose={props.onClose}>
      <Guide text={strings.feedbackGuide} compact />
      {body}
    </Drawer>
  );
}
