/**
 * Smoke test for the EODHD Node.js SDK
 * Usage: EODHD_API_TOKEN=xxx npx tsx test/smoke.ts
 */
import { EODHDClient } from '../src/index.js';

const apiToken = process.env.EODHD_API_TOKEN;
if (!apiToken) {
  console.error('Set EODHD_API_TOKEN environment variable');
  process.exit(1);
}

const client = new EODHDClient({ apiToken });

async function test(name: string, fn: () => Promise<unknown>) {
  try {
    const result = await fn();
    const preview = JSON.stringify(result)?.slice(0, 200);
    console.log(`✅ ${name}: ${preview}...`);
  } catch (err) {
    console.error(`❌ ${name}: ${err}`);
  }
}

async function main() {
  console.log('\n=== EODHD Node.js SDK Smoke Test ===\n');

  // Core APIs
  await test('EOD (AAPL.US)', () => client.eod('AAPL.US', { from: '2025-01-01', to: '2025-01-10' }));
  await test('Real-time (AAPL.US)', () => client.realTime('AAPL.US'));
  await test('Intraday (AAPL.US)', () => client.intraday('AAPL.US', { interval: '1h', from: '1740000000', to: '1740100000' }));
  await test('Fundamentals (AAPL.US, General)', () => client.fundamentals('AAPL.US', { filter: 'General' }));
  await test('Search (Apple)', () => client.search('Apple', { limit: 3 }));
  await test('News (AAPL)', () => client.news({ s: 'AAPL.US', limit: 2 }));
  await test('Exchanges list', () => client.exchanges.list());
  await test('Exchange symbols (US)', () => client.exchanges.symbols('US', { type: 'common_stock' }));
  await test('Calendar earnings', () => client.calendar.earnings({ from: '2025-03-01', to: '2025-03-07' }));
  await test('Screener', () => client.screener({ limit: 3, sort: 'market_capitalization.desc' }));
  await test('Technical (SMA)', () => client.technical('AAPL.US', { function: 'sma', period: 50, from: '2025-01-01', to: '2025-01-31' }));
  await test('Macro indicator (USA GDP)', () => client.macroIndicator('USA', { indicator: 'gdp_current_usd' }));
  await test('User info', () => client.user());

  // Marketplace — Unicorn Bay
  await test('MP: Options underlying symbols', () => client.marketplace.unicornbay.options.underlyingSymbols({ 'page[limit]': 3 }));
  await test('MP: S&P Global indices', () => client.marketplace.unicornbay.spglobal.list());

  console.log('\n=== Done ===\n');
}

main();
