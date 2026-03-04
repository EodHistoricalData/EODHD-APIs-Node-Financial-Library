import { HttpClient } from './http.js';
import { EODHDWebSocket } from './websocket.js';
import { type Logger, resolveLogger } from './logger.js';
import { DEFAULT_RETRY } from './retry.js';
import type {
  Ticker, EodParams, EodDataPoint, IntradayParams, IntradayDataPoint,
  RealTimeQuote, RealTimeParams, UsQuoteDelayedParams, UsQuoteDelayedResult,
  BulkEodParams, BulkEodDataPoint,
  DividendDataPoint, SplitDataPoint, HistoricalMarketCapPoint,
  TicksParams, TickDataPoint,
  FundamentalsParams, FundamentalsData,
  BulkFundamentalsParams, BulkFundamentalsItem,
  CalendarEarningsParams, CalendarTrendsParams, CalendarIposParams,
  CalendarSplitsParams, CalendarDividendsParams,
  NewsParams, NewsArticle, SentimentsParams, SentimentItem,
  NewsWordWeightsParams, NewsWordWeight,
  ExchangeSymbolsParams, ExchangeDetailsParams, Exchange,
  MacroIndicatorParams, MacroIndicatorItem,
  EconomicEventsParams, EconomicEventsResponse,
  TreasuryParams, CboeIndexParams,
  ScreenerParams, ScreenerResponse, SearchParams, SearchResult,
  IdMappingParams, IdMappingItem,
  TechnicalParams, TechnicalDataPoint,
  InsiderTransactionsParams, InsiderTransactionItem,
  DateRange,
  UserData,
  WebSocketFeed, WebSocketOptions,
} from './types.js';

// API modules
import { EodApi } from './api/eod.js';
import { FundamentalsApi } from './api/fundamentals.js';
import { CalendarApi } from './api/calendar.js';
import { NewsApi } from './api/news.js';
import { ExchangesApi } from './api/exchanges.js';
import { MacroApi } from './api/macro.js';
import { TreasuryApi } from './api/treasury.js';
import { CboeApi } from './api/cboe.js';
import { ScreeningApi } from './api/screening.js';
import { CorporateApi } from './api/corporate.js';
import { UserApi } from './api/user.js';

// Marketplace modules
import { UnicornBayApi } from './marketplace/unicornbay.js';
import { TradingHoursApi } from './marketplace/tradinghours.js';
import { PraamsApi } from './marketplace/praams.js';
import { InvestVerteApi } from './marketplace/investverte.js';

export interface EODHDClientOptions {
  /** Your EODHD API token (falls back to EODHD_API_TOKEN env var) */
  apiToken?: string;
  /** Base URL (default: https://eodhd.com/api) */
  baseUrl?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Max retry attempts on retryable errors (default: 2, set 0 to disable) */
  maxRetries?: number;
  /** Optional logger; set EODHD_LOG=debug env var for built-in console logger */
  logger?: Logger;
}

/**
 * Main client for the EODHD financial data API.
 *
 * Provides access to 70+ REST endpoints covering end-of-day prices, fundamentals,
 * news, screener, calendar events, exchanges, macro indicators, and more.
 *
 * @example
 * ```ts
 * import { EODHDClient } from 'eodhd';
 *
 * const client = new EODHDClient({ apiToken: 'YOUR_TOKEN' });
 * const data = await client.eod('AAPL.US', { period: 'd' });
 * ```
 *
 * @see https://eodhd.com/financial-apis/
 */
export class EODHDClient {
  private readonly http: HttpClient;

  // Internal API modules
  private readonly _eod: EodApi;
  private readonly _fundamentals: FundamentalsApi;
  private readonly _news: NewsApi;
  private readonly _screening: ScreeningApi;
  private readonly _corporate: CorporateApi;
  private readonly _user: UserApi;
  private readonly _macro: MacroApi;

  /**
   * Calendar events: earnings, IPOs, splits, dividends, trends.
   *
   * @example
   * ```ts
   * const earnings = await client.calendar.earnings({ symbols: 'AAPL.US' });
   * const ipos = await client.calendar.ipos({ from: '2024-01-01' });
   * ```
   *
   * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
   */
  readonly calendar: CalendarApi;

  /**
   * Exchange information and listings.
   *
   * @example
   * ```ts
   * const exchanges = await client.exchanges.list();
   * const symbols = await client.exchanges.symbols('US');
   * ```
   *
   * @see https://eodhd.com/financial-apis/exchanges-api-list-of-tickers-and-trading-hours/
   */
  readonly exchanges: ExchangesApi;

