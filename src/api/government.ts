import type { HttpClient } from "../http.js";
import type { CongressionalTradesParams, CongressionalTradesResponse } from "../types.js";

/**
 * Government disclosure data APIs.
 *
 * Accessed via `client.government`.
 *
 * @see https://eodhd.com/financial-apis/congressional-trades-api
 */
export class GovernmentApi {
  constructor(private http: HttpClient) {}

  /**
   * US Congress stock-trade disclosures filed under the STOCK Act, from the
   * official Senate EFD and House Clerk sources. Requires the All-in-One plan;
   * each request costs 10 API calls.
   *
   * @param params - Optional filters (symbol, chamber, member, transaction type, date ranges) and pagination
   * @returns Envelope with `data`, `meta`, and `links`
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/congressional-trades-api
   *
   * @example
   * ```ts
   * const res = await client.government.congressionalTrades({ chamber: "senate", "page[limit]": 5 });
   * console.log(res.meta.total, res.data[0].member.full_name);
   * ```
   */
  async congressionalTrades(params: CongressionalTradesParams = {}): Promise<CongressionalTradesResponse> {
    return this.http.get("/congressional-trades", params);
  }
}
