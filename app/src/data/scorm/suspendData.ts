import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import { BlockProgress, Frequency, ModuleProgress, PlayerState, ReviewEntry, UseCaseCard } from '../../core/progress/state';

/**
 * The player state as it is kept in `cmi.suspend_data`. SCORM 1.2 allows
 * only 4096 characters there, while the JSON of a long journey is ten times
 * larger. So the state is first packed into short arrays (lossless: field
 * names and ISO dates take most of the room), then compressed into URI-safe
 * characters (some LMSs mangle others) and, if still too long, slimmed down.
 */

/** The SCORM 1.2 limit of `cmi.suspend_data`. */
export const SUSPEND_DATA_LIMIT = 4096;

/** What we aim for, leaving some room below the hard limit. */
export const SUSPEND_DATA_TARGET = 4000;

/** Marks the format, so a later change can still read older saves. */
const PREFIX = 'o1:';

/** Use case texts are cut to this length when the rest is not enough, and to the shorter one as the very last resort. */
const USECASE_TEXT_MAX = 200;
const USECASE_TEXT_MIN = 60;

// ---- Packing -------------------------------------------------------------

type PackedDate = string | number;
type PackedBlock = [number, number, number, number?, number?];
type PackedModule = [number, number, number, PackedDate?];
type PackedUseCase = [string, string, Frequency, number, string, PackedDate, string?];
type PackedExam = [number, number, number, PackedDate?];

interface Packed {
  p: PlayerState['profile'];
  x: number;
  b: { [key: string]: PackedBlock };
  m: { [moduleId: string]: PackedModule };
  u: PackedUseCase[];
  e?: { [islandId: string]: PackedExam };
  r?: { [key: string]: [string, number] };
  s?: string[];
  c?: { [week: string]: string };
  n?: string;
  k?: number;
  /** Fields a newer app version may add; kept as they are. */
  o?: { [key: string]: unknown };
}

/** An ISO date as base-36 milliseconds when that reads back to exactly the same text. */
function packDate(iso: string): PackedDate {
  const ms = Date.parse(iso);
  return !isNaN(ms) && new Date(ms).toISOString() === iso ? ms.toString(36) : iso;
}

function unpackDate(value: PackedDate): string {
  return typeof value === 'string' && /^[0-9a-z]+$/.test(value) ? new Date(parseInt(value, 36)).toISOString() : String(value);
}

/** Drops trailing undefined entries so the arrays stay short. */
function trim<T extends unknown[]>(items: T): T {
  while (items.length > 0 && items[items.length - 1] === undefined) items.pop();
  return items;
}

const KNOWN = ['version', 'profile', 'xp', 'blocks', 'modules', 'useCases', 'exams', 'reviews', 'savedPrompts', 'challenges', 'reviewSnoozed', 'pinsShared'];

function pack(state: PlayerState): Packed {
  const b: Packed['b'] = {};
  Object.keys(state.blocks).forEach((key) => {
    const x = state.blocks[key];
    b[key] = trim<PackedBlock>([x.done ? 1 : 0, x.attempts, x.xp, x.bestScore, x.rating]);
  });
  const m: Packed['m'] = {};
  Object.keys(state.modules).forEach((id) => {
    const x = state.modules[id];
    m[id] = trim<PackedModule>([x.started, x.completed, x.inProgress ? 1 : 0, x.firstCompletedAt ? packDate(x.firstCompletedAt) : undefined]);
  });
  const u = state.useCases.map((c) => {
    // The id is made from the stage and the time of saving; only a different one needs storing.
    const derived = `${c.moduleId}-${Date.parse(c.createdAt)}`;
    return trim<PackedUseCase>([c.moduleId, c.task, c.frequency, c.minutesPerTime, c.prompt, packDate(c.createdAt), c.id === derived ? undefined : c.id]);
  });
  const packed: Packed = { p: state.profile, x: state.xp, b, m, u };
  if (state.exams) {
    const e: NonNullable<Packed['e']> = {};
    Object.keys(state.exams).forEach((id) => {
      const x = state.exams![id];
      e[id] = trim<PackedExam>([x.passed ? 1 : 0, x.best, x.attempts, x.passedAt ? packDate(x.passedAt) : undefined]);
    });
    packed.e = e;
  }
  if (state.reviews) {
    const r: NonNullable<Packed['r']> = {};
    Object.keys(state.reviews).forEach((key) => {
      r[key] = [state.reviews![key].due, state.reviews![key].step];
    });
    packed.r = r;
  }
  if (state.savedPrompts) packed.s = state.savedPrompts;
  if (state.challenges) packed.c = state.challenges;
  if (state.reviewSnoozed !== undefined) packed.n = state.reviewSnoozed;
  if (state.pinsShared !== undefined) packed.k = state.pinsShared;
  const other: { [key: string]: unknown } = {};
  Object.keys(state).forEach((key) => {
    if (KNOWN.indexOf(key) < 0) other[key] = (state as unknown as { [key: string]: unknown })[key];
  });
  if (Object.keys(other).length > 0) packed.o = other;
  return packed;
}

