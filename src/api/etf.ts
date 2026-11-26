import type { HttpClient } from "../http.js";
import type { EtfHeldByParams, EtfHeldByResponse, EtfHoldingsResponse, Ticker } from "../types.js";

/**
 * ETF Holdings API (beta): positions of a US-listed ETF, and the funds that hold a security.
 * Source: SEC N-PORT filings. US-listed ETFs only.
 *
 * Accessed via `client.etf`.
 *
 * @see https://eodhd.com/financial-apis/etf-holdings-api
 */
export class EtfApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch the holdings of a US-listed ETF (beta): GET /etf/holdings/{ticker}
   *
   * Returns all positions in one response (no pagination); large funds are several MB.
   * Cost: 10 API calls per request. The demo token works for `VTI`.
   *
   * @param ticker - US ETF ticker, with or without `.US` (for example `"VTI"` or `"VTI.US"`)
   * @returns Envelope with fund general data, positions, allocation, weights and performance
   * @throws {@link EODHDError} on API error (404 body: `{ errors: [{ code }] }`; 422 for non-US tickers)
   *
   * @example
   * ```ts
   * const res = await client.etf.holdings('XLE');
   * console.log(res.data.General.Name, res.data.Holdings_Count);
   * ```
   */
  async holdings(ticker: Ticker): Promise<EtfHoldingsResponse> {
    return this.http.get(`/etf/holdings/${encodeURIComponent(ticker)}`);
  }

  /**
   * Fetch the funds that hold a security (beta): GET /etf/security/{ticker}/held-by
   *
   * Cost: 10 API calls per request. The demo token is rejected (403).
   *
   * @param ticker - The security that is looked up: a US ticker (`"NVDA"`) or a foreign ticker with exchange suffix (`"ASML.AS"`)
   * @param params - Optional pagination: `page[offset]` (default 0) and `page[limit]` (default 100, range 1 to 5000)
   * @returns Envelope with the security, the fund count, and a page of funds sorted by weight
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.etf.heldBy('NVDA', { 'page[limit]': 3 });
   * console.log(res.data.held_by_count, res.data.funds[0].ticker);
   * ```
   */
  async heldBy(ticker: Ticker, params: EtfHeldByParams = {}): Promise<EtfHeldByResponse> {
    return this.http.get(`/etf/security/${encodeURIComponent(ticker)}/held-by`, params);
  }
}
