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
  comparison: string | null;
  period: string | null;
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

// ── Exchange Details V2 ──

/** Response from GET /v2/exchange-details (list of supported exchange codes) */
export interface ExchangeDetailsV2ListResponse {
  data: string[];
}

/** Trading hours for an exchange (v2 API) */
export interface ExchangeDetailsV2TradingHours {
  Open: string;
  Close: string;
  WorkingDays: string;
  PreMarketOpen?: string;
  PreMarketClose?: string;
  AfterHoursOpen?: string;
  AfterHoursClose?: string;
  LunchBreakStart?: string;
  LunchBreakEnd?: string;
}

/** Holiday entry for an exchange (v2 API) */
export interface ExchangeDetailsV2Holiday {
  Holiday: string;
  Type: "Official" | "Bank" | "EarlyClose";
  EarlyClose?: string;
}

/** Exchange details data (v2 API) */
export interface ExchangeDetailsV2Data {
  Name: string;
  Code: string;
  Timezone: string;
  TradingHours: ExchangeDetailsV2TradingHours;
  ExchangeHolidays: Record<string, ExchangeDetailsV2Holiday>;
}

/** Response from GET /v2/exchange-details/{code} */
export interface ExchangeDetailsV2Response {
  data: ExchangeDetailsV2Data;
  meta: unknown[];
  links: unknown[];
}

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

// ── Commodities ──

export type CommodityCode =
  | "WTI"
  | "BRENT"
  | "NATURAL_GAS"
  | "GASOLINE_US"
  | "DIESEL_USGULF"
  | "HEATING_OIL_NYH"
  | "JET_FUEL_USGULF"
  | "PROPANE_MBTX"
  | "COAL_AU"
  | "URANIUM"
  | "COPPER"
  | "ALUMINUM"
  | "WHEAT"
  | "CORN"
  | "SUGAR"
  | "COTTON"
  | "COFFEE_MILD_ARABICA"
  | "COFFEE_ROBUSTAS"
  | "ALL_COMMODITIES"
  | "ALL_COMMODITIES_PRODUCER"
  | "ENERGY_INDEX"
  | "NATGAS_EU"
  | "LNG_ASIA";

export type CommodityInterval = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export interface CommodityHistoryParams {
  interval?: CommodityInterval;
}

export interface CommodityMeta {
  name: string;
  interval: CommodityInterval;
  unit: string;
  total: number;
}

export interface CommodityDataPoint {
  date: string;
  value: number;
}

export interface CommodityHistoryResponse {
  meta: CommodityMeta;
  data: CommodityDataPoint[];
  links: {
    next: string | null;
  };
}

// ── Shared JSON:API envelope ──

/** Pagination block nested under `meta.page` on paginated endpoints. */
export interface JsonApiPageMeta {
  offset: number;
  limit: number;
  [key: string]: unknown;
}

/** `meta` object returned by paginated endpoints (pagination lives under `page`). */
export interface JsonApiMeta {
  total: number;
  page: JsonApiPageMeta;
  [key: string]: unknown;
}

/** `links` object returned by paginated endpoints. */
export interface JsonApiLinks {
  next: string | null;
  [key: string]: unknown;
}

/** `meta` object returned by an unpaginated endpoint with a total count. */
export interface JsonApiUnpaginatedMeta {
  total: number;
  [key: string]: unknown;
}

/** Query parameters shared by paginated JSON:API endpoints. */
export interface JsonApiPaginationParams {
  /** Number of records to skip. Minimum and default: 0. */
  "page[offset]"?: number;
  /** Number of records to return. Minimum: 1; maximum: 100; default: 20. */
  "page[limit]"?: number;
}

/**
 * Envelope for endpoints without pagination (sanctions programs/sources,
 * funding-stress spreads).
 */
export interface UnpaginatedResponse<T, TMeta extends JsonApiUnpaginatedMeta | []> {
  data: T[];
  meta: TMeta;
  links: [];
  [key: string]: unknown;
}

/** Response returned by the unpaginated sanctions programs and sources endpoints. */
export type SanctionsListResponse<T> = UnpaginatedResponse<T, []>;

