import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EODHDClient } from "../src/client.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(body: unknown = {}) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    headers: new Headers(),
  });
}

function createClient() {
  return new EODHDClient({ apiToken: "test-token", baseUrl: "https://eodhd.com/api/", timeout: 5000, maxRetries: 0 });
}

function getCalledUrl(mockFetch: ReturnType<typeof vi.fn>): string {
  return mockFetch.mock.calls[0][0];
}

function getCalledParams(mockFetch: ReturnType<typeof vi.fn>): URLSearchParams {
  return new URL(getCalledUrl(mockFetch)).searchParams;
}

function getCalledPathname(mockFetch: ReturnType<typeof vi.fn>): string {
  return new URL(getCalledUrl(mockFetch)).pathname;
}

// ---------------------------------------------------------------------------
// Real Estate (BIS Property Prices)
// ---------------------------------------------------------------------------

describe("EODHDClient Real Estate", () => {
  let fetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetch = mockFetchOk();
    vi.stubGlobal("fetch", fetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sub-module exposure", () => {
    it("exposes realEstate as a direct property", () => {
      const client = createClient();
      expect(client.realEstate).toBeDefined();
      expect(typeof client.realEstate.countries).toBe("function");
      expect(typeof client.realEstate.selectedPrices).toBe("function");
      expect(typeof client.realEstate.detailedPrices).toBe("function");
      expect(typeof client.realEstate.detailedSeries).toBe("function");
    });
  });

  describe("Real Estate delegation", () => {
    it("realEstateCountries() calls /real-estate/countries with sort and pagination", async () => {
      const client = createClient();
      await client.realEstateCountries({ sort: "name", "page[limit]": 100, "page[offset]": 50 });

      expect(getCalledPathname(fetch)).toBe("/api/real-estate/countries");
      const params = getCalledParams(fetch);
      expect(params.get("sort")).toBe("name");
      expect(params.get("page[limit]")).toBe("100");
      expect(params.get("page[offset]")).toBe("50");
    });

    it("realEstateSelectedPrices() calls /real-estate/{code} with filters", async () => {
      const client = createClient();
      await client.realEstateSelectedPrices("US", {
        "filter[type]": "real",
        "filter[metric]": "index",
        "filter[from]": "2020-Q1",
        "filter[to]": "2024-Q4",
        sort: "-period",
      });

      expect(getCalledPathname(fetch)).toBe("/api/real-estate/US");
      const params = getCalledParams(fetch);
      expect(params.get("filter[type]")).toBe("real");
      expect(params.get("filter[metric]")).toBe("index");
      expect(params.get("filter[from]")).toBe("2020-Q1");
      expect(params.get("filter[to]")).toBe("2024-Q4");
      expect(params.get("sort")).toBe("-period");
    });

    it("realEstateSelectedPrices() passes the country code through as given (case-insensitive)", async () => {
      const client = createClient();
      await client.realEstateSelectedPrices("us");

      expect(getCalledPathname(fetch)).toBe("/api/real-estate/us");
    });

    it("realEstateDetailedPrices() calls /real-estate/{code}/detailed with filters", async () => {
      const client = createClient();
      await client.realEstateDetailedPrices("AE", {
        "filter[property_type]": "1",
        "filter[freq]": "Q",
      });

      expect(getCalledPathname(fetch)).toBe("/api/real-estate/AE/detailed");
      const params = getCalledParams(fetch);
      expect(params.get("filter[property_type]")).toBe("1");
      expect(params.get("filter[freq]")).toBe("Q");
    });

    it("realEstateDetailedSeries() calls /real-estate/{code}/detailed/series", async () => {
      const client = createClient();
      await client.realEstateDetailedSeries("US");

      expect(getCalledPathname(fetch)).toBe("/api/real-estate/US/detailed/series");
    });

    it("realEstate.countries() (direct property) calls the same endpoint", async () => {
      const client = createClient();
      await client.realEstate.countries();

      expect(getCalledPathname(fetch)).toBe("/api/real-estate/countries");
    });

    it("always requests JSON format", async () => {
      const client = createClient();
      await client.realEstateCountries();

      expect(getCalledParams(fetch).get("fmt")).toBe("json");
    });
  });
});
