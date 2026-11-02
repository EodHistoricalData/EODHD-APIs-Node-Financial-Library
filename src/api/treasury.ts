import type { HttpClient } from "../http.js";
import type {
  TreasuryBillRateItem,
  TreasuryLongTermRateItem,
  TreasuryParams,
  TreasuryRealYieldRateItem,
  TreasuryResponse,
  TreasuryYieldRateItem,
} from "../types.js";

/**
 * US Treasury rates API for bill rates, yield curves, long-term rates, and real yields.
 *
 * The UST API does NOT support pagination or date-range filtering. The only
 * real query parameter is `filter[year]` (defaults to the current year); the
 * full dataset for that year is always returned in a `{ meta, data, links }`
 * envelope where `links.next` is always `null`.
 *
 * Accessed via `client.treasury`.
 *
 * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
 */
export class TreasuryApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch US Treasury bill rates (short-term discount rates).
   *
   * @param params - Optional year filter (`filter[year]`, defaults to current year)
   * @returns Envelope with bill rate items, meta, and links
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const res = await client.treasury.billRates({ 'filter[year]': 2024 });
   * console.log(res.data[0].date, res.data[0].tenor, res.data[0].discount);
   * ```
   */
  async billRates(params: TreasuryParams = {}): Promise<TreasuryResponse<TreasuryBillRateItem>> {
    return this.http.get("/ust/bill-rates", params);
  }

  /**
   * Fetch US Treasury yield curve rates.
   *
   * @param params - Optional year filter (`filter[year]`, defaults to current year)
   * @returns Envelope with yield rate items, meta, and links
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const res = await client.treasury.yieldRates({ 'filter[year]': 2024 });
   * console.log(res.data[0].date, res.data[0].tenor, res.data[0].rate);
   * ```
   */
  async yieldRates(params: TreasuryParams = {}): Promise<TreasuryResponse<TreasuryYieldRateItem>> {
    return this.http.get("/ust/yield-rates", params);
  }

  /**
   * Fetch US Treasury long-term average rates.
   *
   * @param params - Optional year filter (`filter[year]`, defaults to current year)
   * @returns Envelope with long-term rate items, meta, and links
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const res = await client.treasury.longTermRates({ 'filter[year]': 2024 });
   * console.log(res.data[0].date, res.data[0].rate_type, res.data[0].rate);
   * ```
   */
  async longTermRates(params: TreasuryParams = {}): Promise<TreasuryResponse<TreasuryLongTermRateItem>> {
    return this.http.get("/ust/long-term-rates", params);
  }

  /**
   * Fetch US Treasury real yield rates (inflation-adjusted).
   *
   * @param params - Optional year filter (`filter[year]`, defaults to current year)
   * @returns Envelope with real yield rate items, meta, and links
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const res = await client.treasury.realYieldRates({ 'filter[year]': 2024 });
   * console.log(res.data[0].date, res.data[0].tenor, res.data[0].rate);
   * ```
   */
  async realYieldRates(params: TreasuryParams = {}): Promise<TreasuryResponse<TreasuryRealYieldRateItem>> {
    return this.http.get("/ust/real-yield-rates", params);
  }
}
