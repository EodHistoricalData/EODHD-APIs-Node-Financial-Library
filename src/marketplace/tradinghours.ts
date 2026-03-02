import type { HttpClient } from '../http.js';
import type {
  TradingHoursDetailsParams, TradingHoursLookupParams, TradingHoursStatusParams,
} from '../types.js';

export class TradingHoursApi {
  constructor(private http: HttpClient) {}

  /** Markets list: GET /mp/tradinghours/markets */
  async markets(): Promise<unknown[]> {
    return this.http.get('/mp/tradinghours/markets');
  }

  /** Market details: GET /mp/tradinghours/markets/details */
  async details(params: TradingHoursDetailsParams = {}): Promise<unknown> {
    return this.http.get('/mp/tradinghours/markets/details', params);
  }

  /** Market lookup: GET /mp/tradinghours/markets/lookup */
  async lookup(params: TradingHoursLookupParams = {}): Promise<unknown> {
    return this.http.get('/mp/tradinghours/markets/lookup', params);
  }

  /** Market status: GET /mp/tradinghours/markets/status */
  async status(params: TradingHoursStatusParams = {}): Promise<unknown> {
    return this.http.get('/mp/tradinghours/markets/status', params);
  }
}
