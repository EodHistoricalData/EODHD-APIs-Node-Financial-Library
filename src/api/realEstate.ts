import type { HttpClient } from "../http.js";
import type {
  RealEstateCountriesParams,
  RealEstateCountriesResponse,
  RealEstateDetailedPricesParams,
  RealEstateDetailedPricesResponse,
  RealEstateDetailedSeriesResponse,
  RealEstateSelectedPricesParams,
  RealEstateSelectedPricesResponse,
} from "../types.js";

/**
 * Real Estate Data API for BIS residential property prices — the covered
 * countries catalogue, headline Selected Property Prices (SPP), granular
 * Detailed Property Prices (DPP), and the DPP series catalogue.
 *
 * Country codes are ISO alpha-2 and case-insensitive (normalised server-side),
 * so they can be passed exactly as given (e.g. `US` or `us`).
 *
 * Accessed via `client.realEstate`.
 *
 * @see https://eodhd.com/financial-apis/real-estate-data-api
 */
export class RealEstateApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch the catalogue of covered countries and which datasets each carries.
   *
   * @param params - Optional sort and pagination
   * @returns Envelope with country items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.realEstate.countries({ sort: 'name' });
   * console.log(res.data[0].code, res.data[0].has_spp, res.data[0].has_dpp);
   * ```
   */
  async countries(params: RealEstateCountriesParams = {}): Promise<RealEstateCountriesResponse> {
    return this.http.get("/real-estate/countries", params);
  }

  /**
   * Fetch the headline harmonised Selected Property Prices (SPP) for a country.
   *
   * @param code - ISO alpha-2 country code (case-insensitive), e.g. `US`
   * @param params - Optional type, metric, from/to period filters, sort, and pagination
   * @returns Envelope with SPP items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.realEstate.selectedPrices('US', {
   *   'filter[type]': 'real',
   *   'filter[metric]': 'index',
   * });
   * console.log(res.data[0].period, res.data[0].value);
   * ```
   */
  async selectedPrices(
    code: string,
    params: RealEstateSelectedPricesParams = {},
  ): Promise<RealEstateSelectedPricesResponse> {
    return this.http.get(`/real-estate/${encodeURIComponent(code)}`, params);
  }

  /**
   * Fetch the granular national Detailed Property Prices (DPP) for a country.
   *
   * @param code - ISO alpha-2 country code (case-insensitive), e.g. `AE`
   * @param params - Optional area, property_type, vintage, freq, from/to filters, sort, and pagination
   * @returns Envelope with DPP items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.realEstate.detailedPrices('AE', { 'filter[property_type]': '1' });
   * console.log(res.data[0].period, res.data[0].value, res.data[0].covered_area_label);
   * ```
   */
  async detailedPrices(
    code: string,
    params: RealEstateDetailedPricesParams = {},
  ): Promise<RealEstateDetailedPricesResponse> {
    return this.http.get(`/real-estate/${encodeURIComponent(code)}/detailed`, params);
  }

  /**
   * Fetch the catalogue of available DPP series for a country.
   *
   * This endpoint is not paginated and takes no query parameters.
   *
   * @param code - ISO alpha-2 country code (case-insensitive), e.g. `US`
   * @returns Envelope with series catalogue items and meta (no links block)
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.realEstate.detailedSeries('US');
   * console.log(res.data[0].title, res.data[0].covered_area_label);
   * ```
   */
  async detailedSeries(code: string): Promise<RealEstateDetailedSeriesResponse> {
    return this.http.get(`/real-estate/${encodeURIComponent(code)}/detailed/series`);
  }
}
