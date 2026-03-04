# Contributing

Thanks for your interest in contributing to the `eodhd` SDK!

## Development Setup

```bash
git clone https://github.com/EodHistoricalData/EODHD-APIs-Node-Financial-Library.git
cd EODHD-APIs-Node-Financial-Library
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build CJS + ESM + type declarations |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run dev` | Watch mode build |

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Ensure all checks pass:
   ```bash
   npm run typecheck
   npm run test:unit
   npm run build
   ```
5. Update `CHANGELOG.md` if the change is user-facing
6. Open a pull request

## Code Style

- TypeScript strict mode
- 2-space indentation
- No default exports — use named exports only
- Keep dependencies minimal — the SDK has zero runtime dependencies

## Adding API Methods

1. Add the method to the appropriate file in `src/api/`
2. Add types to `src/types.ts`
3. Export from `src/index.ts`
4. Add unit tests in `test/`
5. Document in `README.md`

## Reporting Bugs

Use [GitHub Issues](https://github.com/EodHistoricalData/EODHD-APIs-Node-Financial-Library/issues) with the bug report template.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
