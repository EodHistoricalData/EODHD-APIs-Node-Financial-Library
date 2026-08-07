import type { HttpClient } from "../http.js";
import type {
  SecFilings8KParams,
  SecFilings8KResponse,
  SecFilings10KParams,
  SecFilings10KResponse,
  SecFilings10QParams,
  SecFilings10QResponse,
  SecFilingsOverviewResponse,
} from "../types.js";

/**
 * SEC Filings API — parsed US SEC EDGAR filings for a symbol: an overview of
 * available forms, annual reports (10-K), quarterly reports (10-Q) with
 * extracted financials, and material-event disclosures (8-K).
 *
 * The 10-K, 10-Q, and 8-K endpoints are paginated via `page[offset]` and
 * `page[limit]`; the overview endpoint takes no query parameters.
 *
 * Accessed via `client.secFilings`.
 *
 * @see https://eodhd.com/financial-apis/sec-filings-api
 */
export class SecFilingsApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch the SEC filings overview for a symbol: issuer identity plus a
   * per-form summary (count, latest date, url) keyed by `10k`/`10q`/`8k`/`form4`.
   *
   * @param symbol - Ticker symbol, e.g. `AAPL`
   * @returns Overview payload where `data` is a single object; `meta` and `links` are empty
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.secFilings.secFilingsOverview('AAPL');
   * console.log(res.data.cik, res.data.filings['10k']?.latest);
   * ```
   */
  async secFilingsOverview(symbol: string): Promise<SecFilingsOverviewResponse> {
    return this.http.get(`/sec-filings/${encodeURIComponent(symbol)}`);
  }

  /**
   * Fetch parsed annual reports (10-K) for a symbol, with extracted financials.
   *
   * @param symbol - Ticker symbol, e.g. `AAPL`
   * @param params - Optional pagination (`page[offset]`, `page[limit]`)
   * @returns Envelope with 10-K filing rows, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.secFilings.secFilings10K('AAPL', { 'page[limit]': 5 });
   * console.log(res.data[0].fiscal_year_end, res.data[0].net_income);
   * ```
   */
  async secFilings10K(symbol: string, params: SecFilings10KParams = {}): Promise<SecFilings10KResponse> {
    return this.http.get(`/sec-filings/${encodeURIComponent(symbol)}/10k`, params);
  }

  /**
   * Fetch parsed quarterly reports (10-Q) for a symbol, with extracted financials.
   *
   * @param symbol - Ticker symbol, e.g. `AAPL`
   * @param params - Optional pagination (`page[offset]`, `page[limit]`)
   * @returns Envelope with 10-Q filing rows, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.secFilings.secFilings10Q('AAPL', { 'page[offset]': 20 });
   * console.log(res.data[0].fiscal_quarter, res.data[0].fiscal_quarter_end);
   * ```
   */
  async secFilings10Q(symbol: string, params: SecFilings10QParams = {}): Promise<SecFilings10QResponse> {
    return this.http.get(`/sec-filings/${encodeURIComponent(symbol)}/10q`, params);
  }

  /**
   * Fetch parsed material-event disclosures (8-K) for a symbol.
   *
   * @param symbol - Ticker symbol, e.g. `AAPL`
   * @param params - Optional pagination (`page[offset]`, `page[limit]`)
   * @returns Envelope with 8-K filing rows, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.secFilings.secFilings8K('AAPL', { 'page[limit]': 10 });
   * console.log(res.data[0].items, res.data[0].item_sections[0]?.title);
   * ```
   */
  async secFilings8K(symbol: string, params: SecFilings8KParams = {}): Promise<SecFilings8KResponse> {
    return this.http.get(`/sec-filings/${encodeURIComponent(symbol)}/8k`, params);
  }
}
