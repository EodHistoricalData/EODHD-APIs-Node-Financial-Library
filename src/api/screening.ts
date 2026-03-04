import type { HttpClient } from '../http.js';
import type { ScreenerParams, ScreenerResponse, SearchParams, SearchResult, Ticker, IdMappingParams, IdMappingItem, TechnicalParams, TechnicalDataPoint } from '../types.js';

export class ScreeningApi {
  constructor(private http: HttpClient) {}

  /** Stock market screener: GET /screener */
  async screener(params: ScreenerParams = {}): Promise<ScreenerResponse> {
    return this.http.get('/screener', params);
  }

  /** Search stocks/ETFs/bonds: GET /search/{query} */
  async search(query: string, params: SearchParams = {}): Promise<SearchResult[]> {
    return this.http.get(`/search/${encodeURIComponent(query)}`, params);
  }

  /** ID mapping (CUSIP/ISIN/FIGI/LEI/CIK): GET /id-mapping */
  async idMapping(params: IdMappingParams = {}): Promise<IdMappingItem[]> {
    return this.http.get('/id-mapping', params);
  }

  /** Technical indicators: GET /technical/{ticker} */
  async technical(ticker: Ticker, params: TechnicalParams): Promise<TechnicalDataPoint[]> {
    return this.http.get(`/technical/${encodeURIComponent(ticker)}`, params);
  }
}
