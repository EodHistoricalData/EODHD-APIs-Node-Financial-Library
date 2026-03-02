/** Format: SYMBOL.EXCHANGE, e.g. "AAPL.US", "MSFT.US", "VOD.LSE" */
export type Ticker = string;

/** Format: YYYY-MM-DD */
export type DateString = string;

/** Common date range parameters */
export interface DateRange {
  from?: DateString;
  to?: DateString;
}

/** Common pagination parameters */
export interface Pagination {
  limit?: number;
  offset?: number;
}

// ── EOD ──

export interface EodParams extends DateRange {
  period?: 'd' | 'w' | 'm';
  order?: 'a' | 'd';
  filter?: 'last_close' | 'last_volume' | string;
}

export interface EodDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
}

// ── Intraday ──

export interface IntradayParams {
  interval?: '1m' | '5m' | '1h';
  from?: number | string;
  to?: number | string;
  'split-dt'?: 0 | 1;
}

export interface IntradayDataPoint {
  timestamp: number;
  gmtoffset: number;
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Real-time ──

export interface RealTimeParams {
  s?: string;
}

export interface RealTimeQuote {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

// ── US Extended Quotes ──

export interface UsQuoteDelayedParams {
  s?: string;
  'page[limit]'?: number;
  'page[offset]'?: number;
}

// ── Bulk EOD ──

export interface BulkEodParams {
  date?: DateString;
  type?: 'eod' | 'splits' | 'dividends';
  symbols?: string;
  filter?: string;
}

// ── Dividends ──

export interface DividendDataPoint {
  date: string;
  declarationDate?: string;
  recordDate?: string;
  paymentDate?: string;
  period?: string;
  value: number;
  unadjustedValue?: number;
  currency?: string;
}

// ── Splits ──

export interface SplitDataPoint {
  date: string;
  split: string;
}

// ── Historical Market Cap ──

export interface HistoricalMarketCapPoint {
  date: string;
  value: number;
}

// ── Ticks ──

export interface TicksParams {
  s?: string;
  from?: number;
  to?: number;
  limit?: number;
}

// ── Screener ──

export interface ScreenerParams {
  filters?: string;
  signals?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

// ── Technical ──

export type TechnicalFunction =
  | 'sma' | 'ema' | 'wma' | 'macd' | 'rsi' | 'stochastic' | 'stochrsi'
  | 'dmi' | 'adx' | 'atr' | 'cci' | 'sar' | 'beta' | 'bbands'
  | 'volatility' | 'avgvol' | 'avgvolccy' | 'splitadjusted' | 'slope' | 'stddev';

export interface TechnicalParams extends DateRange {
  function: TechnicalFunction;
  period?: number;
  order?: 'a' | 'd';
  filter?: string;
  agg_period?: 'd' | 'w' | 'm';
  fast_kperiod?: number;
  slow_kperiod?: number;
  slow_dperiod?: number;
  fast_dperiod?: number;
  fast_period?: number;
  slow_period?: number;
  signal_period?: number;
  acceleration?: number;
  maximum?: number;
  code2?: string;
  splitadjusted_only?: 0 | 1;
}

// ── Fundamentals ──

export interface FundamentalsParams extends DateRange {
  filter?: string;
  historical?: 0 | 1;
}

export interface BulkFundamentalsParams {
  symbols?: string;
}

// ── Insider Transactions ──

export interface InsiderTransactionsParams extends DateRange, Pagination {
  code?: string;
}

// ── Search ──

export interface SearchParams {
  limit?: number;
  exchange?: string;
  type?: 'all' | 'stock' | 'etf' | 'fund' | 'bond' | 'index' | 'crypto';
}

export interface SearchResult {
  Code: string;
  Exchange: string;
  Name: string;
  Type: string;
  Country: string;
  Currency: string;
  ISIN: string;
  previousClose: number;
  previousCloseDate: string;
}

// ── ID Mapping ──

export interface IdMappingParams {
  'filter[symbol]'?: string;
  'filter[isin]'?: string;
  'filter[cusip]'?: string;
  'filter[figi]'?: string;
  'filter[lei]'?: string;
  'filter[cik]'?: string;
  'page[limit]'?: number;
  'page[offset]'?: number;
}

// ── News ──

export interface NewsParams extends Pagination {
  s?: string;
  t?: string;
  from?: DateString;
  to?: DateString;
}

export interface NewsArticle {
  date: string;
  title: string;
  content: string;
  link: string;
  symbols: string[];
  tags: string[];
  sentiment?: {
    polarity: number;
    neg: number;
    neu: number;
    pos: number;
  };
}

// ── Sentiments ──

export interface SentimentsParams extends DateRange {
  s?: string;
}

// ── News Word Weights ──

export interface NewsWordWeightsParams {
  s?: string;
  'filter[date_from]'?: DateString;
  'filter[date_to]'?: DateString;
  'page[limit]'?: number;
}

// ── Calendar ──

export interface CalendarEarningsParams extends DateRange {
  symbols?: string;
}

export interface CalendarTrendsParams {
  symbols: string;
}

export interface CalendarIposParams extends DateRange {}

export interface CalendarSplitsParams extends DateRange {
  symbols?: string;
}

export interface CalendarDividendsParams {
  'filter[symbol]'?: string;
  'filter[date_eq]'?: DateString;
  'filter[date_from]'?: DateString;
  'filter[date_to]'?: DateString;
  'page[limit]'?: number;
  'page[offset]'?: number;
}

// ── Economic Events ──

export interface EconomicEventsParams extends DateRange, Pagination {
  country?: string;
  comparison?: 'mom' | 'qoq' | 'yoy';
  type?: string;
}

// ── Macro Indicators ──

export interface MacroIndicatorParams {
  indicator?: string;
}

// ── Exchanges ──

export interface ExchangeSymbolsParams {
  delisted?: 0 | 1;
  type?: string;
}

export interface Exchange {
  Name: string;
  Code: string;
  OperatingMIC: string;
  Country: string;
  Currency: string;
  CountryISO2: string;
  CountryISO3: string;
}

// ── Treasury ──

export interface TreasuryParams extends DateRange {}

// ── CBOE ──

export interface CboeIndexParams {
  'filter[index_code]': string;
  'filter[feed_type]': string;
  'filter[date]': DateString;
}

// ── Symbol Change History ──

export interface SymbolChangeHistoryParams extends DateRange {}

// ── Exchange Details ──

export interface ExchangeDetailsParams extends DateRange {}

// ── Marketplace: Unicorn Bay Options ──

export interface OptionsContractsParams {
  'filter[underlying_symbol]'?: string;
  'filter[contract]'?: string;
  'filter[exp_date_eq]'?: DateString;
  'filter[exp_date_from]'?: DateString;
  'filter[exp_date_to]'?: DateString;
  'filter[tradetime_eq]'?: DateString;
  'filter[tradetime_from]'?: DateString;
  'filter[tradetime_to]'?: DateString;
  'filter[type]'?: 'put' | 'call';
  'filter[strike_eq]'?: number;
  'filter[strike_from]'?: number;
  'filter[strike_to]'?: number;
  sort?: string;
  'page[offset]'?: number;
  'page[limit]'?: number;
  'fields[options-contracts]'?: string;
}

export interface OptionsEodParams extends OptionsContractsParams {
  compact?: 0 | 1;
  'fields[options-eod]'?: string;
}

export interface OptionsUnderlyingSymbolsParams {
  'page[offset]'?: number;
  'page[limit]'?: number;
}

// ── Marketplace: Unicorn Bay S&P Global ──

export interface SpGlobalComponentsParams {
  historical?: boolean;
  from?: DateString;
  to?: DateString;
}

// ── Marketplace: Unicorn Bay Tick Data ──

export interface MarketplaceTickDataParams {
  from?: number;
  to?: number;
  limit?: number;
}

// ── Marketplace: Trading Hours ──

export interface TradingHoursMarketsParams {}

export interface TradingHoursDetailsParams {
  'filter[market]'?: string;
}

export interface TradingHoursLookupParams {
  'filter[symbol]'?: string;
  'filter[exchange]'?: string;
}

export interface TradingHoursStatusParams {
  'filter[market]'?: string;
}

// ── Marketplace: illio ──

export type IllioIndexId = 'SnP500' | 'DJI' | 'NDX';

// ── Marketplace: Praams ──

export interface PraamsExploreParams {
  skip?: number;
  take?: number;
}

export interface PraamsExploreEquityBody {
  regions?: string[];
  countries?: string[];
  sectors?: string[];
  industries?: string[];
  capitalisation?: string[];
  currency?: string[];
  mainRatioMin?: number;
  mainRatioMax?: number;
  valuationMin?: number;
  valuationMax?: number;
  performanceMin?: number;
  performanceMax?: number;
  profitabilityMin?: number;
  profitabilityMax?: number;
  orderBy?: string;
}

export interface PraamsExploreBondBody extends PraamsExploreEquityBody {
  yieldMin?: number;
  yieldMax?: number;
  durationMin?: number;
  durationMax?: number;
  excludeSubordinated?: boolean;
  excludePerpetuals?: boolean;
}

// ── Marketplace: InvestVerte ESG ──

export interface EsgCompanyParams {
  year?: number;
  frequency?: 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

// ── WebSocket ──

export type WebSocketFeed = 'us' | 'us-quote' | 'forex' | 'crypto';

export interface WebSocketOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
}

export interface WebSocketTick {
  s: string;
  p: number;
  v?: number;
  t: number;
  [key: string]: unknown;
}
