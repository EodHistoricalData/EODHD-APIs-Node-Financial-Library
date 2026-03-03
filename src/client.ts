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
import { IllioApi } from './marketplace/illio.js';
import { PraamsApi } from './marketplace/praams.js';
import { InvestVerteApi } from './marketplace/investverte.js';
import { RobexiaApi } from './marketplace/robexia.js';
import { MainStreetDataApi } from './marketplace/mainstreetdata.js';

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

  /** Calendar events: earnings, IPOs, splits, dividends, trends */
  readonly calendar: CalendarApi;
  /** Exchange information and listings */
  readonly exchanges: ExchangesApi;
  /** US Treasury rates */
  readonly treasury: TreasuryApi;
  /** CBOE Europe indices */
  readonly cboe: CboeApi;
  /** Marketplace data providers */
  readonly marketplace: {
    readonly unicornbay: UnicornBayApi;
    readonly tradinghours: TradingHoursApi;
    readonly illio: IllioApi;
    readonly praams: PraamsApi;
    readonly investverte: InvestVerteApi;
    readonly robexia: RobexiaApi;
    readonly mainstreetdata: MainStreetDataApi;
  };

  private readonly apiToken: string;

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
      illio: new IllioApi(this.http),
      praams: new PraamsApi(this.http),
      investverte: new InvestVerteApi(this.http),
      robexia: new RobexiaApi(this.http),
      mainstreetdata: new MainStreetDataApi(this.http),
    };
  }

  // ── EOD & Price Data ──

  /** Historical end-of-day prices */
  eod(ticker: Ticker, params?: EodParams): Promise<EodDataPoint[]> {
    return this._eod.eod(ticker, params);
  }

  /** Live (delayed) stock price */
  realTime(ticker: Ticker, params?: RealTimeParams): Promise<RealTimeQuote> {
    return this._eod.realTime(ticker, params);
  }

  /** Intraday historical data */
  intraday(ticker: Ticker, params?: IntradayParams): Promise<IntradayDataPoint[]> {
    return this._eod.intraday(ticker, params);
  }

  /** US extended delayed quotes */
  usQuoteDelayed(params?: UsQuoteDelayedParams): Promise<UsQuoteDelayedResult[]> {
    return this._eod.usQuoteDelayed(params);
  }

  /** Bulk EOD data for exchange */
  bulkEod(exchange: string, params?: BulkEodParams): Promise<BulkEodDataPoint[]> {
    return this._eod.bulkEod(exchange, params);
  }

  /** Historical dividends */
  dividends(ticker: Ticker, params?: DateRange): Promise<DividendDataPoint[]> {
    return this._eod.dividends(ticker, params);
  }

  /** Historical splits */
  splits(ticker: Ticker, params?: DateRange): Promise<SplitDataPoint[]> {
    return this._eod.splits(ticker, params);
  }

  /** Historical market capitalization */
  historicalMarketCap(ticker: Ticker, params?: DateRange): Promise<HistoricalMarketCapPoint[]> {
    return this._eod.historicalMarketCap(ticker, params);
  }

  /** US stock market tick data */
  ticks(params?: TicksParams): Promise<TickDataPoint[]> {
    return this._eod.ticks(params);
  }

  // ── Fundamentals ──

  /** Company fundamentals */
  fundamentals(ticker: Ticker, params?: FundamentalsParams): Promise<FundamentalsData> {
    return this._fundamentals.fundamentals(ticker, params);
  }

  /** Bulk fundamentals for exchange */
  bulkFundamentals(exchange: string, params?: BulkFundamentalsParams): Promise<BulkFundamentalsItem[]> {
    return this._fundamentals.bulkFundamentals(exchange, params);
  }

  // ── News & Sentiment ──

  /** Financial news */
  news(params?: NewsParams): Promise<NewsArticle[]> {
    return this._news.news(params);
  }

  /** Sentiment data */
  sentiments(params?: SentimentsParams): Promise<Record<string, SentimentItem[]>> {
    return this._news.sentiments(params);
  }

  /** News word weights */
  newsWordWeights(params?: NewsWordWeightsParams): Promise<NewsWordWeight[]> {
    return this._news.newsWordWeights(params);
  }

  // ── Screening & Search ──

  /** Stock market screener */
  screener(params?: ScreenerParams): Promise<ScreenerResponse> {
    return this._screening.screener(params);
  }

  /** Search stocks/ETFs/bonds */
  search(query: string, params?: SearchParams): Promise<SearchResult[]> {
    return this._screening.search(query, params);
  }

  /** ID mapping (CUSIP/ISIN/FIGI/LEI/CIK) */
  idMapping(params?: IdMappingParams): Promise<IdMappingItem[]> {
    return this._screening.idMapping(params);
  }

  /** Technical indicators */
  technical(ticker: Ticker, params: TechnicalParams): Promise<TechnicalDataPoint[]> {
    return this._screening.technical(ticker, params);
  }

  // ── Corporate Actions ──

  /** Insider transactions (SEC Form 4) */
  insiderTransactions(params?: InsiderTransactionsParams): Promise<InsiderTransactionItem[]> {
    return this._corporate.insiderTransactions(params);
  }

  // ── Macro & Economic ──

  /** Macro indicators by country */
  macroIndicator(country: string, params?: MacroIndicatorParams): Promise<MacroIndicatorItem[]> {
    return this._macro.macroIndicator(country, params);
  }

  /** Economic events calendar */
  economicEvents(params?: EconomicEventsParams): Promise<EconomicEventsResponse> {
    return this._macro.economicEvents(params);
  }

  // ── User ──

  /** User account info */
  user(): Promise<UserData> {
    return this._user.user();
  }

  /** Company logo (PNG) */
  logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this._fundamentals.logo(symbol);
  }

  /** Company logo (SVG) */
  logoSvg(symbol: Ticker): Promise<ArrayBuffer> {
    return this._fundamentals.logoSvg(symbol);
  }

  // ── WebSocket ──

  /** Create a real-time WebSocket connection */
  websocket(feed: WebSocketFeed, symbols: string[], options?: WebSocketOptions): EODHDWebSocket {
    return new EODHDWebSocket(this.apiToken, feed, symbols, options).connect();
  }
}
