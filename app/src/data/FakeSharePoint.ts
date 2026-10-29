import { RestClient, RestResponse } from './RestClient';
import { CONTENT_FILE_NAME, CONTENT_LIBRARY_URL, FEEDBACK_LIST_TITLE, PROGRESS_LIST_TITLE } from './sharepoint/names';

/**
 * A tiny in-memory imitation of the SharePoint REST endpoints the adapters
 * use. Only for tests.
 */
export class FakeSharePoint implements RestClient {
  public listExists = true;
  public feedbackListExists = false;
  public feedback: { [field: string]: unknown }[] = [];
  public items: { Id: number; Title: string; [field: string]: unknown }[] = [];
  public files: { [serverRelativeUrl: string]: string } = {};
  public requests: string[] = [];
  private _nextId = 1;

  public constructor(public readonly webUrl: string) {}

  public setContentFile(text: string): void {
    this.files[`${new URL(this.webUrl).pathname}/${CONTENT_LIBRARY_URL}/${CONTENT_FILE_NAME}`] = text;
  }

  private _respond(status: number, body?: unknown): Promise<RestResponse> {
    const text = typeof body === 'string' ? body : JSON.stringify(body === undefined ? {} : body);
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(JSON.parse(text)),
      text: () => Promise.resolve(text)
    });
  }

  private _feedbackPath(url: string): string | undefined {
    const prefix = `${this.webUrl}/_api/web/lists/getbytitle('${FEEDBACK_LIST_TITLE}')`;
    return url.indexOf(prefix) === 0 ? url.slice(prefix.length) : undefined;
  }

  private _listPath(url: string): string | undefined {
    const prefix = `${this.webUrl}/_api/web/lists/getbytitle('${PROGRESS_LIST_TITLE}')`;
    return url.indexOf(prefix) === 0 ? url.slice(prefix.length) : undefined;
  }

  public get(url: string): Promise<RestResponse> {
    this.requests.push(`GET ${url}`);
    const file = /GetFileByServerRelativePath\(decodedurl='(.*)'\)\/\$value$/.exec(url);
    if (file) {
      const text = this.files[file[1].replace(/''/g, "'")];
      return text === undefined ? this._respond(404) : this._respond(200, text);
    }
    if (this._feedbackPath(url) !== undefined) return this._respond(this.feedbackListExists ? 200 : 404, { Id: 'feedback' });
    const path = this._listPath(url);
    if (path === undefined || !this.listExists) return this._respond(404);
    if (path.indexOf('/items') === 0) {
      const match = /Title eq '([^']*)'/.exec(decodeURIComponent(path));
      return this._respond(200, { value: this.items.filter((i) => !match || i.Title === match[1]).slice(0, 1) });
    }
    return this._respond(200, { Id: 'list' });
  }

  public post(url: string, body?: unknown, headers?: { [name: string]: string }): Promise<RestResponse> {
    this.requests.push(`POST ${url} ${headers ? headers['X-HTTP-Method'] || '' : ''}`.trim());
    if (this._feedbackPath(url) === '/items' && this.feedbackListExists) {
      this.feedback.push(body as { [field: string]: unknown });
      return this._respond(201, body);
    }
    const path = this._listPath(url);
    if (path === undefined || !this.listExists) return this._respond(404);
    const itemMatch = /^\/items\((\d+)\)$/.exec(path);
    if (path === '/items') {
      const item = { Id: this._nextId++, ...(body as { Title: string }) };
      this.items.push(item);
      return this._respond(201, item);
    }
    if (itemMatch) {
      const id = Number(itemMatch[1]);
      const index = this.items.map((i) => i.Id).indexOf(id);
      if (index < 0) return this._respond(404);
      if (headers && headers['X-HTTP-Method'] === 'DELETE') this.items.splice(index, 1);
      else this.items[index] = { ...this.items[index], ...(body as object) };
      return this._respond(204, '');
    }
    return this._respond(400);
  }
}
