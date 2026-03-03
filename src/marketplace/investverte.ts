import type { HttpClient } from '../http.js';
import type { EsgCompanyParams, EsgCompanyItem, EsgCountryItem, EsgSectorItem, EsgData } from '../types.js';

export class InvestVerteApi {
  constructor(private http: HttpClient) {}

  /** ESG companies list: GET /mp/investverte/companies */
  async companies(): Promise<EsgCompanyItem[]> {
    return this.http.get('/mp/investverte/companies');
  }

  /** ESG countries list: GET /mp/investverte/countries */
  async countries(): Promise<EsgCountryItem[]> {
    return this.http.get('/mp/investverte/countries');
  }

  /** ESG sectors list: GET /mp/investverte/sectors */
  async sectors(): Promise<EsgSectorItem[]> {
    return this.http.get('/mp/investverte/sectors');
  }

  /** Company ESG data: GET /mp/investverte/esg/{symbol} */
  async esg(symbol: string, params: EsgCompanyParams = {}): Promise<EsgData> {
    return this.http.get(`/mp/investverte/esg/${symbol}`, params);
  }

  /** Country ESG data: GET /mp/investverte/country/{symbol} */
  async country(symbol: string, params: EsgCompanyParams = {}): Promise<EsgData> {
    return this.http.get(`/mp/investverte/country/${symbol}`, params);
  }

  /** Sector ESG data: GET /mp/investverte/sector/{symbol} */
  async sector(symbol: string, params: EsgCompanyParams = {}): Promise<EsgData> {
    return this.http.get(`/mp/investverte/sector/${symbol}`, params);
  }
}