  /**
   * US Treasury rates: bill, yield, long-term, and real yield rates.
   *
   * @example
   * ```ts
   * const bills = await client.treasury.billRates({ from: '2024-01-01' });
   * ```
   *
   * @see https://eodhd.com/financial-apis/us-treasury-rates-api/
   */
  readonly treasury: TreasuryApi;

  /**
   * CBOE Europe indices.
   *
   * @example
   * ```ts
   * const indices = await client.cboe.indices();
   * ```
   *
   * @see https://eodhd.com/financial-apis/cboe-europe-indices-api/
   */
  readonly cboe: CboeApi;

  /**
   * Marketplace data providers (Unicorn Bay, Trading Hours, Praams, InvestVerte).
   *
   * @example
   * ```ts
   * const markets = await client.marketplace.tradinghours.markets();
   * const analysis = await client.marketplace.praams.analyseEquityByTicker('AAPL.US');
   * ```
   */
  readonly marketplace: {
    readonly unicornbay: UnicornBayApi;
    readonly tradinghours: TradingHoursApi;
    readonly praams: PraamsApi;
    readonly investverte: InvestVerteApi;
  };

  private readonly apiToken: string;

  /**
   * Create a new EODHD API client.
   *
   * @param options - Client configuration (apiToken required unless EODHD_API_TOKEN env var is set)
   * @throws {Error} If no API token is provided or found in environment
   *
   * @example
   * ```ts
   * const client = new EODHDClient({ apiToken: 'YOUR_TOKEN' });
   * ```
   *
   * @example
   * ```ts
   * // Uses EODHD_API_TOKEN env var
   * const client = new EODHDClient({});
   * ```
   */
  constructor(options: EODHDClientOptions) {
    const envToken = typeof process !== 'undefined' ? process.env?.EODHD_API_TOKEN?.trim() : undefined;
    const resolved = options.apiToken?.trim() || envToken || '';
    if (!resolved) {
      throw new Error(
        'apiToken is required. Pass it to EODHDClient({ apiToken }) or set EODHD_API_TOKEN environment variable.',
      );
    }
    this.apiToken = resolved;
    this.http = new HttpClient({
      apiToken: resolved,
      baseUrl: options.baseUrl ?? 'https://eodhd.com/api/',
      timeout: options.timeout ?? 30_000,
      logger: resolveLogger(options.logger),
      retryOptions: { ...DEFAULT_RETRY, ...(options.maxRetries !== undefined ? { maxRetries: options.maxRetries } : {}) },
    });

    // Core API
    this._eod = new EodApi(this.http);
    this._fundamentals = new FundamentalsApi(this.http);
    this.calendar = new CalendarApi(this.http);
    this._news = new NewsApi(this.http);
    this.exchanges = new ExchangesApi(this.http);
    this._macro = new MacroApi(this.http);
    this.treasury = new TreasuryApi(this.http);
    this.cboe = new CboeApi(this.http);
    this._screening = new ScreeningApi(this.http);
    this._corporate = new CorporateApi(this.http);
    this._user = new UserApi(this.http);

    // Marketplace
    this.marketplace = {
      unicornbay: new UnicornBayApi(this.http),
      tradinghours: new TradingHoursApi(this.http),
      praams: new PraamsApi(this.http),
      investverte: new InvestVerteApi(this.http),
    };
  }

  // ── EOD & Price Data ──

  /**
   * Fetch end-of-day historical prices for a ticker.
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Optional date range, period, order, filter
   * @returns Array of OHLCV data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/api-for-historical-data-and-volumes/
   *
   * @example
   * ```ts
   * const data = await client.eod('AAPL.US', { from: '2024-01-01', period: 'd' });
   * console.log(data[0].close); // 185.64
   * ```
   */
  eod(ticker: Ticker, params?: EodParams): Promise<EodDataPoint[]> {
    return this._eod.eod(ticker, params);
  }

  /**
   * Get live (delayed 15-20 min) stock price for a ticker.
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Optional additional symbols via `s` param
   * @returns Real-time quote with OHLCV and change data
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/live-realtime-stocks-api/
   *
   * @example
   * ```ts
   * const quote = await client.realTime('AAPL.US');
   * console.log(quote.close, quote.change_p); // 185.64 1.23
   * ```
   */
  realTime(ticker: Ticker, params?: RealTimeParams): Promise<RealTimeQuote> {
    return this._eod.realTime(ticker, params);
  }

