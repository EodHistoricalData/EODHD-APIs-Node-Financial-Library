/** Rate limit information parsed from response headers */
export interface RateLimitInfo {
  limit?: number;
  remaining?: number;
  reset?: number;
}

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
  period?: "d" | "w" | "m";
  order?: "a" | "d";
  filter?: "last_close" | "last_volume" | string;
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
  interval?: "1m" | "5m" | "1h";
  from?: number | string;
  to?: number | string;
  "split-dt"?: 0 | 1;
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
  "page[limit]"?: number;
  "page[offset]"?: number;
}

export interface UsQuoteDelayedResult {
  code: string;
  name: string;
  exchange: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  previousClose: number;
  change: number;
  change_p: number;
  [key: string]: unknown;
}

// ── Bulk EOD ──

export interface BulkEodParams {
  date?: DateString;
  type?: "eod" | "splits" | "dividends";
  symbols?: string;
  filter?: string;
}

export interface BulkEodDataPoint {
  code: string;
  exchange_short_name: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
  [key: string]: unknown;
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

export interface TickDataPoint {
  timestamp: number;
  datetime: string;
  price: number;
  volume: number;
  [key: string]: unknown;
}

// ── Screener ──

export interface ScreenerParams {
  filters?: string;
  signals?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface ScreenerItem {
  code: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  market_capitalization: number;
  [key: string]: unknown;
}

export interface ScreenerResponse {
  data: ScreenerItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ── Technical ──

export type TechnicalFunction =
  | "sma"
  | "ema"
  | "wma"
  | "macd"
  | "rsi"
  | "stochastic"
  | "stochrsi"
  | "dmi"
  | "adx"
  | "atr"
  | "cci"
  | "sar"
  | "beta"
  | "bbands"
  | "volatility"
  | "avgvol"
  | "avgvolccy"
  | "splitadjusted"
  | "slope"
  | "stddev";

export interface TechnicalParams extends DateRange {
  function: TechnicalFunction;
  period?: number;
  order?: "a" | "d";
  filter?: string;
  agg_period?: "d" | "w" | "m";
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

export interface TechnicalDataPoint {
  date: string;
  [key: string]: unknown;
}

// ── Fundamentals ──

export interface FundamentalsParams extends DateRange {
  filter?: string;
  historical?: 0 | 1;
}

export interface BulkFundamentalsParams {
  symbols?: string;
}

export interface FundamentalsData {
  General?: Record<string, unknown>;
  Highlights?: Record<string, unknown>;
  Valuation?: Record<string, unknown>;
  SharesStats?: Record<string, unknown>;
  Technicals?: Record<string, unknown>;
  SplitsDividends?: Record<string, unknown>;
  AnalystRatings?: Record<string, unknown>;
  Holders?: Record<string, unknown>;
  InsiderTransactions?: Record<string, unknown>;
  ESGScores?: Record<string, unknown>;
  outstandingShares?: Record<string, unknown>;
  Earnings?: Record<string, unknown>;
  Financials?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BulkFundamentalsItem {
  General: Record<string, unknown>;
  [key: string]: unknown;
}

// ── Insider Transactions ──

export interface InsiderTransactionsParams extends DateRange, Pagination {
  code?: string;
}

export interface InsiderTransactionItem {
  code: string;
  date: string;
  ownerName: string;
  ownerTitle: string;
  transactionType: string;
  transactionAmount: number;
  transactionPrice: number;
  transactionShares: number;
  [key: string]: unknown;
}

// ── Search ──

export interface SearchParams {
  limit?: number;
  exchange?: string;
  type?: "all" | "stock" | "etf" | "fund" | "bond" | "index" | "crypto";
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
  "filter[symbol]"?: string;
  "filter[isin]"?: string;
  "filter[cusip]"?: string;
  "filter[figi]"?: string;
  "filter[lei]"?: string;
  "filter[cik]"?: string;
  "page[limit]"?: number;
  "page[offset]"?: number;
}

export interface IdMappingItem {
  Code: string;
  Exchange: string;
  Name: string;
  Country: string;
  Currency: string;
  ISIN: string;
  CUSIP?: string;
  FIGI?: string;
  LEI?: string;
  CIK?: string;
  [key: string]: unknown;
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

export interface SentimentItem {
  date: string;
  count: number;
  normalized: number;
  [key: string]: unknown;
}

// ── News Word Weights ──

export interface NewsWordWeightsParams {
  s?: string;
  "filter[date_from]"?: DateString;
  "filter[date_to]"?: DateString;
  "page[limit]"?: number;
}

export interface NewsWordWeight {
  word: string;
  weight: number;
  [key: string]: unknown;
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
  "filter[symbol]"?: string;
  "filter[date_eq]"?: DateString;
  "filter[date_from]"?: DateString;
  "filter[date_to]"?: DateString;
  "page[limit]"?: number;
  "page[offset]"?: number;
}

export interface CalendarEarningsItem {
  code: string;
  report_date: string;
  date: string;
  before_after_market?: string;
  currency?: string;
  actual?: number | null;
  estimate?: number | null;
  difference?: number | null;
  percent?: number | null;
  [key: string]: unknown;
}

export interface CalendarEarningsResponse {
  type: string;
  description: string;
  symbols_count: number;
  earnings: CalendarEarningsItem[];
  [key: string]: unknown;
}

export interface CalendarTrendsItem {
  code: string;
  date: string;
  period: string;
  growth?: string;
  earningsEstimateAvg?: number | null;
  earningsEstimateHigh?: number | null;
  earningsEstimateLow?: number | null;
  revenueEstimateAvg?: number | null;
  [key: string]: unknown;
}

export interface CalendarTrendsResponse {
  type: string;
  description: string;
  trends: Record<string, CalendarTrendsItem[]>;
  [key: string]: unknown;
}

export interface CalendarIpoItem {
  code: string;
  name: string;
  exchange: string;
  currency: string;
  start_date: string;
  filing_date: string;
  amended_date?: string;
  price_from?: number;
  price_to?: number;
  offer_price?: number;
  shares?: number;
  deal_type?: string;
  [key: string]: unknown;
}

export interface CalendarIposResponse {
  type: string;
  description: string;
  ipos: CalendarIpoItem[];
  [key: string]: unknown;
}

export interface CalendarSplitItem {
  code: string;
  split: string;
  date: string;
  optionable?: string;
  old_shares?: number;
  new_shares?: number;
  [key: string]: unknown;
}

export interface CalendarSplitsResponse {
  type: string;
  description: string;
  splits: CalendarSplitItem[];
  [key: string]: unknown;
}

export interface CalendarDividendItem {
  code: string;
  date: string;
  declarationDate?: string;
  recordDate?: string;
  paymentDate?: string;
  period?: string;
  value?: number;
  unadjustedValue?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface CalendarDividendsData {
  data: CalendarDividendItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ── Economic Events ──

export interface EconomicEventsParams extends DateRange, Pagination {
  country?: string;
  comparison?: "mom" | "qoq" | "yoy";
  type?: string;
}

export interface EconomicEventItem {
  type: string;
  comparison: string;
  country: string;
  date: string;
  actual?: number | null;
  previous?: number | null;
  estimate?: number | null;
  change?: number | null;
  change_percentage?: number | null;
  [key: string]: unknown;
}

export interface EconomicEventsResponse {
  data: EconomicEventItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ── Macro Indicators ──

export interface MacroIndicatorParams {
  indicator?: string;
}

export interface MacroIndicatorItem {
  CountryCode: string;
  Indicator: string;
  Date: string;
  Period: string;
  Value: number;
  [key: string]: unknown;
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

export interface ExchangeSymbol {
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type: string;
  Isin?: string;
  [key: string]: unknown;
}

export interface ExchangeDetails {
  Name: string;
  Code: string;
  OperatingMIC: string;
  Country: string;
  Currency: string;
  Timezone: string;
  isOpen: boolean;
  TradingHours: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SymbolChangeItem {
  date: string;
  old_code: string;
  new_code: string;
  old_exchange: string;
  new_exchange: string;
  [key: string]: unknown;
}

// ── Treasury ──

export interface TreasuryParams extends DateRange {}

export interface TreasuryRateItem {
  date: string;
  [key: string]: unknown;
}

// ── CBOE ──

export interface CboeIndexParams {
  "filter[index_code]": string;
  "filter[feed_type]": string;
  "filter[date]": DateString;
}

export interface CboeIndexItem {
  code: string;
  name: string;
  exchange: string;
  [key: string]: unknown;
}

export interface CboeIndexData {
  data: Record<string, unknown>[];
  [key: string]: unknown;
}

// ── Symbol Change History ──

export interface SymbolChangeHistoryParams extends DateRange {}

// ── Exchange Details ──

export interface ExchangeDetailsParams extends DateRange {}

// ── User ──

export interface UserData {
  name: string;
  email: string;
  subscriptionType: string;
  paymentMethod: string;
  apiRequests: number;
  apiRequestsDate: string;
  dailyRateLimit: number;
  [key: string]: unknown;
}

// ── Marketplace: Unicorn Bay Options ──

export interface OptionsContractsParams {
  "filter[underlying_symbol]"?: string;
  "filter[contract]"?: string;
  "filter[exp_date_eq]"?: DateString;
  "filter[exp_date_from]"?: DateString;
  "filter[exp_date_to]"?: DateString;
  "filter[tradetime_eq]"?: DateString;
  "filter[tradetime_from]"?: DateString;
  "filter[tradetime_to]"?: DateString;
  "filter[type]"?: "put" | "call";
  "filter[strike_eq]"?: number;
  "filter[strike_from]"?: number;
  "filter[strike_to]"?: number;
  sort?: string;
  "page[offset]"?: number;
  "page[limit]"?: number;
  "fields[options-contracts]"?: string;
}

export interface OptionsEodParams extends OptionsContractsParams {
  compact?: 0 | 1;
  "fields[options-eod]"?: string;
}

export interface OptionsUnderlyingSymbolsParams {
  "page[offset]"?: number;
  "page[limit]"?: number;
}

export interface OptionsContract {
  underlying_symbol: string;
  contract: string;
  type: string;
  expiration_date: string;
  strike: number;
  [key: string]: unknown;
}

export interface OptionsContractsResponse {
  data: OptionsContract[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface OptionsEodItem {
  underlying_symbol: string;
  contract: string;
  type: string;
  expiration_date: string;
  strike: number;
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  open_interest?: number;
  implied_volatility?: number;
  [key: string]: unknown;
}

export interface OptionsEodResponse {
  data: OptionsEodItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface OptionsUnderlyingSymbol {
  underlying_symbol: string;
  [key: string]: unknown;
}

export interface OptionsUnderlyingSymbolsResponse {
  data: OptionsUnderlyingSymbol[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ── Marketplace: Unicorn Bay S&P Global ──

export interface SpGlobalComponentsParams {
  historical?: boolean;
  from?: DateString;
  to?: DateString;
}

export interface SpGlobalIndex {
  code: string;
  name: string;
  [key: string]: unknown;
}

export interface SpGlobalComponentsResponse {
  Components: Record<string, unknown>[];
  [key: string]: unknown;
}

// ── Marketplace: Unicorn Bay Tick Data ──

export interface MarketplaceTickDataParams {
  from?: number;
  to?: number;
  limit?: number;
}

export interface MarketplaceTickDataPoint {
  timestamp: number;
  datetime: string;
  price: number;
  volume: number;
  [key: string]: unknown;
}

// ── Marketplace: Trading Hours ──

export type TradingHoursMarketsParams = {};

export interface TradingHoursDetailsParams {
  market?: string;
}

export interface TradingHoursLookupParams {
  "filter[symbol]"?: string;
  "filter[exchange]"?: string;
}

export interface TradingHoursStatusParams {
  market?: string;
}

export interface TradingHoursMarket {
  code: string;
  name: string;
  country: string;
  [key: string]: unknown;
}

export interface TradingHoursDetail {
  code: string;
  name: string;
  country: string;
  timezone: string;
  isOpen: boolean;
  [key: string]: unknown;
}

export interface TradingHoursLookupResult {
  code: string;
  market: string;
  [key: string]: unknown;
}

export interface TradingHoursStatus {
  code: string;
  name: string;
  isOpen: boolean;
  [key: string]: unknown;
}

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

export interface PraamsAnalysisResult {
  [key: string]: unknown;
}

export interface PraamsBankStatementResult {
  [key: string]: unknown;
}

export interface PraamsExploreResult {
  [key: string]: unknown;
}

export interface PraamsReportParams {
  email?: string;
}

export interface PraamsReportResult {
  [key: string]: unknown;
}

// ── Marketplace: InvestVerte ESG ──

export interface EsgCompanyParams {
  year?: number;
  frequency?: "FY" | "Q1" | "Q2" | "Q3" | "Q4";
}

export interface EsgCompanyItem {
  symbol: string;
  name: string;
  [key: string]: unknown;
}

export interface EsgCountryItem {
  code: string;
  name: string;
  [key: string]: unknown;
}

export interface EsgSectorItem {
  code: string;
  name: string;
  [key: string]: unknown;
}

export interface EsgData {
  [key: string]: unknown;
}

// ── WebSocket ──

export type WebSocketFeed = "us" | "us-quote" | "forex" | "crypto";

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
