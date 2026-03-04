import type { HttpClient } from "../http.js";
import type {
  TradingHoursDetail,
  TradingHoursDetailsParams,
  TradingHoursLookupParams,
  TradingHoursLookupResult,
  TradingHoursMarket,
  TradingHoursStatus,
  TradingHoursStatusParams,
} from "../types.js";

export class TradingHoursApi {
  constructor(private http: HttpClient) {}

  /** Markets list: GET /mp/tradinghours/markets */
  async markets(): Promise<TradingHoursMarket[]> {
    return this.http.get("/mp/tradinghours/markets");
  }

  /** Market details: GET /mp/tradinghours/markets/details */
  async details(params: TradingHoursDetailsParams = {}): Promise<TradingHoursDetail[]> {
    return this.http.get("/mp/tradinghours/markets/details", params);
  }

  /** Market lookup: GET /mp/tradinghours/markets/lookup */
  async lookup(params: TradingHoursLookupParams = {}): Promise<TradingHoursLookupResult[]> {
    return this.http.get("/mp/tradinghours/markets/lookup", params);
  }

  /** Market status: GET /mp/tradinghours/markets/status */
  async status(params: TradingHoursStatusParams = {}): Promise<TradingHoursStatus[]> {
    return this.http.get("/mp/tradinghours/markets/status", params);
  }
}
