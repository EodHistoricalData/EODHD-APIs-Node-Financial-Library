import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EODHDClient } from "../src/client.js";

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

function getCalledUrl(mock: ReturnType<typeof vi.fn>): string {
  return mock.mock.calls[0][0];
}

function getCalledMethod(mock: ReturnType<typeof vi.fn>): string {
  return mock.mock.calls[0][1].method;
}

describe("Marketplace: Unicorn Bay", () => {
  let fetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetch = mockFetchOk();
    vi.stubGlobal("fetch", fetch);
  });

  afterEach(() => vi.restoreAllMocks());

  it("options.contracts() calls /mp/unicornbay/options/contracts", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.options.contracts({ "filter[underlying_symbol]": "AAPL" });
    expect(getCalledUrl(fetch)).toContain("/mp/unicornbay/options/contracts");
  });

  it("options.eod() calls /mp/unicornbay/options/eod", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.options.eod({ "filter[underlying_symbol]": "AAPL" });
    expect(getCalledUrl(fetch)).toContain("/mp/unicornbay/options/eod");
  });

  it("options.underlyingSymbols() calls /mp/unicornbay/options/underlying-symbols", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.options.underlyingSymbols();
    expect(getCalledUrl(fetch)).toContain("/mp/unicornbay/options/underlying-symbols");
  });

  it("spglobal.list() calls /mp/unicornbay/spglobal/list", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.spglobal.list();
    expect(getCalledUrl(fetch)).toContain("/mp/unicornbay/spglobal/list");
  });

  it("spglobal.components() calls /mp/unicornbay/spglobal/comp/{symbol}", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.spglobal.components("GSPC.INDX");
    expect(getCalledUrl(fetch)).toContain("/mp/unicornbay/spglobal/comp/GSPC.INDX");
  });

  it("tickdata() calls /mp/unicornbay/tickdata/ticks", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.tickdata("AAPL");
    const url = getCalledUrl(fetch);
    expect(url).toContain("/mp/unicornbay/tickdata/ticks");
    expect(url).toContain("s=AAPL");
  });

  it("logo() calls /mp/unicornbay/logo/{symbol}", async () => {
    const client = createClient();
    await client.marketplace.unicornbay.logo("AAPL.US");
    expect(getCalledUrl(fetch)).toContain("/mp/unicornbay/logo/AAPL.US");
  });
});

describe("Marketplace: Trading Hours", () => {
  let fetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetch = mockFetchOk();
    vi.stubGlobal("fetch", fetch);
  });

  afterEach(() => vi.restoreAllMocks());

  it("markets() calls /mp/tradinghours/markets", async () => {
    const client = createClient();
    await client.marketplace.tradinghours.markets();
    expect(getCalledUrl(fetch)).toContain("/mp/tradinghours/markets");
  });

  it("details() calls /mp/tradinghours/markets/details", async () => {
    const client = createClient();
    await client.marketplace.tradinghours.details({ "filter[market]": "US" });
    expect(getCalledUrl(fetch)).toContain("/mp/tradinghours/markets/details");
  });

  it("lookup() calls /mp/tradinghours/markets/lookup", async () => {
    const client = createClient();
    await client.marketplace.tradinghours.lookup({ "filter[symbol]": "AAPL" });
    expect(getCalledUrl(fetch)).toContain("/mp/tradinghours/markets/lookup");
  });

  it("status() calls /mp/tradinghours/markets/status", async () => {
    const client = createClient();
    await client.marketplace.tradinghours.status();
    expect(getCalledUrl(fetch)).toContain("/mp/tradinghours/markets/status");
  });
});

describe("Marketplace: Praams", () => {
  let fetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetch = mockFetchOk();
    vi.stubGlobal("fetch", fetch);
  });

  afterEach(() => vi.restoreAllMocks());

  it("analyseEquityByTicker() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.analyseEquityByTicker("AAPL.US");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/analyse/equity/ticker/AAPL.US");
  });

  it("analyseEquityByIsin() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.analyseEquityByIsin("US0378331005");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/analyse/equity/isin/US0378331005");
  });

  it("analyseBond() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.analyseBond("US912828Z880");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/analyse/bond/US912828Z880");
  });

  it("bankIncomeStatementByTicker() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.bankIncomeStatementByTicker("JPM.US");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/bank/income_statement/ticker/JPM.US");
  });

  it("bankBalanceSheetByIsin() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.bankBalanceSheetByIsin("US46625H1005");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/bank/balance_sheet/isin/US46625H1005");
  });

  it("exploreEquity() uses POST method", async () => {
    const client = createClient();
    await client.marketplace.praams.exploreEquity({ skip: 0, take: 10 }, { regions: ["US"] });
    expect(getCalledMethod(fetch)).toBe("POST");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/explore/equity");
  });

  it("exploreBond() uses POST method", async () => {
    const client = createClient();
    await client.marketplace.praams.exploreBond({ skip: 0, take: 10 }, { yieldMin: 3 });
    expect(getCalledMethod(fetch)).toBe("POST");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/explore/bond");
  });

  it("reportEquityByTicker() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.reportEquityByTicker("AAPL.US");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/reports/equity/ticker/AAPL.US");
  });

  it("reportBond() calls correct path", async () => {
    const client = createClient();
    await client.marketplace.praams.reportBond("US912828Z880");
    expect(getCalledUrl(fetch)).toContain("/mp/praams/reports/bond/US912828Z880");
  });
});

describe("Marketplace: InvestVerte", () => {
  let fetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetch = mockFetchOk();
    vi.stubGlobal("fetch", fetch);
  });

  afterEach(() => vi.restoreAllMocks());

  it("companies() calls /mp/investverte/companies", async () => {
    const client = createClient();
    await client.marketplace.investverte.companies();
    expect(getCalledUrl(fetch)).toContain("/mp/investverte/companies");
  });

  it("countries() calls /mp/investverte/countries", async () => {
    const client = createClient();
    await client.marketplace.investverte.countries();
    expect(getCalledUrl(fetch)).toContain("/mp/investverte/countries");
  });

  it("sectors() calls /mp/investverte/sectors", async () => {
    const client = createClient();
    await client.marketplace.investverte.sectors();
    expect(getCalledUrl(fetch)).toContain("/mp/investverte/sectors");
  });

  it("esg() calls /mp/investverte/esg/{symbol}", async () => {
    const client = createClient();
    await client.marketplace.investverte.esg("AAPL.US", { year: 2024 });
    const url = getCalledUrl(fetch);
    expect(url).toContain("/mp/investverte/esg/AAPL.US");
    expect(url).toContain("year=2024");
  });

  it("country() calls /mp/investverte/country/{symbol}", async () => {
    const client = createClient();
    await client.marketplace.investverte.country("US");
    expect(getCalledUrl(fetch)).toContain("/mp/investverte/country/US");
  });

  it("sector() calls /mp/investverte/sector/{symbol}", async () => {
    const client = createClient();
    await client.marketplace.investverte.sector("Technology");
    expect(getCalledUrl(fetch)).toContain("/mp/investverte/sector/Technology");
  });
});
