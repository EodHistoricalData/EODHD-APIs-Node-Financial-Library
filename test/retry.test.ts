import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EODHDClient } from "../src/client.js";
import { EODHDError } from "../src/errors.js";

describe("retry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("retries on 500 up to maxRetries", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("error"), headers: new Headers() })
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("error"), headers: new Headers() })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
        text: () => Promise.resolve("[]"),
        headers: new Headers(),
      });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 2 });
    const promise = client.eod("AAPL.US");
    await vi.advanceTimersByTimeAsync(60000);
    const result = await promise;
    expect(result).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry on 400 (non-retryable)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("bad request"),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 2 });
    await expect(client.eod("AAPL.US")).rejects.toThrow(EODHDError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("respects Retry-After header on 429", async () => {
    const headers429 = new Headers({ "Retry-After": "2" });
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve("rate limited"),
        headers: headers429,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
        text: () => Promise.resolve("[]"),
        headers: new Headers(),
      });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 1 });
    const promise = client.eod("AAPL.US");
    await vi.advanceTimersByTimeAsync(5000);
    await promise;
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve("unavailable"),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 2 });
    const promise = client.eod("AAPL.US").catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(60000);
    const err = await promise;
    expect(err).toBeInstanceOf(EODHDError);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("maxRetries: 0 disables retry", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("error"), headers: new Headers() });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 0 });
    await expect(client.eod("AAPL.US")).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retries on network errors", async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
        text: () => Promise.resolve("[]"),
        headers: new Headers(),
      });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 1 });
    const promise = client.eod("AAPL.US");
    await vi.advanceTimersByTimeAsync(60000);
    const result = await promise;
    expect(result).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry on 401 (auth error)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("unauthorized"),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", mockFetch);
    const client = new EODHDClient({ apiToken: "test", maxRetries: 2 });
    await expect(client.eod("AAPL.US")).rejects.toThrow(EODHDError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("rate limit headers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs warning when rate limit remaining is low", async () => {
    const headers = new Headers({
      "X-RateLimit-Limit": "1000",
      "X-RateLimit-Remaining": "5",
      "X-RateLimit-Reset": "1700000000",
    });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve("[]"),
      headers,
    });
    vi.stubGlobal("fetch", mockFetch);
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new EODHDClient({ apiToken: "test", logger });
    await client.eod("AAPL.US");
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Rate limit low"));
  });

  it("does not warn when remaining is above threshold", async () => {
    const headers = new Headers({
      "X-RateLimit-Limit": "1000",
      "X-RateLimit-Remaining": "500",
      "X-RateLimit-Reset": "1700000000",
    });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve("[]"),
      headers,
    });
    vi.stubGlobal("fetch", mockFetch);
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new EODHDClient({ apiToken: "test", logger });
    await client.eod("AAPL.US");
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("handles missing rate limit headers gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve("[]"),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", mockFetch);
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const client = new EODHDClient({ apiToken: "test", logger });
    await client.eod("AAPL.US");
    expect(logger.warn).not.toHaveBeenCalled();
  });
});

describe("calculateDelay", () => {
  it("returns a value between floor and capped exponential", async () => {
    const { calculateDelay, DEFAULT_RETRY } = await import("../src/retry.js");
    const floor = Math.max(100, DEFAULT_RETRY.initialDelay / 2);
    for (let i = 0; i < 100; i++) {
      const delay = calculateDelay(0, DEFAULT_RETRY);
      expect(delay).toBeGreaterThanOrEqual(floor);
      expect(delay).toBeLessThanOrEqual(DEFAULT_RETRY.initialDelay);
    }
  });

  it("caps at maxDelay", async () => {
    const { calculateDelay } = await import("../src/retry.js");
    const opts = { maxRetries: 10, initialDelay: 1000, maxDelay: 5000, multiplier: 2 };
    for (let i = 0; i < 100; i++) {
      const delay = calculateDelay(10, opts);
      expect(delay).toBeLessThanOrEqual(5000);
    }
  });

  it("increases with attempt number on average", async () => {
    const { calculateDelay, DEFAULT_RETRY } = await import("../src/retry.js");
    let sum0 = 0;
    let sum2 = 0;
    const N = 1000;
    for (let i = 0; i < N; i++) {
      sum0 += calculateDelay(0, DEFAULT_RETRY);
      sum2 += calculateDelay(2, DEFAULT_RETRY);
    }
    // Average delay at attempt 2 should be higher than at attempt 0
    expect(sum2 / N).toBeGreaterThan(sum0 / N);
  });
});