  /**
   * Fetch intraday historical data for a ticker.
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Interval (`1m`, `5m`, `1h`), date range as unix timestamps or strings
   * @returns Array of intraday OHLCV data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/intraday-historical-data-api/
   *
   * @example
   * ```ts
   * const bars = await client.intraday('AAPL.US', { interval: '5m', from: '1704067200' });
   * console.log(bars[0].datetime, bars[0].close);
   * ```
   */
  intraday(ticker: Ticker, params?: IntradayParams): Promise<IntradayDataPoint[]> {
    return this._eod.intraday(ticker, params);
  }

  /**
   * Get US extended delayed quotes (real-time, 15-min delay) with pagination.
   *
   * @param params - Optional symbol filter and pagination
   * @returns Array of US delayed quote results
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/live-realtime-stocks-api/
   *
   * @example
   * ```ts
   * const quotes = await client.usQuoteDelayed({ s: 'AAPL,MSFT' });
   * console.log(quotes[0].code, quotes[0].close);
   * ```
   */
  usQuoteDelayed(params?: UsQuoteDelayedParams): Promise<UsQuoteDelayedResult[]> {
    return this._eod.usQuoteDelayed(params);
  }

  /**
   * Fetch bulk end-of-day data for an entire exchange.
   *
   * @param exchange - Exchange code, e.g. `"US"`, `"LSE"`
   * @param params - Optional date, type (eod/splits/dividends), symbols filter
   * @returns Array of bulk EOD data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/bulk-api-eod-splits-dividends/
   *
   * @example
   * ```ts
   * const bulk = await client.bulkEod('US', { date: '2024-01-15' });
   * console.log(bulk.length); // thousands of tickers
   * ```
   */
  bulkEod(exchange: string, params?: BulkEodParams): Promise<BulkEodDataPoint[]> {
    return this._eod.bulkEod(exchange, params);
  }

  /**
   * Fetch historical dividend data for a ticker.
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Optional date range (`from`, `to`)
   * @returns Array of dividend data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/api-splits-dividends/
   *
   * @example
   * ```ts
   * const divs = await client.dividends('AAPL.US', { from: '2020-01-01' });
   * console.log(divs[0].date, divs[0].value); // "2024-02-09" 0.24
   * ```
   */
  dividends(ticker: Ticker, params?: DateRange): Promise<DividendDataPoint[]> {
    return this._eod.dividends(ticker, params);
  }

  /**
   * Fetch historical stock split data for a ticker.
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Optional date range (`from`, `to`)
   * @returns Array of split data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/api-splits-dividends/
   *
   * @example
   * ```ts
   * const splits = await client.splits('AAPL.US');
   * console.log(splits[0].date, splits[0].split); // "2020-08-28" "4/1"
   * ```
   */
  splits(ticker: Ticker, params?: DateRange): Promise<SplitDataPoint[]> {
    return this._eod.splits(ticker, params);
  }

  /**
   * Fetch historical market capitalization for a ticker.
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Optional date range (`from`, `to`)
   * @returns Array of market cap data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/historical-market-capitalization-api/
   *
   * @example
   * ```ts
   * const caps = await client.historicalMarketCap('AAPL.US', { from: '2024-01-01' });
   * console.log(caps[0].date, caps[0].value); // "2024-01-02" 2950000000000
   * ```
   */
  historicalMarketCap(ticker: Ticker, params?: DateRange): Promise<HistoricalMarketCapPoint[]> {
    return this._eod.historicalMarketCap(ticker, params);
  }

  /**
   * Fetch US stock market tick (trade) data.
   *
   * @param params - Optional symbol, unix timestamp range, limit
   * @returns Array of tick data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/stock-market-tick-data-api/
   *
   * @example
   * ```ts
   * const ticks = await client.ticks({ s: 'AAPL', limit: 100 });
   * console.log(ticks[0].price, ticks[0].volume);
   * ```
   */
  ticks(params?: TicksParams): Promise<TickDataPoint[]> {
    return this._eod.ticks(params);
  }

  // ── Fundamentals ──

  /**
   * Fetch company fundamentals (general info, financials, valuation, earnings, etc.).
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Optional date range, filter, historical toggle
   * @returns Fundamentals data object with nested sections
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds/
   *
   * @example
   * ```ts
   * const fund = await client.fundamentals('AAPL.US');
   * console.log(fund.General?.Name); // "Apple Inc"
   * ```
   */
  fundamentals(ticker: Ticker, params?: FundamentalsParams): Promise<FundamentalsData> {
    return this._fundamentals.fundamentals(ticker, params);
  }

