import type { HttpClient } from "../http.js";
import type {
  AsxCorporateActionsParams,
  AsxCorporateActionsResponse,
  InsiderTransactionItem,
  InsiderTransactionsParams,
} from "../types.js";

export class CorporateApi {
  constructor(private http: HttpClient) {}

  /** Insider transactions (SEC Form 4): GET /insider-transactions */
  async insiderTransactions(params: InsiderTransactionsParams = {}): Promise<InsiderTransactionItem[]> {
    return this.http.get("/insider-transactions", params);
  }

  /**
   * ASX Corporate Actions: GET /asx-corporate-actions
   *
   * Returns dividends, splits, bonus issues, rights issues, buybacks,
   * capital returns, SPP and other corporate actions for securities listed
   * on the Australian Securities Exchange (ASX). Data is sourced from the
   * ASX ReferencePoint E34 feed and refreshed daily. All tickers use the
   * `.AU` suffix (e.g. `PMV.AU`).
   *
   * Cost: 1 API call per request. Subscription: Fundamentals or All-in-One.
   */
  async asxCorporateActions(params: AsxCorporateActionsParams = {}): Promise<AsxCorporateActionsResponse> {
    return this.http.get("/asx-corporate-actions", params);
  }
}
