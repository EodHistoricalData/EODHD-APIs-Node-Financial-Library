import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../src/http.js';
import {
  EODHDError,
  EODHDAuthError,
  EODHDRateLimitError,
  EODHDNetworkError,
  EODHDTimeoutError,
} from '../src/errors.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createHttpClient(overrides: Partial<{ apiToken: string; baseUrl: string; timeout: number }> = {}) {
  return new HttpClient({
    apiToken: overrides.apiToken ?? 'demo',
    baseUrl: overrides.baseUrl ?? 'https://eodhd.com/api/',
    timeout: overrides.timeout ?? 5000,
  });
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  };
}

function errorResponse(status: number, body: string, headers: Record<string, string> = {}) {
  const headerMap = new Map(Object.entries(headers));
  return {
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.reject(new Error('not json')),
    text: () => Promise.resolve(body),
    arrayBuffer: () => Promise.reject(new Error('not buffer')),
    headers: { get: (name: string) => headerMap.get(name) ?? null },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HttpClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── URL building ────────────────────────────────────────────────────────

  describe('URL building', () => {
    it('builds a correct URL for a simple GET', async () => {
      const http = createHttpClient();
      await http.get('/eod/AAPL.US');

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('eodhd.com/api/eod/AAPL.US');
      expect(url).toContain('api_token=demo');
      expect(url).toContain('fmt=json');
    });

    it('appends query params to the URL', async () => {
      const http = createHttpClient();
      await http.get('/eod/AAPL.US', { from: '2025-01-01', to: '2025-06-01', period: 'd' });

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('from=2025-01-01');
      expect(url).toContain('to=2025-06-01');
      expect(url).toContain('period=d');
    });

    it('omits null and undefined params', async () => {
      const http = createHttpClient();
      await http.get('/eod/AAPL.US', { from: '2025-01-01', to: undefined, period: null });

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('from=2025-01-01');
      expect(url).not.toContain('to=');
      expect(url).not.toContain('period=');
    });

    it('strips leading slash from path', async () => {
      const http = createHttpClient();
      await http.get('/eod/AAPL.US');

      const url: string = mockFetch.mock.calls[0][0];
      // Should not result in double slashes like api//eod
      expect(url).not.toMatch(/api\/\/eod/);
    });

    it('handles base URL without trailing slash', async () => {
      const http = createHttpClient({ baseUrl: 'https://eodhd.com/api' });
      await http.get('/eod/AAPL.US');

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('eodhd.com/api/eod/AAPL.US');
    });

    it('converts numeric param values to strings', async () => {
      const http = createHttpClient();
      await http.get('/ticks', { limit: 100 });

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('limit=100');
    });
  });

  // ── GET method ──────────────────────────────────────────────────────────

  describe('get()', () => {
    it('uses GET method', async () => {
      const http = createHttpClient();
      await http.get('/user');

      const opts = mockFetch.mock.calls[0][1];
      expect(opts.method).toBe('GET');
    });

    it('returns parsed JSON body', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ name: 'Test User' }));
      const http = createHttpClient();
      const result = await http.get('/user');

      expect(result).toEqual({ name: 'Test User' });
    });

    it('includes AbortSignal with timeout', async () => {
      const http = createHttpClient({ timeout: 3000 });
      await http.get('/user');

      const opts = mockFetch.mock.calls[0][1];
      expect(opts.signal).toBeDefined();
    });

    it('always adds fmt=json', async () => {
      const http = createHttpClient();
      await http.get('/eod/AAPL.US');

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('fmt=json');
    });
  });

  // ── getBuffer method ────────────────────────────────────────────────────

  describe('getBuffer()', () => {
    it('uses GET method and returns ArrayBuffer', async () => {
      const buf = new ArrayBuffer(16);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(buf),
        text: () => Promise.resolve(''),
      });

      const http = createHttpClient();
      const result = await http.getBuffer('/logo/AAPL.US');

      expect(result).toBe(buf);
      const opts = mockFetch.mock.calls[0][1];
      expect(opts.method).toBe('GET');
    });

    it('does not add fmt=json for buffer requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        text: () => Promise.resolve(''),
      });

      const http = createHttpClient();
      await http.getBuffer('/logo/AAPL.US');

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).not.toContain('fmt=json');
    });

    it('still includes api_token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        text: () => Promise.resolve(''),
      });

      const http = createHttpClient({ apiToken: 'mykey' });
      await http.getBuffer('/logo/AAPL.US');

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('api_token=mykey');
    });
  });

  // ── POST method ─────────────────────────────────────────────────────────

  describe('post()', () => {
    it('uses POST method with JSON body', async () => {
      const http = createHttpClient();
      await http.post('/mp/praams/explore/equity', {}, { regions: ['US'] });

      const opts = mockFetch.mock.calls[0][1];
      expect(opts.method).toBe('POST');
      expect(opts.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(opts.body)).toEqual({ regions: ['US'] });
    });

    it('adds api_token and fmt=json to URL', async () => {
      const http = createHttpClient();
      await http.post('/mp/praams/explore/equity', { skip: 0 }, {});

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('api_token=demo');
      expect(url).toContain('fmt=json');
      expect(url).toContain('skip=0');
    });

    it('returns parsed JSON response', async () => {
      mockFetch.mockResolvedValue(jsonResponse([{ ticker: 'AAPL.US' }]));
      const http = createHttpClient();
      const result = await http.post('/mp/praams/explore/equity');

      expect(result).toEqual([{ ticker: 'AAPL.US' }]);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────

  describe('error handling', () => {
    it('throws EODHDError on non-ok response', async () => {
      mockFetch.mockResolvedValue(errorResponse(401, 'Unauthorized'));

      const http = createHttpClient();
      await expect(http.get('/user')).rejects.toThrow(EODHDError);
    });

    it('includes status code in the error', async () => {
      mockFetch.mockResolvedValue(errorResponse(403, 'Forbidden'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDError);
        expect((err as EODHDError).statusCode).toBe(403);
      }
    });

    it('includes response body in error message', async () => {
      mockFetch.mockResolvedValue(errorResponse(429, 'Rate limit exceeded'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as EODHDError).message).toContain('Rate limit exceeded');
      }
    });

    it('falls back to statusText when text() fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.reject(new Error('fail')),
      });

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as EODHDError).message).toContain('Internal Server Error');
        expect((err as EODHDError).statusCode).toBe(500);
      }
    });

    it('uses statusText when response body is empty', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: () => Promise.resolve(''),
      });

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as EODHDError).message).toContain('Bad Gateway');
      }
    });

    it('throws EODHDError on non-ok response for getBuffer', async () => {
      mockFetch.mockResolvedValue(errorResponse(404, 'Not Found'));

      const http = createHttpClient();
      await expect(http.getBuffer('/logo/INVALID')).rejects.toThrow(EODHDError);
    });

    it('throws EODHDError on non-ok response for post', async () => {
      mockFetch.mockResolvedValue(errorResponse(400, 'Bad Request'));

      const http = createHttpClient();
      await expect(http.post('/something', {}, {})).rejects.toThrow(EODHDError);
    });
  });

  // ── Specific error types ─────────────────────────────────────────────────

  describe('specific error types', () => {
    it('throws EODHDAuthError on 401', async () => {
      mockFetch.mockResolvedValue(errorResponse(401, 'Unauthorized'));

      const http = createHttpClient();
      await expect(http.get('/user')).rejects.toThrow(EODHDAuthError);
    });

    it('throws EODHDAuthError on 403', async () => {
      mockFetch.mockResolvedValue(errorResponse(403, 'Forbidden'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDAuthError);
        expect((err as EODHDAuthError).statusCode).toBe(403);
        expect((err as EODHDAuthError).code).toBe('auth_error');
      }
    });

    it('throws EODHDRateLimitError on 429', async () => {
      mockFetch.mockResolvedValue(errorResponse(429, 'Rate limit exceeded'));

      const http = createHttpClient();
      await expect(http.get('/user')).rejects.toThrow(EODHDRateLimitError);
    });

    it('parses Retry-After header as seconds', async () => {
      mockFetch.mockResolvedValue(errorResponse(429, 'Rate limit exceeded', { 'Retry-After': '30' }));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDRateLimitError);
        expect((err as EODHDRateLimitError).retryAfter).toBe(30);
      }
    });

    it('retryAfter is undefined when Retry-After header missing', async () => {
      mockFetch.mockResolvedValue(errorResponse(429, 'Rate limit exceeded'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDRateLimitError);
        expect((err as EODHDRateLimitError).retryAfter).toBeUndefined();
      }
    });

    it('throws EODHDError with server_error code for 5xx', async () => {
      mockFetch.mockResolvedValue(errorResponse(503, 'Service Unavailable'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDError);
        expect((err as EODHDError).code).toBe('server_error');
      }
    });

    it('throws EODHDError with client_error code for 4xx', async () => {
      mockFetch.mockResolvedValue(errorResponse(404, 'Not Found'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDError);
        expect((err as EODHDError).code).toBe('client_error');
      }
    });
  });

  // ── Fetch error wrapping ─────────────────────────────────────────────────

  describe('fetch error wrapping', () => {
    it('wraps AbortError as EODHDTimeoutError', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockFetch.mockRejectedValue(abortError);

      const http = createHttpClient();
      await expect(http.get('/user')).rejects.toThrow(EODHDTimeoutError);
    });

    it('wraps TimeoutError DOMException as EODHDTimeoutError', async () => {
      const timeoutError = new DOMException('The operation timed out', 'TimeoutError');
      mockFetch.mockRejectedValue(timeoutError);

      const http = createHttpClient();
      await expect(http.get('/user')).rejects.toThrow(EODHDTimeoutError);
    });

    it('wraps generic fetch error as EODHDNetworkError', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const http = createHttpClient();
      await expect(http.get('/user')).rejects.toThrow(EODHDNetworkError);
    });

    it('wraps fetch error for getBuffer', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const http = createHttpClient();
      await expect(http.getBuffer('/logo/AAPL')).rejects.toThrow(EODHDNetworkError);
    });

    it('wraps fetch error for post', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      const http = createHttpClient();
      await expect(http.post('/something')).rejects.toThrow(EODHDNetworkError);
    });

    it('timeout wrapping preserves message', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockFetch.mockRejectedValue(abortError);

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDTimeoutError);
        expect((err as EODHDTimeoutError).message).toContain('timed out');
        expect((err as EODHDTimeoutError).code).toBe('timeout');
      }
    });

    it('network error preserves original message', async () => {
      mockFetch.mockRejectedValue(new TypeError('net::ERR_CONNECTION_REFUSED'));

      const http = createHttpClient();
      try {
        await http.get('/user');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(EODHDNetworkError);
        expect((err as EODHDNetworkError).message).toContain('ERR_CONNECTION_REFUSED');
        expect((err as EODHDNetworkError).code).toBe('network_error');
      }
    });
  });
});

// ---------------------------------------------------------------------------
// EODHDError standalone tests
// ---------------------------------------------------------------------------

describe('EODHDError', () => {
  it('has correct name', () => {
    const err = new EODHDError('test', 400);
    expect(err.name).toBe('EODHDError');
  });

  it('has correct statusCode', () => {
    const err = new EODHDError('test', 401);
    expect(err.statusCode).toBe(401);
  });

  it('includes status code in message', () => {
    const err = new EODHDError('Unauthorized', 401);
    expect(err.message).toContain('401');
    expect(err.message).toContain('Unauthorized');
  });

  it('is an instance of Error', () => {
    const err = new EODHDError('test', 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(EODHDError);
  });
});
