import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EODHDClient } from '../src/client.js';
import {
  resolveLogger,
  redactUrl,
  createConsoleLogger,
  NO_OP_LOGGER,
} from '../src/logger.js';
import type { Logger } from '../src/logger.js';

// ---------------------------------------------------------------------------
// Unit tests for logger utilities
// ---------------------------------------------------------------------------

describe('redactUrl', () => {
  it('replaces api_token value with ***', () => {
    expect(redactUrl('https://eodhd.com/api/eod/AAPL.US?api_token=secret123&fmt=json'))
      .toBe('https://eodhd.com/api/eod/AAPL.US?api_token=***&fmt=json');
  });

  it('returns unchanged URL when no api_token present', () => {
    const url = 'https://eodhd.com/api/eod/AAPL.US?fmt=json';
    expect(redactUrl(url)).toBe(url);
  });

  it('handles api_token at end of query string', () => {
    expect(redactUrl('https://eodhd.com/api/eod?fmt=json&api_token=mykey'))
      .toBe('https://eodhd.com/api/eod?fmt=json&api_token=***');
  });
});

describe('resolveLogger', () => {
  afterEach(() => {
    delete process.env.EODHD_LOG;
  });

  it('returns provided logger when given', () => {
    const custom: Logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    expect(resolveLogger(custom)).toBe(custom);
  });

  it('returns console logger when EODHD_LOG=debug', () => {
    process.env.EODHD_LOG = 'debug';
    const logger = resolveLogger();
    // Console logger has real functions, not no-ops
    expect(logger).not.toBe(NO_OP_LOGGER);
    expect(typeof logger.debug).toBe('function');
  });

  it('returns NO_OP_LOGGER when no logger and no env var', () => {
    delete process.env.EODHD_LOG;
    expect(resolveLogger()).toBe(NO_OP_LOGGER);
  });
});

describe('createConsoleLogger', () => {
  it('prefixes messages with [eodhd]', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.debug('test message');
    expect(spy).toHaveBeenCalledWith('[eodhd] test message');
    spy.mockRestore();
  });

  it('passes extra args through', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = createConsoleLogger();
    logger.warn('msg', { extra: true });
    expect(spy).toHaveBeenCalledWith('[eodhd] msg', { extra: true });
    spy.mockRestore();
  });
});

describe('NO_OP_LOGGER', () => {
  it('has all methods as no-ops', () => {
    expect(() => NO_OP_LOGGER.debug('x')).not.toThrow();
    expect(() => NO_OP_LOGGER.warn('x')).not.toThrow();
    expect(() => NO_OP_LOGGER.error('x')).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Integration: logging through EODHDClient
// ---------------------------------------------------------------------------

describe('logging integration', () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve('[]'),
    headers: new Headers(),
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.EODHD_LOG;
  });

  it('calls logger.debug on request when logger provided', async () => {
    const logger: Logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new EODHDClient({ apiToken: 'secret-token', logger });
    await client.eod('AAPL.US');

    expect(logger.debug).toHaveBeenCalled();
    // Verify api_token is redacted
    const calls = (logger.debug as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0],
    );
    expect(calls.some((msg: string) => msg.includes('secret-token'))).toBe(false);
    expect(calls.some((msg: string) => msg.includes('api_token=***'))).toBe(true);
  });

  it('logs request and response with elapsed time', async () => {
    const logger: Logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new EODHDClient({ apiToken: 'test', logger });
    await client.eod('AAPL.US');

    const calls = (logger.debug as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0],
    );
    // First call: request log with GET
    expect(calls[0]).toMatch(/GET/);
    // Second call: response log with status and elapsed ms
    expect(calls[1]).toMatch(/200/);
    expect(calls[1]).toMatch(/\d+ms/);
  });

  it('does not log when no logger and no env var', async () => {
    delete process.env.EODHD_LOG;
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const client = new EODHDClient({ apiToken: 'test' });
    await client.eod('AAPL.US');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs POST requests', async () => {
    const logger: Logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new EODHDClient({ apiToken: 'test', logger });
    // praams.exploreEquity is one of the few POST endpoints
    await client.marketplace.praams.exploreEquity({}, { regions: ['US'] });

    const calls = (logger.debug as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0],
    );
    expect(calls[0]).toMatch(/POST/);
  });
});
