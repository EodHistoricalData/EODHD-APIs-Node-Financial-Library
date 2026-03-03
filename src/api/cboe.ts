import type { HttpClient } from '../http.js';
import type { CboeIndexParams, CboeIndexItem, CboeIndexData } from '../types.js';

export class CboeApi {
  constructor(private http: HttpClient) {}

  /** CBOE indices list: GET /cboe/indices */
  async indices(): Promise<CboeIndexItem[]> {
    return this.http.get('/cboe/indices');
  }

  /** CBOE index data: GET /cboe/index */
  async index(params: CboeIndexParams): Promise<CboeIndexData> {
    return this.http.get('/cboe/index', params);
  }
}
