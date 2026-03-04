import { redactUrl } from "./logger.js";
import { calculateDelay } from "./retry.js";
import type { WebSocketFeed, WebSocketOptions, WebSocketTick } from "./types.js";

type WebSocketListener = (data: WebSocketTick) => void;
type ErrorListener = (error: Error) => void;

const WS_BASE_URL = "wss://ws.eodhistoricaldata.com/ws";

/**
 * Real-time WebSocket client for streaming market data from EODHD.
 *
 * Supports US trades, US quotes, forex, and crypto feeds with automatic
 * reconnection using exponential backoff with jitter on connection loss.
 *
 * Typically created via {@link EODHDClient.websocket} rather than directly.
 *
 * @example
 * ```ts
 * const ws = client.websocket('us', ['AAPL', 'MSFT']);
 * ws.on('data', (tick) => console.log(tick.s, tick.p, tick.v));
 * ws.on('error', (err) => console.error(err));
 * ws.on('close', () => console.log('disconnected'));
 * ws.on('reconnectFailed', () => console.log('all reconnect attempts exhausted'));
 * // Post-connect symbol changes:
 * ws.subscribe(['GOOG']);
 * ws.unsubscribe(['AAPL']);
 * // Later: ws.close();
 * ```
 *
 * @see https://eodhd.com/financial-apis/live-realtime-stocks-api/
 */
