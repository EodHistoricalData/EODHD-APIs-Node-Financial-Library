import type { HttpClient } from "../http.js";
import type {
  CalendarDividendsData,
  CalendarDividendsParams,
  CalendarEarningsParams,
  CalendarEarningsResponse,
  CalendarIposParams,
  CalendarIposResponse,
  CalendarSplitsParams,
  CalendarSplitsResponse,
  CalendarTrendsParams,
  CalendarTrendsResponse,
} from "../types.js";

/**
 * Calendar API for upcoming and historical corporate events.
 *
 * Accessed via `client.calendar`.
 *
 * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
 */
export class CalendarApi {
  constructor(private http: HttpClient) {}

  /**
   * Fetch upcoming and recent earnings reports.
   *
   * @param params - Optional symbols filter and date range
   * @returns Earnings response with symbols count and earnings array
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
   *
   * @example
   * ```ts
   * const result = await client.calendar.earnings({ symbols: 'AAPL.US', from: '2024-01-01' });
   * console.log(result.earnings[0].code, result.earnings[0].actual);
   * ```
   */
  async earnings(params: CalendarEarningsParams = {}): Promise<CalendarEarningsResponse> {
    return this.http.get("/calendar/earnings", params);
  }

  /**
   * Fetch earnings estimate trends for symbols.
   *
   * @param params - Required symbols string (comma-separated)
   * @returns Trends response grouped by symbol
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
   *
   * @example
   * ```ts
   * const result = await client.calendar.trends({ symbols: 'AAPL.US' });
   * console.log(result.trends['AAPL.US']?.[0].earningsEstimateAvg);
   * ```
   */
  async trends(params: CalendarTrendsParams): Promise<CalendarTrendsResponse> {
    return this.http.get("/calendar/trends", params);
  }

  /**
   * Fetch upcoming IPO filings.
   *
   * @param params - Optional date range
   * @returns IPO response with filings array
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
   *
   * @example
   * ```ts
   * const result = await client.calendar.ipos({ from: '2024-01-01' });
   * console.log(result.ipos[0].name, result.ipos[0].offer_price);
   * ```
   */
  async ipos(params: CalendarIposParams = {}): Promise<CalendarIposResponse> {
    return this.http.get("/calendar/ipos", params);
  }

  /**
   * Fetch upcoming stock splits.
   *
   * @param params - Optional symbols filter and date range
   * @returns Splits response with splits array
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
   *
   * @example
   * ```ts
   * const result = await client.calendar.splits({ from: '2024-01-01' });
   * console.log(result.splits[0].code, result.splits[0].split);
   * ```
   */
  async splits(params: CalendarSplitsParams = {}): Promise<CalendarSplitsResponse> {
    return this.http.get("/calendar/splits", params);
  }

  /**
   * Fetch upcoming dividend payments with pagination.
   *
   * @param params - Optional symbol filter, date filters, pagination
   * @returns Paginated dividend data with items and metadata
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/calendar-upcoming-earnings-ipos-and-splits-api/
   *
   * @example
   * ```ts
   * const result = await client.calendar.dividends({ 'filter[symbol]': 'AAPL.US' });
   * console.log(result.data[0].code, result.data[0].value);
   * ```
   */
  async dividends(params: CalendarDividendsParams = {}): Promise<CalendarDividendsData> {
    return this.http.get("/calendar/dividends", params);
  }
}
