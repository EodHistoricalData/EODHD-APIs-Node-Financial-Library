import type { HttpClient } from '../http.js';
import type { Ticker } from '../types.js';

export class UserApi {
  constructor(private http: HttpClient) {}

  /** User account info: GET /user */
  async user(): Promise<unknown> {
    return this.http.get('/user');
  }

  /** Company logo (PNG): GET /logo/{symbol} */
  async logo(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/logo/${symbol}`);
  }

  /** Company logo (SVG): GET /logo-svg/{symbol} */
  async logoSvg(symbol: Ticker): Promise<ArrayBuffer> {
    return this.http.getBuffer(`/logo-svg/${symbol}`);
  }
}
