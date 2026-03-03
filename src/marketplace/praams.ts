import type { HttpClient } from '../http.js';
import type {
  Ticker, PraamsExploreParams, PraamsExploreEquityBody, PraamsExploreBondBody,
  PraamsAnalysisResult, PraamsBankStatementResult, PraamsExploreResult, PraamsReportResult,
} from '../types.js';

export class PraamsApi {
  constructor(private http: HttpClient) {}

  // ── Analyse ──

  /** Equity risk scoring by ticker: GET /mp/praams/analyse/equity/ticker/{ticker} */
  async analyseEquityByTicker(ticker: Ticker): Promise<PraamsAnalysisResult> {
    return this.http.get(`/mp/praams/analyse/equity/ticker/${ticker}`);
  }

  /** Equity risk scoring by ISIN: GET /mp/praams/analyse/equity/isin/{isin} */
  async analyseEquityByIsin(isin: string): Promise<PraamsAnalysisResult> {
    return this.http.get(`/mp/praams/analyse/equity/isin/${isin}`);
  }

  /** Bond analysis by ISIN: GET /mp/praams/analyse/bond/{isin} */
  async analyseBond(isin: string): Promise<PraamsAnalysisResult> {
    return this.http.get(`/mp/praams/analyse/bond/${isin}`);
  }

  // ── Bank Financials ──

  /** Bank income statement by ticker: GET /mp/praams/bank/income_statement/ticker/{ticker} */
  async bankIncomeStatementByTicker(ticker: Ticker): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/income_statement/ticker/${ticker}`);
  }

  /** Bank income statement by ISIN: GET /mp/praams/bank/income_statement/isin/{isin} */
  async bankIncomeStatementByIsin(isin: string): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/income_statement/isin/${isin}`);
  }

  /** Bank balance sheet by ticker: GET /mp/praams/bank/balance_sheet/ticker/{ticker} */
  async bankBalanceSheetByTicker(ticker: Ticker): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/balance_sheet/ticker/${ticker}`);
  }

  /** Bank balance sheet by ISIN: GET /mp/praams/bank/balance_sheet/isin/{isin} */
  async bankBalanceSheetByIsin(isin: string): Promise<PraamsBankStatementResult> {
    return this.http.get(`/mp/praams/bank/balance_sheet/isin/${isin}`);
  }

  // ── Smart Screeners ──

  /** Smart equity screener: POST /mp/praams/explore/equity */
  async exploreEquity(params: PraamsExploreParams = {}, body: PraamsExploreEquityBody = {}): Promise<PraamsExploreResult> {
    return this.http.post('/mp/praams/explore/equity', params, body);
  }

  /** Smart bond screener: POST /mp/praams/explore/bond */
  async exploreBond(params: PraamsExploreParams = {}, body: PraamsExploreBondBody = {}): Promise<PraamsExploreResult> {
    return this.http.post('/mp/praams/explore/bond', params, body);
  }

  // ── Reports ──

  /** Equity report by ticker: GET /mp/praams/reports/equity/ticker/{ticker} */
  async reportEquityByTicker(ticker: Ticker): Promise<PraamsReportResult> {
    return this.http.get(`/mp/praams/reports/equity/ticker/${ticker}`);
  }

  /** Equity report by ISIN: GET /mp/praams/reports/equity/isin/{isin} */
  async reportEquityByIsin(isin: string): Promise<PraamsReportResult> {
    return this.http.get(`/mp/praams/reports/equity/isin/${isin}`);
  }

  /** Bond report by ISIN: GET /mp/praams/reports/bond/{isin} */
  async reportBond(isin: string): Promise<PraamsReportResult> {
    return this.http.get(`/mp/praams/reports/bond/${isin}`);
  }
}
