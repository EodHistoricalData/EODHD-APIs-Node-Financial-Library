import type { HttpClient } from "../http.js";
import type { CboeIndexData, CboeIndexItem, CboeIndexParams } from "../types.js";

/**
 * CBOE Europe indices API for index listings and historical data.
 *
 * Accessed via `client.cboe`.
 *
 * @see https://eodhd.com/financial-apis/cboe-europe-indices-api/
 */
export class CboeApi {
  constructor(private http: HttpClient) {}

  /**
   * Get a list of all available CBOE Europe indices.
   *
   * @returns Array of CBOE index items with codes and names
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/cboe-europe-indices-api/
   *
   * @example
   * ```ts
   * const indices = await client.cboe.indices();
   * console.log(indices[0].code, indices[0].name);
   * ```
   */
  async indices(): Promise<CboeIndexItem[]> {
    return this.http.get("/cboe/indices");
  }

  /**
   * Get historical data for a specific CBOE index.
   *
   * @param params - Required index code, feed type, and date filters
   * @returns CBOE index data object
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/cboe-europe-indices-api/
   *
   * @example
   * ```ts
   * const data = await client.cboe.index({
   *   'filter[index_code]': 'BUK100P',
   *   'filter[feed_type]': 'eod',
   *   'filter[date]': '2024-01-15',
   * });
   * console.log(data.data);
   * ```
   */
  async index(params: CboeIndexParams): Promise<CboeIndexData> {
    return this.http.get("/cboe/index", params);
  }
}
