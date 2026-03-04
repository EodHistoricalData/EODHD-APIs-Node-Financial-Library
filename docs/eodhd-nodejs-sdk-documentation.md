# EODHD Node.js/TypeScript SDK — Official Library

## Overview

The official EODHD Node.js/TypeScript library (`eodhd`) provides a convenient, fully-typed client for accessing the complete EODHD Financial Data API. It covers 70+ API endpoints including historical prices, fundamentals, options, news, real-time WebSocket streaming, calendar events, macroeconomic data, and all Marketplace providers.

**Key features:**

- Full TypeScript support with typed parameters and responses
- Single client for all EODHD APIs including Marketplace
- Real-time WebSocket streaming with auto-reconnect
- Works in Node.js 18+, Deno, Bun, and modern browsers
- Zero dependencies for REST (uses native `fetch`); optional `ws` package for WebSocket in Node.js
- Lightweight — under 40 KB (gzip)

**Links:**

- npm: https://www.npmjs.com/package/eodhd
- GitHub: https://github.com/EodHistoricalData/EODHD-APIs-Node-Financial-Library

---

## Installation

```bash
npm install eodhd
```

Or with Yarn / pnpm:

```bash
yarn add eodhd
pnpm add eodhd
```

---

## Quick Start

```typescript
import { EODHDClient } from 'eodhd';

const client = new EODHDClient({ apiToken: 'YOUR_API_TOKEN' });

// Get historical prices
const prices = await client.eod('AAPL.US', { from: '2024-01-01', to: '2024-12-31' });
console.log(prices[0]);
// { date: '2024-01-02', open: 187.15, high: 188.44, low: 183.89,
//   close: 185.64, adjusted_close: 184.53, volume: 82488700 }

// Get live price
const quote = await client.realTime('AAPL.US');
console.log(`${quote.code}: $${quote.close} (${quote.change_p}%)`);

// Search for stocks
const results = await client.search('Tesla', { limit: 5 });
```

---

## Configuration

```typescript
const client = new EODHDClient({
  apiToken: 'YOUR_API_TOKEN',       // required — get yours at https://eodhd.com
  baseUrl: 'https://eodhd.com/api', // optional, default
  timeout: 30000,                    // optional, request timeout in ms, default 30s
});
```

All methods return Promises. Ticker format is `SYMBOL.EXCHANGE` (e.g. `AAPL.US`, `VOD.LSE`, `BTC-USD.CC`).

---

## Historical & Price Data

### End-of-Day Historical Prices

```typescript
const eod = await client.eod('AAPL.US', {
  from: '2024-01-01',
  to: '2024-12-31',
  period: 'd', // 'd' (daily), 'w' (weekly), 'm' (monthly)
  order: 'a',  // 'a' (ascending), 'd' (descending)
  filter: 'last_close', // optional: 'last_close', 'last_volume'
});
```

### Intraday Data

```typescript
const intraday = await client.intraday('AAPL.US', {
  interval: '5m', // '1m', '5m', '1h'
  from: '1704067200',
  to: '1704153600',
});
```

### Live (Delayed) Stock Price

```typescript
// Single ticker
const live = await client.realTime('AAPL.US');

// Multiple tickers in one call
const liveMulti = await client.realTime('AAPL.US', { s: 'MSFT.US,GOOG.US' });
```

### US Extended Delayed Quotes

```typescript
const usQuotes = await client.usQuoteDelayed({ s: 'AAPL,MSFT,GOOG' });
```

### Bulk EOD Data

```typescript
const bulkUs = await client.bulkEod('US', { date: '2024-12-31' });
```

### Historical Dividends

```typescript
const dividends = await client.dividends('AAPL.US', { from: '2020-01-01' });
```

### Historical Splits

```typescript
const splits = await client.splits('AAPL.US');
```

### Historical Market Capitalization

```typescript
const marketCap = await client.historicalMarketCap('AAPL.US', {
  from: '2024-01-01',
});
```

### US Tick-Level Data

```typescript
const ticks = await client.ticks({
  s: 'AAPL',
  from: 1704067200,
  to: 1704070800,
});
```

---

## Fundamentals

### Company Fundamentals

```typescript
// Full company fundamentals
const fundamentals = await client.fundamentals('AAPL.US');

// Filter specific sections
const general = await client.fundamentals('AAPL.US', { filter: 'General' });
const financials = await client.fundamentals('AAPL.US', {
  filter: 'Financials',
});

// Historical fundamentals
const historical = await client.fundamentals('AAPL.US', {
  historical: 1,
  from: '2024-01-01',
  to: '2024-12-31',
});
```

