import { RegattaEntry, RegattaReport, RegattaSource, weekStartFor } from '../../core/regatta/regatta';
import { odataString, RestClient, RestError } from '../RestClient';
import { REGATTA_AREA_FIELD, REGATTA_COMPASS_FIELD, REGATTA_LIST_TITLE, REGATTA_MILES_FIELD, REGATTA_SHOW_NAME_FIELD, REGATTA_WEEK_FIELD, REGATTA_WEEK_START_FIELD } from './names';

/** Never read more than this many lines, so a mistake cannot load forever. */
const MAX_ITEMS = 20000;
const PAGE_SIZE = 2000;

type Item = { [field: string]: unknown };

interface Page {
  value?: Item[];
  'odata.nextLink'?: string;
  '@odata.nextLink'?: string;
}

interface OwnLine {
  id: number;
  miles: number;
  week?: string;
  weekStart: number;
}

function numberOf(value: unknown): number {
  const n = Number(value);
  return isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/**
 * The regatta on the list «OdysseeRegatta»: one line per person who takes
 * part, titled with the person's pseudonymous key. Everyone can read all
 * lines, so the app can rank them, and change only their own. The line holds
 * the area, the miles and whether the compass course is done, nothing else
 * from the saved game.
 */
export class SharePointRegattaSource implements RegattaSource {
  /** The person's line once looked up; null when there is none. */
  private _own: OwnLine | null | undefined;

  public constructor(
    private readonly _client: RestClient,
    private readonly _webUrl: string,
    private readonly _playerKey: string
  ) {}

  private get _listUrl(): string {
    return `${this._webUrl.replace(/\/$/, '')}/_api/web/lists/getbytitle(${odataString(REGATTA_LIST_TITLE)})`;
  }

  /** Resolves when the list exists; rejects with a RestError otherwise. */
  public async checkList(): Promise<void> {
    const response = await this._client.get(`${this._listUrl}?$select=Id`);
    if (!response.ok) throw new RestError(response.status, `Liste ${REGATTA_LIST_TITLE} nicht erreichbar`);
  }

  private _ownLine(item: Item): OwnLine {
    return {
      id: Number(item.Id),
      miles: numberOf(item[REGATTA_MILES_FIELD]),
      week: item[REGATTA_WEEK_FIELD] ? String(item[REGATTA_WEEK_FIELD]) : undefined,
      weekStart: numberOf(item[REGATTA_WEEK_START_FIELD])
    };
  }

  private async _findOwn(): Promise<OwnLine | null> {
    const filter = encodeURIComponent(`Title eq ${odataString(this._playerKey)}`);
    const fields = ['Id', REGATTA_MILES_FIELD, REGATTA_WEEK_FIELD, REGATTA_WEEK_START_FIELD].join(',');
    const response = await this._client.get(`${this._listUrl}/items?$select=${fields}&$filter=${filter}&$top=1`);
    if (!response.ok) throw new RestError(response.status, 'Regatta-Eintrag konnte nicht gelesen werden');
    const body = (await response.json()) as Page;
    const item = body.value && body.value[0];
    this._own = item ? this._ownLine(item) : null;
    return this._own;
  }

  public async load(): Promise<RegattaEntry[]> {
    const fields = [
      'Id',
      'Title',
      REGATTA_AREA_FIELD,
      REGATTA_MILES_FIELD,
      REGATTA_WEEK_FIELD,
      REGATTA_WEEK_START_FIELD,
      REGATTA_COMPASS_FIELD,
      REGATTA_SHOW_NAME_FIELD,
      'Author/Title'
    ].join(',');
    const items: Item[] = [];
    let url: string | undefined = `${this._listUrl}/items?$select=${fields}&$expand=Author&$top=${PAGE_SIZE}`;
    while (url && items.length < MAX_ITEMS) {
      const response = await this._client.get(url);
      if (!response.ok) throw new RestError(response.status, 'Regatta konnte nicht geladen werden');
      const page = (await response.json()) as Page;
      items.push(...(page.value || []));
      url = page['odata.nextLink'] || page['@odata.nextLink'];
    }

    // Two browser windows can create a second line for the same person; the one further ahead counts.
    const byKey: { [key: string]: RegattaEntry } = {};
    items.forEach((item) => {
      const key = String(item.Title || '');
      if (!key) return;
      const author = item.Author as { Title?: string } | undefined;
      const entry: RegattaEntry = {
        area: item[REGATTA_AREA_FIELD] ? String(item[REGATTA_AREA_FIELD]) : undefined,
        miles: numberOf(item[REGATTA_MILES_FIELD]),
        week: item[REGATTA_WEEK_FIELD] ? String(item[REGATTA_WEEK_FIELD]) : undefined,
        weekStart: numberOf(item[REGATTA_WEEK_START_FIELD]),
        compass: item[REGATTA_COMPASS_FIELD] === true,
        name: item[REGATTA_SHOW_NAME_FIELD] === true && author && author.Title ? author.Title : undefined,
        mine: key === this._playerKey
      };
      if (!byKey[key] || entry.miles > byKey[key].miles) byKey[key] = entry;
    });
    return Object.keys(byKey).map((key) => byKey[key]);
  }

  public async report(report: RegattaReport): Promise<void> {
    const own = this._own === undefined ? await this._findOwn() : this._own;
    const weekStart = weekStartFor(own || undefined, report);
    const fields: Item = {
      [REGATTA_AREA_FIELD]: report.area || '',
      [REGATTA_MILES_FIELD]: report.miles,
      [REGATTA_WEEK_FIELD]: report.week,
      [REGATTA_WEEK_START_FIELD]: weekStart,
      [REGATTA_COMPASS_FIELD]: report.compass,
      [REGATTA_SHOW_NAME_FIELD]: report.showName
    };
    if (!own) {
      const response = await this._client.post(`${this._listUrl}/items`, { Title: this._playerKey, ...fields });
      if (!response.ok) throw new RestError(response.status, 'Regatta-Eintrag konnte nicht angelegt werden');
      this._own = { id: Number(((await response.json()) as Item).Id), miles: report.miles, week: report.week, weekStart };
      return;
    }
    const response = await this._client.post(`${this._listUrl}/items(${own.id})`, fields, { 'X-HTTP-Method': 'MERGE', 'IF-MATCH': '*' });
    if (!response.ok) {
      // The line may have been removed elsewhere; the next report looks it up again.
      this._own = undefined;
      throw new RestError(response.status, 'Regatta-Eintrag konnte nicht gespeichert werden');
    }
    this._own = { id: own.id, miles: report.miles, week: report.week, weekStart };
  }

  public async leave(): Promise<void> {
    // Removes every line of the person, also a second one from another window.
    for (let own = await this._findOwn(); own; own = await this._findOwn()) {
      const response = await this._client.post(`${this._listUrl}/items(${own.id})`, undefined, { 'X-HTTP-Method': 'DELETE', 'IF-MATCH': '*' });
      if (!response.ok) throw new RestError(response.status, 'Regatta-Eintrag konnte nicht entfernt werden');
    }
  }
}
