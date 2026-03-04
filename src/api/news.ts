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

  /** Financial news: GET /news */
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
