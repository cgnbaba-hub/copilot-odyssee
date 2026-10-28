import { SPHttpClient } from '@microsoft/sp-http';

import { RestClient, RestResponse } from '../../data/RestClient';

const JSON_HEADERS = {
  Accept: 'application/json;odata=nometadata',
  'Content-Type': 'application/json;odata=nometadata'
};

/** RestClient on top of SPHttpClient, which handles sign-in and request digests. */
export class SpRestClient implements RestClient {
  public constructor(private readonly _http: SPHttpClient) {}

  public get(url: string): Promise<RestResponse> {
    return this._http.get(url, SPHttpClient.configurations.v1, { headers: { Accept: JSON_HEADERS.Accept } });
  }

  public post(url: string, body?: unknown, headers?: { [name: string]: string }): Promise<RestResponse> {
    return this._http.post(url, SPHttpClient.configurations.v1, {
      headers: { ...JSON_HEADERS, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }
}
