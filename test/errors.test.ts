import { describe, expect, it } from "vitest";
import {
  EODHDAuthError,
  EODHDError,
  EODHDNetworkError,
  EODHDRateLimitError,
  EODHDTimeoutError,
} from "../src/errors.js";

// ---------------------------------------------------------------------------
// EODHDError
// ---------------------------------------------------------------------------

describe("EODHDError", () => {
  it("has correct name", () => {
    const err = new EODHDError("bad request", 400);
    expect(err.name).toBe("EODHDError");
  });

  it("stores statusCode", () => {
    const err = new EODHDError("not found", 404);
    expect(err.statusCode).toBe(404);
  });

  it("defaults code to unknown", () => {
    const err = new EODHDError("fail", 500);
    expect(err.code).toBe("unknown");
  });

  it("accepts explicit code", () => {
    const err = new EODHDError("fail", 500, "server_error");
    expect(err.code).toBe("server_error");
  });

  it("stores requestId", () => {
    const err = new EODHDError("fail", 500, "server_error", "req-123");
    expect(err.requestId).toBe("req-123");
  });

  it("stores responseBody", () => {
    const body = { error: "something broke" };
    const err = new EODHDError("fail", 500, "server_error", undefined, body);
    expect(err.responseBody).toEqual(body);
  });

  it("includes status code in message", () => {
    const err = new EODHDError("Unauthorized", 401);
    expect(err.message).toContain("401");
    expect(err.message).toContain("Unauthorized");
  });

  it("is instanceof Error", () => {
    const err = new EODHDError("test", 500);
    expect(err).toBeInstanceOf(Error);
  });

  it("retryable = true for 429", () => {
    const err = new EODHDError("rate limited", 429);
    expect(err.retryable).toBe(true);
  });

  it("retryable = true for 500", () => {
    const err = new EODHDError("server error", 500);
    expect(err.retryable).toBe(true);
  });

  it("retryable = true for 502", () => {
    const err = new EODHDError("bad gateway", 502);
    expect(err.retryable).toBe(true);
  });

  it("retryable = true for 503", () => {
    const err = new EODHDError("unavailable", 503);
    expect(err.retryable).toBe(true);
  });

  it("retryable = true for 504", () => {
    const err = new EODHDError("timeout", 504);
    expect(err.retryable).toBe(true);
  });

  it("retryable = true for 408", () => {
    const err = new EODHDError("request timeout", 408);
    expect(err.retryable).toBe(true);
  });

  it("retryable = false for 400", () => {
    const err = new EODHDError("bad request", 400);
    expect(err.retryable).toBe(false);
  });

  it("retryable = false for 401", () => {
    const err = new EODHDError("unauthorized", 401);
    expect(err.retryable).toBe(false);
  });

  it("retryable = false for 404", () => {
    const err = new EODHDError("not found", 404);
    expect(err.retryable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// EODHDAuthError
// ---------------------------------------------------------------------------

describe("EODHDAuthError", () => {
  it("has correct name", () => {
    const err = new EODHDAuthError("invalid token");
    expect(err.name).toBe("EODHDAuthError");
  });

  it("extends EODHDError", () => {
    const err = new EODHDAuthError("invalid token");
    expect(err).toBeInstanceOf(EODHDError);
    expect(err).toBeInstanceOf(Error);
  });

  it("has statusCode 401", () => {
    const err = new EODHDAuthError("invalid token");
    expect(err.statusCode).toBe(401);
  });

  it("has code auth_error", () => {
    const err = new EODHDAuthError("invalid token");
    expect(err.code).toBe("auth_error");
  });

  it("stores requestId and responseBody", () => {
    const err = new EODHDAuthError("invalid token", 401, "req-456", { error: "bad key" });
    expect(err.requestId).toBe("req-456");
    expect(err.responseBody).toEqual({ error: "bad key" });
  });

  it("retryable = false", () => {
    const err = new EODHDAuthError("invalid token");
    expect(err.retryable).toBe(false);
  });

  it("accepts custom status code (e.g. 403)", () => {
    const err = new EODHDAuthError("forbidden", 403);
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("auth_error");
  });
});

// ---------------------------------------------------------------------------
// EODHDRateLimitError
// ---------------------------------------------------------------------------

describe("EODHDRateLimitError", () => {
  it("has correct name", () => {
    const err = new EODHDRateLimitError("too many requests");
    expect(err.name).toBe("EODHDRateLimitError");
  });

  it("extends EODHDError", () => {
    const err = new EODHDRateLimitError("too many requests");
    expect(err).toBeInstanceOf(EODHDError);
    expect(err).toBeInstanceOf(Error);
  });

  it("has statusCode 429", () => {
    const err = new EODHDRateLimitError("too many requests");
    expect(err.statusCode).toBe(429);
  });

  it("has code rate_limit", () => {
    const err = new EODHDRateLimitError("too many requests");
    expect(err.code).toBe("rate_limit");
  });

  it("stores retryAfter", () => {
    const err = new EODHDRateLimitError("too many requests", 30);
    expect(err.retryAfter).toBe(30);
  });

  it("retryAfter defaults to undefined", () => {
    const err = new EODHDRateLimitError("too many requests");
    expect(err.retryAfter).toBeUndefined();
  });

  it("stores requestId and responseBody", () => {
    const err = new EODHDRateLimitError("limit", 60, "req-789", { wait: 60 });
    expect(err.requestId).toBe("req-789");
    expect(err.responseBody).toEqual({ wait: 60 });
  });

  it("retryable = true", () => {
    const err = new EODHDRateLimitError("too many requests");
    expect(err.retryable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EODHDNetworkError
// ---------------------------------------------------------------------------

describe("EODHDNetworkError", () => {
  it("has correct name", () => {
    const err = new EODHDNetworkError("connection refused");
    expect(err.name).toBe("EODHDNetworkError");
  });

  it("extends EODHDError", () => {
    const err = new EODHDNetworkError("connection refused");
    expect(err).toBeInstanceOf(EODHDError);
    expect(err).toBeInstanceOf(Error);
  });

  it("has statusCode 0", () => {
    const err = new EODHDNetworkError("connection refused");
    expect(err.statusCode).toBe(0);
  });

  it("has code network_error", () => {
    const err = new EODHDNetworkError("connection refused");
    expect(err.code).toBe("network_error");
  });

  it("retryable = true", () => {
    const err = new EODHDNetworkError("connection refused");
    expect(err.retryable).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EODHDTimeoutError
// ---------------------------------------------------------------------------

describe("EODHDTimeoutError", () => {
  it("has correct name", () => {
    const err = new EODHDTimeoutError("request timed out");
    expect(err.name).toBe("EODHDTimeoutError");
  });

  it("extends EODHDError", () => {
    const err = new EODHDTimeoutError("request timed out");
    expect(err).toBeInstanceOf(EODHDError);
    expect(err).toBeInstanceOf(Error);
  });

  it("has statusCode 0", () => {
    const err = new EODHDTimeoutError("request timed out");
    expect(err.statusCode).toBe(0);
  });

  it("has code timeout", () => {
    const err = new EODHDTimeoutError("request timed out");
    expect(err.code).toBe("timeout");
  });

  it("retryable = true", () => {
    const err = new EODHDTimeoutError("request timed out");
    expect(err.retryable).toBe(true);
  });
});