/** Response returned by the unpaginated funding-stress endpoint. */
export type FundingStressResponse<T> = UnpaginatedResponse<T, JsonApiUnpaginatedMeta>;

// ── Credit & Sovereign Risk ──

/** Envelope shared by Credit & Sovereign Risk endpoints */
export interface CreditRiskResponse<T> {
  data: T[];
  meta: JsonApiMeta;
  links: JsonApiLinks;
  [key: string]: unknown;
}

export interface SovereignRiskPremiumParams extends JsonApiPaginationParams {
  "filter[country]"?: string;
  "filter[region]"?: string;
  "filter[as_of]"?: DateString;
}

export interface SovereignRiskPremiumItem {
  country_iso3: string;
  country_name: string;
  region?: string;
  as_of_date: string;
  moodys_rating: string;
  adj_default_spread: number;
  country_risk_premium: number;
  equity_risk_premium: number;
  corporate_tax_rate: number;
  sovereign_cds: number | null;
  source: string;
  [key: string]: unknown;
}

export interface SovereignCreditRatingsParams extends JsonApiPaginationParams {
  "filter[country]"?: string;
  "filter[as_of]"?: DateString;
}

export interface SovereignCreditRatingItem {
  country_iso3: string;
  country_name: string;
  as_of_date: string;
  moodys_rating: string;
  sp_rating: string;
  fitch_rating: string;
  source: string;
  [key: string]: unknown;
}

export interface SovereignCdsSpreadsParams extends JsonApiPaginationParams {
  "filter[country]"?: string;
  "filter[as_of]"?: DateString;
}

export interface SovereignCdsSpreadItem {
  country_iso3: string;
  country_name: string;
  as_of_date: string;
  moodys_rating: string;
  cds_spread: number | null;
  cds_spread_net_of_switzerland: number | null;
  source: string;
  [key: string]: unknown;
}

export interface SovereignDefaultSpreadsParams extends JsonApiPaginationParams {
  "filter[rating]"?: string;
  "filter[as_of]"?: DateString;
}

export interface SovereignDefaultSpreadItem {
  rating: string;
  as_of_date: string;
  default_spread: number;
  source: string;
  [key: string]: unknown;
}

export interface CorporateCmdiParams extends JsonApiPaginationParams {
  "filter[from]"?: DateString;
  "filter[to]"?: DateString;
}

export interface CorporateCmdiItem {
  as_of_date: string;
  market_cmdi: number;
  ig_cmdi: number;
  hy_cmdi: number;
  source: string;
  [key: string]: unknown;
}

export interface CorporateHqmYieldsParams extends JsonApiPaginationParams {
  /** One tenor or a comma-separated list of tenors in years, e.g. `"10"` or `"5,10,30"`. */
  "filter[tenor]"?: string;
  /** `"par"`, `"spot"`, or a comma-separated combination, e.g. `"spot,par"`. */
  "filter[type]"?: string;
  "filter[from]"?: DateString;
  "filter[to]"?: DateString;
}

export interface CorporateHqmYieldItem {
  series_id: string;
  tenor_years: number;
  yield_type: string;
  as_of_date: string;
  yield_value: number;
  source: string;
  [key: string]: unknown;
}

export interface CdsMarketAggregatesParams extends JsonApiPaginationParams {
  "filter[metric]"?: "gross_notional";
  "filter[dimension]"?: "grade" | "cleared_status";
  /** Filter by a specific breakdown value (e.g. a grade or cleared status). */
  "filter[value]"?: string;
  /** Filter by region (e.g. `"North America"`). */
  "filter[region]"?: string;
  "filter[from]"?: DateString;
  "filter[to]"?: DateString;
}

export interface CdsMarketAggregateItem {
  as_of_date: string;
  release_date: string;
  metric: string;
  breakdown_dimension: string;
  breakdown_value: string;
  region: string;
  usd_notional_mn: number;
  source: string;
  [key: string]: unknown;
}

// ── Sanctions ──

/** Envelope shared by the paginated Sanctions endpoints (entities, vessels) */
export interface SanctionsResponse<T> {
  data: T[];
  meta: JsonApiMeta;
  links: JsonApiLinks;
  [key: string]: unknown;
}

