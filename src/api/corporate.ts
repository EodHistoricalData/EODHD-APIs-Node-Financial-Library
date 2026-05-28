import type { HttpClient } from "../http.js";
import type {
  InsiderTransactionItem,
  InsiderTransactionsParams,
  InsiderTransactionsV2Params,
  InsiderTransactionsV2Response,
} from "../types.js";

export class CorporateApi {
  constructor(private http: HttpClient) {}

  /**
   * @deprecated Obsolete legacy endpoint. Use {@link CorporateApi.insiderTransactionsV2} for SEC Form 4 data.
   *
   * Insider transactions (legacy flat schema): GET /insider-transactions
   */
  async insiderTransactions(params: InsiderTransactionsParams = {}): Promise<InsiderTransactionItem[]> {
    return this.http.get("/insider-transactions", params);
  }

  /** Insider transactions v2 (SEC Form 4): GET /sec-filings/{symbol}/form4 */
  async insiderTransactionsV2(
    symbol: string,
    params: InsiderTransactionsV2Params = {},
  ): Promise<InsiderTransactionsV2Response> {
    return this.http.get(`/sec-filings/${encodeURIComponent(symbol)}/form4`, params);
  }
}
