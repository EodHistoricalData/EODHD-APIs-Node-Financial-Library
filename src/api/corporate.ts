import type { HttpClient } from '../http.js';
import type { InsiderTransactionsParams, SymbolChangeHistoryParams } from '../types.js';

export class CorporateApi {
  constructor(private http: HttpClient) {}

  /** Insider transactions (SEC Form 4): GET /insider-transactions */
  async insiderTransactions(params: InsiderTransactionsParams = {}): Promise<unknown[]> {
    return this.http.get('/insider-transactions', params);
  }
}
