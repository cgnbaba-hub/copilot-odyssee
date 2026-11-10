/**
 * The SCORM 1.2 runtime: the LMS puts an object named `API` on the window
 * that opens the course (a parent frame or the opener of a pop-up). The page
 * must also run without it, e.g. opened straight from the disk, so nothing
 * here ever throws.
 */

/** The calls of the SCORM 1.2 API object; every value is a string. */
export interface Scorm12Api {
  LMSInitialize(arg: string): string;
  LMSFinish(arg: string): string;
  LMSGetValue(element: string): string;
  LMSSetValue(element: string, value: string): string;
  LMSCommit(arg: string): string;
  LMSGetLastError?(): string;
}

/** The part of a window the lookup needs, so tests can pass plain objects. */
export interface ApiWindow {
  API?: unknown;
  /** The top window is its own parent. */
  parent?: ApiWindow;
  /** Null in a real window that was not opened as a pop-up. */
  opener?: ApiWindow;
}

/** SCORM tells LMSs to place the API at most a few frames up; 10 is the usual safety limit. */
const MAX_PARENTS = 10;

function apiOf(win: ApiWindow): Scorm12Api | undefined {
  // Reading from a frame of another origin throws; that frame simply has no API for us.
  try {
    const api = win.API as Partial<Scorm12Api> | undefined;
    return api && typeof api.LMSInitialize === 'function' && typeof api.LMSGetValue === 'function' ? (api as Scorm12Api) : undefined;
  } catch {
    return undefined;
  }
}

function searchUp(start: ApiWindow): Scorm12Api | undefined {
  let win: ApiWindow | undefined = start;
  for (let level = 0; win && level <= MAX_PARENTS; level++) {
    const api = apiOf(win);
    if (api) return api;
    let parent: ApiWindow | undefined;
    try {
      parent = win.parent;
    } catch {
      parent = undefined;
    }
    // The top window is its own parent.
    if (!parent || parent === win) return undefined;
    win = parent;
  }
  return undefined;
}

/** Looks for the API in the window and its parents, then in the opener of a pop-up and its parents. */
export function findScormApi(win: ApiWindow): Scorm12Api | undefined {
  const found = searchUp(win);
  if (found) return found;
  let opener: ApiWindow | undefined;
  try {
    opener = win.opener;
  } catch {
    opener = undefined;
  }
  return opener ? searchUp(opener) : undefined;
}

/**
 * A session with the LMS. Calls after `finish()` are ignored: the LMS
 * no longer accepts them and some show an error for each one.
 */
export class ScormConnection {
  private _finished: boolean = false;

  public constructor(private readonly _api: Scorm12Api) {}

  /** Starts the session; the result is only informative, since some LMSs answer "false" when already initialised. */
  public initialize(): boolean {
    return this._call(() => this._api.LMSInitialize(''));
  }

  /** The stored value, or an empty string when the LMS has none or fails. */
  public get(element: string): string {
    if (this._finished) return '';
    try {
      const value = this._api.LMSGetValue(element);
      return typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value);
    } catch {
      return '';
    }
  }

  public set(element: string, value: string): boolean {
    return !this._finished && this._call(() => this._api.LMSSetValue(element, value));
  }

  public commit(): boolean {
    return !this._finished && this._call(() => this._api.LMSCommit(''));
  }

  public get finished(): boolean {
    return this._finished;
  }

  /** Ends the session; safe to call more than once. */
  public finish(): boolean {
    if (this._finished) return false;
    this._finished = true;
    return this._call(() => this._api.LMSFinish(''));
  }

  private _call(call: () => unknown): boolean {
    try {
      return String(call()) === 'true';
    } catch {
      return false;
    }
  }
}

/** Finds the LMS and starts a session; undefined outside an LMS, so the page still runs. */
export function connectScorm(win: ApiWindow): ScormConnection | undefined {
  const api = findScormApi(win);
  if (!api) return undefined;
  const connection = new ScormConnection(api);
  connection.initialize();
  return connection;
}