export interface SanctionsEntitiesParams extends JsonApiPaginationParams {
  /** Data source. Currently only `"ofac"` is supported. */
  source?: "ofac";
  /** Entity type filter. */
  type?: "individual" | "entity" | "vessel" | "aircraft";
  program?: string;
  country?: string;
  /** Free-text search (minimum 2 characters). */
  q?: string;
  /** Active status filter. Serializes to the string `"true"` or `"false"` on the wire. */
  active?: boolean | "true" | "false";
}

export interface SanctionsEntityItem {
  /** May be omitted by production API responses. */
  id?: number;
  source: string;
  source_uid: string;
  entity_type: string;
  name: string;
  programs: string[];
  country: string | null;
  remarks: string | null;
  listed_date: string | null;
  is_active: boolean;
  aliases: string[];
  /**
   * Identifying details keyed by identifier type, e.g.
   * `{ "Tax ID No.": ["7704028201"] }`. Serializes as `[]` when empty.
   */
  identifiers: Record<string, string[]> | Record<string, unknown>[];
  [key: string]: unknown;
}

export interface SanctionsVesselsParams extends JsonApiPaginationParams {
  /** Data source. Currently only `"ofac"` is supported. */
  source?: "ofac";
  imo?: string;
  flag?: string;
  vessel_type?: string;
  /** Free-text search (minimum 2 characters). */
  q?: string;
  program?: string;
}

export interface SanctionsVesselItem {
  /** May be omitted by production API responses. */
  id?: number;
  call_sign: string | null;
  vessel_type: string | null;
  flag: string | null;
  tonnage: number | null;
  gross_tonnage: number | null;
  owner: string | null;
  imo_number: string | null;
  mmsi: string | null;
  entity_source_uid: string;
  entity_name: string;
  source: string;
  programs: string[];
  country: string | null;
  is_active: boolean;
  [key: string]: unknown;
}

export interface SanctionsProgramItem {
  program: string;
  count: number;
  [key: string]: unknown;
}

export interface SanctionsSourceItem {
  name: string;
  [key: string]: unknown;
}

// ── Interest Rates & Spreads ──

/** Envelope shared by the paginated Interest Rates endpoints (reference rates, policy rates) */
export interface InterestRatesResponse<T> {
  data: T[];
  meta: JsonApiMeta;
  links: JsonApiLinks;
  [key: string]: unknown;
}

export interface ReferenceRatesParams extends JsonApiPaginationParams {
  "filter[code]"?: string;
  /** Supported currency code. */
  "filter[currency]"?: "USD" | "GBP" | "EUR";
  "filter[from]"?: DateString;
  "filter[to]"?: DateString;
}

export interface ReferenceRateItem {
  date: string;
  code: string;
  currency: string;
  rate_type: string;
  rate: number;
  source: string;
  source_series_id: string;
  /** Rate distribution percentiles (NY Fed series only). */
  percentiles?: {
    p1?: number;
    p25?: number;
    p75?: number;
    p99?: number;
    [key: string]: unknown;
  };
  /** Underlying transaction volume in billions of USD (NY Fed series only). */
  volume_billion_usd?: number;
  [key: string]: unknown;
}

export interface PolicyRatesParams extends JsonApiPaginationParams {
  "filter[code]"?: string;
  "filter[country]"?: string;
  "filter[central_bank]"?: string;
  "filter[from]"?: DateString;
  "filter[to]"?: DateString;
}

export interface PolicyRateItem {
  date: string;
  code: string;
  country: string;
  central_bank: string;
  rate: number;
  source: string;
  source_series_id: string;
  [key: string]: unknown;
}

export interface FundingStressParams {
  "filter[code]"?: string;
  "filter[from]"?: DateString;
  "filter[to]"?: DateString;
}

export interface FundingStressItem {
  date: string;
  code: string;
  value_bps: number;
  formula: string;
  leg_a: string;
  leg_b: string;
  leg_a_rate: number;
  leg_b_rate: number;
  [key: string]: unknown;
}

// ── Real Estate (BIS Property Prices) ──

/**
 * `meta` block returned by the paginated Real Estate endpoints. Pagination fields
 * (`offset`, `limit`) live at the meta root here, not nested under `page`.
 */
