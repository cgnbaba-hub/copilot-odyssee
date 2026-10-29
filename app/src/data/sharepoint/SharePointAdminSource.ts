import { AdminSource } from '../../core/admin/source';
import { AdminData, FeedbackRecord, PlayerRecord } from '../../core/admin/stats';
import { PlayerState } from '../../core/progress/state';
import { odataString, RestClient, RestError } from '../RestClient';
import { FEEDBACK_CONTEXT_FIELD, FEEDBACK_LIST_TITLE, FEEDBACK_MESSAGE_FIELD, FEEDBACK_PROFILE_FIELD, PROGRESS_LIST_TITLE, PROGRESS_STATE_FIELD } from './names';

/** Bit of the SharePoint permission "Manage lists" in the low part of the permission mask. */
const MANAGE_LISTS = 0x800;
/** Never read more than this many entries, so a mistake cannot load forever. */
const MAX_ITEMS = 20000;

interface Page {
  value?: { [field: string]: unknown }[];
  'odata.nextLink'?: string;
  '@odata.nextLink'?: string;
}

/**
 * Reads all progress and feedback entries. Participants only see their own
 * entries in these lists; people who manage the lists (site owners) see all,
 * so only they get this source.
 */
export class SharePointAdminSource implements AdminSource {
  public constructor(
    private readonly _client: RestClient,
    private readonly _webUrl: string
  ) {}

  private _listUrl(title: string): string {
    return `${this._webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle(${odataString(title)})`;
  }

  /** Whether the current person may see every entry of the progress list. */
  public async isAllowed(): Promise<boolean> {
    const response = await this._client.get(`${this._listUrl(PROGRESS_LIST_TITLE)}/EffectiveBasePermissions`);
    if (!response.ok) return false;
    const body = (await response.json()) as { Low?: string | number; EffectiveBasePermissions?: { Low?: string | number } };
    const low = Number((body.EffectiveBasePermissions || body).Low || 0);
    // The mask is a 32-bit unsigned number; >>> 0 keeps the bit test unsigned.
    return ((low >>> 0) & MANAGE_LISTS) !== 0;
  }

  private async _readAll(firstUrl: string): Promise<{ [field: string]: unknown }[]> {
    const items: { [field: string]: unknown }[] = [];
    let url: string | undefined = firstUrl;
    while (url && items.length < MAX_ITEMS) {
      const response = await this._client.get(url);
      if (!response.ok) throw new RestError(response.status, 'Einträge konnten nicht gelesen werden');
      const page = (await response.json()) as Page;
      items.push(...(page.value || []));
      url = page['odata.nextLink'] || page['@odata.nextLink'];
    }
    return items;
  }

  public async load(): Promise<AdminData> {
    const progressItems = await this._readAll(`${this._listUrl(PROGRESS_LIST_TITLE)}/items?$select=Id,${PROGRESS_STATE_FIELD},Modified&$top=2000`);
    const players: PlayerRecord[] = [];
    progressItems.forEach((item) => {
      const raw = item[PROGRESS_STATE_FIELD];
      if (typeof raw !== 'string') return;
      try {
        const state = JSON.parse(raw) as PlayerState;
        if (state && state.version === 1) players.push({ state, modified: typeof item.Modified === 'string' ? item.Modified : undefined });
      } catch {
        // A damaged entry is left out of the figures.
      }
    });

    let feedback: FeedbackRecord[] = [];
    try {
      const fields = `Title,${FEEDBACK_MESSAGE_FIELD},${FEEDBACK_CONTEXT_FIELD},${FEEDBACK_PROFILE_FIELD},Created`;
      const feedbackItems = await this._readAll(`${this._listUrl(FEEDBACK_LIST_TITLE)}/items?$select=${fields}&$orderby=Created desc&$top=500`);
      feedback = feedbackItems.map((item) => ({
        kind: String(item.Title || ''),
        message: String(item[FEEDBACK_MESSAGE_FIELD] || ''),
        context: item[FEEDBACK_CONTEXT_FIELD] ? String(item[FEEDBACK_CONTEXT_FIELD]) : undefined,
        profile: item[FEEDBACK_PROFILE_FIELD] ? String(item[FEEDBACK_PROFILE_FIELD]) : undefined,
        created: String(item.Created || '')
      }));
    } catch {
      // Without the feedback list the view simply shows no feedback.
    }
    return { players, feedback };
  }
}
