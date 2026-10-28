import * as React from 'react';

import { MissionApp } from '../../core/content/types';
import { APP_NAMES, COPILOT_CHAT_URL, copyText, CopyState } from '../copilot';
import { format } from '../i18n/strings';
import { useGame } from '../GameContext';
import styles from '../styles.module.scss';
import { LicenseChip } from './LicenseChip';

/** Shows [placeholders] highlighted, so it is clear what to replace. */
function PromptText(props: { text: string }): React.ReactElement {
  const parts = props.text.split(/(\[[^\]]+\])/);
  return (
    <>
      {parts.map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <mark key={i} className={styles.placeholder}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export interface PromptCardProps {
  title: string;
  text: string;
  app?: MissionApp;
  premium?: boolean;
  /** Shown as a small label above the title, for example the stage a use case comes from. */
  eyebrow?: string;
  saved?: boolean;
  onToggleSave?: () => void;
}

/** A prompt with buttons to copy it, open Copilot and pin it to the cheat sheet. */
export function PromptCard(props: PromptCardProps): React.ReactElement {
  const { strings } = useGame();
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const place = props.app ? format(strings.placeApp, { app: APP_NAMES[props.app] }) : strings.placeChat;

  return (
    <li className={styles.promptCard}>
      {props.eyebrow && <p className={styles.eyebrow}>{props.eyebrow}</p>}
      <div className={styles.promptCardHead}>
        <h3>{props.title}</h3>
        <span className={styles.chip}>{place}</span>
        {props.premium && <LicenseChip license="premium" />}
      </div>
      <p className={styles.promptCardText} ref={textRef}>
        <PromptText text={props.text} />
      </p>
      <div className={styles.promptCardActions}>
        <button
          type="button"
          className={copyState === 'copied' ? styles.buttonSuccess : styles.buttonPrimary}
          onClick={() => copyText(props.text, textRef.current || undefined, setCopyState)}
        >
          {copyState === 'copied' ? `✓ ${strings.copied}` : `⧉ ${strings.copy}`}
        </button>
        {!props.app && (
          <a className={styles.button} href={COPILOT_CHAT_URL} target="_blank" rel="noopener noreferrer">
            {strings.missionOpenCopilot} ↗
          </a>
        )}
        {props.onToggleSave && (
          <button type="button" className={styles.button} aria-pressed={!!props.saved} onClick={props.onToggleSave}>
            {props.saved ? `★ ${strings.savedPrompt}` : `☆ ${strings.savePrompt}`}
          </button>
        )}
      </div>
      {copyState === 'failed' && <p className={styles.copyFailed}>{strings.missionCopyFailed}</p>}
    </li>
  );
}