export class EODHDWebSocket {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];
  private errorListeners: ErrorListener[] = [];
  private closeListeners: (() => void)[] = [];
  private reconnectFailedListeners: (() => void)[] = [];
  private reconnectAttempts = 0;
  private closed = false;

  /**
   * Create a new WebSocket client instance.
   *
   * @param apiToken - EODHD API token for authentication
   * @param feed - Feed type: `"us"`, `"us-quote"`, `"forex"`, or `"crypto"`
   * @param symbols - Symbols to subscribe to on connect
   * @param options - Reconnect settings (maxReconnectAttempts defaults to 5, reconnectInterval defaults to 3000ms)
   */
  constructor(
    private apiToken: string,
    private feed: WebSocketFeed,
    private symbols: string[],
    private options: WebSocketOptions = {},
  ) {}

  /**
   * Start the WebSocket connection and subscribe to configured symbols.
   *
   * Called automatically by {@link EODHDClient.websocket}. Returns `this` for chaining.
   * The connection is established asynchronously; in Node.js the `ws` package is
   * loaded via dynamic `import('ws')` for ESM compatibility.
   *
   * @returns This instance for method chaining
   *
   * @example
   * ```ts
   * const ws = new EODHDWebSocket(token, 'us', ['AAPL']).connect();
   * ```
   */
  connect(): this {
    this.closed = false;
    this.reconnecting = false;
    const url = `${WS_BASE_URL}/${this.feed}?api_token=${this.apiToken}`;
    this.initConnection(url);
    return this;
  }

  /**
   * Register an event listener for data ticks, errors, close, or reconnectFailed events.
   *
   * @param event - Event name: `"data"`, `"error"`, `"close"`, or `"reconnectFailed"`
   * @param listener - Callback function for the event
   * @returns This instance for method chaining
   *
   * @example
   * ```ts
   * ws.on('data', (tick) => {
   *   console.log(`${tick.s}: $${tick.p} x${tick.v}`);
   * });
   * ws.on('error', (err) => console.error('WS error:', err.message));
   * ws.on('close', () => console.log('Connection closed'));
   * ws.on('reconnectFailed', () => console.log('Reconnect exhausted'));
   * ```
   */
  on(event: "data", listener: WebSocketListener): this;
  on(event: "error", listener: ErrorListener): this;
  on(event: "close", listener: () => void): this;
  on(event: "reconnectFailed", listener: () => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    if (event === "data") this.listeners.push(listener as WebSocketListener);
    else if (event === "error") this.errorListeners.push(listener as ErrorListener);
    else if (event === "close") this.closeListeners.push(listener as () => void);
    else if (event === "reconnectFailed") this.reconnectFailedListeners.push(listener as () => void);
    return this;
  }

  /**
   * Subscribe to additional symbols on an open connection.
   *
   * @param symbols - Symbols to subscribe to
   *
   * @example
   * ```ts
   * ws.subscribe(['GOOG', 'TSLA']);
   * ```
   */
  subscribe(symbols: string[]): void {
    if (this.ws && symbols.length > 0) {
      this.ws.send(JSON.stringify({ action: "subscribe", symbols: symbols.join(",") }));
    }
  }

  /**
   * Unsubscribe from symbols on an open connection.
   *
   * @param symbols - Symbols to unsubscribe from
   *
   * @example
   * ```ts
   * ws.unsubscribe(['AAPL']);
   * ```
   */
  unsubscribe(symbols: string[]): void {
    if (this.ws && symbols.length > 0) {
      this.ws.send(JSON.stringify({ action: "unsubscribe", symbols: symbols.join(",") }));
    }
  }

  /**
   * Close the WebSocket connection and stop auto-reconnect.
   *
   * @example
   * ```ts
   * ws.close();
   * ```
   */
  close(): void {
    this.closed = true;
    this.reconnecting = false;
    this.ws?.close();
    this.ws = null;
  }

  /** Set up connection — uses dynamic import('ws') in Node.js for ESM compat. */
  private initConnection(url: string): void {
    if (typeof globalThis.WebSocket !== "undefined") {
      this.createConnection(url, globalThis.WebSocket);
    } else {
      // Node.js: dynamic import for ESM compatibility
      import("ws")
        .then((mod) => {
          const WS = mod.default || mod;
          this.createConnection(url, WS as unknown as typeof WebSocket);
        })
        .catch((err) => {
          this.emitError(new Error(`Failed to load ws package: ${redactUrl(String(err))}`));
        });
    }
  }

  private createConnection(url: string, WsCtor: typeof WebSocket | (new (url: string) => WebSocket)): void {
    try {
      this.ws = new (WsCtor as new (url: string) => WebSocket)(url);
    } catch (err) {
      this.emitError(new Error(`Failed to create WebSocket: ${redactUrl(String(err))}`));
      return;
    }

    this.ws!.onopen = () => {
      this.reconnectAttempts = 0;
      this.reconnecting = false;
      // Subscribe to symbols
      if (this.symbols.length > 0) {
        const msg = JSON.stringify({ action: "subscribe", symbols: this.symbols.join(",") });
        this.ws?.send(msg);
      }
    };

    this.ws!.onmessage = (event: MessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      } catch (err) {
        this.emitError(new Error(`WebSocket message parse error: ${err}`));
        return;
      }
      // Skip status messages
      if (data && typeof data === "object" && "status_code" in data) return;
      for (const listener of this.listeners) {
        listener(data as WebSocketTick);
      }
    };

    this.ws!.onerror = (event: Event) => {
      this.emitError(new Error(`WebSocket error: ${redactUrl((event as ErrorEvent).message || "unknown")}`));
    };

    this.ws!.onclose = () => {
      if (this.closed) {
        // User called close() — fire close listeners
        this.emitClose();
        return;
      }

      // Attempt reconnect
      const maxAttempts = this.options.maxReconnectAttempts ?? 5;
      if (this.reconnectAttempts < maxAttempts) {
        this.reconnecting = true;
        this.tryReconnect(url);
      } else {
        // Reconnect exhausted
        this.reconnecting = false;
        for (const listener of this.reconnectFailedListeners) {
          listener();
        }
        this.emitClose();
      }
    };
  }

  private tryReconnect(url: string): void {
    this.reconnectAttempts++;

    const delay = calculateDelay(this.reconnectAttempts - 1, {
      initialDelay: this.options.reconnectInterval ?? 3000,
      maxDelay: 30000,
      multiplier: 2,
      maxRetries: this.options.maxReconnectAttempts ?? 5,
    });

    setTimeout(() => {
      if (!this.closed) this.initConnection(url);
    }, delay);
  }

  private emitError(error: Error): void {
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }

  private emitClose(): void {
    for (const listener of this.closeListeners) {
      listener();
    }
  }
}
