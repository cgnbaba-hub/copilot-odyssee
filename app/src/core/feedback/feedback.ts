/** What a player can report from inside the app; «outdated» comes from «Stimmt das noch?» on a step. */
export type FeedbackKind = 'idea' | 'problem' | 'content' | 'praise' | 'outdated';

/** The kinds offered in the feedback form. */
export const FEEDBACK_KINDS: FeedbackKind[] = ['idea', 'problem', 'content', 'praise'];

/** Longest message the app accepts; enough for a detailed note, short enough to read. */
export const FEEDBACK_MAX_LENGTH = 2000;

export interface FeedbackEntry {
  kind: FeedbackKind;
  message: string;
  /** The screen the player was on, e.g. "Etappe: Mails verstehen", if they chose to send it. */
  context?: string;
  lang: string;
  license: string;
  area?: string;
}

/** Sends feedback somewhere the team can read it. */
export interface FeedbackSender {
  send(entry: FeedbackEntry): Promise<void>;
}

/** Trims the message and checks it is worth sending. */
export function cleanMessage(message: string): string | undefined {
  const text = message.trim().slice(0, FEEDBACK_MAX_LENGTH);
  return text.length >= 3 ? text : undefined;
}
