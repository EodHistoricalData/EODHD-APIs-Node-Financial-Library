# EODHD Node.js/TypeScript SDK

## Overview

Official Node.js/TypeScript SDK for the EODHD financial data API. Published as `eodhd` on npm. Covers 70+ REST endpoints and 4 WebSocket feeds. Zero runtime deps beyond optional `ws` for Node.js WebSocket. Universal runtime: Node.js 18+, Deno, Bun, browsers.

## File Structure

```
src/
├── index.ts            # Public exports: client, errors, websocket, types, utilities
├── client.ts           # EODHDClient — facade class, delegates to API modules
├── http.ts             # HttpClient — fetch wrapper, auth, retry, logging
├── errors.ts           # Error hierarchy: EODHDError, AuthError, RateLimitError, NetworkError, TimeoutError
├── types.ts            # All TypeScript interfaces — params + responses (fully typed, zero unknown)
├── websocket.ts        # EODHDWebSocket — auto-reconnect with backoff, subscribe/unsubscribe
├── logger.ts           # Logger interface, console logger, EODHD_LOG env var, URL redaction
├── retry.ts            # RetryOptions, calculateDelay (full jitter), sleep
├── pagination.ts       # paginate() async iterator with toArray(max)
├── deprecation.ts      # deprecated() wrapper with process.emitWarning
├── api/                # Core API modules (11 files)
│   ├── eod.ts          # eod, realTime, intraday, bulkEod, dividends, splits, ticks, historicalMarketCap
│   ├── fundamentals.ts # fundamentals, bulkFundamentals, logo, logoSvg
│   ├── calendar.ts     # earnings, trends, ipos, splits, dividends
│   ├── news.ts         # news, sentiments, newsWordWeights
│   ├── exchanges.ts    # list, symbols, details, symbolChangeHistory
│   ├── macro.ts        # macroIndicator, economicEvents
│   ├── treasury.ts     # billRates, yieldRates, longTermRates, realYieldRates
│   ├── cboe.ts         # indices, index
│   ├── screening.ts    # screener, search, idMapping, technical (20+ indicators)
│   ├── corporate.ts    # insiderTransactions
│   └── user.ts         # user account info
└── marketplace/        # Marketplace provider modules (7 files)
    ├── unicornbay.ts   # options (contracts/eod/underlyingSymbols), spglobal, tickdata, logo
    ├── tradinghours.ts # markets, details, lookup, status
    ├── illio.ts        # categoryPerformance/Risk, performance, bestAndWorst, volatility, risk, volume, betaBands
    ├── praams.ts       # analyseEquity/Bond, bankIncomeStatement/BalanceSheet, explore, report
    ├── investverte.ts  # companies, countries, sectors, esg, country, sector
    ├── robexia.ts      # basicTechAnalysis
    └── mainstreetdata.ts # metrics

test/
├── client.test.ts      # 55 tests — client methods, URL delegation, apiToken validation
├── http.test.ts        # 41 tests — URL building, auth, errors, timeout/network wrapping
├── errors.test.ts      # 42 tests — error hierarchy, retryable logic, subclasses
├── marketplace.test.ts # 36 tests — all 7 providers
├── logger.test.ts      # 13 tests — redaction, resolveLogger, console logger
├── retry.test.ts       # 13 tests — retry on 500/429, no retry on 400, exhaustion, Retry-After
├── websocket.test.ts   # 13 tests — reconnect, subscribe/unsubscribe, events, parse errors
├── responses.test.ts   # 8 tests — fixture-based response shape verification
├── pagination.test.ts  # 6 tests — async iteration, toArray, offset math
├── deprecation.test.ts # 5 tests — warning emission, dedup, this-context
├── fixtures/           # JSON response fixtures (eod, fundamentals, news, etc.)
└── smoke.ts            # Live E2E (needs EODHD_API_TOKEN)
```

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| EODHDClient | Facade — exposes all API methods, delegates to modules | `src/client.ts` |
| HttpClient | fetch wrapper — GET/POST/getBuffer, auth, retry, logging | `src/http.ts` |
| EODHDWebSocket | WS streaming with exponential backoff reconnect, subscribe/unsubscribe | `src/websocket.ts` |
| Error hierarchy | EODHDError, AuthError, RateLimitError, NetworkError, TimeoutError | `src/errors.ts` |
| Logger | Optional debug logging with token redaction, EODHD_LOG env var | `src/logger.ts` |
| Retry | Exponential backoff with full jitter, Retry-After support | `src/retry.ts` |
| Pagination | `paginate()` async iterator with `for await...of` + `toArray()` | `src/pagination.ts` |
| Deprecation | `deprecated()` wrapper with `process.emitWarning()` | `src/deprecation.ts` |
| API modules | One class per endpoint group, receives HttpClient via constructor | `src/api/*.ts` |
| Marketplace modules | One class per provider, same pattern | `src/marketplace/*.ts` |

