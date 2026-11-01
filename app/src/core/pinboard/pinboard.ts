import { MissionApp } from '../content/types';

/**
 * The harbour board ("Hafen-Pinnwand"): prompts colleagues found useful and
 * shared. A new post waits until the editorial team approves it; only its
 * author and the team see it before that.
 */

export type PinStatus = 'approved' | 'pending' | 'rejected';

/** Where the prompt is used; missing means Copilot Chat. */
export type PinTool = MissionApp | 'chat';

export const PIN_TOOLS: PinTool[] = ['chat', 'outlook', 'teams', 'word', 'excel', 'powerpoint'];

export interface PinPost {
  id: string;
  title: string;
  prompt: string;
  tool: PinTool;
  /** Field of work (id from areas.json). */
  area?: string;
  /** Shown only when the author chose to show their name. */
  author?: string;
  /** ISO date and time. */
  created: string;
  status: PinStatus;
  mine: boolean;
  /** How many people said it helped them. */
  likes: number;
  /** Whether the current person said so. */
  liked: boolean;
}

export interface NewPinPost {
  title: string;
  prompt: string;
  tool: PinTool;
  area?: string;
  showName: boolean;
}

export interface PinboardData {
  posts: PinPost[];
  /** Whether the current person may approve posts (the editorial team). */
  canModerate: boolean;
}

export interface PinboardSource {
  load(): Promise<PinboardData>;
  add(post: NewPinPost): Promise<void>;
  setLike(postId: string, liked: boolean): Promise<void>;
  /** Approves or rejects a waiting post; only for the editorial team. */
  moderate(postId: string, approve: boolean): Promise<void>;
  /** True for the demo, which keeps everything in the browser. */
  sample?: boolean;
}

export const PIN_TITLE_MAX = 80;
export const PIN_PROMPT_MAX = 2000;
const PIN_PROMPT_MIN_WORDS = 5;

/** Trims the input and checks it is complete; undefined when it cannot be posted yet. */
export function cleanPost(input: NewPinPost): NewPinPost | undefined {
  const title = input.title.trim().replace(/\s+/g, ' ').slice(0, PIN_TITLE_MAX);
  const prompt = input.prompt.trim().slice(0, PIN_PROMPT_MAX);
  const words = prompt.split(/\s+/).filter((w) => w.length > 0).length;
  if (title.length < 3 || words < PIN_PROMPT_MIN_WORDS) return undefined;
  return { ...input, title, prompt };
}

export type SensitiveHint = 'mail' | 'phone' | 'iban';

/**
 * Things that look like personal or customer data. The board is visible to
 * everyone, so the form warns before such a prompt is shared.
 */
export function sensitiveHints(text: string): SensitiveHint[] {
  const hints: SensitiveHint[] = [];
  const iban = /\b[A-Z]{2}\d{2}(\s?[A-Z0-9]{4}){3,}(\s?[A-Z0-9]{1,4})?/g;
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text)) hints.push('mail');
  // The digits of an account number are not a phone number as well.
  if (/(\+|\b0)\d[\d\s/.-]{7,}\d/.test(text.replace(iban, ' '))) hints.push('phone');
  if (iban.test(text)) hints.push('iban');
  return hints;
}

export type PinOrder = 'popular' | 'new';

/** Most helpful first (newer wins a tie), or simply newest first. */
export function sortPosts(posts: PinPost[], order: PinOrder): PinPost[] {
  return posts.slice().sort((a, b) => {
    if (order === 'popular' && a.likes !== b.likes) return b.likes - a.likes;
    return a.created < b.created ? 1 : a.created > b.created ? -1 : 0;
  });
}
