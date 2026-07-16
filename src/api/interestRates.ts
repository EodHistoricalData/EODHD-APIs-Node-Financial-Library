import type { HttpClient } from "../http.js";
import type {
  FundingStressItem,
  FundingStressParams,
  FundingStressResponse,
  InterestRatesResponse,
  PolicyRateItem,
  PolicyRatesParams,
  ReferenceRateItem,
  ReferenceRatesParams,
} from "../types.js";

/**
 * Interest Rates & Spreads API for reference rates (SOFR, SONIA, ESTR),
 * central bank policy rates, and funding-stress spreads.
 *
 * Accessed via `client.interestRates`.
 *
 * @see https://eodhd.com/financial-apis/interest-rates-api-sofr-fed-funds-ecb-boe-policy-rates
 */
export class InterestRatesApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch benchmark reference rates (e.g. SOFR, SONIA, ESTR).
   *
   * @param params - Optional code, supported currency (USD|GBP|EUR), from/to date filters, and pagination
   * @returns Envelope with reference rate items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.interestRates.referenceRates({ 'filter[currency]': 'USD' });
   * console.log(res.data[0].code, res.data[0].rate);
   * ```
   */
  async referenceRates(params: ReferenceRatesParams = {}): Promise<InterestRatesResponse<ReferenceRateItem>> {
    return this.http.get("/rates/reference-rates", params);
  }

  /**
   * Fetch central bank policy rates.
   *
   * @param params - Optional code, country, central_bank, from/to date filters, and pagination
   * @returns Envelope with policy rate items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.interestRates.policyRates({ 'filter[country]': 'US' });
   * console.log(res.data[0].central_bank, res.data[0].rate);
   * ```
   */
  async policyRates(params: PolicyRatesParams = {}): Promise<InterestRatesResponse<PolicyRateItem>> {
    return this.http.get("/rates/policy-rates", params);
  }

  /**
   * Fetch funding-stress spreads (e.g. spread between two funding legs, in bps).
   *
   * Note: this endpoint does not support pagination.
   *
   * @param params - Optional code and from/to date filters
   * @returns Envelope with funding-stress items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.interestRates.fundingStress({ 'filter[code]': 'EFFR_SOFR' });
   * console.log(res.data[0].value_bps, res.data[0].formula);
   * ```
   */
  async fundingStress(params: FundingStressParams = {}): Promise<FundingStressResponse<FundingStressItem>> {
    return this.http.get("/spreads/funding-stress", params);
  }
}
