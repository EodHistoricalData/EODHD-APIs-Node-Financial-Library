import type { HttpClient } from '../http.js';
import type { ScreenerParams, SearchParams, SearchResult, Ticker, IdMappingParams, TechnicalParams } from '../types.js';

export class ScreeningApi {
  constructor(private http: HttpClient) {}

  /** Stock market screener: GET /screener */
  async screener(params: ScreenerParams = {}): Promise<unknown> {
    return this.http.get('/screener', params);
  }

  /** Search stocks/ETFs/bonds: GET /search/{query} */
  async search(query: string, params: SearchParams = {}): Promise<SearchResult[]> {
    return this.http.get(`/search/${encodeURIComponent(query)}`, params);
  }

  /** ID mapping (CUSIP/ISIN/FIGI/LEI/CIK): GET /id-mapping */
  async idMapping(params: IdMappingParams = {}): Promise<unknown> {
    return this.http.get('/id-mapping', params);
  }

  /** Technical indicators: GET /technical/{ticker} */
  async technical(ticker: Ticker, params: TechnicalParams): Promise<unknown[]> {
    return this.http.get(`/technical/${ticker}`, params);
  }
}
