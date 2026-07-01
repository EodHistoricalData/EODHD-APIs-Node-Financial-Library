import type { HttpClient } from "../http.js";
import type {
  CdsMarketAggregateItem,
  CdsMarketAggregatesParams,
  CorporateCmdiItem,
  CorporateCmdiParams,
  CorporateHqmYieldItem,
  CorporateHqmYieldsParams,
  CreditRiskResponse,
  SovereignCdsSpreadItem,
  SovereignCdsSpreadsParams,
  SovereignCreditRatingItem,
  SovereignCreditRatingsParams,
  SovereignDefaultSpreadItem,
  SovereignDefaultSpreadsParams,
  SovereignRiskPremiumItem,
  SovereignRiskPremiumParams,
} from "../types.js";

/**
 * Credit & Sovereign Risk API for sovereign risk premiums, credit ratings,
 * CDS spreads, corporate credit market indices, HQM yields, and CDS market aggregates.
 *
 * Accessed via `client.creditRisk`.
 *
 * @see https://eodhd.com/financial-apis/
 */
export class CreditRiskApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch sovereign equity/country risk premiums by country.
   *
   * @param params - Optional country, region, as-of date filters, and pagination
   * @returns Envelope with sovereign risk premium items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const rp = await client.creditRisk.sovereignRiskPremium({ 'filter[country]': 'USA' });
   * console.log(rp.data[0].country_risk_premium);
   * ```
   */
  async sovereignRiskPremium(
    params: SovereignRiskPremiumParams = {},
  ): Promise<CreditRiskResponse<SovereignRiskPremiumItem>> {
    return this.http.get("/credit-risk/sovereign/risk-premium", params);
  }

  /**
   * Fetch sovereign credit ratings (Moody's, S&P, Fitch) by country.
   *
   * @param params - Optional country, as-of date filters, and pagination
   * @returns Envelope with sovereign credit rating items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const r = await client.creditRisk.sovereignCreditRatings({ 'filter[country]': 'USA' });
   * console.log(r.data[0].sp_rating, r.data[0].fitch_rating);
   * ```
   */
  async sovereignCreditRatings(
    params: SovereignCreditRatingsParams = {},
  ): Promise<CreditRiskResponse<SovereignCreditRatingItem>> {
    return this.http.get("/credit-risk/sovereign/credit-ratings", params);
  }

  /**
   * Fetch sovereign CDS spreads by country.
   *
   * @param params - Optional country, as-of date filters, and pagination
   * @returns Envelope with sovereign CDS spread items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const s = await client.creditRisk.sovereignCdsSpreads({ 'filter[country]': 'USA' });
   * console.log(s.data[0].cds_spread);
   * ```
   */
  async sovereignCdsSpreads(
    params: SovereignCdsSpreadsParams = {},
  ): Promise<CreditRiskResponse<SovereignCdsSpreadItem>> {
    return this.http.get("/credit-risk/sovereign/cds-spreads", params);
  }

  /**
   * Fetch sovereign default spreads by rating.
   *
   * @param params - Optional rating, as-of date filters, and pagination
   * @returns Envelope with sovereign default spread items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const d = await client.creditRisk.sovereignDefaultSpreads({ 'filter[rating]': 'Aaa' });
   * console.log(d.data[0].default_spread);
   * ```
   */
  async sovereignDefaultSpreads(
    params: SovereignDefaultSpreadsParams = {},
  ): Promise<CreditRiskResponse<SovereignDefaultSpreadItem>> {
    return this.http.get("/credit-risk/sovereign/default-spreads", params);
  }

  /**
   * Fetch corporate credit market distress index (CMDI) time series.
   *
   * @param params - Optional from/to date filters and pagination
   * @returns Envelope with corporate CMDI items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const cmdi = await client.creditRisk.corporateCmdi({ 'filter[from]': '2024-01-01' });
   * console.log(cmdi.data[0].market_cmdi);
   * ```
   */
  async corporateCmdi(params: CorporateCmdiParams = {}): Promise<CreditRiskResponse<CorporateCmdiItem>> {
    return this.http.get("/credit-risk/corporate/cmdi", params);
  }

  /**
   * Fetch high quality market (HQM) corporate bond yields.
   *
   * @param params - Optional tenor, type (par|spot), from/to date filters, and pagination
   * @returns Envelope with corporate HQM yield items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const y = await client.creditRisk.corporateHqmYields({ 'filter[type]': 'spot' });
   * console.log(y.data[0].yield_value);
   * ```
   */
  async corporateHqmYields(
    params: CorporateHqmYieldsParams = {},
  ): Promise<CreditRiskResponse<CorporateHqmYieldItem>> {
    return this.http.get("/credit-risk/corporate/hqm-yields", params);
  }

  /**
   * Fetch CDS market aggregates (e.g. gross notional by grade or cleared status).
   *
   * @param params - Optional metric, dimension, from/to date filters, and pagination
   * @returns Envelope with CDS market aggregate items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const agg = await client.creditRisk.cdsMarketAggregates({
   *   'filter[metric]': 'gross_notional',
   *   'filter[dimension]': 'grade',
   * });
   * console.log(agg.data[0].usd_notional_mn);
   * ```
   */
  async cdsMarketAggregates(
    params: CdsMarketAggregatesParams = {},
  ): Promise<CreditRiskResponse<CdsMarketAggregateItem>> {
    return this.http.get("/credit-risk/cds-market/aggregates", params);
  }
}