  /**
   * Fetch bulk fundamentals for all tickers on an exchange.
   *
   * @param exchange - Exchange code, e.g. `"US"`
   * @param params - Optional symbols filter
   * @returns Array of bulk fundamentals items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/bulk-fundamentals-api/
   *
   * @example
   * ```ts
   * const bulk = await client.bulkFundamentals('US', { symbols: 'AAPL,MSFT' });
   * console.log(bulk[0].General?.Name);
   * ```
   */
  bulkFundamentals(exchange: string, params?: BulkFundamentalsParams): Promise<BulkFundamentalsItem[]> {
    return this._fundamentals.bulkFundamentals(exchange, params);
  }

  // ── News & Sentiment ──

  /**
   * Fetch financial news articles.
   *
   * @param params - Optional symbol filter (`s`), tag filter (`t`), date range, pagination
   * @returns Array of news articles with sentiment scores
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/financial-news-api/
   *
   * @example
   * ```ts
   * const articles = await client.news({ s: 'AAPL.US', limit: 10 });
   * console.log(articles[0].title, articles[0].sentiment?.polarity);
   * ```
   */
  news(params?: NewsParams): Promise<NewsArticle[]> {
    return this._news.news(params);
  }

  /**
   * Fetch sentiment data for tickers over time.
   *
   * @param params - Optional symbol filter (`s`), date range
   * @returns Record mapping ticker to array of sentiment items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/sentiment-api/
   *
   * @example
   * ```ts
   * const sentiments = await client.sentiments({ s: 'AAPL.US', from: '2024-01-01' });
   * console.log(sentiments['AAPL.US']?.[0].normalized);
   * ```
   */
  sentiments(params?: SentimentsParams): Promise<Record<string, SentimentItem[]>> {
    return this._news.sentiments(params);
  }

  /**
   * Fetch word weights (trending keywords) from financial news.
   *
   * @param params - Optional symbol filter, date range, pagination
   * @returns Array of word-weight pairs
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/sentiment-api/
   *
   * @example
   * ```ts
   * const weights = await client.newsWordWeights({ s: 'AAPL.US' });
   * console.log(weights[0].word, weights[0].weight);
   * ```
   */
  newsWordWeights(params?: NewsWordWeightsParams): Promise<NewsWordWeight[]> {
    return this._news.newsWordWeights(params);
  }

  // ── Screening & Search ──

  /**
   * Screen stocks by financial filters and signals.
   *
   * @param params - Optional filters, signals, sort, pagination
   * @returns Screener response with matching stocks and metadata
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/stock-market-screener-api/
   *
   * @example
   * ```ts
   * const result = await client.screener({
   *   filters: '[["market_capitalization",">",1000000000]]',
   *   sort: 'market_capitalization.desc',
   *   limit: 10,
   * });
   * console.log(result.data[0].code, result.data[0].market_capitalization);
   * ```
   */
  screener(params?: ScreenerParams): Promise<ScreenerResponse> {
    return this._screening.screener(params);
  }

  /**
   * Search for stocks, ETFs, funds, bonds, indices, or crypto by query string.
   *
   * @param query - Search query, e.g. `"Apple"`, `"AAPL"`
   * @param params - Optional limit, exchange filter, instrument type
   * @returns Array of search results
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/search-api-for-stocks-etfs-mutual-funds-and-indices/
   *
   * @example
   * ```ts
   * const results = await client.search('Apple', { limit: 5, type: 'stock' });
   * console.log(results[0].Code, results[0].Exchange); // "AAPL" "US"
   * ```
   */
  search(query: string, params?: SearchParams): Promise<SearchResult[]> {
    return this._screening.search(query, params);
  }

  /**
   * Map between identifiers: symbol, ISIN, CUSIP, FIGI, LEI, CIK.
   *
   * @param params - Filter by symbol, ISIN, CUSIP, FIGI, LEI, or CIK; pagination
   * @returns Array of matched ID mapping items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/symbol-id-isin-cusip-api/
   *
   * @example
   * ```ts
   * const items = await client.idMapping({ 'filter[isin]': 'US0378331005' });
   * console.log(items[0].Code, items[0].ISIN); // "AAPL" "US0378331005"
   * ```
   */
  idMapping(params?: IdMappingParams): Promise<IdMappingItem[]> {
    return this._screening.idMapping(params);
  }

  /**
   * Calculate technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.).
   *
   * @param ticker - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @param params - Indicator function, period, date range, and function-specific params
   * @returns Array of technical data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/technical-indicators-api/
   *
   * @example
   * ```ts
   * const sma = await client.technical('AAPL.US', { function: 'sma', period: 50 });
   * console.log(sma[0].date, sma[0].sma);
   * ```
   */
  technical(ticker: Ticker, params: TechnicalParams): Promise<TechnicalDataPoint[]> {
    return this._screening.technical(ticker, params);
  }

