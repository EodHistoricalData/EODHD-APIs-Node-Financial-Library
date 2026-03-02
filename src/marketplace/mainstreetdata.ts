import type { HttpClient } from '../http.js';

export class MainStreetDataApi {
  constructor(private http: HttpClient) {}

  /** Company operating metrics: GET /mp/mainstreetdata/msdapi */
  async metrics(params: Record<string, unknown> = {}): Promise<unknown> {
    return this.http.get('/mp/mainstreetdata/msdapi', params);
  }
}
