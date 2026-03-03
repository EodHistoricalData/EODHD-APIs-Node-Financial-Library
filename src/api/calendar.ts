import type { HttpClient } from '../http.js';
import type {
  CalendarEarningsParams, CalendarEarningsResponse,
  CalendarTrendsParams, CalendarTrendsResponse,
  CalendarIposParams, CalendarIposResponse,
  CalendarSplitsParams, CalendarSplitsResponse,
  CalendarDividendsParams, CalendarDividendsData,
} from '../types.js';

export class CalendarApi {
  constructor(private http: HttpClient) {}

  /** Upcoming earnings: GET /calendar/earnings */
  async earnings(params: CalendarEarningsParams = {}): Promise<CalendarEarningsResponse> {
    return this.http.get('/calendar/earnings', params);
  }

  /** Earnings trends: GET /calendar/trends */
  async trends(params: CalendarTrendsParams): Promise<CalendarTrendsResponse> {
    return this.http.get('/calendar/trends', params);
  }

  /** Upcoming IPOs: GET /calendar/ipos */
  async ipos(params: CalendarIposParams = {}): Promise<CalendarIposResponse> {
    return this.http.get('/calendar/ipos', params);
  }

  /** Upcoming splits: GET /calendar/splits */
  async splits(params: CalendarSplitsParams = {}): Promise<CalendarSplitsResponse> {
    return this.http.get('/calendar/splits', params);
  }

  /** Upcoming dividends: GET /calendar/dividends */
  async dividends(params: CalendarDividendsParams = {}): Promise<CalendarDividendsData> {
    return this.http.get('/calendar/dividends', params);
  }
}