### Bulk Fundamentals

```typescript
const bulkFund = await client.bulkFundamentals('US', {
  symbols: 'AAPL,MSFT,GOOG',
});
```

### Company Logos

```typescript
// Company logo (PNG) — returns ArrayBuffer
const logoPng = await client.logo('AAPL.US');

// Company logo (SVG) — returns ArrayBuffer
const logoSvg = await client.logoSvg('AAPL.US');
```

---

## Calendar Events

```typescript
// Upcoming earnings
const earnings = await client.calendar.earnings({
  from: '2025-03-01',
  to: '2025-03-31',
  symbols: 'AAPL.US,MSFT.US',
});

// Earnings trends
const trends = await client.calendar.trends({
  symbols: 'AAPL.US,MSFT.US',
});

// Upcoming IPOs
const ipos = await client.calendar.ipos({
  from: '2025-03-01',
  to: '2025-06-01',
});

// Upcoming splits
const splits = await client.calendar.splits({
  from: '2025-03-01',
  to: '2025-06-01',
  symbols: 'AAPL.US', // optional
});

// Upcoming dividends
const dividends = await client.calendar.dividends({
  'filter[date_from]': '2025-03-01',
  'filter[date_to]': '2025-03-31',
});
```

---

## News & Sentiment

```typescript
// Financial news
const news = await client.news({ s: 'AAPL.US', limit: 10 });

// Filter by tag
const techNews = await client.news({ t: 'technology', limit: 20 });

// Sentiment data
const sentiment = await client.sentiments({
  s: 'AAPL.US',
  from: '2025-01-01',
});

// News word weights
const weights = await client.newsWordWeights({
  s: 'AAPL.US',
  'filter[date_from]': '2025-01-01',
  'filter[date_to]': '2025-01-31',
});
```

---

## Technical Indicators

```typescript
const sma = await client.technical('AAPL.US', {
  function: 'sma',
  period: 50,
  from: '2025-01-01',
  order: 'a',
});

const rsi = await client.technical('AAPL.US', {
  function: 'rsi',
  period: 14,
  from: '2025-01-01',
});

const bbands = await client.technical('AAPL.US', {
  function: 'bbands',
  period: 20,
  from: '2025-01-01',
});
```

Available functions: `sma`, `ema`, `wma`, `macd`, `rsi`, `stochastic`, `stochrsi`, `dmi`, `adx`, `atr`, `cci`, `sar`, `beta`, `bbands`, `volatility`, `avgvol`, `avgvolccy`, `splitadjusted`, `slope`, `stddev`.

---

## Screening & Search

### Stock Screener

```typescript
const screened = await client.screener({
  sort: 'market_capitalization.desc',
  filters: JSON.stringify([
    ['market_capitalization', '>', 1000000000],
  ]),
  limit: 10,
});
```

### Search

```typescript
const results = await client.search('Apple', {
  limit: 10,
  type: 'stock', // 'all', 'stock', 'etf', 'fund', 'index', 'crypto'
});
```

### ID Mapping (ISIN, CUSIP, FIGI, LEI, CIK)

```typescript
const mapped = await client.idMapping({
  'filter[isin]': 'US0378331005',
});
```

---

## Exchanges

```typescript
// List all exchanges
const exchanges = await client.exchanges.list();

// Tickers for an exchange
const tickers = await client.exchanges.symbols('US', {
  type: 'common_stock',
});

// Exchange details with trading hours
const details = await client.exchanges.details('US');

// Symbol change history
const changes = await client.exchanges.symbolChangeHistory({
  from: '2024-01-01',
});
```

---

## Macro & Economic Data

```typescript
// Macroeconomic indicators
const gdp = await client.macroIndicator('USA', {
  indicator: 'gdp_current_usd',
});
const inflation = await client.macroIndicator('USA', {
  indicator: 'inflation_consumer_prices_annual',
});

// Economic events calendar
const events = await client.economicEvents({
  from: '2025-03-01',
  to: '2025-03-31',
  country: 'US',
});
```

---

## US Treasury Rates

```typescript
const bills = await client.treasury.billRates({ from: '2025-01-01' });
const yields = await client.treasury.yieldRates({ from: '2025-01-01' });
const longTerm = await client.treasury.longTermRates({
  from: '2025-01-01',
});
const realYield = await client.treasury.realYieldRates({
  from: '2025-01-01',
});
```

