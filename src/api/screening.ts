import type { HttpClient } from "../http.js";
import type {
  IdMappingItem,
  IdMappingParams,
  ScreenerParams,
  ScreenerResponse,
  SearchParams,
  SearchResult,
  TechnicalDataPoint,
  TechnicalParams,
  Ticker,
} from "../types.js";

function warnBondTypeNotSupported(): void {
  const message =
    '[eodhd] search() type: "bond" is not supported on any current EODHD plan and is ignored; ' +
    "the request will be sent without a type filter.";
  if (typeof process !== "undefined" && typeof process.emitWarning === "function") {
    process.emitWarning(message, "DeprecationWarning");
  } else {
    console.warn(message);
  }
}

export class ScreeningApi {
  constructor(private http: HttpClient) {}

  /** Stock market screener: GET /screener */
  async screener(params: ScreenerParams = {}): Promise<ScreenerResponse> {
    return this.http.get("/screener", params);
  }

  /** Search stocks/ETFs/funds: GET /search/{query} */
  async search(query: string, params: SearchParams = {}): Promise<SearchResult[]> {
    // "bond" is no longer part of the public SearchParams.type union, but a JS
    // caller (or `as any`) can still pass it through — quietly drop it instead
    // of forwarding it to the API.
    if ((params as { type?: string }).type === "bond") {
      warnBondTypeNotSupported();
      const { type: _unused, ...rest } = params as SearchParams & { type?: string };
      return this.http.get(`/search/${encodeURIComponent(query)}`, rest);
    }
    return this.http.get(`/search/${encodeURIComponent(query)}`, params);
  }

  /** ID mapping (CUSIP/ISIN/FIGI/LEI/CIK): GET /id-mapping */
  async idMapping(params: IdMappingParams = {}): Promise<IdMappingItem[]> {
    return this.http.get("/id-mapping", params);
  }

  /** Technical indicators: GET /technical/{ticker} */
  async technical(ticker: Ticker, params: TechnicalParams): Promise<TechnicalDataPoint[]> {
    return this.http.get(`/technical/${encodeURIComponent(ticker)}`, params);
  }
}
