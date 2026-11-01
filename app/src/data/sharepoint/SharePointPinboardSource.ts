import { NewPinPost, PIN_TOOLS, PinboardData, PinboardSource, PinPost, PinStatus, PinTool } from '../../core/pinboard/pinboard';
import { odataString, RestClient, RestError } from '../RestClient';
import { PINBOARD_AREA_FIELD, PINBOARD_LIKES_LIST_TITLE, PINBOARD_LIST_TITLE, PINBOARD_PROMPT_FIELD, PINBOARD_SHOW_NAME_FIELD, PINBOARD_TOOL_FIELD } from './names';

/** Bit of the SharePoint permission "Approve items" in the low part of the permission mask. */
const APPROVE_ITEMS = 0x10;
/** The board shows the newest posts; older ones stay in the list. */
const MAX_POSTS = 500;
const MAX_LIKES = 5000;

type Item = { [field: string]: unknown };

/** SharePoint content approval: 0 approved, 1 rejected, 2 pending; drafts count as pending. */
function statusOf(value: unknown): PinStatus {
  const code = Number(value);
  if (code === 0) return 'approved';
  if (code === 1) return 'rejected';
  return 'pending';
}

function toolOf(value: unknown): PinTool {
  return PIN_TOOLS.indexOf(value as PinTool) >= 0 ? (value as PinTool) : 'chat';
}

/**
 * The board on two lists: «OdysseePinnwand» holds the posts and uses
 * SharePoint content approval, so a new post is visible only to its author
 * and the approvers until it is approved. «OdysseePinnwandDaumen» holds one
 * item per «helped me», titled with the post id; people can only remove
 * their own.
 */
export class SharePointPinboardSource implements PinboardSource {
  private _userId: number | undefined;
  /** Item ids of the current person's likes, by post id, to take one back. */
  private _myLikes: { [postId: string]: number } = {};

  public constructor(
    private readonly _client: RestClient,
    private readonly _webUrl: string
  ) {}

  private get _web(): string {
    return this._webUrl.replace(/\/$/, '');
  }

  private _listUrl(title: string): string {
    return `${this._web}/_api/web/lists/getbytitle(${odataString(title)})`;
  }

  private async _get(url: string, what: string): Promise<Item> {
    const response = await this._client.get(url);
    if (!response.ok) throw new RestError(response.status, what);
    return (await response.json()) as Item;
  }

  /** Resolves when both lists exist; rejects with a RestError otherwise. */
  public async checkLists(): Promise<void> {
    await this._get(`${this._listUrl(PINBOARD_LIST_TITLE)}?$select=Id`, `Liste ${PINBOARD_LIST_TITLE} nicht erreichbar`);
    await this._get(`${this._listUrl(PINBOARD_LIKES_LIST_TITLE)}?$select=Id`, `Liste ${PINBOARD_LIKES_LIST_TITLE} nicht erreichbar`);
  }

  private async _currentUserId(): Promise<number> {
    if (this._userId === undefined) {
      const body = await this._get(`${this._web}/_api/web/currentuser?$select=Id`, 'Angemeldete Person unbekannt');
      this._userId = Number(body.Id);
    }
    return this._userId;
  }

  private async _canModerate(): Promise<boolean> {
    const response = await this._client.get(`${this._listUrl(PINBOARD_LIST_TITLE)}/EffectiveBasePermissions`);
    if (!response.ok) return false;
    const body = (await response.json()) as { Low?: string | number; EffectiveBasePermissions?: { Low?: string | number } };
    const low = Number((body.EffectiveBasePermissions || body).Low || 0);
    return ((low >>> 0) & APPROVE_ITEMS) !== 0;
  }

