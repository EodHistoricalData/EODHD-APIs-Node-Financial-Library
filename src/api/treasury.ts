import type { HttpClient } from '../http.js';
import type { TreasuryParams } from '../types.js';

export class TreasuryApi {
  constructor(private http: HttpClient) {}

  /** US Treasury bill rates: GET /ust/bill-rates */
  async billRates(params: TreasuryParams = {}): Promise<unknown[]> {
    return this.http.get('/ust/bill-rates', params);
  }

  /** US Treasury yield rates: GET /ust/yield-rates */
  async yieldRates(params: TreasuryParams = {}): Promise<unknown[]> {
    return this.http.get('/ust/yield-rates', params);
  }

  /** US Treasury long-term rates: GET /ust/long-term-rates */
  async longTermRates(params: TreasuryParams = {}): Promise<unknown[]> {
    return this.http.get('/ust/long-term-rates', params);
  }

  /** US Treasury real yield rates: GET /ust/real-yield-rates */
  async realYieldRates(params: TreasuryParams = {}): Promise<unknown[]> {
    return this.http.get('/ust/real-yield-rates', params);
  }
}
