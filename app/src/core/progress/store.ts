import { PlayerState } from './state';

/** Where the player's progress is kept. SharePoint follows in AP 1.4. */
export interface ProgressStore {
  load(): Promise<PlayerState | undefined>;
  save(state: PlayerState): Promise<void>;
  clear(): Promise<void>;
}

function isPlayerState(value: unknown): value is PlayerState {
  return !!value && typeof value === 'object' && (value as PlayerState).version === 1;
}

/**
 * Keeps progress in the browser's localStorage. Storage can be unavailable
 * (private windows, blocked site data); the game then simply starts fresh.
 */
export class LocalStorageProgressStore implements ProgressStore {
  public constructor(private readonly _key: string) {}

  public load(): Promise<PlayerState | undefined> {
    try {
      const raw = window.localStorage.getItem(this._key);
      const parsed: unknown = raw ? JSON.parse(raw) : undefined;
      return Promise.resolve(isPlayerState(parsed) ? parsed : undefined);
    } catch {
      return Promise.resolve(undefined);
    }
  }

  public save(state: PlayerState): Promise<void> {
    try {
      window.localStorage.setItem(this._key, JSON.stringify(state));
    } catch {
      // Progress is then kept only for this session.
    }
    return Promise.resolve();
  }

  public clear(): Promise<void> {
    try {
      window.localStorage.removeItem(this._key);
    } catch {
      // Nothing stored that could be removed.
    }
    return Promise.resolve();
  }
}

export class MemoryProgressStore implements ProgressStore {
  private _state: PlayerState | undefined;

  public load(): Promise<PlayerState | undefined> {
    return Promise.resolve(this._state);
  }

  public save(state: PlayerState): Promise<void> {
    this._state = state;
    return Promise.resolve();
  }

  public clear(): Promise<void> {
    this._state = undefined;
    return Promise.resolve();
  }
}
