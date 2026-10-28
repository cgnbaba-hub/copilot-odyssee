/**
 * The few HTTP calls the SharePoint adapters need. The web part implements
 * it with SPHttpClient (which adds authentication and request digests);
 * tests use a fake.
 */
export interface RestResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface RestClient {
  get(url: string): Promise<RestResponse>;
  /** `body` is sent as JSON when given. */
  post(url: string, body?: unknown, headers?: { [name: string]: string }): Promise<RestResponse>;
}

export class RestError extends Error {
  public constructor(public readonly status: number, message: string) {
    super(message);
    // Keeps instanceof working when compiled to ES5.
    Object.setPrototypeOf(this, RestError.prototype);
  }
}

/** Escapes a value for use inside a single-quoted OData string. */
export function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}
