import type { HttpClient } from "../http.js";
import type {
  MarketplaceTickDataParams,
  MarketplaceTickDataPoint,
  OptionsContractsParams,
  OptionsContractsResponse,
  OptionsEodParams,
  OptionsEodResponse,
  OptionsUnderlyingSymbolsParams,
  OptionsUnderlyingSymbolsResponse,
  SpGlobalComponentsParams,
  SpGlobalComponentsResponse,
  SpGlobalIndex,
  Ticker,
} from "../types.js";

export class UnicornBayOptionsApi {
  constructor(private http: HttpClient) {}

  /** US Options contracts: GET /mp/unicornbay/options/contracts */
  async contracts(params: OptionsContractsParams = {}): Promise<OptionsContractsResponse> {
    return this.http.get("/mp/unicornbay/options/contracts", params);
  }

  /** US Options EOD data: GET /mp/unicornbay/options/eod */
  async eod(params: OptionsEodParams = {}): Promise<OptionsEodResponse> {
    return this.http.get("/mp/unicornbay/options/eod", params);
  }

  /** US Options underlying symbols: GET /mp/unicornbay/options/underlying-symbols */
  async underlyingSymbols(params: OptionsUnderlyingSymbolsParams = {}): Promise<OptionsUnderlyingSymbolsResponse> {
    return this.http.get("/mp/unicornbay/options/underlying-symbols", params);
  }
}

export class UnicornBaySpGlobalApi {
  constructor(private http: HttpClient) {}

  /** S&P Global indices list: GET /mp/unicornbay/spglobal/list */
  async list(): Promise<SpGlobalIndex[]> {
    return this.http.get("/mp/unicornbay/spglobal/list");
  }

  /** S&P Global index components: GET /mp/unicornbay/spglobal/comp/{symbol} */
  async components(symbol: string, params: SpGlobalComponentsParams = {}): Promise<SpGlobalComponentsResponse> {
    return this.http.get(`/mp/unicornbay/spglobal/comp/${encodeURIComponent(symbol)}`, params);
  }
}

export class UnicornBayApi {
  readonly options: UnicornBayOptionsApi;
  readonly spglobal: UnicornBaySpGlobalApi;

  constructor(private http: HttpClient) {
    this.options = new UnicornBayOptionsApi(http);
    this.spglobal = new UnicornBaySpGlobalApi(http);
  }

  /** Tick data: GET /mp/unicornbay/tickdata/ticks */
  async tickdata(symbol: string, params: MarketplaceTickDataParams = {}): Promise<MarketplaceTickDataPoint[]> {
    return this.http.get(`/mp/unicornbay/tickdata/ticks`, { s: symbol, ...params });
  }

  /** Stock market logo: GET /mp/unicornbay/logo/{symbol} */
  async logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/mp/unicornbay/logo/${encodeURIComponent(symbol)}`);
  }
}
