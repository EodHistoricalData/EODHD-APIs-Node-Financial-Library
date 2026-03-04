import type { HttpClient } from "../http.js";
import type {
  BulkEodDataPoint,
  BulkEodParams,
  DateRange,
  DividendDataPoint,
  EodDataPoint,
  EodParams,
  HistoricalMarketCapPoint,
  IntradayDataPoint,
  IntradayParams,
  RealTimeParams,
  RealTimeQuote,
  SplitDataPoint,
  TickDataPoint,
  Ticker,
  TicksParams,
  UsQuoteDelayedParams,
  UsQuoteDelayedResult,
} from "../types.js";

export class EodApi {
  constructor(private http: HttpClient) {}

  /** Historical end-of-day prices: GET /eod/{ticker} */
  async eod(ticker: Ticker, params: EodParams = {}): Promise<EodDataPoint[]> {
    return this.http.get(`/eod/${encodeURIComponent(ticker)}`, params);
  }

  /** Live (delayed) stock price: GET /real-time/{ticker} */
  async realTime(ticker: Ticker, params: RealTimeParams = {}): Promise<RealTimeQuote> {
    return this.http.get(`/real-time/${encodeURIComponent(ticker)}`, params);
  }

  /** Intraday historical data: GET /intraday/{ticker} */
  async intraday(ticker: Ticker, params: IntradayParams = {}): Promise<IntradayDataPoint[]> {
    return this.http.get(`/intraday/${encodeURIComponent(ticker)}`, params);
  }

  /** US extended delayed quotes: GET /us-quote-delayed */
  async usQuoteDelayed(params: UsQuoteDelayedParams = {}): Promise<UsQuoteDelayedResult[]> {
    return this.http.get("/us-quote-delayed", params);
  }

  /** Bulk EOD data for exchange: GET /eod-bulk-last-day/{exchange} */
  async bulkEod(exchange: string, params: BulkEodParams = {}): Promise<BulkEodDataPoint[]> {
    return this.http.get(`/eod-bulk-last-day/${encodeURIComponent(exchange)}`, params);
  }

  /** Historical dividends: GET /div/{ticker} */
  async dividends(ticker: Ticker, params: DateRange = {}): Promise<DividendDataPoint[]> {
    return this.http.get(`/div/${encodeURIComponent(ticker)}`, params);
  }

  /** Historical splits: GET /splits/{ticker} */
  async splits(ticker: Ticker, params: DateRange = {}): Promise<SplitDataPoint[]> {
    return this.http.get(`/splits/${encodeURIComponent(ticker)}`, params);
  }

  /** Historical market capitalization: GET /historical-market-cap/{ticker} */
  async historicalMarketCap(ticker: Ticker, params: DateRange = {}): Promise<HistoricalMarketCapPoint[]> {
    return this.http.get(`/historical-market-cap/${encodeURIComponent(ticker)}`, params);
  }

  /** US stock market tick data: GET /ticks */
  async ticks(params: TicksParams = {}): Promise<TickDataPoint[]> {
    return this.http.get("/ticks", params);
  }
}
