import { ContentFilter } from '../../core/content/bundle';
import { ContentBundle } from '../../core/content/types';
import { courseCompletion } from '../../core/progress/completion';
import { PlayerState } from '../../core/progress/state';
import { LocalStorageProgressStore, ProgressStore } from '../../core/progress/store';
import { ScormConnection } from './ScormApi';
import { decodeState, encodeState, SUSPEND_DATA_LIMIT } from './suspendData';

/** The SCORM 1.2 limit of `cmi.core.lesson_location`. */
const LOCATION_LIMIT = 255;

/** Statuses an LMS keeps once reached; the course never reports less afterwards. */
const FINAL_STATUSES = ['completed', 'passed'];

/** `HHHH:MM:SS`, the CMITimespan of SCORM 1.2. */
export function scormTimespan(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number, width: number): string => String(n).padStart(width, '0');
  return `${pad(Math.min(9999, Math.floor(seconds / 3600)), 4)}:${pad(Math.floor(seconds / 60) % 60, 2)}:${pad(seconds % 60, 2)}`;
}

export interface ScormStoreOptions {
  /** Local copy kept as a safety net; it also serves outside an LMS. */
  local?: ProgressStore;
  /** Clock for the session time; tests pass a fake. */
  now?: () => number;
}

/**
 * Keeps progress in the LMS: the state goes to `cmi.suspend_data`, and the
 * course status and score follow the basic islands done. A copy stays in
 * the browser in case the LMS loses or refuses a value.
 */
export class ScormProgressStore implements ProgressStore {
  private readonly _local: ProgressStore;
  private readonly _now: () => number;
  private readonly _started: number;
  /** The status the LMS reported at the start, then the one last sent. */
  private _status: string;

  public constructor(
    private readonly _lms: ScormConnection | undefined,
    private readonly _content: ContentBundle,
    private readonly _filter: ContentFilter,
    options: ScormStoreOptions = {}
  ) {
    // The local copy is kept per learner, so on a shared computer nobody picks up someone else's journey.
    const learner = _lms ? _lms.get('cmi.core.student_id') : '';
    this._local = options.local || new LocalStorageProgressStore(learner ? `odyssee-scorm:${learner}` : 'odyssee-scorm');
    this._now = options.now || (() => Date.now());
    this._started = this._now();
    this._status = _lms ? _lms.get('cmi.core.lesson_status') : '';
  }

  /** Learner name for display; LMSs usually send "Lastname, Firstname", shown here as "Firstname Lastname". Undefined outside an LMS. */
  public get learnerName(): string | undefined {
    const name = ((this._lms && this._lms.get('cmi.core.student_name')) || '').trim();
    if (!name) return undefined;
    const parts = name.split(',');
    return parts.length === 2 && parts[0].trim() && parts[1].trim() ? `${parts[1].trim()} ${parts[0].trim()}` : name;
  }

  public async load(): Promise<PlayerState | undefined> {
    const lms = this._lms;
    const state = (lms && decodeState(lms.get('cmi.suspend_data'))) || (await this._local.load());
    // The app saves only on the next change; a journey finished elsewhere should show as done in the LMS right away.
    if (lms && state && !lms.finished) {
      this._report(lms, state);
      lms.commit();
    }
    return state;
  }

  public async save(state: PlayerState): Promise<void> {
    await this._local.save(state);
    const lms = this._lms;
    if (!lms || lms.finished) return;

    const data = encodeState(state);
    // A value over the limit would be refused or cut off; the last one that fit stays, and the browser has the rest.
    if (data.length <= SUSPEND_DATA_LIMIT) lms.set('cmi.suspend_data', data);

    this._report(lms, state);
    lms.commit();
  }

  /** Status, score and current stage, derived from the state. */
  private _report(lms: ScormConnection, state: PlayerState): void {
    const completion = courseCompletion(this._content, state, this._filter);
    const status = completion.basic.complete ? 'completed' : 'incomplete';
    if (!(status === 'incomplete' && FINAL_STATUSES.indexOf(this._status) >= 0) && status !== this._status) {
      if (lms.set('cmi.core.lesson_status', status)) this._status = status;
    }
    lms.set('cmi.core.score.min', '0');
    lms.set('cmi.core.score.max', '100');
    lms.set('cmi.core.score.raw', String(completion.percentBasic));

    // The stage being played, as a hint for LMS reports; the app itself resumes from the state.
    const current = Object.keys(state.modules).filter((id) => state.modules[id].inProgress)[0];
    if (current) lms.set('cmi.core.lesson_location', current.slice(0, LOCATION_LIMIT));
  }

  /** Starts the journey over; a status the LMS already counts as done is kept. */
  public async clear(): Promise<void> {
    await this._local.clear();
    const lms = this._lms;
    if (!lms || lms.finished) return;
    lms.set('cmi.suspend_data', '');
    lms.commit();
  }

  /** Reports the session time and ends the session; safe to call twice, e.g. from pagehide and beforeunload. */
  public finish(): void {
    const lms = this._lms;
    if (!lms || lms.finished) return;
    lms.set('cmi.core.session_time', scormTimespan(this._now() - this._started));
    // "suspend" asks the LMS to keep suspend_data for the next launch instead of starting a new attempt.
    lms.set('cmi.core.exit', 'suspend');
    lms.commit();
    lms.finish();
  }
}
