import { RestClient, RestResponse } from './RestClient';
import { SharePointRegattaSource } from './sharepoint/SharePointRegattaSource';

const WEB = 'https://contoso.sharepoint.com/sites/odyssee';
const LIST = `${WEB}/_api/web/lists/getbytitle('OdysseeRegatta')`;
const WEEK = '2026-11-09';

type Item = { [field: string]: unknown };

/** Just enough of SharePoint for the regatta: one list, read in pages. */
class FakeRegatta implements RestClient {
  public exists = true;
  public items: Item[] = [];
  public pageSize = 100;
  public posted: { url: string; body?: unknown; headers?: { [name: string]: string } }[] = [];
  private _nextId = 100;

  private _respond(status: number, body: unknown = {}): Promise<RestResponse> {
    const text = JSON.stringify(body);
    return Promise.resolve({ ok: status < 300, status, json: () => Promise.resolve(JSON.parse(text)), text: () => Promise.resolve(text) });
  }

  public get(url: string): Promise<RestResponse> {
    if (!this.exists || url.indexOf(LIST) !== 0) return this._respond(404);
    const path = url.slice(LIST.length);
    if (path.indexOf('/items') !== 0) return this._respond(200, { Id: 'list' });
    const own = /Title eq '([^']*)'/.exec(decodeURIComponent(path));
    if (own) return this._respond(200, { value: this.items.filter((i) => i.Title === own[1]).slice(0, 1) });
    const skip = Number((/skip=(\d+)/.exec(path) || ['', '0'])[1]);
    const next = skip + this.pageSize < this.items.length ? `${LIST}/items?skip=${skip + this.pageSize}` : undefined;
    return this._respond(200, { value: this.items.slice(skip, skip + this.pageSize), 'odata.nextLink': next });
  }

  public post(url: string, body?: unknown, headers?: { [name: string]: string }): Promise<RestResponse> {
    this.posted.push({ url, body, headers });
    const id = /items\((\d+)\)$/.exec(url);
    if (id && headers && headers['X-HTTP-Method'] === 'DELETE') {
      this.items = this.items.filter((i) => i.Id !== Number(id[1]));
      return this._respond(204);
    }
    if (id) {
      const item = this.items.filter((i) => i.Id === Number(id[1]))[0];
      if (!item) return this._respond(404);
      Object.assign(item, body);
      return this._respond(204);
    }
    const item = { Id: this._nextId++, Author: { Title: 'Ich Selbst' }, ...(body as Item) };
    this.items.push(item);
    return this._respond(201, item);
  }
}

const line = (id: number, key: string, miles: number, extra: Item = {}): Item => ({
  Id: id,
  Title: key,
  OdysseeArea: 'beratung',
  OdysseeMiles: miles,
  OdysseeWeek: WEEK,
  OdysseeWeekStart: miles - 50,
  OdysseeCompass: false,
  OdysseeShowName: false,
  Author: { Title: `Person ${id}` },
  ...extra
});

describe('SharePointRegattaSource', () => {
  it('rejects when the list is missing', async () => {
    const sp = new FakeRegatta();
    await expect(new SharePointRegattaSource(sp, WEB, 'me').checkList()).resolves.toBeUndefined();
    sp.exists = false;
    await expect(new SharePointRegattaSource(sp, WEB, 'me').checkList()).rejects.toThrow('OdysseeRegatta');
  });

  it('reads all pages, shows names only when chosen and marks the own line', async () => {
    const sp = new FakeRegatta();
    sp.pageSize = 2;
    sp.items = [
      line(1, 'a', 300, { OdysseeShowName: true, OdysseeCompass: true }),
      line(2, 'me', 200),
      line(3, 'c', 100, { OdysseeArea: '', OdysseeWeek: '' }),
      line(4, 'a', 120),
      line(5, '', 999)
    ];
    const entries = await new SharePointRegattaSource(sp, WEB, 'me').load();
    expect(entries).toEqual([
      { area: 'beratung', miles: 300, week: WEEK, weekStart: 250, compass: true, name: 'Person 1', mine: false },
      { area: 'beratung', miles: 200, week: WEEK, weekStart: 150, compass: false, name: undefined, mine: true },
      { area: undefined, miles: 100, week: undefined, weekStart: 50, compass: false, name: undefined, mine: false }
    ]);
  });

  it('creates the own line once, then updates it and keeps the start of the week', async () => {
    const sp = new FakeRegatta();
    const source = new SharePointRegattaSource(sp, WEB, 'me');
    await source.report({ area: 'marketing', miles: 400, compass: false, showName: false, week: WEEK });
    expect(sp.posted[0]).toEqual({
      url: `${LIST}/items`,
      body: { Title: 'me', OdysseeArea: 'marketing', OdysseeMiles: 400, OdysseeWeek: WEEK, OdysseeWeekStart: 400, OdysseeCompass: false, OdysseeShowName: false },
      headers: undefined
    });
    await source.report({ area: 'marketing', miles: 460, compass: true, showName: true, week: WEEK });
    expect(sp.posted[1]).toEqual({
      url: `${LIST}/items(100)`,
      body: { OdysseeArea: 'marketing', OdysseeMiles: 460, OdysseeWeek: WEEK, OdysseeWeekStart: 400, OdysseeCompass: true, OdysseeShowName: true },
      headers: { 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' }
    });
    expect(sp.items).toHaveLength(1);
  });

  it('starts a new week from the miles of the line found', async () => {
    const sp = new FakeRegatta();
    sp.items = [line(7, 'me', 500, { OdysseeWeek: '2026-11-02', OdysseeWeekStart: 100 })];
    await new SharePointRegattaSource(sp, WEB, 'me').report({ miles: 530, compass: false, showName: false, week: WEEK });
    expect(sp.posted[0]).toMatchObject({ url: `${LIST}/items(7)`, body: { OdysseeArea: '', OdysseeMiles: 530, OdysseeWeek: WEEK, OdysseeWeekStart: 500 } });
  });

  it('looks the line up again when it was removed elsewhere', async () => {
    const sp = new FakeRegatta();
    const source = new SharePointRegattaSource(sp, WEB, 'me');
    const report = { miles: 10, compass: false, showName: false, week: WEEK };
    await source.report(report);
    sp.items = [];
    await expect(source.report(report)).rejects.toThrow();
    await source.report(report);
    expect(sp.items).toHaveLength(1);
  });

  it('removes every line of the person when they leave', async () => {
    const sp = new FakeRegatta();
    sp.items = [line(1, 'a', 300), line(2, 'me', 200), line(3, 'me', 180)];
    const source = new SharePointRegattaSource(sp, WEB, 'me');
    await source.leave();
    expect(sp.items.map((i) => i.Id)).toEqual([1]);
    await source.leave();
    expect(sp.posted).toHaveLength(2);
  });
});
