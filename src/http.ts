export interface HttpClientConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params = Record<string, any>;

export class HttpClient {
  constructor(private config: HttpClientConfig) {}

  async get<T = unknown>(path: string, params: Params = {}): Promise<T> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken, fmt: 'json' });
    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(this.config.timeout),
    });
    if (!response.ok) {
      await this.handleError(response);
    }
    return response.json() as Promise<T>;
  }

  async getBuffer(path: string, params: Params = {}): Promise<ArrayBuffer> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken });
    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(this.config.timeout),
    });
    if (!response.ok) {
      await this.handleError(response);
    }
    return response.arrayBuffer();
  }

  async post<T = unknown>(path: string, params: Params = {}, body: unknown = {}): Promise<T> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken, fmt: 'json' });
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.config.timeout),
    });
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
    throw new EODHDError(message, response.status);
  }
}

export class EODHDError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(`EODHD API Error (${statusCode}): ${message}`);
    this.name = 'EODHDError';
  }
}
