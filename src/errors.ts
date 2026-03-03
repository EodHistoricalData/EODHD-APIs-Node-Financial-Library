export type ErrorCode =
  | 'auth_error'
  | 'rate_limit'
  | 'network_error'
  | 'timeout'
  | 'server_error'
  | 'client_error'
  | 'unknown';

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export class EODHDError extends Error {
  override readonly name: string = 'EODHDError';

  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: ErrorCode = 'unknown',
    readonly requestId?: string,
    readonly responseBody?: unknown,
  ) {
    super(`EODHD API Error (${statusCode}): ${message}`);
  }

  get retryable(): boolean {
    return RETRYABLE_STATUS_CODES.has(this.statusCode);
  }
}

export class EODHDAuthError extends EODHDError {
  override readonly name = 'EODHDAuthError';

  constructor(message: string, statusCode: number = 401, requestId?: string, responseBody?: unknown) {
    super(message, statusCode, 'auth_error', requestId, responseBody);
  }
}

export class EODHDRateLimitError extends EODHDError {
  override readonly name = 'EODHDRateLimitError';

  constructor(
    message: string,
    readonly retryAfter?: number,
    requestId?: string,
    responseBody?: unknown,
  ) {
    super(message, 429, 'rate_limit', requestId, responseBody);
  }
}

export class EODHDNetworkError extends EODHDError {
  override readonly name = 'EODHDNetworkError';

  constructor(message: string) {
    super(message, 0, 'network_error');
  }

  override get retryable(): boolean {
    return true;
  }
}

export class EODHDTimeoutError extends EODHDError {
  override readonly name = 'EODHDTimeoutError';

  constructor(message: string) {
    super(message, 0, 'timeout');
  }

  override get retryable(): boolean {
    return true;
  }
}
