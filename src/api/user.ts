import type { HttpClient } from "../http.js";
import type { UserData } from "../types.js";

export class UserApi {
  constructor(private http: HttpClient) {}

  /** User account info: GET /user */
  async user(): Promise<UserData> {
    return this.http.get("/user");
  }
}