  public async load(): Promise<PinboardData> {
    const fields = [
      'Id',
      'Title',
      PINBOARD_PROMPT_FIELD,
      PINBOARD_TOOL_FIELD,
      PINBOARD_AREA_FIELD,
      PINBOARD_SHOW_NAME_FIELD,
      'Created',
      'AuthorId',
      'Author/Title',
      'OData__ModerationStatus'
    ].join(',');
    const [me, canModerate, postsBody, likesBody] = await Promise.all([
      this._currentUserId(),
      this._canModerate(),
      this._get(`${this._listUrl(PINBOARD_LIST_TITLE)}/items?$select=${fields}&$expand=Author&$orderby=Created desc&$top=${MAX_POSTS}`, 'Pinnwand konnte nicht geladen werden'),
      this._get(`${this._listUrl(PINBOARD_LIKES_LIST_TITLE)}/items?$select=Id,Title,AuthorId&$top=${MAX_LIKES}`, 'Daumen konnten nicht geladen werden')
    ]);

    const counts: { [postId: string]: number } = {};
    this._myLikes = {};
    ((likesBody.value as Item[]) || []).forEach((like) => {
      const postId = String(like.Title || '');
      counts[postId] = (counts[postId] || 0) + 1;
      if (Number(like.AuthorId) === me) this._myLikes[postId] = Number(like.Id);
    });

    const posts: PinPost[] = [];
    ((postsBody.value as Item[]) || []).forEach((item) => {
      const id = String(item.Id);
      const mine = Number(item.AuthorId) === me;
      const status = statusOf(item.OData__ModerationStatus);
      // SharePoint already hides other people's waiting posts; this keeps it so if the list is set up differently.
      if (status !== 'approved' && !mine && !canModerate) return;
      const author = item.Author as { Title?: string } | undefined;
      posts.push({
        id,
        title: String(item.Title || ''),
        prompt: String(item[PINBOARD_PROMPT_FIELD] || ''),
        tool: toolOf(item[PINBOARD_TOOL_FIELD]),
        area: item[PINBOARD_AREA_FIELD] ? String(item[PINBOARD_AREA_FIELD]) : undefined,
        author: item[PINBOARD_SHOW_NAME_FIELD] === true && author && author.Title ? author.Title : undefined,
        created: String(item.Created || ''),
        status,
        mine,
        likes: counts[id] || 0,
        liked: this._myLikes[id] !== undefined
      });
    });
    return { posts, canModerate };
  }

  public async add(post: NewPinPost): Promise<void> {
    const response = await this._client.post(`${this._listUrl(PINBOARD_LIST_TITLE)}/items`, {
      Title: post.title,
      [PINBOARD_PROMPT_FIELD]: post.prompt,
      [PINBOARD_TOOL_FIELD]: post.tool,
      [PINBOARD_AREA_FIELD]: post.area || '',
      [PINBOARD_SHOW_NAME_FIELD]: post.showName
    });
    if (!response.ok) throw new RestError(response.status, 'Prompt konnte nicht geteilt werden');
  }

  public async setLike(postId: string, liked: boolean): Promise<void> {
    const list = this._listUrl(PINBOARD_LIKES_LIST_TITLE);
    const existing = this._myLikes[postId];
    if (liked) {
      if (existing !== undefined) return;
      const response = await this._client.post(`${list}/items`, { Title: postId });
      if (!response.ok) throw new RestError(response.status, 'Daumen konnte nicht gespeichert werden');
      this._myLikes[postId] = Number(((await response.json()) as Item).Id);
      return;
    }
    if (existing === undefined) return;
    const response = await this._client.post(`${list}/items(${existing})`, undefined, { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' });
    if (!response.ok) throw new RestError(response.status, 'Daumen konnte nicht entfernt werden');
    delete this._myLikes[postId];
  }

  public async moderate(postId: string, approve: boolean): Promise<void> {
    const response = await this._client.post(`${this._listUrl(PINBOARD_LIST_TITLE)}/items(${Number(postId)})/ValidateUpdateListItem`, {
      formValues: [{ FieldName: '_ModerationStatus', FieldValue: approve ? '0' : '1' }],
      bNewDocumentUpdate: false
    });
    if (!response.ok) throw new RestError(response.status, 'Freigabe fehlgeschlagen');
    const body = (await response.json()) as { value?: { HasException?: boolean; ErrorMessage?: string }[] };
    const failed = (body.value || []).filter((field) => field.HasException)[0];
    if (failed) throw new RestError(400, failed.ErrorMessage || 'Freigabe fehlgeschlagen');
  }
}
