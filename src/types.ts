/** 公共类型 */

export interface FundAPIOptions {
  /** API Key；不传则读环境变量 FUND_KEY；都没有则匿名（仅免费端点可用） */
  key?: string;
  /** 兼容别名（等同于 key） */
  apiKey?: string;
  /** 服务地址，默认 https://api.fundapi.cn */
  baseUrl?: string;
  /** 单请求超时（毫秒），默认 30000 */
  timeout?: number;
  /** 5xx / 网络错误的重试次数，默认 3 */
  retries?: number;
  /** true → 返回完整信封（含 ok / tier / data 等），不取出 data */
  raw?: boolean;
}

/** 一行数据 */
export type Row = Record<string, unknown>;

/** 响应信封 */
export interface Envelope {
  ok?: boolean;
  endpoint?: string;
  tier?: string;
  data?: unknown;
  [k: string]: unknown;
}
