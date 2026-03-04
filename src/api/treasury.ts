import type { HttpClient } from '../http.js';
import type { TreasuryParams, TreasuryRateItem } from '../types.js';

/**
 * US Treasury rates API for bill rates, yield curves, long-term rates, and real yields.
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
   * @param params - Optional date range
   * @returns Array of treasury rate items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const rates = await client.treasury.billRates({ from: '2024-01-01' });
   * console.log(rates[0].date);
   * ```
   */
  async billRates(params: TreasuryParams = {}): Promise<TreasuryRateItem[]> {
    return this.http.get('/ust/bill-rates', params);
  }

  /**
   * Fetch US Treasury yield curve rates.
   *
   * @param params - Optional date range
   * @returns Array of treasury rate items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const rates = await client.treasury.yieldRates({ from: '2024-01-01' });
   * console.log(rates[0].date);
   * ```
   */
  async yieldRates(params: TreasuryParams = {}): Promise<TreasuryRateItem[]> {
    return this.http.get('/ust/yield-rates', params);
  }

  /**
   * Fetch US Treasury long-term average rates.
   *
   * @param params - Optional date range
   * @returns Array of treasury rate items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const rates = await client.treasury.longTermRates({ from: '2024-01-01' });
   * console.log(rates[0].date);
   * ```
   */
  async longTermRates(params: TreasuryParams = {}): Promise<TreasuryRateItem[]> {
    return this.http.get('/ust/long-term-rates', params);
  }

  /**
   * Fetch US Treasury real yield rates (inflation-adjusted).
   *
   * @param params - Optional date range
   * @returns Array of treasury rate items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   *
   * @example
   * ```ts
   * const rates = await client.treasury.realYieldRates({ from: '2024-01-01' });
   * console.log(rates[0].date);
   * ```
   */
  async realYieldRates(params: TreasuryParams = {}): Promise<TreasuryRateItem[]> {
    return this.http.get('/ust/real-yield-rates', params);
  }
}
