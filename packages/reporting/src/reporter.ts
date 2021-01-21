import axios, {AxiosInstance} from 'axios'
import qs from 'qs'

const API_URL = 'https://exchange.api.bity.com'
const REPORTING_URL = 'https://reporting.api.bity.com/exchange/v1'
const AUTH_URL = 'https://connect.bity.com/oauth2/token'
const TIMEOUT = 10 * 1000

export class Reporter {
  reportInstance: AxiosInstance
  apiInstance: AxiosInstance

  constructor() {
  }

  async initializeAuth(client_id: string, client_secret: string) {
    const { data } = await axios({
      method: 'post',
      url: AUTH_URL,
      data: qs.stringify({
        grant_type: 'client_credentials',
        scope: 'https://auth.bity.com/scopes/reporting.exchange',
        client_id,
        client_secret,
      }),
    })
    const { access_token } = data

    this.reportInstance = axios.create({
      baseURL: REPORTING_URL,
      timeout: TIMEOUT,
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
    this.apiInstance = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
  }

  async getOrder(orderId: string) {
    console.log('[FETCH] order', orderId);
    const { data } = await this.apiInstance({
      method: 'get',
      url: `/v2/orders/${orderId}`,
    });
    console.log('[DONE] order', orderId);

    let orderStatus = 'WAITING';
    if(data.timestamp_cancelled) {
      orderStatus = 'CANCELLED';
    } else if(data.timestamp_executed) {
      orderStatus = 'EXECUTED';
    } else if(data.timestamp_payment_received) {
      orderStatus = 'RECEIVED';
    }
    data.orderStatus = orderStatus;

    return data;
  }

  async getMonthReport(month: number, year: number) {
    const { data } = await this.reportInstance({
      method: 'get',
      url: `/summary/monthly/${year}-${month}`,
    });

    return data;
  }

  async getMonthOrderIds(month: number, year: number) {
    const { data } = await this.reportInstance({
      method: 'get',
      url: `/summary/monthly/${year}-${month}/order-ids`,
    });

    return data;
  }
}