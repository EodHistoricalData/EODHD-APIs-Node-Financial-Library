import type { HttpClient } from "../http.js";
import type {
  PraamsAnalysisResult,
  PraamsBankStatementResult,
  PraamsExploreBondBody,
  PraamsExploreEquityBody,
  PraamsExploreParams,
  PraamsExploreResult,
  PraamsReportParams,
  PraamsReportResult,
  Ticker,
} from "../types.js";

export class PraamsApi {
  constructor(private http: HttpClient) {}

  // ── Analyse ──

  /** Equity risk scoring by ticker: GET /mp/praams/analyse/equity/ticker/{ticker} */
  async analyseEquityByTicker(ticker: Ticker): Promise<PraamsAnalysisResult> {
    return this.http.get(`/mp/praams/analyse/equity/ticker/${encodeURIComponent(ticker)}`);
  }

  /** Equity risk scoring by ISIN: GET /mp/praams/analyse/equity/isin/{isin} */
  async analyseEquityByIsin(isin: string): Promise<PraamsAnalysisResult> {
    return this.http.get(`/mp/praams/analyse/equity/isin/${encodeURIComponent(isin)}`);
  }

  /** Bond analysis by ISIN: GET /mp/praams/analyse/bond/{isin} */
  async analyseBond(isin: string): Promise<PraamsAnalysisResult> {
    return this.http.get(`/mp/praams/analyse/bond/${encodeURIComponent(isin)}`);
  }

  // ── Bank Financials ──

  /** Bank income statement by ticker: GET /mp/praams/bank/income_statement/ticker/{ticker} */
  async bankIncomeStatementByTicker(ticker: Ticker): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/income_statement/ticker/${encodeURIComponent(ticker)}`);
  }

  /** Bank income statement by ISIN: GET /mp/praams/bank/income_statement/isin/{isin} */
  async bankIncomeStatementByIsin(isin: string): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/income_statement/isin/${encodeURIComponent(isin)}`);
  }

  /** Bank balance sheet by ticker: GET /mp/praams/bank/balance_sheet/ticker/{ticker} */
  async bankBalanceSheetByTicker(ticker: Ticker): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/balance_sheet/ticker/${encodeURIComponent(ticker)}`);
  }

  /** Bank balance sheet by ISIN: GET /mp/praams/bank/balance_sheet/isin/{isin} */
  async bankBalanceSheetByIsin(isin: string): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/balance_sheet/isin/${encodeURIComponent(isin)}`);
  }

  // ── Smart Screeners ──

  /** Smart equity screener: POST /mp/praams/explore/equity */
  async exploreEquity(
    params: PraamsExploreParams = {},
    body: PraamsExploreEquityBody = {},
  ): Promise<PraamsExploreResult> {
    return this.http.post("/mp/praams/explore/equity", params, body);
  }

  /** Smart bond screener: POST /mp/praams/explore/bond */
  async exploreBond(params: PraamsExploreParams = {}, body: PraamsExploreBondBody = {}): Promise<PraamsExploreResult> {
    return this.http.post("/mp/praams/explore/bond", params, body);
  }

  // ── Reports ──

  /** Equity report by ticker: GET /mp/praams/reports/equity/ticker/{ticker} */
  async reportEquityByTicker(ticker: Ticker, params: PraamsReportParams = {}): Promise<PraamsReportResult> {
    return this.http.get(`/mp/praams/reports/equity/ticker/${encodeURIComponent(ticker)}`, params);
  }

  /** Equity report by ISIN: GET /mp/praams/reports/equity/isin/{isin} */
  async reportEquityByIsin(isin: string, params: PraamsReportParams = {}): Promise<PraamsReportResult> {
    return this.http.get(`/mp/praams/reports/equity/isin/${encodeURIComponent(isin)}`, params);
  }

  /** Bond report by ISIN: GET /mp/praams/reports/bond/{isin} */
  async reportBond(isin: string, params: PraamsReportParams = {}): Promise<PraamsReportResult> {
    return this.http.get(`/mp/praams/reports/bond/${encodeURIComponent(isin)}`, params);
  }
}
