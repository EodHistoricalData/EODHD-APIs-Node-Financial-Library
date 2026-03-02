import type { HttpClient } from '../http.js';
import type {
  Ticker, DateRange, EodParams, EodDataPoint, IntradayParams, IntradayDataPoint,
  RealTimeQuote, RealTimeParams, UsQuoteDelayedParams, BulkEodParams,
  DividendDataPoint, SplitDataPoint, HistoricalMarketCapPoint, TicksParams,
} from '../types.js';

export class EodApi {
  constructor(private http: HttpClient) {}

  /** Historical end-of-day prices: GET /eod/{ticker} */
  async eod(ticker: Ticker, params: EodParams = {}): Promise<EodDataPoint[]> {
    return this.http.get(`/eod/${ticker}`, params);
  }

  /** Live (delayed) stock price: GET /real-time/{ticker} */
  async realTime(ticker: Ticker, params: RealTimeParams = {}): Promise<RealTimeQuote> {
    return this.http.get(`/real-time/${ticker}`, params);
  }

  /** Intraday historical data: GET /intraday/{ticker} */
  async intraday(ticker: Ticker, params: IntradayParams = {}): Promise<IntradayDataPoint[]> {
    return this.http.get(`/intraday/${ticker}`, params);
  }

  /** US extended delayed quotes: GET /us-quote-delayed */
  async usQuoteDelayed(params: UsQuoteDelayedParams = {}): Promise<unknown[]> {
    return this.http.get('/us-quote-delayed', params);
  }

  /** Bulk EOD data for exchange: GET /eod-bulk-last-day/{exchange} */
  async bulkEod(exchange: string, params: BulkEodParams = {}): Promise<unknown[]> {
    return this.http.get(`/eod-bulk-last-day/${exchange}`, params);
  }

  /** Historical dividends: GET /div/{ticker} */
  async dividends(ticker: Ticker, params: DateRange = {}): Promise<DividendDataPoint[]> {
    return this.http.get(`/div/${ticker}`, params);
  }

  /** Historical splits: GET /splits/{ticker} */
  async splits(ticker: Ticker, params: DateRange = {}): Promise<SplitDataPoint[]> {
    return this.http.get(`/splits/${ticker}`, params);
  }

  /** Historical market capitalization: GET /historical-market-cap/{ticker} */
  async historicalMarketCap(ticker: Ticker, params: DateRange = {}): Promise<HistoricalMarketCapPoint[]> {
    return this.http.get(`/historical-market-cap/${ticker}`, params);
  }

  /** US stock market tick data: GET /ticks */
  async ticks(params: TicksParams = {}): Promise<unknown[]> {
    return this.http.get('/ticks', params);
  }
}
