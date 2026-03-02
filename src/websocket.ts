import type { WebSocketFeed, WebSocketOptions, WebSocketTick } from './types.js';

type WebSocketListener = (data: WebSocketTick) => void;
type ErrorListener = (error: Error) => void;

const WS_BASE_URL = 'wss://ws.eodhistoricaldata.com/ws';

export class EODHDWebSocket {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];
  private errorListeners: ErrorListener[] = [];
  private closeListeners: (() => void)[] = [];
  private reconnectAttempts = 0;
  private closed = false;

  constructor(
    private apiToken: string,
    private feed: WebSocketFeed,
    private symbols: string[],
    private options: WebSocketOptions = {},
  ) {}

  /** Start the WebSocket connection */
  connect(): this {
    this.closed = false;
    const url = `${WS_BASE_URL}/${this.feed}?api_token=${this.apiToken}`;
    this.createConnection(url);
    return this;
  }

  /** Subscribe to incoming ticks */
  on(event: 'data', listener: WebSocketListener): this;
  on(event: 'error', listener: ErrorListener): this;
  on(event: 'close', listener: () => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    if (event === 'data') this.listeners.push(listener as WebSocketListener);
    else if (event === 'error') this.errorListeners.push(listener as ErrorListener);
    else if (event === 'close') this.closeListeners.push(listener as () => void);
    return this;
  }

  /** Close the connection */
  close(): void {
    this.closed = true;
    this.ws?.close();
    this.ws = null;
  }

  private createConnection(url: string): void {
    try {
      // Use native WebSocket in browser, or ws package in Node.js
      if (typeof globalThis.WebSocket !== 'undefined') {
        this.ws = new globalThis.WebSocket(url);
      } else {
        // Node.js: dynamically require ws
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const WS = require('ws');
        this.ws = new WS(url) as WebSocket;
      }
    } catch (err) {
      this.emitError(new Error(`Failed to create WebSocket: ${err}`));
      return;
    }

    this.ws!.onopen = () => {
      this.reconnectAttempts = 0;
      // Subscribe to symbols
      if (this.symbols.length > 0) {
        const msg = JSON.stringify({ action: 'subscribe', symbols: this.symbols.join(',') });
        this.ws!.send(msg);
      }
    };

    this.ws!.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());
        // Skip status messages
        if (data.status_code) return;
        for (const listener of this.listeners) {
          listener(data);
        }
      } catch {
        // ignore parse errors
      }
    };

    this.ws!.onerror = (event: Event) => {
      this.emitError(new Error(`WebSocket error: ${(event as ErrorEvent).message || 'unknown'}`));
    };

    this.ws!.onclose = () => {
      if (!this.closed) {
        this.tryReconnect(url);
      }
      for (const listener of this.closeListeners) {
        listener();
      }
    };
  }

  private tryReconnect(url: string): void {
    const maxAttempts = this.options.maxReconnectAttempts ?? 5;
    const interval = this.options.reconnectInterval ?? 3000;

    if (this.reconnectAttempts < maxAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (!this.closed) this.createConnection(url);
      }, interval);
    }
  }

  private emitError(error: Error): void {
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }
}