  // ── Corporate Actions ──

  /**
   * Fetch insider transactions (SEC Form 4 filings).
   *
   * @param params - Optional ticker code, date range, pagination
   * @returns Array of insider transaction items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/insider-transactions-api/
   *
   * @example
   * ```ts
   * const txns = await client.insiderTransactions({ code: 'AAPL.US', limit: 10 });
   * console.log(txns[0].ownerName, txns[0].transactionType);
   * ```
   */
  insiderTransactions(params?: InsiderTransactionsParams): Promise<InsiderTransactionItem[]> {
    return this._corporate.insiderTransactions(params);
  }

  // ── Macro & Economic ──

  /**
   * Fetch macroeconomic indicators for a country.
   *
   * @param country - ISO 3-letter country code, e.g. `"USA"`, `"GBR"`
   * @param params - Optional indicator name filter
   * @returns Array of macro indicator data points
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/macroeconomics-data-and-macro-indicators-api/
   *
   * @example
   * ```ts
   * const gdp = await client.macroIndicator('USA', { indicator: 'gdp_current_usd' });
   * console.log(gdp[0].Value, gdp[0].Period);
   * ```
   */
  macroIndicator(country: string, params?: MacroIndicatorParams): Promise<MacroIndicatorItem[]> {
    return this._macro.macroIndicator(country, params);
  }

  /**
   * Fetch upcoming and historical economic events (earnings, GDP releases, etc.).
   *
   * @param params - Optional country, date range, comparison type, pagination
   * @returns Paginated response with economic event items
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/economic-events-data-api/
   *
   * @example
   * ```ts
   * const events = await client.economicEvents({ country: 'US', from: '2024-01-01' });
   * console.log(events.data[0].type, events.data[0].actual);
   * ```
   */
  economicEvents(params?: EconomicEventsParams): Promise<EconomicEventsResponse> {
    return this._macro.economicEvents(params);
  }

  // ── User ──

  /**
   * Get current user account information (subscription, usage, limits).
   *
   * @returns User data with subscription type, API usage, and daily rate limit
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/user-api/
   *
   * @example
   * ```ts
   * const user = await client.user();
   * console.log(user.subscriptionType, user.apiRequests, user.dailyRateLimit);
   * ```
   */
  user(): Promise<UserData> {
    return this._user.user();
  }

  /**
   * Download company logo as PNG image.
   *
   * @param symbol - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @returns PNG image data as ArrayBuffer
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds/
   *
   * @example
   * ```ts
   * const png = await client.logo('AAPL.US');
   * // Write to file: fs.writeFileSync('aapl.png', Buffer.from(png));
   * ```
   */
  logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this._fundamentals.logo(symbol);
  }

  /**
   * Download company logo as SVG image.
   *
   * @param symbol - Symbol with exchange suffix, e.g. `"AAPL.US"`
   * @returns SVG image data as ArrayBuffer
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/stock-etfs-fundamental-data-feeds/
   *
   * @example
   * ```ts
   * const svg = await client.logoSvg('AAPL.US');
   * // Write to file: fs.writeFileSync('aapl.svg', Buffer.from(svg));
   * ```
   */
  logoSvg(symbol: Ticker): Promise<ArrayBuffer> {
    return this._fundamentals.logoSvg(symbol);
  }

  // ── WebSocket ──

  /**
   * Create a real-time WebSocket connection for streaming market data.
   *
   * @param feed - Feed type: `"us"` (trades), `"us-quote"` (quotes), `"forex"`, or `"crypto"`
   * @param symbols - Array of symbols to subscribe to, e.g. `["AAPL", "MSFT"]`
   * @param options - Optional reconnect settings (maxReconnectAttempts, reconnectInterval)
   * @returns Connected {@link EODHDWebSocket} instance
   * @see https://eodhd.com/financial-apis/live-realtime-stocks-api/
   *
   * @example
   * ```ts
   * const ws = client.websocket('us', ['AAPL', 'MSFT']);
   * ws.on('data', (tick) => console.log(tick.s, tick.p, tick.v));
   * ws.on('error', (err) => console.error(err));
   * // Later: ws.close();
   * ```
   */
  websocket(feed: WebSocketFeed, symbols: string[], options?: WebSocketOptions): EODHDWebSocket {
    return new EODHDWebSocket(this.apiToken, feed, symbols, options).connect();
  }
}
