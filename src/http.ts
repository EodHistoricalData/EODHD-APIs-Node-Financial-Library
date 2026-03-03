import {
  EODHDError,
  EODHDAuthError,
  EODHDRateLimitError,
  EODHDNetworkError,
  EODHDTimeoutError,
} from './errors.js';
import { type Logger, NO_OP_LOGGER, redactUrl } from './logger.js';

export type { ErrorCode } from './errors.js';
export { EODHDError, EODHDAuthError, EODHDRateLimitError, EODHDNetworkError, EODHDTimeoutError };

export interface HttpClientConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
  logger?: Logger;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params = Record<string, any>;

export class HttpClient {
  private readonly logger: Logger;

  constructor(private config: HttpClientConfig) {
    this.logger = config.logger ?? NO_OP_LOGGER;
  }

  async get<T = unknown>(path: string, params: Params = {}): Promise<T> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken, fmt: 'json' });
    const redacted = redactUrl(url.toString());
    this.logger.debug(`GET ${redacted}`);
    const start = Date.now();
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout),
      });
    } catch (err) {
      throw wrapFetchError(err);
    }
    this.logger.debug(`${response.status} ${redacted} (${Date.now() - start}ms)`);
    if (!response.ok) {
      await this.handleError(response);
    }
    return response.json() as Promise<T>;
  }

  async getBuffer(path: string, params: Params = {}): Promise<ArrayBuffer> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken });
    const redacted = redactUrl(url.toString());
    this.logger.debug(`GET ${redacted}`);
    const start = Date.now();
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout),
      });
    } catch (err) {
      throw wrapFetchError(err);
    }
    this.logger.debug(`${response.status} ${redacted} (${Date.now() - start}ms)`);
    if (!response.ok) {
      await this.handleError(response);
    }
    return response.arrayBuffer();
  }

  async post<T = unknown>(path: string, params: Params = {}, body: unknown = {}): Promise<T> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken, fmt: 'json' });
    const redacted = redactUrl(url.toString());
    this.logger.debug(`POST ${redacted}`);
    const start = Date.now();
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.config.timeout),
      });
    } catch (err) {
      throw wrapFetchError(err);
    }
    this.logger.debug(`${response.status} ${redacted} (${Date.now() - start}ms)`);
    if (!response.ok) {
      await this.handleError(response);
    }
    return response.json() as Promise<T>;
  }

  private buildUrl(path: string, params: Params): URL {
    // Strip leading slash to properly append to base URL
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const base = this.config.baseUrl.endsWith('/') ? this.config.baseUrl : this.config.baseUrl + '/';
    const url = new URL(cleanPath, base);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
    return url;
  }

  private async handleError(response: Response): Promise<never> {
    let message: string;
    try {
      const text = await response.text();
      message = text || response.statusText;
    } catch {
      message = response.statusText;
    }

    const status = response.status;

    if (status === 401 || status === 403) {
      throw new EODHDAuthError(message, status);
    }

    if (status === 429) {
      const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
      throw new EODHDRateLimitError(message, retryAfter);
    }

    const code = status >= 500 ? 'server_error' : 'client_error';
    throw new EODHDError(message, status, code);
  }
}

function parseRetryAfter(header: string | null): number | undefined {
  if (header === null) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds >= 0) return seconds;
  // Try parsing as HTTP date
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    const delta = Math.ceil((date - Date.now()) / 1000);
    return delta > 0 ? delta : 0;
  }
  return undefined;
}

function wrapFetchError(err: unknown): EODHDError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return new EODHDTimeoutError('Request timed out');
  }
  if (err instanceof TypeError && err.name === 'TimeoutError') {
    return new EODHDTimeoutError('Request timed out');
  }
  // Node 18+ AbortSignal.timeout throws with name "TimeoutError"
  if (err instanceof DOMException && err.name === 'TimeoutError') {
    return new EODHDTimeoutError('Request timed out');
  }
  const message = err instanceof Error ? err.message : String(err);
  return new EODHDNetworkError(message);
}
