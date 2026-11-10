import { ContentFilter } from '../content/bundle';
import { ContentBundle } from '../content/types';
import { passportStamps } from './achievements';
import { courseCompletion } from './completion';
import { PlayerState } from './state';

/**
 * Completion badges derived from the passport, so nothing extra is stored:
 * «basic» once every Basic island has its stamp, «premium» once every island has.
 */

export type BadgeId = 'basic' | 'premium';

export interface BadgeStatus {
  id: BadgeId;
  earned: boolean;
  done: number;
  total: number;
  /** ISO date of the last stamp that completed the tier. */
  earnedAt?: string;
}

export function badgeStatuses(content: ContentBundle, state: PlayerState, filter: ContentFilter): BadgeStatus[] {
  const completion = courseCompletion(content, state, filter);
  const stamps = passportStamps(content, state, filter);
  const basicIslands = content.islands.filter((i) => i.license === 'basic').map((i) => i.id);
  const latest = (onlyIslands?: string[]): string | undefined =>
    stamps
      .filter((s) => !onlyIslands || onlyIslands.indexOf(s.islandId) >= 0)
      .map((s) => s.date)
      .sort()
      .pop();
  return [
    { id: 'basic', ...completion.basic, earned: completion.basic.complete, earnedAt: completion.basic.complete ? latest(basicIslands) : undefined },
    { id: 'premium', ...completion.premium, earned: completion.premium.complete, earnedAt: completion.premium.complete ? latest() : undefined }
  ].map((s) => ({ id: s.id as BadgeId, earned: s.earned, done: s.done, total: s.total, earnedAt: s.earnedAt }));
}

/** Base 32 without the confusable characters I, O, 0 and 1. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    // Multiply by the FNV prime (16777619) in 32 bit arithmetic.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/**
 * A short, stable, readable code such as «CO-B-2611-7F3K»: tier, year and
 * month of the date, and four characters of an FNV-1a hash over tier, date and
 * holder name. It is an identifier that lets people name and look up a badge,
 * NOT a cryptographic proof: anyone can compute it, so it proves nothing alone.
 * The month is read in UTC so the same input gives the same code in any time zone.
 */
export function credentialId(id: BadgeId, earnedAt: string, holder: string | undefined): string {
  const date = new Date(earnedAt);
  const yymm = ('0' + (date.getUTCFullYear() % 100)).slice(-2) + ('0' + (date.getUTCMonth() + 1)).slice(-2);
  let hash = fnv1a(`${id}|${earnedAt}|${(holder || '').trim()}`);
  let check = '';
  for (let i = 0; i < 4; i++) {
    check = ALPHABET[hash & 31] + check;
    hash >>>= 5;
  }
  return `CO-${id === 'basic' ? 'B' : 'P'}-${yymm}-${check}`;
}

/**
 * Link to LinkedIn's «add certification» form. The format comes from third-party
 * documentation, not from LinkedIn itself. With an organization id LinkedIn shows
 * the company logo, so it replaces the plain name.
 */
export function linkedInUrl(options: { name: string; organizationName: string; organizationId?: string; earnedAt: string; credentialId: string; certUrl?: string }): string {
  const date = new Date(options.earnedAt);
  const parts: [string, string][] = [
    ['startTask', 'CERTIFICATION_NAME'],
    ['name', options.name],
    options.organizationId ? ['organizationId', options.organizationId] : ['organizationName', options.organizationName],
    ['issueYear', String(date.getUTCFullYear())],
    ['issueMonth', String(date.getUTCMonth() + 1)],
    ['certId', options.credentialId]
  ];
  if (options.certUrl) parts.push(['certUrl', options.certUrl]);
  return `https://www.linkedin.com/profile/add?${parts.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
}
