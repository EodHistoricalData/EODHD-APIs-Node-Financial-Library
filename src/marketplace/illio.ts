import type { HttpClient } from '../http.js';
import type { IllioIndexId, IllioChapterData } from '../types.js';

export class IllioApi {
  constructor(private http: HttpClient) {}

  /** Performance insights by category: GET /mp/illio/categories/performance/{id} */
  async categoryPerformance(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/categories/performance/${id}`);
  }

  /** Risk insights by category: GET /mp/illio/categories/risk/{id} */
  async categoryRisk(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/categories/risk/${id}`);
  }

  /** Performance chapter: GET /mp/illio/chapters/performance/{id} */
  async performance(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/chapters/performance/${id}`);
  }

  /** Best and worst chapter: GET /mp/illio/chapters/best-and-worst/{id} */
  async bestAndWorst(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/chapters/best-and-worst/${id}`);
  }

  /** Volatility chapter: GET /mp/illio/chapters/volatility/{id} */
  async volatility(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/chapters/volatility/${id}`);
  }

  /** Risk return chapter: GET /mp/illio/chapters/risk/{id} */
  async risk(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/chapters/risk/${id}`);
  }

  /** Largest volume chapter: GET /mp/illio/chapters/volume/{id} */
  async volume(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/chapters/volume/${id}`);
  }

  /** Beta bands chapter: GET /mp/illio/chapters/beta-bands/{id} */
  async betaBands(id: IllioIndexId): Promise<IllioChapterData> {
    return this.http.get(`/mp/illio/chapters/beta-bands/${id}`);
  }
}
