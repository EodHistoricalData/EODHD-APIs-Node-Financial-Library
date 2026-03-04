import { EODHDAuthError, EODHDError, EODHDNetworkError, EODHDRateLimitError, EODHDTimeoutError } from "./errors.js";
import { type Logger, NO_OP_LOGGER, redactUrl } from "./logger.js";
import { calculateDelay, DEFAULT_RETRY, type RetryOptions, sleep } from "./retry.js";
import type { RateLimitInfo } from "./types.js";

export type { ErrorCode } from "./errors.js";
export { EODHDError, EODHDAuthError, EODHDRateLimitError, EODHDNetworkError, EODHDTimeoutError };

export interface HttpClientConfig {
  apiToken: string;
  baseUrl: string;
  timeout: number;
  logger?: Logger;
  retryOptions?: RetryOptions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Params = Record<string, any>;

export class HttpClient {
  private readonly logger: Logger;
  private readonly retryOptions: RetryOptions;

  constructor(private config: HttpClientConfig) {
    this.logger = config.logger ?? NO_OP_LOGGER;
    this.retryOptions = config.retryOptions ?? DEFAULT_RETRY;
  }

  async get<T = unknown>(path: string, params: Params = {}): Promise<T> {
    return this.requestWithRetry<T>("GET", path, { ...params, fmt: "json" });
  }

  async getBuffer(path: string, params: Params = {}): Promise<ArrayBuffer> {
    return this.requestWithRetry<ArrayBuffer>("GET", path, params, undefined, true);
  }

  async post<T = unknown>(path: string, params: Params = {}, body: unknown = {}): Promise<T> {
    return this.requestWithRetry<T>("POST", path, { ...params, fmt: "json" }, body);
  }

  private async requestWithRetry<T>(
    method: string,
    path: string,
    params: Params,
    body?: unknown,
    isBuffer?: boolean,
  ): Promise<T> {
    const url = this.buildUrl(path, { ...params, api_token: this.config.apiToken });
    const redacted = redactUrl(url.toString());
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      this.logger.debug(`${method} ${redacted}${attempt > 0 ? ` (attempt ${attempt + 1})` : ""}`);
      const start = Date.now();

      try {
        const fetchOptions: RequestInit = {
          method,
          signal: AbortSignal.timeout(this.config.timeout),
        };
        if (body !== undefined) {
          fetchOptions.headers = { "Content-Type": "application/json" };
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url.toString(), fetchOptions);
        this.logger.debug(`${response.status} ${redacted} (${Date.now() - start}ms)`);

        if (!response.ok) {
          await this.handleError(response);
        }

        // Parse rate limit headers on success
        const rateLimit = parseRateLimitHeaders(response.headers);
        if (rateLimit?.remaining !== undefined && rateLimit.remaining < 10) {
          this.logger.warn(`Rate limit low: ${rateLimit.remaining}/${rateLimit.limit} remaining`);
        }

        if (isBuffer) {
          return response.arrayBuffer() as Promise<T>;
        }
        try {
          return (await response.json()) as T;
        } catch (parseErr) {
          throw new EODHDError(
            `Failed to parse response as JSON: ${parseErr instanceof Error ? parseErr.message : parseErr}`,
            response.status,
            "parse_error",
          );
        }
      } catch (error) {
        const wrapped = error instanceof EODHDError ? error : wrapFetchError(error);
        lastError = wrapped;

        if (!wrapped.retryable) throw wrapped;
        if (attempt >= this.retryOptions.maxRetries) throw wrapped;

        let delay: number;
        if (wrapped instanceof EODHDRateLimitError && wrapped.retryAfter) {
          delay = wrapped.retryAfter * 1000;
        } else {
          delay = calculateDelay(attempt, this.retryOptions);
        }

        this.logger.debug(`Retry ${attempt + 1}/${this.retryOptions.maxRetries} after ${Math.round(delay)}ms`);
        await sleep(delay);
      }
    }

    throw lastError!;
  }

  private buildUrl(path: string, params: Params): URL {
    // Strip leading slash to properly append to base URL
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const base = this.config.baseUrl.endsWith("/") ? this.config.baseUrl : `${this.config.baseUrl}/`;
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
    let responseBody: unknown;
    try {
      const text = await response.text();
      message = text || response.statusText;
      try {
        responseBody = JSON.parse(text);
      } catch {
        responseBody = text || undefined;
      }
    } catch {
      message = response.statusText;
    }

    const status = response.status;
    const requestId = response.headers.get("X-Request-Id") ?? undefined;

    if (status === 401 || status === 403) {
      throw new EODHDAuthError(message, status, requestId, responseBody);
    }

    if (status === 429) {
      const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
      throw new EODHDRateLimitError(message, retryAfter, requestId, responseBody);
    }

    const code = status >= 500 ? "server_error" : "client_error";
    throw new EODHDError(message, status, code, requestId, responseBody);
  }
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get("X-RateLimit-Limit");
  const remaining = headers.get("X-RateLimit-Remaining");
  const reset = headers.get("X-RateLimit-Reset");
  if (!limit && !remaining && !reset) return undefined;
  return {
    limit: limit ? Number(limit) : undefined,
    remaining: remaining ? Number(remaining) : undefined,
    reset: reset ? Number(reset) : undefined,
  };
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
  if (err instanceof DOMException && err.name === "AbortError") {
    return new EODHDTimeoutError("Request timed out");
  }
  if (err instanceof TypeError && err.name === "TimeoutError") {
    return new EODHDTimeoutError("Request timed out");
  }
  // Node 18+ AbortSignal.timeout throws with name "TimeoutError"
  if (err instanceof DOMException && err.name === "TimeoutError") {
    return new EODHDTimeoutError("Request timed out");
  }
  const message = err instanceof Error ? err.message : String(err);
  return new EODHDNetworkError(message);
}
