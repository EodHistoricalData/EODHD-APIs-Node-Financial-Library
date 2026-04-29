import type { HttpClient } from "../http.js";
import type {
  BulkFundamentalsItem,
  BulkFundamentalsParams,
  FundamentalsData,
  FundamentalsParams,
  Ticker,
} from "../types.js";

export class FundamentalsApi {
  constructor(private http: HttpClient) {}

  /** Company fundamentals: GET /fundamentals/{ticker} */
  async fundamentals(ticker: Ticker, params: FundamentalsParams = {}): Promise<FundamentalsData> {
    return this.http.get(`/fundamentals/${encodeURIComponent(ticker)}`, params);
  }

  /** Bulk fundamentals for exchange: GET /bulk-fundamentals/{exchange} */
  async bulkFundamentals(exchange: string, params: BulkFundamentalsParams = {}): Promise<BulkFundamentalsItem[]> {
    return this.http.get(`/bulk-fundamentals/${encodeURIComponent(exchange)}`, params);
  }

  /** Company fundamentals v1.1 (extended Earnings::Trend): GET /v1.1/fundamentals/{ticker} */
  async fundamentalsV1_1(ticker: Ticker, params: FundamentalsParams = {}): Promise<FundamentalsData> {
    return this.http.get(`/v1.1/fundamentals/${encodeURIComponent(ticker)}`, params);
  }

  /** Bulk fundamentals v1.1 for exchange: GET /v1.1/bulk-fundamentals/{exchange} */
  async bulkFundamentalsV1_1(exchange: string, params: BulkFundamentalsParams = {}): Promise<BulkFundamentalsItem[]> {
    return this.http.get(`/v1.1/bulk-fundamentals/${encodeURIComponent(exchange)}`, params);
  }

  /** Company logo (PNG): GET /logo/{symbol} */
  async logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/logo/${encodeURIComponent(symbol)}`);
  }

  /** Company logo (SVG): GET /logo-svg/{symbol} */
  async logoSvg(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/logo-svg/${encodeURIComponent(symbol)}`);
  }
}
