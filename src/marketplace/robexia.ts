import type { HttpClient } from '../http.js';
import type { RobexiaTechAnalysisResult } from '../types.js';

export class RobexiaApi {
  constructor(private http: HttpClient) {}

  /** Basic technical analysis: GET /mp/robexia/basic-tech-analysis */
  async basicTechAnalysis(params: Record<string, unknown> = {}): Promise<RobexiaTechAnalysisResult> {
    return this.http.get('/mp/robexia/basic-tech-analysis', params);
  }
}
