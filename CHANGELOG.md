# Changelog

## 0.2.0 (2026-03-03)

### Security
- Add `encodeURIComponent` on all path parameters to prevent path injection
- Redact API token in WebSocket error messages

### Fixed
- `handleError` now passes `responseBody` and `requestId` to error constructors
- `response.json()` parse failures now throw `EODHDError` with `parse_error` code instead of `NetworkError`
- Retry delay now has a minimum floor (100ms) to prevent zero-delay retries
- `Error.captureStackTrace` added for proper stack traces
- `TradingHoursDetailsParams` and `TradingHoursStatusParams`: `filter[market]` → `market`
- PRAAMS report methods now accept optional `email` parameter

### Changed
- `ws` moved from `dependencies` to optional `peerDependencies`

### Removed
- `illio` marketplace provider (non-functional)
- `robexia` marketplace provider (non-functional)
- `mainstreetdata` marketplace provider (non-functional)

## 0.1.0 (2026-03-03)

Initial public release.

### Features

- **70+ API endpoints** — EOD prices, intraday, fundamentals, calendar, news, screening, exchanges, macro, treasury, CBOE, corporate actions
- **WebSocket streaming** — real-time trades, quotes, forex, crypto with auto-reconnect and exponential backoff
- **Marketplace APIs** — Unicorn Bay (options, S&P Global, tick data), Trading Hours, PRAAMS (risk analytics), InvestVerte (ESG)
- **TypeScript-first** — 113 exported types, full IntelliSense support
- **Dual CJS/ESM** — tree-shakeable bundles via tsup
- **Error hierarchy** — `EODHDError`, `EODHDAuthError`, `EODHDRateLimitError`, `EODHDNetworkError`, `EODHDTimeoutError`
- **Retry with backoff** — configurable retries, exponential backoff with jitter, `Retry-After` header support
- **Rate limit awareness** — logs warning when API rate limit is low
- **Pagination helper** — `paginate()` async iterator for paged endpoints
- **Zero runtime deps** — optional `ws` peer dependency for Node.js WebSocket only
- **Universal runtime** — Node.js 18+, Deno, Bun, browsers
