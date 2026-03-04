# AGENTS.md — AI Agent Instructions

> Universal instructions for AI coding agents (Claude Code, GitHub Copilot, Cursor, OpenAI Codex, Gemini CLI, etc.)

## Project Overview

`eodhd` is the official Node.js/TypeScript SDK for [EODHD Financial Data APIs](https://eodhd.com). It provides typed access to 150,000+ tickers across 70+ exchanges — historical prices, fundamentals, options, news, real-time WebSocket streaming, and marketplace integrations.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Build:** tsup (CJS + ESM + declarations)
- **Test:** Vitest (unit tests with mocks, no API calls)
- **Runtime:** Node.js >= 20 (native fetch), also works in Deno/Bun/browsers
- **Dependencies:** zero runtime deps; `ws` optional peer dep for Node.js WebSocket

## Project Structure

```
src/
├── client.ts           # EODHDClient — main entry point
├── http.ts             # HTTP layer (fetch wrapper, retry, error handling)
├── errors.ts           # EODHDError class
├── types.ts            # All TypeScript interfaces/types
├── logger.ts           # Optional debug logger
├── retry.ts            # Retry logic with exponential backoff
├── pagination.ts       # Async iterator pagination
├── websocket.ts        # WebSocket client with reconnect
├── index.ts            # Public API exports
├── api/                # REST API method groups
│   ├── calendar.ts     # Earnings, IPOs, splits, dividends
│   ├── cboe.ts         # CBOE Europe indices
│   ├── corporate.ts    # Insider transactions
│   ├── eod.ts          # EOD, intraday, real-time, bulk, ticks
│   ├── exchanges.ts    # Exchange listings, symbols, details
│   ├── fundamentals.ts # Company fundamentals, bulk, logos
│   ├── macro.ts        # Macro indicators, economic events
│   ├── news.ts         # News, sentiment, word weights
│   ├── screening.ts    # Screener, search, ID mapping
│   ├── treasury.ts     # US Treasury rates
│   └── user.ts         # User info
└── marketplace/        # Third-party marketplace APIs
    ├── unicornbay.ts   # Options, S&P indices, tick data, logos
    ├── tradinghours.ts # Market hours/status
    ├── praams.ts       # Risk analytics, bond analysis
    └── investverte.ts  # ESG ratings
test/
├── client.test.ts      # Client initialization and method routing
├── http.test.ts        # HTTP layer, retries, error handling
├── errors.test.ts      # Error class behavior
├── marketplace.test.ts # Marketplace API tests
├── pagination.test.ts  # Async iterator tests
├── retry.test.ts       # Retry logic tests
├── websocket.test.ts   # WebSocket client tests
└── logger.test.ts      # Logger tests
```

## Conventions

- **Named exports only** — no default exports
- **Zero runtime dependencies** — all HTTP via native fetch
- **All tests are unit tests** — mock HTTP responses, never call real APIs
- **Types in `src/types.ts`** — centralized, exported from index
- **Error handling** — throw `EODHDError` with statusCode and message
- **API methods** return typed Promises — no callbacks
- **Marketplace APIs** are namespaced: `client.marketplace.<provider>.<method>()`

## Commands

```bash
npm run build       # Build CJS + ESM + type declarations
npm run typecheck   # TypeScript type checking
npm run test:unit   # Run all unit tests
npm run dev         # Watch mode build
```

## Guidelines for AI Agents

1. **Don't add runtime dependencies** — this SDK intentionally has zero
2. **Don't call real APIs in tests** — always mock fetch responses
3. **Follow existing patterns** — look at similar methods before adding new ones
4. **Keep types centralized** — add new interfaces to `src/types.ts`
5. **Export from index** — any new public API must be re-exported from `src/index.ts`
6. **Update CHANGELOG.md** for user-facing changes
