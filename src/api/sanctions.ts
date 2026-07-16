import type { HttpClient } from "../http.js";
import type {
  SanctionsEntitiesParams,
  SanctionsEntityItem,
  SanctionsListResponse,
  SanctionsProgramItem,
  SanctionsResponse,
  SanctionsSourceItem,
  SanctionsVesselItem,
  SanctionsVesselsParams,
} from "../types.js";

/**
 * Sanctions API for screening sanctioned entities and vessels, and listing
 * the available sanctions programs and sources.
 *
 * Accessed via `client.sanctions`.
 *
 * @see https://eodhd.com/financial-apis/sanctions-api-ofac-screening-data-entities-vessels
 */
export class SanctionsApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch sanctioned entities.
   *
   * @param params - Optional source, type, program, country, q (search), active filters, and pagination
   * @returns Envelope with sanctioned entity items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.sanctions.entities({ country: 'RU', type: 'individual' });
   * console.log(res.data[0].name, res.data[0].programs);
   * ```
   */
  async entities(params: SanctionsEntitiesParams = {}): Promise<SanctionsResponse<SanctionsEntityItem>> {
    return this.http.get("/sanctions/entities", params);
  }

  /**
   * Fetch sanctioned vessels.
   *
   * @param params - Optional source, imo, flag, vessel_type, q (minimum 2 characters), program filters, and pagination
   * @returns Envelope with sanctioned vessel items, meta, and links
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.sanctions.vessels({ flag: 'PA' });
   * console.log(res.data[0].imo_number, res.data[0].entity_name);
   * ```
   */
  async vessels(params: SanctionsVesselsParams = {}): Promise<SanctionsResponse<SanctionsVesselItem>> {
    return this.http.get("/sanctions/vessels", params);
  }

  /**
   * Fetch the list of sanctions programs with entity counts.
   *
   * This endpoint is not paginated and takes no parameters.
   *
   * @returns Envelope with sanctions program items (meta and links are empty)
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.sanctions.programs();
   * console.log(res.data[0].program, res.data[0].count);
   * ```
   */
  async programs(): Promise<SanctionsListResponse<SanctionsProgramItem>> {
    return this.http.get("/sanctions/programs");
  }

  /**
   * Fetch the list of sanctions sources.
   *
   * This endpoint is not paginated and takes no parameters.
   *
   * @returns Envelope with sanctions source items (meta and links are empty)
   * @throws {@link EODHDError} on API error
   *
   * @example
   * ```ts
   * const res = await client.sanctions.sources();
   * console.log(res.data[0].name);
   * ```
   */
  async sources(): Promise<SanctionsListResponse<SanctionsSourceItem>> {
    return this.http.get("/sanctions/sources");
  }
}
