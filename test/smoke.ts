/**
 * Full smoke test for the EODHD Node.js SDK — all endpoints
 * Usage: EODHD_API_TOKEN=xxx npx tsx test/smoke.ts
 */
import { EODHDClient } from "../src/index.js";

const apiToken = process.env.EODHD_API_TOKEN;
if (!apiToken) {
  console.error("Set EODHD_API_TOKEN environment variable");
  process.exit(1);
}

const client = new EODHDClient({ apiToken, maxRetries: 1 });

let passed = 0;
let failed = 0;
const failures: string[] = [];

async function test(name: string, fn: () => Promise<unknown>) {
  try {
    const result = await fn();
    const preview = JSON.stringify(result)?.slice(0, 120);
    console.log(`  \x1b[32m✓\x1b[0m ${name}: ${preview}...`);
    passed++;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  \x1b[31m✗\x1b[0m ${name}: ${msg}`);
    failed++;
    failures.push(name);
  }
}

async function main() {
  console.log("\n=== EODHD Node.js SDK — Full Smoke Test ===\n");

  // ── EOD & Price Data ──
  console.log("EOD & Price Data:");
  await test("eod", () => client.eod("AAPL.US", { from: "2025-01-01", to: "2025-01-10" }));
  await test("realTime", () => client.realTime("AAPL.US"));
  await test("intraday", () => client.intraday("AAPL.US", { interval: "1h", from: "1740000000", to: "1740100000" }));
  await test("usQuoteDelayed", () => client.usQuoteDelayed({ s: "AAPL" }));
  await test("bulkEod", () => client.bulkEod("US", { symbols: "AAPL,MSFT", date: "2025-01-02" }));
  await test("dividends", () => client.dividends("AAPL.US", { from: "2024-01-01", to: "2024-12-31" }));
  await test("splits", () => client.splits("AAPL.US", { from: "2020-01-01", to: "2024-12-31" }));
  await test("historicalMarketCap", () =>
    client.historicalMarketCap("AAPL.US", { from: "2025-01-01", to: "2025-01-10" }));
  await test("ticks", () => client.ticks({ s: "AAPL", from: "1740000000", to: "1740001000" }));

  // ── Fundamentals ──
  console.log("\nFundamentals:");
  await test("fundamentals", () => client.fundamentals("AAPL.US", { filter: "General" }));
  await test("bulkFundamentals", () => client.bulkFundamentals("US", { symbols: "AAPL", type: "General" }));
  await test("logo (PNG)", () => client.logo("AAPL.US"));
  await test("logoSvg", () => client.logoSvg("AAPL.US"));

  // ── Calendar ──
  console.log("\nCalendar:");
  await test("calendar.earnings", () => client.calendar.earnings({ from: "2025-03-01", to: "2025-03-07" }));
  await test("calendar.trends", () => client.calendar.trends({ symbols: "AAPL.US" }));
  await test("calendar.ipos", () => client.calendar.ipos({ from: "2025-03-01", to: "2025-03-07" }));
  await test("calendar.splits", () => client.calendar.splits({ from: "2025-03-01", to: "2025-03-31" }));
  await test("calendar.dividends", () => client.calendar.dividends({ "filter[date_eq]": "2025-03-03" }));

  // ── News & Sentiment ──
  console.log("\nNews & Sentiment:");
  await test("news", () => client.news({ s: "AAPL.US", limit: 2 }));
  await test("sentiments", () => client.sentiments({ s: "AAPL.US", from: "2025-01-01", to: "2025-01-10" }));
  await test("newsWordWeights", () => client.newsWordWeights({ s: "AAPL.US", "page[limit]": 10 }));

  // ── Screening & Search ──
  console.log("\nScreening & Search:");
  await test("screener", () => client.screener({ limit: 3, sort: "market_capitalization.desc" }));
  await test("search", () => client.search("Apple", { limit: 3 }));
  await test("idMapping", () => client.idMapping({ "filter[isin]": "US0378331005" }));
  await test("technical (SMA)", () =>
    client.technical("AAPL.US", { function: "sma", period: 50, from: "2025-01-01", to: "2025-01-31" }));

  // ── Exchanges ──
  console.log("\nExchanges:");
  await test("exchanges.list", () => client.exchanges.list());
  await test("exchanges.symbols", () => client.exchanges.symbols("US", { type: "common_stock" }));
  await test("exchanges.details", () => client.exchanges.details("US"));
  await test("exchanges.symbolChangeHistory", () =>
    client.exchanges.symbolChangeHistory({ from: "2025-01-01", to: "2025-01-31" }));

  // ── Corporate ──
  console.log("\nCorporate:");
  await test("insiderTransactions", () => client.insiderTransactions({ code: "AAPL", limit: 3 }));

  // ── Macro & Economic ──
  console.log("\nMacro & Economic:");
  await test("macroIndicator", () => client.macroIndicator("USA", { indicator: "gdp_current_usd" }));
  await test("economicEvents", () => client.economicEvents({ from: "2025-03-01", to: "2025-03-07" }));

  // ── Treasury ──
  console.log("\nTreasury:");
  await test("treasury.billRates", () => client.treasury.billRates({ from: "2025-01-01", to: "2025-01-10" }));
  await test("treasury.yieldRates", () => client.treasury.yieldRates({ from: "2025-01-01", to: "2025-01-10" }));
  await test("treasury.longTermRates", () => client.treasury.longTermRates({ from: "2025-01-01", to: "2025-01-10" }));
  await test("treasury.realYieldRates", () => client.treasury.realYieldRates({ from: "2025-01-01", to: "2025-01-10" }));

  // ── CBOE ──
  console.log("\nCBOE:");
  await test("cboe.indices", () => client.cboe.indices());
  await test("cboe.index", () =>
    client.cboe.index({ "filter[index_code]": "BUK100P", "filter[feed_type]": "eod", "filter[date]": "2025-01-15" }));

  // ── User ──
  console.log("\nUser:");
  await test("user", () => client.user());

  // ── Marketplace: Unicorn Bay ──
  console.log("\nMarketplace — Unicorn Bay:");
  await test("unicornbay.options.contracts", () =>
    client.marketplace.unicornbay.options.contracts({ "filter[underlying_symbol]": "AAPL", "page[limit]": 3 }));
  await test("unicornbay.options.eod", () =>
    client.marketplace.unicornbay.options.eod({ "filter[underlying_symbol]": "AAPL", "page[limit]": 3 }));
  await test("unicornbay.options.underlyingSymbols", () =>
    client.marketplace.unicornbay.options.underlyingSymbols({ "page[limit]": 3 }));
  await test("unicornbay.spglobal.list", () => client.marketplace.unicornbay.spglobal.list());
  await test("unicornbay.spglobal.components", () => client.marketplace.unicornbay.spglobal.components("GSPC"));
  await test("unicornbay.tickdata", () =>
    client.marketplace.unicornbay.tickdata("AAPL", { from: "1740000000", to: "1740001000" }));
  await test("unicornbay.logo", () => client.marketplace.unicornbay.logo("AAPL"));

  // ── Marketplace: Trading Hours ──
  console.log("\nMarketplace — Trading Hours:");
  await test("tradinghours.markets", () => client.marketplace.tradinghours.markets());
  await test("tradinghours.details", () => client.marketplace.tradinghours.details({ market: "US.NASDAQ" }));
  await test("tradinghours.lookup", () => client.marketplace.tradinghours.lookup({ "filter[name]": "NASDAQ" }));
  await test("tradinghours.status", () => client.marketplace.tradinghours.status({ market: "US.NASDAQ" }));

  // ── Marketplace: PRAAMS ──
  console.log("\nMarketplace — PRAAMS:");
  await test("praams.analyseEquityByTicker", () => client.marketplace.praams.analyseEquityByTicker("AAPL.DE"));
  await test("praams.analyseEquityByIsin", () => client.marketplace.praams.analyseEquityByIsin("US0378331005"));
  await test("praams.reportEquityByTicker", () =>
    client.marketplace.praams.reportEquityByTicker("AAPL.US", { email: "test@example.com" }));
  await test("praams.exploreEquity", () => client.marketplace.praams.exploreEquity({}, {}));

  // ── Marketplace: InvestVerte (ESG) ──
  console.log("\nMarketplace — InvestVerte (ESG):");
  await test("investverte.companies", () => client.marketplace.investverte.companies());
  await test("investverte.countries", () => client.marketplace.investverte.countries());
  await test("investverte.sectors", () => client.marketplace.investverte.sectors());
  await test("investverte.esg", () => client.marketplace.investverte.esg("AAPL"));

  // ── Summary ──
  console.log(`\n${"=".repeat(50)}`);
  console.log(`\x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m out of ${passed + failed} endpoints`);
  if (failures.length > 0) {
    console.log(`\nFailed: ${failures.join(", ")}`);
  }
  console.log();

  process.exit(failed > 0 ? 1 : 0);
}

main();
