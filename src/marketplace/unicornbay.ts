import type { HttpClient } from '../http.js';
import type {
  OptionsContractsParams, OptionsEodParams, OptionsUnderlyingSymbolsParams,
  SpGlobalComponentsParams, MarketplaceTickDataParams, Ticker,
} from '../types.js';

export class UnicornBayOptionsApi {
  constructor(private http: HttpClient) {}

  /** US Options contracts: GET /mp/unicornbay/options/contracts */
  async contracts(params: OptionsContractsParams = {}): Promise<unknown> {
    return this.http.get('/mp/unicornbay/options/contracts', params);
  }

  /** US Options EOD data: GET /mp/unicornbay/options/eod */
  async eod(params: OptionsEodParams = {}): Promise<unknown> {
    return this.http.get('/mp/unicornbay/options/eod', params);
  }

  /** US Options underlying symbols: GET /mp/unicornbay/options/underlying-symbols */
  async underlyingSymbols(params: OptionsUnderlyingSymbolsParams = {}): Promise<unknown> {
    return this.http.get('/mp/unicornbay/options/underlying-symbols', params);
  }
}

export class UnicornBaySpGlobalApi {
  constructor(private http: HttpClient) {}

  /** S&P Global indices list: GET /mp/unicornbay/spglobal/list */
  async list(): Promise<unknown[]> {
    return this.http.get('/mp/unicornbay/spglobal/list');
  }

  /** S&P Global index components: GET /mp/unicornbay/spglobal/comp/{symbol} */
  async components(symbol: string, params: SpGlobalComponentsParams = {}): Promise<unknown> {
    return this.http.get(`/mp/unicornbay/spglobal/comp/${symbol}`, params);
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
  async tickdata(symbol: string, params: MarketplaceTickDataParams = {}): Promise<unknown[]> {
    return this.http.get(`/mp/unicornbay/tickdata/ticks`, { s: symbol, ...params });
  }

  /** Stock market logo: GET /mp/unicornbay/logo/{symbol} */
  async logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/mp/unicornbay/logo/${symbol}`);
  }
}