export interface RealEstateMeta {
  total: number;
  offset: number;
  limit: number;
  [key: string]: unknown;
}

/** Envelope shared by the paginated Real Estate endpoints (countries, SPP, DPP). */
export interface RealEstateResponse<TData, TMeta extends RealEstateMeta = RealEstateMeta> {
  data: TData[];
  meta: TMeta;
  links: JsonApiLinks;
  [key: string]: unknown;
}

export interface RealEstateCountriesParams extends JsonApiPaginationParams {
  sort?: "code" | "-code" | "name" | "-name";
}

export interface RealEstateCountry {
  code: string;
  name: string;
  has_spp: boolean;
  has_dpp: boolean;
  [key: string]: unknown;
}

/** Response returned by the covered-countries catalogue endpoint. */
export type RealEstateCountriesResponse = RealEstateResponse<RealEstateCountry>;

export interface RealEstateSelectedPricesParams extends JsonApiPaginationParams {
  "filter[type]"?: "nominal" | "real";
  "filter[metric]"?: "index" | "yoy";
  /** Start period, format `YYYY-Qn` (e.g. `2020-Q1`). */
  "filter[from]"?: string;
  /** End period, format `YYYY-Qn` (e.g. `2024-Q4`). */
  "filter[to]"?: string;
  sort?: "period" | "-period" | "value" | "-value";
}

export interface RealEstateSelectedPrice {
  period: string;
  value: number;
  /** `nominal` or `real`. */
  type: string;
  /** `index` or `yoy`. */
  metric: string;
  [key: string]: unknown;
}

export interface RealEstateSelectedPricesMeta extends RealEstateMeta {
  country_code: string;
  country_name: string;
  type: string;
  metric: string;
  base_year: number | null;
  frequency: string;
  source: string;
  from: string | null;
  to: string | null;
}

/** Response returned by the Selected Property Prices (SPP) endpoint. */
export type RealEstateSelectedPricesResponse = RealEstateResponse<
  RealEstateSelectedPrice,
  RealEstateSelectedPricesMeta
>;

export interface RealEstateDetailedPricesParams extends JsonApiPaginationParams {
  /** BIS covered-area dimension code. */
  "filter[area]"?: string;
  "filter[property_type]"?: string;
  "filter[vintage]"?: string;
  "filter[freq]"?: "Q" | "A" | "M" | "H";
  /** Start period; format follows the series frequency (e.g. `2020-01` or `2020-Q1`). */
  "filter[from]"?: string;
  /** End period; format follows the series frequency. */
  "filter[to]"?: string;
  sort?: "period" | "-period" | "value" | "-value";
}

export interface RealEstateDetailedPrice {
  period: string;
  value: number;
  frequency: string;
  covered_area: string;
  covered_area_label: string;
  property_type: string;
  property_type_label: string;
  vintage: string;
  vintage_label: string;
  unit_measure: string;
  unit_measure_label: string | null;
  [key: string]: unknown;
}

export interface RealEstateDetailedPricesMeta extends RealEstateMeta {
  country_code: string;
  source: string;
  dataset: string;
  filters: Record<string, unknown>;
}

/** Response returned by the Detailed Property Prices (DPP) endpoint. */
export type RealEstateDetailedPricesResponse = RealEstateResponse<
  RealEstateDetailedPrice,
  RealEstateDetailedPricesMeta
>;

export interface RealEstateDetailedSeriesItem {
  covered_area: string;
  covered_area_label: string;
  property_type: string;
  property_type_label: string;
  vintage: string;
  vintage_label: string;
  compiling_org: string;
  priced_unit: string;
  seasonal_adj: string;
  unit_measure: string;
  unit_measure_label: string | null;
  title: string;
  [key: string]: unknown;
}

export interface RealEstateDetailedSeriesMeta {
  country_code: string;
  total: number;
  [key: string]: unknown;
}

/**
 * Response returned by the DPP series catalogue endpoint. This endpoint is not
 * paginated and returns no `links` block.
 */
export interface RealEstateDetailedSeriesResponse {
  data: RealEstateDetailedSeriesItem[];
  meta: RealEstateDetailedSeriesMeta;
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
