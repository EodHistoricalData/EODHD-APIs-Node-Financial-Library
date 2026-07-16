import { describe, expect, it } from "vitest";
import type {
  CorporateHqmYieldsParams,
  CreditRiskResponse,
  EODHDClient,
  FundingStressItem,
  FundingStressResponse,
  ReferenceRateItem,
  ReferenceRatesParams,
  SanctionsEntityItem,
  SanctionsListResponse,
  SanctionsProgramItem,
  SanctionsVesselItem,
  SovereignRiskPremiumItem,
} from "../src/index.js";

describe("public API types", () => {
  it("models paginated JSON:API envelopes", () => {
    const response: CreditRiskResponse<SovereignRiskPremiumItem> = {
      data: [],
      meta: { total: 10, page: { offset: 0, limit: 20 } },
      links: { next: null },
    };

    expect(response.meta.page).toEqual({ offset: 0, limit: 20 });
  });

  it("requires the documented envelope fields and shapes", () => {
    const missingPage: CreditRiskResponse<SovereignRiskPremiumItem> = {
      data: [],
      // @ts-expect-error Paginated responses require meta.page.
      meta: { total: 10 },
      links: { next: null },
    };
    const missingNext: CreditRiskResponse<SovereignRiskPremiumItem> = {
      data: [],
      meta: { total: 10, page: { offset: 0, limit: 20 } },
      // @ts-expect-error Paginated responses require links.next.
      links: {},
    };
    const invalidSanctionsMeta: SanctionsListResponse<SanctionsProgramItem> = {
      data: [],
      // @ts-expect-error Sanctions programs and sources return an empty meta tuple.
      meta: { total: 0 },
      links: [],
    };
    const missingFundingTotal: FundingStressResponse<FundingStressItem> = {
      data: [],
      // @ts-expect-error Funding-stress responses require meta.total.
      meta: {},
      links: [],
    };

    expect(missingPage.meta.total).toBe(10);
    expect(missingNext.links).toEqual({});
    expect(invalidSanctionsMeta.meta).toEqual({ total: 0 });
    expect(missingFundingTotal.meta).toEqual({});
  });

  it("models sanctions list envelopes with empty meta and links", () => {
    const response: SanctionsListResponse<SanctionsProgramItem> = {
      data: [{ program: "SDN", count: 3 }],
      meta: [],
      links: [],
    };

    expect(response.meta).toEqual([]);
    expect(response.links).toEqual([]);
  });

  it("models funding-stress envelopes with an unpaginated total", () => {
    const response: FundingStressResponse<FundingStressItem> = {
      data: [],
      meta: { total: 0 },
      links: [],
    };

    expect(response.meta.total).toBe(0);
  });

  it("models optional sanctions entity ids, identifiers, and nullable fields", () => {
    const entity: SanctionsEntityItem = {
      id: 20413,
      source: "ofac",
      source_uid: "2674",
      entity_type: "individual",
      name: "Example Entity",
      programs: ["SDGT"],
      country: null,
      remarks: null,
      listed_date: null,
      is_active: true,
      aliases: [],
      identifiers: { "Tax ID No.": ["7704028201"] },
    };

    const entityWithoutId: SanctionsEntityItem = {
      source: "ofac",
      source_uid: "2674",
      entity_type: "individual",
      name: "Example Entity Without Id",
      programs: ["SDGT"],
      country: null,
      remarks: null,
      listed_date: null,
      is_active: true,
      aliases: [],
      identifiers: { "Tax ID No.": ["7704028201"] },
    };

    const documentedIdentifiers: SanctionsEntityItem["identifiers"] = [{ passport: "123456" }];
    const invalidEntityId: SanctionsEntityItem = {
      ...entityWithoutId,
      // @ts-expect-error Sanctions entity IDs must be numbers when present.
      id: "20413",
    };
    const nullEntityId: SanctionsEntityItem = {
      ...entityWithoutId,
      // @ts-expect-error Production omits entity IDs instead of returning null.
      id: null,
    };

    expect(entity.id).toBe(20413);
    expect(entityWithoutId.id).toBeUndefined();
    expect(invalidEntityId.id).toBe("20413");
    expect(nullEntityId.id).toBeNull();
    expect(entity.country).toBeNull();
    expect(documentedIdentifiers).toHaveLength(1);
  });

  it("models optional sanctions vessel ids and nullable vessel details", () => {
    const vessel: SanctionsVesselItem = {
      id: 1500,
      call_sign: null,
      vessel_type: null,
      flag: null,
      tonnage: null,
      gross_tonnage: null,
      owner: null,
      imo_number: null,
      mmsi: null,
      entity_source_uid: "7406784",
      entity_name: "Example Vessel",
      source: "ofac",
      programs: ["CUBA"],
      country: null,
      is_active: true,
    };
    const vesselWithoutId: SanctionsVesselItem = {
      call_sign: null,
      vessel_type: null,
      flag: null,
      tonnage: null,
      gross_tonnage: null,
      owner: null,
      imo_number: null,
      mmsi: null,
      entity_source_uid: "7406784",
      entity_name: "Example Vessel Without Id",
      source: "ofac",
      programs: ["CUBA"],
      country: null,
      is_active: true,
    };
    const invalidVesselId: SanctionsVesselItem = {
      ...vesselWithoutId,
      // @ts-expect-error Sanctions vessel IDs must be numbers when present.
      id: "1500",
    };
    const nullVesselId: SanctionsVesselItem = {
      ...vesselWithoutId,
      // @ts-expect-error Production omits vessel IDs instead of returning null.
      id: null,
    };

    expect(vessel.id).toBe(1500);
    expect(vesselWithoutId.id).toBeUndefined();
    expect(invalidVesselId.id).toBe("1500");
    expect(nullVesselId.id).toBeNull();
    expect(vessel.imo_number).toBeNull();
  });

  it("models optional reference-rate distribution fields", () => {
    const rate: ReferenceRateItem = {
      date: "2026-01-02",
      code: "SOFR",
      currency: "USD",
      rate_type: "overnight",
      rate: 4.25,
      source: "NY Fed",
      source_series_id: "SOFR",
      percentiles: { p1: 4.2, p25: 4.23, p75: 4.27, p99: 4.31 },
      volume_billion_usd: 1_925,
    };
    const rateWithoutDistribution: ReferenceRateItem = {
      date: "2026-01-03",
      code: "SONIA",
      currency: "GBP",
      rate_type: "overnight",
      rate: 3.75,
      source: "Bank of England",
      source_series_id: "SONIA",
    };
    const premiumWithoutRegion: SovereignRiskPremiumItem = {
      country_iso3: "USA",
      country_name: "United States",
      as_of_date: "2026-01-03",
      moodys_rating: "Aaa",
      adj_default_spread: 0,
      country_risk_premium: 0,
      equity_risk_premium: 4.33,
      corporate_tax_rate: 21,
      sovereign_cds: null,
      source: "EODHD",
    };

    expect(rate.percentiles?.p99).toBe(4.31);
    expect(rate.volume_billion_usd).toBe(1_925);
    expect(rateWithoutDistribution.percentiles).toBeUndefined();
    expect(premiumWithoutRegion.region).toBeUndefined();
  });

  it("keeps CSV filters as strings and currency values contract-bound", () => {
    const hqm: CorporateHqmYieldsParams = { "filter[tenor]": "5,10,30", "filter[type]": "spot,par" };
    const rates: ReferenceRatesParams = { "filter[currency]": "USD" };

    const invalidHqm: CorporateHqmYieldsParams = {
      // @ts-expect-error The API contract requires a string, including for a single tenor.
      "filter[tenor]": 10,
    };
    const invalidRates: ReferenceRatesParams = {
      // @ts-expect-error The public contract currently supports USD, GBP, and EUR.
      "filter[currency]": "JPY",
    };

    expect(hqm["filter[tenor]"]).toBe("5,10,30");
    expect(rates["filter[currency]"]).toBe("USD");
    expect(invalidHqm["filter[tenor]"]).toBe(10);
    expect(invalidRates["filter[currency]"]).toBe("JPY");
  });

  it("exposes parameterless sanctions list methods", () => {
    const namespaceProgramsArgs: Parameters<EODHDClient["sanctions"]["programs"]> = [];
    const namespaceSourcesArgs: Parameters<EODHDClient["sanctions"]["sources"]> = [];
    const facadeProgramsArgs: Parameters<EODHDClient["sanctionsPrograms"]> = [];
    const facadeSourcesArgs: Parameters<EODHDClient["sanctionsSources"]> = [];

    // @ts-expect-error Sanctions programs do not accept query parameters.
    const invalidNamespaceProgramsArgs: Parameters<EODHDClient["sanctions"]["programs"]> = [{}];
    // @ts-expect-error Sanctions sources do not accept query parameters.
    const invalidNamespaceSourcesArgs: Parameters<EODHDClient["sanctions"]["sources"]> = [{}];
    // @ts-expect-error The programs facade does not accept query parameters.
    const invalidFacadeProgramsArgs: Parameters<EODHDClient["sanctionsPrograms"]> = [{}];
    // @ts-expect-error The sources facade does not accept query parameters.
    const invalidFacadeSourcesArgs: Parameters<EODHDClient["sanctionsSources"]> = [{}];

    expect(namespaceProgramsArgs).toEqual([]);
    expect(namespaceSourcesArgs).toEqual([]);
    expect(facadeProgramsArgs).toEqual([]);
    expect(facadeSourcesArgs).toEqual([]);
    expect(invalidNamespaceProgramsArgs).toEqual([{}]);
    expect(invalidNamespaceSourcesArgs).toEqual([{}]);
    expect(invalidFacadeProgramsArgs).toEqual([{}]);
    expect(invalidFacadeSourcesArgs).toEqual([{}]);
  });
});
