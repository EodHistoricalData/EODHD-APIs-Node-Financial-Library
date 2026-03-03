import type { HttpClient } from '../http.js';
import type { MainStreetDataMetricsResult } from '../types.js';

export class MainStreetDataApi {
  constructor(private http: HttpClient) {}

  /** Company operating metrics: GET /mp/mainstreetdata/msdapi */
  async metrics(params: Record<string, unknown> = {}): Promise<MainStreetDataMetricsResult> {
    return this.http.get('/mp/mainstreetdata/msdapi', params);
  }
}