function unpack(packed: Packed): PlayerState {
  const blocks: { [key: string]: BlockProgress } = {};
  Object.keys(packed.b || {}).forEach((key) => {
    const [done, attempts, xp, bestScore, rating] = packed.b[key];
    const block: BlockProgress = { done: done === 1, attempts, xp };
    if (bestScore !== undefined && bestScore !== null) block.bestScore = bestScore;
    if (rating !== undefined && rating !== null) block.rating = rating;
    blocks[key] = block;
  });
  const modules: { [moduleId: string]: ModuleProgress } = {};
  Object.keys(packed.m || {}).forEach((id) => {
    const [started, completed, inProgress, first] = packed.m[id];
    const progress: ModuleProgress = { started, completed, inProgress: inProgress === 1 };
    if (first !== undefined && first !== null) progress.firstCompletedAt = unpackDate(first);
    modules[id] = progress;
  });
  const useCases: UseCaseCard[] = (packed.u || []).map(([moduleId, task, frequency, minutesPerTime, prompt, created, id]) => {
    const createdAt = unpackDate(created);
    return { task, frequency, minutesPerTime, prompt, id: id || `${moduleId}-${Date.parse(createdAt)}`, moduleId, createdAt };
  });
  const state: PlayerState = { ...((packed.o || {}) as object), version: 1, profile: packed.p, xp: packed.x, blocks, modules, useCases };
  if (packed.e) {
    const exams: NonNullable<PlayerState['exams']> = {};
    Object.keys(packed.e).forEach((id) => {
      const [passed, best, attempts, passedAt] = packed.e![id];
      exams[id] = { passed: passed === 1, best, attempts };
      if (passedAt !== undefined && passedAt !== null) exams[id].passedAt = unpackDate(passedAt);
    });
    state.exams = exams;
  }
  if (packed.r) {
    const reviews: { [key: string]: ReviewEntry } = {};
    Object.keys(packed.r).forEach((key) => {
      reviews[key] = { due: packed.r![key][0], step: packed.r![key][1] };
    });
    state.reviews = reviews;
  }
  if (packed.s) state.savedPrompts = packed.s;
  if (packed.c) state.challenges = packed.c;
  if (packed.n !== undefined) state.reviewSnoozed = packed.n;
  if (packed.k !== undefined) state.pinsShared = packed.k;
  return state;
}

// ---- Reducing ------------------------------------------------------------

function encodeRaw(state: PlayerState): string {
  return PREFIX + compressToEncodedURIComponent(JSON.stringify(pack(state)));
}

function fits(state: PlayerState): boolean {
  return encodeRaw(state).length <= SUSPEND_DATA_TARGET;
}

function withoutReviews(state: PlayerState): PlayerState {
  const next = { ...state };
  delete next.reviews;
  return next;
}

/**
 * Completion and the XP total live in `modules` and `xp`, not in the steps,
 * so the step details of a completed stage can go. A stage being repeated
 * keeps them, as its current run needs them.
 */
function withoutCompletedBlocks(state: PlayerState): PlayerState {
  const blocks: { [key: string]: BlockProgress } = {};
  Object.keys(state.blocks).forEach((key) => {
    const progress = state.modules[key.split('/')[0]];
    if (!progress || progress.completed === 0 || progress.inProgress) blocks[key] = state.blocks[key];
  });
  return { ...state, blocks };
}

function cutUseCases(state: PlayerState, max: number): PlayerState {
  const cut = (text: string): string => (text.length > max ? text.slice(0, max - 1) + '…' : text);
  return { ...state, useCases: state.useCases.map((c) => ({ ...c, task: cut(c.task), prompt: cut(c.prompt) })) };
}

/**
 * Drops data in order of least harm until the encoded state fits: review
 * dates, step details of completed stages, long use case texts. The full
 * state is still kept in the browser.
 */
export function reduceState(state: PlayerState): PlayerState {
  const steps = [withoutReviews, withoutCompletedBlocks, (s: PlayerState) => cutUseCases(s, USECASE_TEXT_MAX), (s: PlayerState) => cutUseCases(s, USECASE_TEXT_MIN)];
  let current = state;
  for (const step of steps) {
    if (fits(current)) return current;
    current = step(current);
  }
  return current;
}

/** The value for `cmi.suspend_data`; it may still exceed the limit for an extreme state, which the caller checks. */
export function encodeState(state: PlayerState): string {
  return encodeRaw(reduceState(state));
}

/** The state from `cmi.suspend_data`, or undefined for an empty, foreign or broken value. */
export function decodeState(raw: string): PlayerState | undefined {
  if (!raw || raw.indexOf(PREFIX) !== 0) return undefined;
  try {
    const json = decompressFromEncodedURIComponent(raw.slice(PREFIX.length));
    const parsed: unknown = json ? JSON.parse(json) : undefined;
    if (!parsed || typeof parsed !== 'object' || !(parsed as Packed).p || typeof (parsed as Packed).x !== 'number') return undefined;
    return unpack(parsed as Packed);
  } catch {
    return undefined;
  }
}
