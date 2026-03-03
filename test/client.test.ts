import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EODHDClient } from '../src/client.js';

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
  return new EODHDClient({ apiToken: 'test-token', baseUrl: 'https://eodhd.com/api/', timeout: 5000, maxRetries: 0 });
}

function getCalledUrl(mockFetch: ReturnType<typeof vi.fn>): string {
  return mockFetch.mock.calls[0][0];
}

function getCalledMethod(mockFetch: ReturnType<typeof vi.fn>): string {
  return mockFetch.mock.calls[0][1].method;
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe('EODHDClient', () => {
  let fetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetch = mockFetchOk();
    vi.stubGlobal('fetch', fetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('creates client with required apiToken', () => {
      const client = new EODHDClient({ apiToken: 'abc' });
      expect(client).toBeInstanceOf(EODHDClient);
    });

    it('uses default baseUrl and timeout', async () => {
      const client = new EODHDClient({ apiToken: 'abc' });
      await client.user();

      const url = getCalledUrl(fetch);
      expect(url).toContain('eodhd.com/api/');
    });

    it('accepts custom baseUrl', async () => {
      const client = new EODHDClient({ apiToken: 'abc', baseUrl: 'https://custom.api.com/v1/' });
      await client.user();

      const url = getCalledUrl(fetch);
      expect(url).toContain('custom.api.com/v1/');
    });

    it('passes apiToken in every request', async () => {
      const client = new EODHDClient({ apiToken: 'secret-key' });
      await client.user();

      const url = getCalledUrl(fetch);
      expect(url).toContain('api_token=secret-key');
    });
  });

  describe('apiToken validation', () => {
    const savedEnv = process.env.EODHD_API_TOKEN;

    afterEach(() => {
      if (savedEnv !== undefined) {
        process.env.EODHD_API_TOKEN = savedEnv;
      } else {
        delete process.env.EODHD_API_TOKEN;
      }
    });

    it('throws if apiToken is empty string', () => {
      delete process.env.EODHD_API_TOKEN;
      expect(() => new EODHDClient({ apiToken: '' })).toThrow('apiToken is required');
    });

    it('throws if apiToken is whitespace only', () => {
      delete process.env.EODHD_API_TOKEN;
      expect(() => new EODHDClient({ apiToken: '   ' })).toThrow('apiToken is required');
    });

    it('reads EODHD_API_TOKEN from env if no apiToken provided', () => {
      process.env.EODHD_API_TOKEN = 'env-token';
      const client = new EODHDClient({} as any);
      expect(client).toBeDefined();
    });

    it('throws if neither apiToken nor env var set', () => {
      delete process.env.EODHD_API_TOKEN;
      expect(() => new EODHDClient({} as any)).toThrow('apiToken is required');
    });

    it('trims apiToken', async () => {
      const client = new EODHDClient({ apiToken: '  my-token  ' });
      await client.user();

      const url = getCalledUrl(fetch);
      expect(url).toContain('api_token=my-token');
    });

    it('trims env var token', async () => {
      process.env.EODHD_API_TOKEN = '  env-trimmed  ';
      const client = new EODHDClient({} as any);
      await client.user();

      const url = getCalledUrl(fetch);
      expect(url).toContain('api_token=env-trimmed');
    });

    it('prefers explicit apiToken over env var', async () => {
      process.env.EODHD_API_TOKEN = 'env-token';
      const client = new EODHDClient({ apiToken: 'explicit-token' });
      await client.user();

      const url = getCalledUrl(fetch);
      expect(url).toContain('api_token=explicit-token');
    });
  });

  // ── Exposes sub-modules ─────────────────────────────────────────────────

  describe('sub-module exposure', () => {
    it('exposes calendar as a direct property', () => {
      const client = createClient();
      expect(client.calendar).toBeDefined();
      expect(typeof client.calendar.earnings).toBe('function');
      expect(typeof client.calendar.trends).toBe('function');
      expect(typeof client.calendar.ipos).toBe('function');
      expect(typeof client.calendar.splits).toBe('function');
      expect(typeof client.calendar.dividends).toBe('function');
    });

    it('exposes exchanges as a direct property', () => {
      const client = createClient();
      expect(client.exchanges).toBeDefined();
      expect(typeof client.exchanges.list).toBe('function');
      expect(typeof client.exchanges.symbols).toBe('function');
      expect(typeof client.exchanges.details).toBe('function');
      expect(typeof client.exchanges.symbolChangeHistory).toBe('function');
    });

    it('exposes treasury as a direct property', () => {
      const client = createClient();
      expect(client.treasury).toBeDefined();
      expect(typeof client.treasury.billRates).toBe('function');
      expect(typeof client.treasury.yieldRates).toBe('function');
      expect(typeof client.treasury.longTermRates).toBe('function');
      expect(typeof client.treasury.realYieldRates).toBe('function');
    });

    it('exposes cboe as a direct property', () => {
      const client = createClient();
      expect(client.cboe).toBeDefined();
      expect(typeof client.cboe.indices).toBe('function');
      expect(typeof client.cboe.index).toBe('function');
    });

    it('exposes marketplace with all providers', () => {
      const client = createClient();
      expect(client.marketplace).toBeDefined();
      expect(client.marketplace.unicornbay).toBeDefined();
      expect(client.marketplace.tradinghours).toBeDefined();
      expect(client.marketplace.illio).toBeDefined();
      expect(client.marketplace.praams).toBeDefined();
      expect(client.marketplace.investverte).toBeDefined();
      expect(client.marketplace.robexia).toBeDefined();
      expect(client.marketplace.mainstreetdata).toBeDefined();
    });
  });

  // ── Delegation: EOD & Price Data ────────────────────────────────────────

  describe('EOD delegation', () => {
    it('eod() calls /eod/{ticker}', async () => {
      const client = createClient();
      await client.eod('AAPL.US', { from: '2025-01-01' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/eod/AAPL.US');
      expect(url).toContain('from=2025-01-01');
    });

    it('realTime() calls /real-time/{ticker}', async () => {
      const client = createClient();
      await client.realTime('MSFT.US');

      expect(getCalledUrl(fetch)).toContain('/real-time/MSFT.US');
    });

    it('intraday() calls /intraday/{ticker}', async () => {
      const client = createClient();
      await client.intraday('TSLA.US', { interval: '5m' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/intraday/TSLA.US');
      expect(url).toContain('interval=5m');
    });

    it('usQuoteDelayed() calls /us-quote-delayed', async () => {
      const client = createClient();
      await client.usQuoteDelayed({ s: 'AAPL' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/us-quote-delayed');
      expect(url).toContain('s=AAPL');
    });

    it('bulkEod() calls /eod-bulk-last-day/{exchange}', async () => {
      const client = createClient();
      await client.bulkEod('US', { date: '2025-01-15' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/eod-bulk-last-day/US');
      expect(url).toContain('date=2025-01-15');
    });

    it('dividends() calls /div/{ticker}', async () => {
      const client = createClient();
      await client.dividends('AAPL.US', { from: '2024-01-01' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/div/AAPL.US');
      expect(url).toContain('from=2024-01-01');
    });

    it('splits() calls /splits/{ticker}', async () => {
      const client = createClient();
      await client.splits('AAPL.US');

      expect(getCalledUrl(fetch)).toContain('/splits/AAPL.US');
    });

    it('historicalMarketCap() calls /historical-market-cap/{ticker}', async () => {
      const client = createClient();
      await client.historicalMarketCap('AAPL.US');

      expect(getCalledUrl(fetch)).toContain('/historical-market-cap/AAPL.US');
    });

    it('ticks() calls /ticks', async () => {
      const client = createClient();
      await client.ticks({ s: 'AAPL', limit: 10 });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/ticks');
      expect(url).toContain('s=AAPL');
      expect(url).toContain('limit=10');
    });
  });

  // ── Delegation: Fundamentals ────────────────────────────────────────────

  describe('Fundamentals delegation', () => {
    it('fundamentals() calls /fundamentals/{ticker}', async () => {
      const client = createClient();
      await client.fundamentals('AAPL.US', { filter: 'General' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/fundamentals/AAPL.US');
      expect(url).toContain('filter=General');
    });

    it('bulkFundamentals() calls /bulk-fundamentals/{exchange}', async () => {
      const client = createClient();
      await client.bulkFundamentals('US', { symbols: 'AAPL,MSFT' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/bulk-fundamentals/US');
      expect(url).toContain('symbols=AAPL%2CMSFT');
    });

});

  // ── Delegation: News & Sentiment ────────────────────────────────────────

  describe('News delegation', () => {
    it('news() calls /news', async () => {
      const client = createClient();
      await client.news({ s: 'AAPL.US', limit: 5 });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/news');
      expect(url).toContain('s=AAPL.US');
      expect(url).toContain('limit=5');
    });

    it('sentiments() calls /sentiments', async () => {
      const client = createClient();
      await client.sentiments({ s: 'AAPL.US' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/sentiments');
      expect(url).toContain('s=AAPL.US');
    });

    it('newsWordWeights() calls /news-word-weights', async () => {
      const client = createClient();
      await client.newsWordWeights({ s: 'AAPL.US' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/news-word-weights');
    });
  });

  // ── Delegation: Screening & Search ──────────────────────────────────────

  describe('Screening delegation', () => {
    it('screener() calls /screener', async () => {
      const client = createClient();
      await client.screener({ filters: 'market_capitalization>100000000000' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/screener');
    });

    it('search() calls /search/{query}', async () => {
      const client = createClient();
      await client.search('Apple', { limit: 10, type: 'stock' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/search/Apple');
      expect(url).toContain('limit=10');
      expect(url).toContain('type=stock');
    });

    it('idMapping() calls /id-mapping', async () => {
      const client = createClient();
      await client.idMapping({ 'filter[isin]': 'US0378331005' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/id-mapping');
    });

    it('technical() calls /technical/{ticker}', async () => {
      const client = createClient();
      await client.technical('AAPL.US', { function: 'sma', period: 50 });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/technical/AAPL.US');
      expect(url).toContain('function=sma');
      expect(url).toContain('period=50');
    });
  });

  // ── Delegation: Corporate ───────────────────────────────────────────────

  describe('Corporate delegation', () => {
    it('insiderTransactions() calls /insider-transactions', async () => {
      const client = createClient();
      await client.insiderTransactions({ code: 'AAPL' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/insider-transactions');
      expect(url).toContain('code=AAPL');
    });
  });

  // ── Delegation: Macro ───────────────────────────────────────────────────

  describe('Macro delegation', () => {
    it('macroIndicator() calls /macro-indicator/{country}', async () => {
      const client = createClient();
      await client.macroIndicator('USA', { indicator: 'gdp_current_usd' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/macro-indicator/USA');
      expect(url).toContain('indicator=gdp_current_usd');
    });

    it('economicEvents() calls /economic-events', async () => {
      const client = createClient();
      await client.economicEvents({ country: 'US', from: '2025-01-01' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/economic-events');
      expect(url).toContain('country=US');
      expect(url).toContain('from=2025-01-01');
    });
  });

  // ── Delegation: User ────────────────────────────────────────────────────

  describe('User delegation', () => {
    it('user() calls /user', async () => {
      const client = createClient();
      await client.user();

      expect(getCalledUrl(fetch)).toContain('/user');
    });

    it('logo() calls /logo/{symbol}', async () => {
      const client = createClient();
      await client.logo('AAPL.US');

      expect(getCalledUrl(fetch)).toContain('/logo/AAPL.US');
    });

    it('logoSvg() calls /logo-svg/{symbol}', async () => {
      const client = createClient();
      await client.logoSvg('AAPL.US');

      expect(getCalledUrl(fetch)).toContain('/logo-svg/AAPL.US');
    });
  });

  // ── Calendar (direct property) ──────────────────────────────────────────

  describe('Calendar (via direct property)', () => {
    it('calendar.earnings() calls /calendar/earnings', async () => {
      const client = createClient();
      await client.calendar.earnings({ symbols: 'AAPL.US' });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/calendar/earnings');
      expect(url).toContain('symbols=AAPL.US');
    });

    it('calendar.trends() calls /calendar/trends', async () => {
      const client = createClient();
      await client.calendar.trends({ symbols: 'AAPL.US' });

      expect(getCalledUrl(fetch)).toContain('/calendar/trends');
    });

    it('calendar.ipos() calls /calendar/ipos', async () => {
      const client = createClient();
      await client.calendar.ipos();

      expect(getCalledUrl(fetch)).toContain('/calendar/ipos');
    });

    it('calendar.splits() calls /calendar/splits', async () => {
      const client = createClient();
      await client.calendar.splits();

      expect(getCalledUrl(fetch)).toContain('/calendar/splits');
    });

    it('calendar.dividends() calls /calendar/dividends', async () => {
      const client = createClient();
      await client.calendar.dividends();

      expect(getCalledUrl(fetch)).toContain('/calendar/dividends');
    });
  });

  // ── Exchanges (direct property) ─────────────────────────────────────────

  describe('Exchanges (via direct property)', () => {
    it('exchanges.list() calls /exchanges-list/', async () => {
      const client = createClient();
      await client.exchanges.list();

      expect(getCalledUrl(fetch)).toContain('/exchanges-list/');
    });

    it('exchanges.symbols() calls /exchange-symbol-list/{code}', async () => {
      const client = createClient();
      await client.exchanges.symbols('US');

      expect(getCalledUrl(fetch)).toContain('/exchange-symbol-list/US');
    });

    it('exchanges.details() calls /exchange-details/{code}', async () => {
      const client = createClient();
      await client.exchanges.details('US');

      expect(getCalledUrl(fetch)).toContain('/exchange-details/US');
    });

    it('exchanges.symbolChangeHistory() calls /symbol-change-history', async () => {
      const client = createClient();
      await client.exchanges.symbolChangeHistory();

      expect(getCalledUrl(fetch)).toContain('/symbol-change-history');
    });
  });

  // ── Treasury (direct property) ──────────────────────────────────────────

  describe('Treasury (via direct property)', () => {
    it('treasury.billRates() calls /ust/bill-rates', async () => {
      const client = createClient();
      await client.treasury.billRates();

      expect(getCalledUrl(fetch)).toContain('/ust/bill-rates');
    });

    it('treasury.yieldRates() calls /ust/yield-rates', async () => {
      const client = createClient();
      await client.treasury.yieldRates();

      expect(getCalledUrl(fetch)).toContain('/ust/yield-rates');
    });

    it('treasury.longTermRates() calls /ust/long-term-rates', async () => {
      const client = createClient();
      await client.treasury.longTermRates();

      expect(getCalledUrl(fetch)).toContain('/ust/long-term-rates');
    });

    it('treasury.realYieldRates() calls /ust/real-yield-rates', async () => {
      const client = createClient();
      await client.treasury.realYieldRates();

      expect(getCalledUrl(fetch)).toContain('/ust/real-yield-rates');
    });
  });

  // ── CBOE (direct property) ──────────────────────────────────────────────

  describe('CBOE (via direct property)', () => {
    it('cboe.indices() calls /cboe/indices', async () => {
      const client = createClient();
      await client.cboe.indices();

      expect(getCalledUrl(fetch)).toContain('/cboe/indices');
    });

    it('cboe.index() calls /cboe/index', async () => {
      const client = createClient();
      await client.cboe.index({
        'filter[index_code]': 'BUK100P',
        'filter[feed_type]': 'eod',
        'filter[date]': '2025-01-15',
      });

      const url = getCalledUrl(fetch);
      expect(url).toContain('/cboe/index');
    });
  });
});
