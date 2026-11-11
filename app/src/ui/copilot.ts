import { MissionApp } from '../core/content/types';

/** Copilot Chat in the browser, for Basic and Premium. */
export const COPILOT_CHAT_URL = 'https://m365.cloud.microsoft/chat';

/** Product names, the same in every language. */
export const APP_NAMES: Record<MissionApp, string> = {
  outlook: 'Outlook',
  teams: 'Teams',
  word: 'Word',
  excel: 'Excel',
  powerpoint: 'PowerPoint'
};

/** The web versions of the apps, for prompts that are used there and not in Copilot Chat. */
export const APP_URLS: Record<MissionApp, string> = {
  outlook: 'https://outlook.office.com/mail/',
  teams: 'https://teams.microsoft.com/',
  word: 'https://www.office.com/launch/word',
  excel: 'https://www.office.com/launch/excel',
  powerpoint: 'https://www.office.com/launch/powerpoint'
};

export type CopyState = 'idle' | 'copied' | 'failed';

/**
 * Copies at once, inside the click itself. A link that opens Copilot in a new
 * tab uses this, because the clipboard of the browser refuses a page that has
 * just lost the focus. Returns false where the browser does not allow it.
 */
export function copyNow(text: string): boolean {
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  try {
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (area.parentNode) area.parentNode.removeChild(area);
    if (active && active.focus) active.focus();
  }
}

/** How long «Kopiert» stays on a copy button. */
const COPIED_VISIBLE_MS = 2000;

/** Selects the text of an element so it can be copied by hand. */
function selectText(element: HTMLElement | undefined): void {
  const selection = window.getSelection();
  if (!element || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Copies text to the clipboard. Where the browser refuses (older browsers,
 * blocked permission), the element is selected so it can be copied by hand.
 */
export function copyText(text: string, element: HTMLElement | undefined, done: (state: CopyState) => void): void {
  const failed = (): void => {
    selectText(element);
    done('failed');
  };
  try {
    navigator.clipboard.writeText(text).then(() => {
      done('copied');
      // The confirmation fades after a moment, so the button can be used again.
      window.setTimeout(() => done('idle'), COPIED_VISIBLE_MS);
    }, failed);
  } catch {
    failed();
  }
}
