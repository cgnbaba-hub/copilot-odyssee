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

export type CopyState = 'idle' | 'copied' | 'failed';

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
    navigator.clipboard.writeText(text).then(() => done('copied'), failed);
  } catch {
    failed();
  }
}
