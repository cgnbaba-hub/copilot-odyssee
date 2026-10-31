import { PlayerState } from './state';
import { ProgressStore } from './store';

/**
 * Collects quick successive saves into one write, so a stage with many
 * steps does not send a request per click. The latest state always wins.
 */
/** What the player sees about saving: waiting, writing, done or failed. */
export type SaveStatus = 'pending' | 'saving' | 'saved' | 'error';

export class DebouncedProgressStore implements ProgressStore {
  private _pending: PlayerState | undefined;
  private _listeners: ((status: SaveStatus) => void)[] = [];
  private _timer: number | undefined;
  private _writing: Promise<void> = Promise.resolve();

  public constructor(
    private readonly _inner: ProgressStore,
    private readonly _delayMs: number
  ) {}

  public load(): Promise<PlayerState | undefined> {
    return this._inner.load();
  }

  /** Tells the listener whenever the save status changes; returns a function to stop listening. */
  public subscribe(listener: (status: SaveStatus) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener);
    };
  }

  private _emit(status: SaveStatus): void {
    this._listeners.forEach((l) => l(status));
  }

  public save(state: PlayerState): Promise<void> {
    this._pending = state;
    this._emit('pending');
    if (this._timer !== undefined) window.clearTimeout(this._timer);
    this._timer = window.setTimeout(() => {
      this.flush().catch(() => undefined);
    }, this._delayMs);
    return Promise.resolve();
  }

  /** Writes a pending state right away, e.g. before the page is left. */
  public flush(): Promise<void> {
    if (this._timer !== undefined) {
      window.clearTimeout(this._timer);
      this._timer = undefined;
    }
    const state = this._pending;
    this._pending = undefined;
    if (!state) return this._writing;
    // Writes run one after another so an older state never overtakes a newer one.
    this._emit('saving');
    this._writing = this._writing.catch(() => undefined).then(() => this._inner.save(state));
    this._writing.then(
      () => {
        // A newer state may already be waiting; then the status stays at pending.
        if (!this._pending) this._emit('saved');
      },
      () => this._emit('error')
    );
    return this._writing;
  }

  public clear(): Promise<void> {
    if (this._timer !== undefined) window.clearTimeout(this._timer);
    this._timer = undefined;
    this._pending = undefined;
    return this._writing.catch(() => undefined).then(() => this._inner.clear());
  }
}
