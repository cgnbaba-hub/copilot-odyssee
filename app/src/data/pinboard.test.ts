import { RestClient, RestResponse } from './RestClient';
import { SharePointPinboardSource } from './sharepoint/SharePointPinboardSource';

const WEB = 'https://contoso.sharepoint.com/sites/odyssee';
const POSTS = `${WEB}/_api/web/lists/getbytitle('OdysseePinnwand')`;
const LIKES = `${WEB}/_api/web/lists/getbytitle('OdysseePinnwandDaumen')`;

type Item = { [field: string]: unknown };

/** Just enough of SharePoint for the board: two lists, the current user and permissions. */
class FakeBoard implements RestClient {
  public me = 7;
  public approver = false;
  public posts: Item[] = [];
  public likes: Item[] = [];
  public posted: { url: string; body?: unknown; headers?: { [name: string]: string } }[] = [];
  private _nextId = 100;

  private _respond(status: number, body: unknown = {}): Promise<RestResponse> {
    const text = JSON.stringify(body);
    return Promise.resolve({ ok: status < 300, status, json: () => Promise.resolve(JSON.parse(text)), text: () => Promise.resolve(text) });
  }

  public get(url: string): Promise<RestResponse> {
    if (url.indexOf(`${WEB}/_api/web/currentuser`) === 0) return this._respond(200, { Id: this.me });
    if (url === `${POSTS}/EffectiveBasePermissions`) return this._respond(200, { High: '0', Low: this.approver ? '4294967295' : '1011028719' });
    if (url.indexOf(`${POSTS}/items`) === 0) return this._respond(200, { value: this.posts });
    if (url.indexOf(`${LIKES}/items`) === 0) return this._respond(200, { value: this.likes });
    if (url.indexOf(POSTS) === 0 || url.indexOf(LIKES) === 0) return this._respond(200, { Id: 'list' });
    return this._respond(404);
  }

  public post(url: string, body?: unknown, headers?: { [name: string]: string }): Promise<RestResponse> {
    this.posted.push({ url, body, headers });
    if (url === `${LIKES}/items`) {
      const like = { Id: this._nextId++, AuthorId: this.me, ...(body as Item) };
      this.likes.push(like);
      return this._respond(201, like);
    }
    if (/ValidateUpdateListItem$/.test(url)) return this._respond(200, { value: [{ FieldName: '_ModerationStatus', HasException: false }] });
    return this._respond(201, { Id: this._nextId++ });
  }
}

const item = (id: number, author: number, status: number, extra: Item = {}): Item => ({
  Id: id,
  Title: `Post ${id}`,
  OdysseePrompt: 'Fasse die Mail in drei Stichpunkten zusammen.',
  OdysseeTool: 'outlook',
  OdysseeArea: 'beratung',
  OdysseeShowName: false,
  Created: `2026-10-0${id}T08:00:00Z`,
  AuthorId: author,
  Author: { Title: `Person ${author}` },
  OData__ModerationStatus: status,
  ...extra
});

describe('SharePointPinboardSource', () => {
  it('shows approved posts, own waiting ones, likes and names only when allowed', async () => {
    const sp = new FakeBoard();
    sp.posts = [item(1, 3, 0, { OdysseeShowName: true }), item(2, 7, 2), item(3, 4, 2), item(4, 4, 0, { OdysseeTool: 'fax' })];
    sp.likes = [
      { Id: 50, Title: '1', AuthorId: 3 },
      { Id: 51, Title: '1', AuthorId: 7 },
      { Id: 52, Title: '4', AuthorId: 3 }
    ];
    const data = await new SharePointPinboardSource(sp, WEB).load();
    expect(data.canModerate).toBe(false);
    expect(data.posts.map((p) => p.id)).toEqual(['1', '2', '4']);
    const [first, own, last] = data.posts;
    expect(first).toMatchObject({ author: 'Person 3', likes: 2, liked: true, status: 'approved', tool: 'outlook', mine: false });
    expect(own).toMatchObject({ status: 'pending', mine: true, author: undefined });
    expect(last).toMatchObject({ likes: 1, liked: false, tool: 'chat' });
  });

  it('lets approvers see waiting posts and approve them', async () => {
    const sp = new FakeBoard();
    sp.approver = true;
    sp.posts = [item(3, 4, 2)];
    const source = new SharePointPinboardSource(sp, WEB);
    const data = await source.load();
    expect(data.canModerate).toBe(true);
    expect(data.posts).toHaveLength(1);
    await source.moderate('3', true);
    const call = sp.posted[sp.posted.length - 1];
    expect(call.url).toBe(`${POSTS}/items(3)/ValidateUpdateListItem`);
    expect(call.body).toEqual({ formValues: [{ FieldName: '_ModerationStatus', FieldValue: '0' }], bNewDocumentUpdate: false });
  });

  it('adds a like once and takes back only its own', async () => {
    const sp = new FakeBoard();
    sp.posts = [item(1, 3, 0)];
    sp.likes = [{ Id: 60, Title: '1', AuthorId: 7 }];
    const source = new SharePointPinboardSource(sp, WEB);
    await source.load();
    await source.setLike('1', true);
    expect(sp.posted).toHaveLength(0);
    await source.setLike('1', false);
    expect(sp.posted[0]).toMatchObject({ url: `${LIKES}/items(60)`, headers: { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' } });
    await source.setLike('1', true);
    expect(sp.posted[1]).toMatchObject({ url: `${LIKES}/items`, body: { Title: '1' } });
  });

  it('sends a new post with all its fields', async () => {
    const sp = new FakeBoard();
    await new SharePointPinboardSource(sp, WEB).add({ title: 'Angebot', prompt: 'Kürze die Mail.', tool: 'outlook', area: 'beratung', showName: true });
    expect(sp.posted[0]).toMatchObject({
      url: `${POSTS}/items`,
      body: { Title: 'Angebot', OdysseePrompt: 'Kürze die Mail.', OdysseeTool: 'outlook', OdysseeArea: 'beratung', OdysseeShowName: true }
    });
  });
});
