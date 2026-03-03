import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EODHDClient } from '../src/client.js';
import eodFixture from './fixtures/eod.json';
import realTimeFixture from './fixtures/real-time.json';
import fundamentalsFixture from './fixtures/fundamentals.json';
import newsFixture from './fixtures/news.json';
import searchFixture from './fixtures/search.json';
import exchangesFixture from './fixtures/exchanges.json';
import calendarEarningsFixture from './fixtures/calendar-earnings.json';
import userFixture from './fixtures/user.json';

function mockResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  };
}

describe('response shapes', () => {
  let client: EODHDClient;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    client = new EODHDClient({ apiToken: 'test', maxRetries: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('eod() returns EodDataPoint[] with expected fields', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(eodFixture));
    const data = await client.eod('AAPL.US');
    expect(data).toHaveLength(2);
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('open');
    expect(data[0]).toHaveProperty('high');
    expect(data[0]).toHaveProperty('low');
    expect(data[0]).toHaveProperty('close');
    expect(data[0]).toHaveProperty('volume');
    expect(data[0]).toHaveProperty('adjusted_close');
    expect(typeof data[0].close).toBe('number');
    expect(typeof data[0].volume).toBe('number');
    expect(typeof data[0].date).toBe('string');
  });

  it('realTime() returns RealTimeQuote with expected fields', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(realTimeFixture));
    const data = await client.realTime('AAPL.US');
    expect(data).toHaveProperty('code');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('gmtoffset');
    expect(data).toHaveProperty('open');
    expect(data).toHaveProperty('high');
    expect(data).toHaveProperty('low');
    expect(data).toHaveProperty('close');
    expect(data).toHaveProperty('volume');
    expect(data).toHaveProperty('previousClose');
    expect(data).toHaveProperty('change');
    expect(data).toHaveProperty('change_p');
    expect(typeof data.close).toBe('number');
    expect(typeof data.change_p).toBe('number');
  });

  it('fundamentals() returns FundamentalsData with expected sections', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(fundamentalsFixture));
    const data = await client.fundamentals('AAPL.US');
    expect(data).toHaveProperty('General');
    expect(data).toHaveProperty('Highlights');
    expect(data).toHaveProperty('Valuation');
    expect(data).toHaveProperty('Financials');
    expect(data.General).toHaveProperty('Code');
    expect(data.General).toHaveProperty('Name');
  });

  it('news() returns NewsArticle[] with sentiment', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(newsFixture));
    const data = await client.news();
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty('date');
    expect(data[0]).toHaveProperty('title');
    expect(data[0]).toHaveProperty('content');
    expect(data[0]).toHaveProperty('link');
    expect(data[0]).toHaveProperty('symbols');
    expect(data[0]).toHaveProperty('tags');
    expect(data[0]).toHaveProperty('sentiment');
    expect(data[0].sentiment).toHaveProperty('polarity');
    expect(data[0].sentiment).toHaveProperty('neg');
    expect(data[0].sentiment).toHaveProperty('neu');
    expect(data[0].sentiment).toHaveProperty('pos');
    expect(Array.isArray(data[0].symbols)).toBe(true);
    expect(Array.isArray(data[0].tags)).toBe(true);
  });

  it('search() returns SearchResult[] with expected fields', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(searchFixture));
    const data = await client.search('Apple');
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty('Code');
    expect(data[0]).toHaveProperty('Exchange');
    expect(data[0]).toHaveProperty('Name');
    expect(data[0]).toHaveProperty('Type');
    expect(data[0]).toHaveProperty('Country');
    expect(data[0]).toHaveProperty('Currency');
    expect(data[0]).toHaveProperty('ISIN');
    expect(data[0]).toHaveProperty('previousClose');
    expect(data[0]).toHaveProperty('previousCloseDate');
    expect(typeof data[0].previousClose).toBe('number');
  });

  it('exchanges.list() returns Exchange[] with expected fields', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(exchangesFixture));
    const data = await client.exchanges.list();
    expect(data).toHaveLength(1);
    expect(data[0]).toHaveProperty('Name');
    expect(data[0]).toHaveProperty('Code');
    expect(data[0]).toHaveProperty('OperatingMIC');
    expect(data[0]).toHaveProperty('Country');
    expect(data[0]).toHaveProperty('Currency');
    expect(data[0]).toHaveProperty('CountryISO2');
    expect(data[0]).toHaveProperty('CountryISO3');
  });

  it('calendar.earnings() returns CalendarEarningsResponse', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(calendarEarningsFixture));
    const data = await client.calendar.earnings();
    expect(data).toHaveProperty('type');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('symbols_count');
    expect(data).toHaveProperty('earnings');
    expect(Array.isArray(data.earnings)).toBe(true);
    expect(data.earnings[0]).toHaveProperty('code');
    expect(data.earnings[0]).toHaveProperty('report_date');
    expect(data.earnings[0]).toHaveProperty('date');
    expect(data.earnings[0]).toHaveProperty('actual');
    expect(data.earnings[0]).toHaveProperty('estimate');
    expect(typeof data.earnings[0].actual).toBe('number');
  });

  it('user() returns UserData with expected fields', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(userFixture));
    const data = await client.user();
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('subscriptionType');
    expect(data).toHaveProperty('paymentMethod');
    expect(data).toHaveProperty('apiRequests');
    expect(data).toHaveProperty('apiRequestsDate');
    expect(data).toHaveProperty('dailyRateLimit');
    expect(typeof data.apiRequests).toBe('number');
    expect(typeof data.dailyRateLimit).toBe('number');
    expect(typeof data.name).toBe('string');
  });
});
