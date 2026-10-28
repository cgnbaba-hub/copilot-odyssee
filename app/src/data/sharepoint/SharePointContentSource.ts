import { ContentBundle } from '../../core/content/types';
import { ContentSource, parseContentFile } from '../content';
import { RestClient, RestError } from '../RestClient';
import { CONTENT_FILE_NAME, CONTENT_LIBRARY_URL } from './names';

/** Reads the content file that provisioning/Publish-OdysseeContent.ps1 uploads. */
export class SharePointContentSource implements ContentSource {
  public constructor(
    private readonly _client: RestClient,
    private readonly _webUrl: string
  ) {}

  public async load(): Promise<ContentBundle> {
    const web = this._webUrl.replace(/\/$/, '');
    const fileUrl = `${new URL(web).pathname.replace(/\/$/, '')}/${CONTENT_LIBRARY_URL}/${CONTENT_FILE_NAME}`;
    const response = await this._client.get(`${web}/_api/web/GetFileByServerRelativePath(decodedurl='${fileUrl.replace(/'/g, "''")}')/$value`);
    if (!response.ok) throw new RestError(response.status, `${CONTENT_FILE_NAME} nicht gefunden`);
    return parseContentFile(JSON.parse(await response.text()));
  }
}
