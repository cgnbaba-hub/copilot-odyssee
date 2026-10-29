import { FeedbackEntry, FeedbackKind, FeedbackSender } from '../../core/feedback/feedback';
import { odataString, RestClient, RestError } from '../RestClient';
import { FEEDBACK_CONTEXT_FIELD, FEEDBACK_LIST_TITLE, FEEDBACK_MESSAGE_FIELD, FEEDBACK_PROFILE_FIELD } from './names';

/** Titles as the team reads them in the list. */
const KIND_TITLES: Record<FeedbackKind, string> = {
  idea: 'Idee oder Wunsch',
  problem: 'Etwas funktioniert nicht',
  content: 'Inhalt falsch oder unklar',
  praise: 'Lob'
};

/**
 * Adds each piece of feedback as an item to the feedback list. SharePoint
 * records who wrote it; list permissions let participants add items but
 * only the site owners read all of them.
 */
export class SharePointFeedbackSender implements FeedbackSender {
  public constructor(
    private readonly _client: RestClient,
    private readonly _webUrl: string
  ) {}

  private get _listUrl(): string {
    return `${this._webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle(${odataString(FEEDBACK_LIST_TITLE)})`;
  }

  /** Resolves when the list exists; rejects with a RestError otherwise. */
  public async checkList(): Promise<void> {
    const response = await this._client.get(`${this._listUrl}?$select=Id`);
    if (!response.ok) throw new RestError(response.status, `Liste ${FEEDBACK_LIST_TITLE} nicht erreichbar`);
  }

  public async send(entry: FeedbackEntry): Promise<void> {
    const profile = [entry.lang, entry.license, entry.area].filter((x) => !!x).join(' · ');
    const response = await this._client.post(`${this._listUrl}/items`, {
      Title: KIND_TITLES[entry.kind],
      [FEEDBACK_MESSAGE_FIELD]: entry.message,
      [FEEDBACK_CONTEXT_FIELD]: (entry.context || '').slice(0, 255),
      [FEEDBACK_PROFILE_FIELD]: profile.slice(0, 255)
    });
    if (!response.ok) throw new RestError(response.status, 'Feedback konnte nicht gesendet werden');
  }
}
