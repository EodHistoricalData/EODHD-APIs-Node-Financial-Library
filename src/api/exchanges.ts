import type { HttpClient } from "../http.js";
import type {
  DateRange,
  Exchange,
  ExchangeDetails,
  ExchangeDetailsParams,
  ExchangeSymbol,
  ExchangeSymbolsParams,
  SymbolChangeItem,
} from "../types.js";

/**
 * Exchanges API for exchange listings, symbols, details, and symbol change history.
 *
 * Accessed via `client.exchanges`.
 *
 * @see https://eodhd.com/financial-apis/exchanges-api-list-of-tickers-and-trading-hours/
 */
export class ExchangesApi {
  constructor(private http: HttpClient) {}

  /**
   * Get a list of all supported exchanges.
   *
   * @returns Array of exchanges with codes, countries, and currencies
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/exchanges-api-list-of-tickers-and-trading-hours/
   *
   * @example
   * ```ts
   * const exchanges = await client.exchanges.list();
   * console.log(exchanges[0].Code, exchanges[0].Name); // "US" "USA Stocks"
   * ```
   */
  async list(): Promise<Exchange[]> {
    return this.http.get("/exchanges-list/");
  }

  /**
   * Get all tickers listed on an exchange.
   *
   * @param exchangeCode - Exchange code, e.g. `"US"`, `"LSE"`, `"TO"`
   * @param params - Optional delisted flag and instrument type filter
   * @returns Array of exchange symbols
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/exchanges-api-list-of-tickers-and-trading-hours/
   *
   * @example
   * ```ts
   * const symbols = await client.exchanges.symbols('US', { type: 'stock' });
   * console.log(symbols[0].Code, symbols[0].Name);
   * ```
   */
  async symbols(exchangeCode: string, params: ExchangeSymbolsParams = {}): Promise<ExchangeSymbol[]> {
    return this.http.get(`/exchange-symbol-list/${encodeURIComponent(exchangeCode)}`, params);
  }

  /**
   * Get exchange details including trading hours and timezone.
   *
   * @param exchangeCode - Exchange code, e.g. `"US"`, `"LSE"`
   * @param params - Optional date range
   * @returns Exchange details with trading hours and open/closed status
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/exchanges-api-list-of-tickers-and-trading-hours/
   *
   * @example
   * ```ts
   * const details = await client.exchanges.details('US');
   * console.log(details.Name, details.isOpen, details.Timezone);
   * ```
   */
  async details(exchangeCode: string, params: ExchangeDetailsParams = {}): Promise<ExchangeDetails> {
    return this.http.get(`/exchange-details/${encodeURIComponent(exchangeCode)}`, params);
  }

  /**
   * Get symbol change (rename) history across exchanges.
   *
   * @param params - Optional date range to filter changes
   * @returns Array of symbol change records (old_code to new_code)
   * @throws {@link EODHDError} on API error
   * @see https://eodhd.com/financial-apis/exchanges-api-list-of-tickers-and-trading-hours/
   *
   * @example
   * ```ts
   * const changes = await client.exchanges.symbolChangeHistory({ from: '2024-01-01' });
   * console.log(changes[0].old_code, '->', changes[0].new_code);
   * ```
   */
  async symbolChangeHistory(params: DateRange = {}): Promise<SymbolChangeItem[]> {
    return this.http.get("/symbol-change-history", params);
  }
}
