import type { HttpClient } from '../http.js';

export class RobexiaApi {
  constructor(private http: HttpClient) {}

  /** Basic technical analysis: GET /mp/robexia/basic-tech-analysis */
  async basicTechAnalysis(params: Record<string, unknown> = {}): Promise<unknown> {
    return this.http.get('/mp/robexia/basic-tech-analysis', params);
  }
}
