import type { HttpClient } from "../http.js";
import type { CommodityHistoryParams, CommodityHistoryResponse } from "../types.js";

/**
 * Commodities API for historical commodity prices sourced from FRED.
 *
 * Covers energy, metals, and agricultural commodities with daily, weekly,
 * monthly, quarterly, and annual intervals.
 *
 * Accessed via `client.commodities`.
 *
 * @see https://eodhd.com/financial-apis/commodities-api/
 */
export class CommoditiesApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch historical price data for a specific commodity.
   *
   * @param code - Commodity code, e.g. `"WTI"`, `"NATURAL_GAS"`, `"ALL_COMMODITIES"`
   * @param params - Optional interval (`daily`, `weekly`, `monthly`, `quarterly`, `annual`)
   * @returns Commodity history response with meta, data, and links
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/commodities-api/
   *
   * @example
   * ```ts
   * const wti = await client.commodities.history('WTI', { interval: 'monthly' });
   * console.log(wti.meta.name); // "Crude Oil Prices: West Texas Intermediate (WTI) ..."
   * console.log(wti.data[0].date, wti.data[0].value); // "2026-03-01" 104.69
   * ```
   */
  async history(code: string, params: CommodityHistoryParams = {}): Promise<CommodityHistoryResponse> {
    return this.http.get(`/commodities/historical/${code}`, params);
  }
}
