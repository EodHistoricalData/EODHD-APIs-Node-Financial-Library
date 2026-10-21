import type { HttpClient } from "../http.js";
import type {
  NewsArticle,
  NewsParams,
  NewsWordWeight,
  NewsWordWeightsParams,
  SentimentItem,
  SentimentsParams,
} from "../types.js";

export class NewsApi {
  constructor(private http: HttpClient) {}

  /**
   * Financial news: GET /news. `offset` max is 10000 and `offset + limit` must not exceed 10000;
   * narrow the period with `from`/`to` to reach older articles. `direction: 1` returns articles in
   * database-entry order for duplicate-free forward paging (requires `from` and `to`, window up to 31 days).
   */
  async news(params: NewsParams = {}): Promise<NewsArticle[]> {
    return this.http.get("/news", params);
  }

  /** Sentiment data: GET /sentiments */
  async sentiments(params: SentimentsParams = {}): Promise<Record<string, SentimentItem[]>> {
    return this.http.get("/sentiments", params);
  }

  /** News word weights: GET /news-word-weights */
  async newsWordWeights(params: NewsWordWeightsParams = {}): Promise<NewsWordWeight[]> {
    return this.http.get("/news-word-weights", params);
  }
}
