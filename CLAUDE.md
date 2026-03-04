# EODHD Node.js/TypeScript SDK

## Overview

Official Node.js/TypeScript SDK for the EODHD financial data API. Published as `eodhd` on npm. Covers 70+ REST endpoints and 4 WebSocket feeds. Zero runtime deps beyond optional `ws` for Node.js WebSocket. Universal runtime: Node.js 18+, Deno, Bun, browsers.

## File Structure

```
src/
├── index.ts            # Public exports: EODHDClient, EODHDWebSocket, EODHDError, types
├── client.ts           # EODHDClient — facade class, delegates to API modules
├── http.ts             # HttpClient — fetch wrapper, auth injection, EODHDError
├── types.ts            # All TypeScript interfaces (flat, single file)
├── websocket.ts        # EODHDWebSocket — auto-reconnect, runtime WS detection
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
└── marketplace/        # Marketplace provider modules (4 files)
    ├── unicornbay.ts   # options (contracts/eod/underlyingSymbols), spglobal, tickdata, logo
    ├── tradinghours.ts # markets, details, lookup, status
    ├── praams.ts       # analyseEquity/Bond, bankIncomeStatement/BalanceSheet, explore, report
    └── investverte.ts  # companies, countries, sectors, esg, country, sector

test/
├── client.test.ts      # 48 tests — client methods, URL delegation
├── http.test.ts        # 27 tests — URL building, auth, errors
├── marketplace.test.ts # 26 tests — all 4 providers
└── smoke.ts            # Live E2E (needs EODHD_API_TOKEN)
```

## Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| EODHDClient | Facade — exposes all API methods, delegates to modules | `src/client.ts` |
| HttpClient | fetch wrapper — GET/POST/getBuffer, auth, timeout, error handling | `src/http.ts` |
| EODHDWebSocket | WS streaming with auto-reconnect, runtime detection (native/ws) | `src/websocket.ts` |
| EODHDError | Typed error with `statusCode` and `responseBody` | `src/http.ts` |
| API modules | One class per endpoint group, receives HttpClient via constructor | `src/api/*.ts` |
| Marketplace modules | One class per provider, same pattern | `src/marketplace/*.ts` |

## Architecture

**Pattern:** Class-based facade with constructor-injected modules.

```
EODHDClient (facade)
├── delegates to private modules: _eod, _fundamentals, _news, _screening, _corporate, _user, _macro
├── exposes public namespaces: calendar, exchanges, treasury, cboe
└── marketplace: { unicornbay: { options, spglobal }, tradinghours, praams, investverte }
    └── UnicornBayApi has nested sub-objects (options, spglobal) — 3rd nesting level
```

- All params → query string (no custom headers except `Content-Type` on POST)
- Auth: `api_token` query param injected by HttpClient
- Timeout: `AbortSignal.timeout()` (configurable, default from options)
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
npm run test:unit                        # 209 unit tests (vitest, no token needed)
EODHD_API_TOKEN=xxx npm test             # live smoke test (needs real token)
```

Tests mock `globalThis.fetch` — pure unit tests, no network. Verify exact URL paths and query params.

## Build & Publish

- **Bundler:** tsup 8 — dual CJS (`dist/index.js`) + ESM (`dist/index.mjs`)
- **Types:** `dist/index.d.ts` + `.d.ts.map`
- **Treeshake:** enabled, splitting disabled, sourcemap enabled
- **Prepublish:** `npm run build` runs automatically before `npm publish`
- **Target:** ES2022, strict TypeScript

## Runtime Compatibility

| Runtime | HTTP | WebSocket |
|---------|------|-----------|
| Node.js 18+ | native fetch | `ws` package (optional peer) |
| Deno | native fetch | native WebSocket |
| Bun | native fetch | native WebSocket |
| Browser | native fetch | native WebSocket |

WS detection: `globalThis.WebSocket` exists → native, else `require('ws')`.

## Dependencies

**Runtime:** `ws@^8` (optional — only needed for Node.js WebSocket)
**Dev:** typescript 5, tsup 8, vitest 4, tsx 4

## Related

- eodhdocs summary: `docs/code/nodejs-sdk.md`
- npm: https://www.npmjs.com/package/eodhd
- EODHD API docs: https://eodhd.com/financial-apis/
