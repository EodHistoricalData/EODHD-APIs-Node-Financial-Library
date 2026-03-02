import type { HttpClient } from '../http.js';
import type { MacroIndicatorParams, EconomicEventsParams } from '../types.js';

export class MacroApi {
  constructor(private http: HttpClient) {}

  /** Macro indicators by country: GET /macro-indicator/{country} */
  async macroIndicator(country: string, params: MacroIndicatorParams = {}): Promise<unknown[]> {
    return this.http.get(`/macro-indicator/${country}`, params);
  }

  /** Economic events calendar: GET /economic-events */
  async economicEvents(params: EconomicEventsParams = {}): Promise<unknown> {
    return this.http.get('/economic-events', params);
  }
}
