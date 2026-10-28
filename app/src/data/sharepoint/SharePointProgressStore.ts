import { PlayerState } from '../../core/progress/state';
import { ProgressStore } from '../../core/progress/store';
import { odataString, RestClient, RestError } from '../RestClient';
import { PROGRESS_LIST_TITLE, PROGRESS_STATE_FIELD } from './names';

interface ProgressItem {
  Id: number;
  [field: string]: unknown;
}

/**
 * Keeps each player's state as one item in the progress list. The item
 * title is the player's pseudonymous key; list permissions let every user
 * read and edit only the items they created.
 */
export class SharePointProgressStore implements ProgressStore {
  private _itemId: number | undefined;

  public constructor(
    private readonly _client: RestClient,
    private readonly _webUrl: string,
    private readonly _playerKey: string
  ) {}

  private get _listUrl(): string {
    return `${this._webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle(${odataString(PROGRESS_LIST_TITLE)})`;
  }

  /** Resolves when the list exists; rejects with a RestError (404) otherwise. */
  public async checkList(): Promise<void> {
    const response = await this._client.get(`${this._listUrl}?$select=Id`);
    if (!response.ok) throw new RestError(response.status, `Liste ${PROGRESS_LIST_TITLE} nicht erreichbar`);
  }

  private async _findItem(): Promise<ProgressItem | undefined> {
    const filter = encodeURIComponent(`Title eq ${odataString(this._playerKey)}`);
    const response = await this._client.get(`${this._listUrl}/items?$select=Id,${PROGRESS_STATE_FIELD}&$filter=${filter}&$top=1`);
    if (!response.ok) throw new RestError(response.status, 'Fortschritt konnte nicht geladen werden');
    const body = (await response.json()) as { value?: ProgressItem[] };
    const item = body.value && body.value[0];
    this._itemId = item ? item.Id : undefined;
    return item;
  }

  public async load(): Promise<PlayerState | undefined> {
    const item = await this._findItem();
    const raw = item && item[PROGRESS_STATE_FIELD];
    if (typeof raw !== 'string') return undefined;
    try {
      const state = JSON.parse(raw) as PlayerState;
      return state && state.version === 1 ? state : undefined;
    } catch {
      return undefined;
    }
  }

  public async save(state: PlayerState): Promise<void> {
    if (this._itemId === undefined) await this._findItem();

    const fields: { [name: string]: string } = { [PROGRESS_STATE_FIELD]: JSON.stringify(state) };
    if (this._itemId === undefined) {
      const response = await this._client.post(`${this._listUrl}/items`, { Title: this._playerKey, ...fields });
      if (!response.ok) throw new RestError(response.status, 'Fortschritt konnte nicht angelegt werden');
      this._itemId = ((await response.json()) as ProgressItem).Id;
      return;
    }

    const response = await this._client.post(`${this._listUrl}/items(${this._itemId})`, fields, { 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' });
    if (!response.ok) throw new RestError(response.status, 'Fortschritt konnte nicht gespeichert werden');
  }

  public async clear(): Promise<void> {
    if (this._itemId === undefined) await this._findItem();
    if (this._itemId === undefined) return;
    const response = await this._client.post(`${this._listUrl}/items(${this._itemId})`, undefined, { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' });
    if (!response.ok) throw new RestError(response.status, 'Fortschritt konnte nicht gelöscht werden');
    this._itemId = undefined;
  }
}