---

## CBOE Europe Indices

```typescript
const indices = await client.cboe.indices();
const index = await client.cboe.index({
  'filter[index_code]': 'BUK100P',
  'filter[feed_type]': 'constituent',
  'filter[date]': '2025-01-15',
});
```

---

## Corporate Actions

```typescript
// Insider transactions (SEC Form 4)
const insiders = await client.insiderTransactions({
  code: 'AAPL',
  from: '2025-01-01',
  limit: 100,
});
```

---

## User Info

```typescript
const user = await client.user();
// { name: '...', subscriptionType: '...', apiRequests: 42,
//   dailyRateLimit: 100000, ... }
```

---

## WebSocket (Real-time Streaming)

```typescript
// Connect to real-time US trades feed
const ws = client.websocket('us', ['AAPL', 'TSLA', 'MSFT']);

ws.on('data', (tick) => {
  console.log(`${tick.s}: $${tick.p} x${tick.v} @ ${new Date(tick.t)}`);
});

ws.on('error', (err) => console.error(err));
ws.on('close', () => console.log('Disconnected'));

// Close when done
ws.close();
```

Available feeds: `us` (US trades), `us-quote` (US quotes), `forex`, `crypto`.

WebSocket options:

```typescript
const ws = client.websocket('forex', ['EURUSD', 'GBPUSD'], {
  maxReconnectAttempts: 10, // default: 5
  reconnectInterval: 5000,  // default: 3000ms
});
```

---

## Marketplace APIs

