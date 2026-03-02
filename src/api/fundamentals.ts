import type { HttpClient } from '../http.js';
import type { Ticker, FundamentalsParams, BulkFundamentalsParams, BondsParams } from '../types.js';

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

  /** US corporate bonds: GET /bonds */
  async bonds(params: BondsParams = {}): Promise<unknown> {
    return this.http.get('/bonds', params);
  }
}
