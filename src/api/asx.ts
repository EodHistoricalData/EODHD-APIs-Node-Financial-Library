import type { HttpClient } from "../http.js";
import type { AsxCorporateActionItem, AsxCorporateActionsParams, AsxCorporateActionsResponse } from "../types.js";

/**
 * ASX Corporate Actions API for Australian Securities Exchange corporate
 * actions (dividends, splits, bonus/rights issues, buybacks, capital returns,
 * SPP, and other events).
 *
 * Accessed via `client.asx`.
 *
 * @see https://eodhd.com/financial-apis/
 */
export class AsxApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch ASX corporate actions.
   *
   * @param params - Optional type, symbol (`.AU` ticker), date_from/date_to filters, and pagination
   * @returns Envelope with corporate action items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.asx.corporateActions({ type: 'dividends', symbol: 'PMV.AU' });
   * console.log(res.data[0].code, res.data[0].value);
   * ```
   */
  async corporateActions(
    params: AsxCorporateActionsParams = {},
  ): Promise<AsxCorporateActionsResponse<AsxCorporateActionItem>> {
    return this.http.get("/asx-corporate-actions", params);
  }
}