The EODHD Marketplace (https://eodhd.com/financial-apis/marketplace) provides access to specialized data from third-party and in-house providers. All Marketplace methods are accessed via `client.marketplace.<provider>`.

### Unicorn Bay — US Options

**Marketplace product:** Unicorn Bay US Options (https://eodhd.com/financial-apis/marketplace/unicorn-bay-us-options-data-api)

```typescript
// List underlying symbols with options data
const symbols =
  await client.marketplace.unicornbay.options.underlyingSymbols({
    'page[limit]': 100,
  });

// Options contracts
const contracts =
  await client.marketplace.unicornbay.options.contracts({
    'filter[underlying_symbol]': 'AAPL',
    'filter[type]': 'call',
    'filter[exp_date_from]': '2025-06-01',
    'page[limit]': 50,
  });

// Options EOD data
const optionsEod =
  await client.marketplace.unicornbay.options.eod({
    'filter[underlying_symbol]': 'AAPL',
    'filter[exp_date_eq]': '2025-06-20',
  });
```

### Unicorn Bay — S&P Global Indices

**Marketplace product:** Unicorn Bay S&P Global Indices (https://eodhd.com/financial-apis/marketplace/unicorn-bay-sp-global-indices-api)

```typescript
// List all S&P/Dow Jones indices
const indices =
  await client.marketplace.unicornbay.spglobal.list();

// Index components (current)
const components =
  await client.marketplace.unicornbay.spglobal.components('GSPC.INDX');

// Historical components
const historical =
  await client.marketplace.unicornbay.spglobal.components('GSPC.INDX', {
    historical: true,
    from: '2024-01-01',
    to: '2024-12-31',
  });
```

### Unicorn Bay — Tick Data & Logos

**Marketplace product:** Unicorn Bay Tick Data (https://eodhd.com/financial-apis/marketplace/unicorn-bay-tick-data-api)

```typescript
// Tick data
const ticks = await client.marketplace.unicornbay.tickdata('AAPL');

// Stock logo
const logo = await client.marketplace.unicornbay.logo('AAPL.US');
```

### Trading Hours

**Marketplace product:** Trading Hours (https://eodhd.com/financial-apis/marketplace/trading-hours-api)

```typescript
const markets =
  await client.marketplace.tradinghours.markets();
const details =
  await client.marketplace.tradinghours.details({
    'filter[market]': 'US',
  });
const status =
  await client.marketplace.tradinghours.status({
    'filter[market]': 'US',
  });
const lookup =
  await client.marketplace.tradinghours.lookup({
    'filter[symbol]': 'AAPL',
  });
```

### illio — Market Insights

**Marketplace product:** illio Market Insights (https://eodhd.com/financial-apis/marketplace/illio-market-insights-api)

```typescript
// Available indices: 'SnP500', 'DJI', 'NDX'
const perf = await client.marketplace.illio.performance('SnP500');
const risk = await client.marketplace.illio.risk('SnP500');
const volatility = await client.marketplace.illio.volatility('DJI');
const bestWorst =
  await client.marketplace.illio.bestAndWorst('NDX');
const betaBands =
  await client.marketplace.illio.betaBands('SnP500');
const volume = await client.marketplace.illio.volume('SnP500');
const catPerf =
  await client.marketplace.illio.categoryPerformance('SnP500');
const catRisk =
  await client.marketplace.illio.categoryRisk('SnP500');
```

### PRAAMS — Investment Analytics

**Marketplace product:** PRAAMS Investment Analytics (https://eodhd.com/financial-apis/marketplace/praams-investment-analytics-api)

```typescript
// Equity risk scoring
const equityRisk =
  await client.marketplace.praams.analyseEquityByTicker('AAPL.US');
const equityRiskIsin =
  await client.marketplace.praams.analyseEquityByIsin('US0378331005');

// Bond analysis
const bondAnalysis =
  await client.marketplace.praams.analyseBond('US912828Z880');

// Bank financials
const bankIncome =
  await client.marketplace.praams.bankIncomeStatementByTicker('JPM.US');
const bankBalance =
  await client.marketplace.praams.bankBalanceSheetByTicker('JPM.US');

// Smart equity screener (POST)
const equities = await client.marketplace.praams.exploreEquity(
  { skip: 0, take: 20 },
  { regions: ['North America'], sectors: ['Technology'] },
);

// Smart bond screener (POST)
const bonds = await client.marketplace.praams.exploreBond(
  { skip: 0, take: 20 },
  { yieldMin: 3.0, durationMax: 5.0 },
);

// Reports (PDF)
const equityReport =
  await client.marketplace.praams.reportEquityByTicker('AAPL.US');
const bondReport =
  await client.marketplace.praams.reportBond('US912828Z880');
```

### InvestVerte — ESG Data

**Marketplace product:** InvestVerte ESG Data (https://eodhd.com/financial-apis/marketplace/investverte-esg-data-api)

```typescript
const companies =
  await client.marketplace.investverte.companies();
const countries =
  await client.marketplace.investverte.countries();
const sectors =
  await client.marketplace.investverte.sectors();

// Company ESG ratings
const esg = await client.marketplace.investverte.esg('AAPL.US', {
  year: 2024,
});

// Country ESG ratings
const countryEsg =
  await client.marketplace.investverte.country('US');

// Sector ESG ratings
const sectorEsg =
  await client.marketplace.investverte.sector('Technology');
```

### Robexia AI Lab

**Marketplace product:** Robexia AI Lab (https://eodhd.com/financial-apis/marketplace/robexia-ai-lab-api)

```typescript
const analysis =
  await client.marketplace.robexia.basicTechAnalysis({
    symbol: 'AAPL.US',
  });
```

### Main Street Data

**Marketplace product:** Main Street Data (https://eodhd.com/financial-apis/marketplace/main-street-data-api)

```typescript
const metrics =
  await client.marketplace.mainstreetdata.metrics({ symbol: 'TSLA' });
```

---

## Error Handling

All API errors are thrown as `EODHDError` with the HTTP status code:

```typescript
import { EODHDClient, EODHDError } from 'eodhd';

try {
  const data = await client.eod('INVALID.XX');
} catch (err) {
  if (err instanceof EODHDError) {
    console.log(err.statusCode); // 404
    console.log(err.message);    // "EODHD API Error (404): ..."
  }
}
```

---

## TypeScript Support

The library is written in TypeScript and exports typed interfaces for all parameters and responses:

```typescript
import {
  EODHDClient,
  EodDataPoint,
  RealTimeQuote,
  SearchResult,
} from 'eodhd';

const client = new EODHDClient({ apiToken: 'YOUR_API_TOKEN' });
const prices: EodDataPoint[] = await client.eod('AAPL.US');
const quote: RealTimeQuote = await client.realTime('AAPL.US');
const results: SearchResult[] = await client.search('Apple');
```

---

## Requirements

- **Node.js** >= 18 (uses native `fetch`)
- Also works in **Deno**, **Bun**, and modern **browsers**
- Optional: `ws` package for WebSocket in Node.js (browsers use native WebSocket)

---

## Links

- EODHD API Documentation: https://eodhd.com/financial-apis/
- npm Package: https://www.npmjs.com/package/eodhd
- GitHub Repository: https://github.com/EodHistoricalData/EODHD-APIs-Node-Financial-Library
- Support: https://eodhd.com/support
