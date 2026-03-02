import type { HttpClient } from '../http.js';
import type { Ticker, FundamentalsParams, BulkFundamentalsParams } from '../types.js';

export class FundamentalsApi {
  constructor(private http: HttpClient) {}

  /** Company fundamentals: GET /fundamentals/{ticker} */
  async fundamentals(ticker: Ticker, params: FundamentalsParams = {}): Promise<unknown> {
    return this.http.get(`/fundamentals/${ticker}`, params);
  }

  /** Bulk fundamentals for exchange: GET /bulk-fundamentals/{exchange} */
  async bulkFundamentals(exchange: string, params: BulkFundamentalsParams = {}): Promise<unknown> {
    return this.http.get(`/bulk-fundamentals/${exchange}`, params);
  }

  /** Company logo (PNG): GET /logo/{symbol} */
  async logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/logo/${symbol}`);
  }

  /** Company logo (SVG): GET /logo-svg/{symbol} */
  async logoSvg(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/logo-svg/${symbol}`);
  }
}
