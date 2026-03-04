import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EODHDWebSocket } from "../src/websocket.js";

// ---------------------------------------------------------------------------
// Mock WebSocket — tracks all instances created
// ---------------------------------------------------------------------------

const instances: MockWebSocket[] = [];

class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((e: Error) => void) | null = null;
  sent: string[] = [];
  readyState = 1;

  constructor(_url: string) {
    instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.onclose?.();
  }

  simulateOpen() {
    this.onopen?.();
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  simulateRawMessage(data: string) {
    this.onmessage?.({ data });
  }

  simulateClose() {
    this.onclose?.();
  }

  simulateError(err: Error) {
    this.onerror?.(err);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the latest MockWebSocket instance created */
function latestWs(): MockWebSocket {
  return instances[instances.length - 1];
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("EODHDWebSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    instances.length = 0;
    // Stub globalThis.WebSocket with our mock class
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createWs(
    symbols: string[] = ["AAPL", "MSFT"],
    options: { maxReconnectAttempts?: number; reconnectInterval?: number } = {},
  ) {
    return new EODHDWebSocket("test-token", "us", symbols, options);
  }

  // ─── 1. Subscribes on connect ───────────────────────────────────────────

  it("sends subscribe message on connect", () => {
    const ws = createWs(["AAPL", "MSFT"]);
    ws.connect();
    const mock = latestWs();
    mock.simulateOpen();

    expect(mock.sent).toHaveLength(1);
    const msg = JSON.parse(mock.sent[0]);
    expect(msg).toEqual({ action: "subscribe", symbols: "AAPL,MSFT" });
  });

  // ─── 2. Emits data events on message ────────────────────────────────────

  it("emits data events on message", () => {
    const ws = createWs();
    const handler = vi.fn();
    ws.on("data", handler);
    ws.connect();
    const mock = latestWs();
    mock.simulateOpen();

    const tick = { s: "AAPL", p: 150.5, v: 100, t: 1234567890 };
    mock.simulateMessage(tick);

    expect(handler).toHaveBeenCalledWith(tick);
  });

  // ─── 3. Emits error on JSON parse failure ───────────────────────────────

  it("emits error event on JSON parse failure", () => {
    const ws = createWs();
    const errorHandler = vi.fn();
    ws.on("error", errorHandler);
    ws.connect();
    const mock = latestWs();
    mock.simulateOpen();

    mock.simulateRawMessage("not-valid-json{{{");

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(errorHandler.mock.calls[0][0].message).toContain("parse");
  });

  // ─── 4. subscribe() sends subscribe message post-connect ────────────────

  it("subscribe() sends subscribe message on open connection", () => {
    const ws = createWs(["AAPL"]);
    ws.connect();
    const mock = latestWs();
    mock.simulateOpen();
    mock.sent = []; // clear initial subscribe

    ws.subscribe(["GOOG", "TSLA"]);

    expect(mock.sent).toHaveLength(1);
    const msg = JSON.parse(mock.sent[0]);
    expect(msg).toEqual({ action: "subscribe", symbols: "GOOG,TSLA" });
  });

  // ─── 5. unsubscribe() sends unsubscribe message ────────────────────────

  it("unsubscribe() sends unsubscribe message", () => {
    const ws = createWs(["AAPL", "MSFT"]);
    ws.connect();
    const mock = latestWs();
    mock.simulateOpen();
    mock.sent = [];

    ws.unsubscribe(["AAPL"]);

    expect(mock.sent).toHaveLength(1);
    const msg = JSON.parse(mock.sent[0]);
    expect(msg).toEqual({ action: "unsubscribe", symbols: "AAPL" });
  });

  // ─── 6. Does not fire close listeners during reconnect ──────────────────

  it("does not fire close listeners during reconnect", () => {
    const ws = createWs(["AAPL"], { maxReconnectAttempts: 3, reconnectInterval: 1000 });
    const closeHandler = vi.fn();
    ws.on("close", closeHandler);
    ws.connect();
    latestWs().simulateOpen();

    // Simulate transient disconnect (reconnect will be attempted)
    latestWs().simulateClose();

    expect(closeHandler).not.toHaveBeenCalled();
  });

  it("fires close listeners when user calls close()", () => {
    const ws = createWs(["AAPL"], { maxReconnectAttempts: 3 });
    const closeHandler = vi.fn();
    ws.on("close", closeHandler);
    ws.connect();
    latestWs().simulateOpen();

    ws.close();

    expect(closeHandler).toHaveBeenCalledTimes(1);
  });

  it("fires close listeners after reconnect exhausted", () => {
    const ws = createWs(["AAPL"], { maxReconnectAttempts: 2, reconnectInterval: 100 });
    const closeHandler = vi.fn();
    const reconnectFailedHandler = vi.fn();
    ws.on("close", closeHandler);
    ws.on("reconnectFailed", reconnectFailedHandler);
    ws.connect();
    latestWs().simulateOpen();

    // First disconnect — starts reconnect attempt 1
    latestWs().simulateClose();
    expect(closeHandler).not.toHaveBeenCalled();

    // Advance timer to trigger reconnect attempt 1
    vi.advanceTimersByTime(35000);
    // A new MockWebSocket was created; fail it too
    latestWs().simulateClose(); // attempt 1 fails

    // Advance timer for attempt 2
    vi.advanceTimersByTime(35000);
    latestWs().simulateClose(); // attempt 2 fails — exhausted

    expect(reconnectFailedHandler).toHaveBeenCalledTimes(1);
    expect(closeHandler).toHaveBeenCalledTimes(1);
  });

  // ─── 7. Emits reconnectFailed after max attempts exhausted ──────────────

  it("emits reconnectFailed after max attempts exhausted", () => {
    const ws = createWs(["AAPL"], { maxReconnectAttempts: 1, reconnectInterval: 100 });
    const reconnectHandler = vi.fn();
    ws.on("reconnectFailed", reconnectHandler);
    ws.connect();
    latestWs().simulateOpen();

    // Disconnect
    latestWs().simulateClose();

    // Advance timer to trigger the one reconnect attempt
    vi.advanceTimersByTime(35000);
    // Fail the reconnect
    latestWs().simulateClose();

    expect(reconnectHandler).toHaveBeenCalledTimes(1);
  });

  // ─── 8. Skips status messages ───────────────────────────────────────────

  it("skips messages with status_code property", () => {
    const ws = createWs();
    const handler = vi.fn();
    ws.on("data", handler);
    ws.connect();
    latestWs().simulateOpen();

    latestWs().simulateMessage({ status_code: 200, message: "connected" });

    expect(handler).not.toHaveBeenCalled();
  });

  // ─── Additional: multiple data listeners ────────────────────────────────

  it("supports multiple data listeners", () => {
    const ws = createWs();
    const h1 = vi.fn();
    const h2 = vi.fn();
    ws.on("data", h1).on("data", h2);
    ws.connect();
    latestWs().simulateOpen();

    latestWs().simulateMessage({ s: "AAPL", p: 100, t: 1 });

    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  // ─── Empty symbols array does not send subscribe ────────────────────────

  it("does not send subscribe if symbols array is empty", () => {
    const ws = createWs([]);
    ws.connect();
    latestWs().simulateOpen();

    expect(latestWs().sent).toHaveLength(0);
  });

  // ─── Reconnect resets attempt counter on successful connect ─────────────

  it("resets reconnect counter on successful reconnect", () => {
    const ws = createWs(["AAPL"], { maxReconnectAttempts: 2, reconnectInterval: 100 });
    const reconnectHandler = vi.fn();
    ws.on("reconnectFailed", reconnectHandler);
    ws.connect();
    latestWs().simulateOpen();

    // First disconnect
    latestWs().simulateClose();
    vi.advanceTimersByTime(35000);

    // Reconnect succeeds — counter resets
    latestWs().simulateOpen();

    // Second disconnect — should restart counter from 0
    latestWs().simulateClose();
    vi.advanceTimersByTime(35000);
    latestWs().simulateOpen();

    expect(reconnectHandler).not.toHaveBeenCalled();
  });
});
