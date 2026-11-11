import * as React from 'react';

import { MissionApp } from '../../core/content/types';
import { APP_NAMES, APP_URLS, COPILOT_CHAT_URL, copyNow } from '../copilot';
import { useGame } from '../GameContext';
import { format } from '../i18n/strings';

/** How long the link says that the text was copied. */
const COPIED_VISIBLE_MS = 6000;

/**
 * Opens Copilot Chat, or the app a prompt is meant for, in a new tab. Given a
 * text it copies it in the same click, so the only thing left to do there is
 * to paste. Copilot offers no link that fills in a prompt, so this is the
 * shortest way.
 */
export function CopilotLink(props: { text?: string; app?: MissionApp; className?: string; label?: string }): React.ReactElement {
  const { strings } = useGame();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const name = props.app ? APP_NAMES[props.app] : 'Copilot';
  const label = props.text ? format(strings.copyOpen, { app: name }) : props.label || format(strings.openApp, { app: name });
  const onClick = (): void => {
    if (!props.text) return;
    if (copyNow(props.text)) {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_VISIBLE_MS);
      return;
    }
    // Last resort; the copy button next to the link stays available.
    try {
      navigator.clipboard.writeText(props.text).catch(() => undefined);
    } catch {
      // The link still opens.
    }
  };

  return (
    <a className={props.className} href={props.app ? APP_URLS[props.app] : COPILOT_CHAT_URL} target="_blank" rel="noopener noreferrer" onClick={onClick}>
      {copied ? `✓ ${strings.copyOpenDone}` : `${label} ↗`}
    </a>
  );
}