## Architecture

**Pattern:** Class-based facade with constructor-injected modules.

```
EODHDClient (facade)
├── delegates to private modules: _eod, _fundamentals, _news, _screening, _corporate, _user, _macro
├── exposes public namespaces: calendar, exchanges, treasury, cboe
└── marketplace: { unicornbay: { options, spglobal }, tradinghours, illio, praams, investverte, robexia, mainstreetdata }
    └── UnicornBayApi has nested sub-objects (options, spglobal) — 3rd nesting level
```

- All params → query string (no custom headers except `Content-Type` on POST)
- Auth: `api_token` query param injected by HttpClient; supports `EODHD_API_TOKEN` env var fallback
- Timeout: `AbortSignal.timeout()` (configurable, default from options)
- Retry: exponential backoff with full jitter, configurable `maxRetries` (default 2), respects `Retry-After`
- Logging: optional `Logger` injection or `EODHD_LOG=debug` env var; auto-redacts api_token
- No DI container, decorators, or runtime reflection

## API Surface

Client methods (top-level):
`eod`, `realTime`, `intraday`, `usQuoteDelayed`, `bulkEod`, `dividends`, `splits`, `historicalMarketCap`, `ticks`, `fundamentals`, `bulkFundamentals`, `logo`, `logoSvg`, `news`, `sentiments`, `newsWordWeights`, `screener`, `search`, `idMapping`, `technical`, `insiderTransactions`, `macroIndicator`, `economicEvents`, `user`, `websocket`

Sub-namespaces: `client.calendar.*`, `client.exchanges.*`, `client.treasury.*`, `client.cboe.*`, `client.marketplace.*`

WebSocket feeds: `us` (trades), `us-quote` (quotes), `forex`, `crypto`

## Development Setup

```bash
npm install
npm run build        # tsup → dist/ (CJS + ESM + types)
npm run dev          # tsup --watch
npm run typecheck    # tsc --noEmit
```

## Testing

```bash
npm run test:unit                        # 232 unit tests (vitest, no token needed)
EODHD_API_TOKEN=xxx npm test             # live smoke test (needs real token)
```

Tests mock `globalThis.fetch` — pure unit tests, no network. Layers:
- URL routing tests (verify exact paths and query params)
- Error hierarchy tests (subclasses, retryable logic, error codes)
- Retry tests (backoff, Retry-After, exhaustion, non-retryable skip)
- WebSocket tests (reconnect, subscribe/unsubscribe, events, parse errors)
- Response shape tests (fixture-based, verify typed interfaces match API responses)
- Logger/pagination/deprecation unit tests

## Build & Publish

- **Bundler:** tsup 8 — dual CJS (`dist/index.js`) + ESM (`dist/index.mjs`)
- **Types:** `dist/index.d.ts` + `.d.ts.map`
- **Treeshake:** enabled, splitting enabled, `sideEffects: false`, sourcemap enabled
- **Prepublish:** `npm run build` runs automatically before `npm publish`
- **Target:** ES2022, strict TypeScript

## Runtime Compatibility

| Runtime | HTTP | WebSocket |
|---------|------|-----------|
| Node.js 18+ | native fetch | `ws` package (bundled) |
| Deno | native fetch | native WebSocket |
| Bun | native fetch | native WebSocket |
| Browser | native fetch | native WebSocket |

WS detection: `globalThis.WebSocket` exists → native, else dynamic `import('ws')`.
WS reconnect: exponential backoff with full jitter, `reconnectFailed` event on exhaustion.
WS post-connect: `subscribe(symbols)` / `unsubscribe(symbols)` for dynamic symbol changes.

## Dependencies

**Runtime:** `ws@^8` (optional — only needed for Node.js WebSocket)
**Dev:** typescript 5, tsup 8, vitest 4, tsx 4

## Related

- eodhdocs summary: `docs/code/nodejs-sdk.md`
- npm: https://www.npmjs.com/package/eodhd
- EODHD API docs: https://eodhd.com/financial-apis/
