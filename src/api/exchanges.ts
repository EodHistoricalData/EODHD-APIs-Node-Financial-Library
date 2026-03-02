import type { HttpClient } from '../http.js';
import type { Exchange, ExchangeSymbolsParams, ExchangeDetailsParams, DateRange } from '../types.js';

export class ExchangesApi {
  constructor(private http: HttpClient) {}

  /** List of exchanges: GET /exchanges-list */
  async list(): Promise<Exchange[]> {
    return this.http.get('/exchanges-list/');
  }

  /** Tickers for exchange: GET /exchange-symbol-list/{code} */
  async symbols(exchangeCode: string, params: ExchangeSymbolsParams = {}): Promise<unknown[]> {
    return this.http.get(`/exchange-symbol-list/${exchangeCode}`, params);
  }

  /** Exchange details with trading hours: GET /exchange-details/{code} */
  async details(exchangeCode: string, params: ExchangeDetailsParams = {}): Promise<unknown> {
    return this.http.get(`/exchange-details/${exchangeCode}`, params);
  }

  /** Symbol change history: GET /symbol-change-history */
  async symbolChangeHistory(params: DateRange = {}): Promise<unknown[]> {
    return this.http.get('/symbol-change-history', params);
  }
}
