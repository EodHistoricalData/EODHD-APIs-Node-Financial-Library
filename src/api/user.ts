import type { HttpClient } from '../http.js';

export class UserApi {
  constructor(private http: HttpClient) {}

  /** User account info: GET /user */
  async user(): Promise<unknown> {
    return this.http.get('/user');
  }
}
