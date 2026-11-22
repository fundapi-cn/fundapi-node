/**
 * 基金数据 API 官方 Node.js / TypeScript SDK
 *
 * ```ts
 * import { FundAPI } from "@fundapi/sdk";
 *
 * const cli = new FundAPI();                    // 免费端点无需 Key
 * const data = await cli.fundProfile("110022");
 *
 * const cli2 = new FundAPI({ key: "cf-..." });  // 付费端点需 Key（也读 FUND_KEY）
 * const nav = await cli2.fundNav("110022", { size: 5 });
 * ```
 *
 * 仅在服务端使用 —— 浏览器里会暴露你的 API Key（本包刻意不提供浏览器构建）。
 *
 * 文档：https://fundapi.cn/docs
 */

export { FundAPI } from "./endpoints.js";
export type {
  NavOptions,
  HoldingsOptions,
  RankOptions,
  PageSizeOptions,
  HoldingChangesOptions,
  ScreenerOptions,
} from "./endpoints.js";
export { FundAPIBase, DEFAULT_BASE, FREE_ENDPOINTS, RETRY_429_MAX_WAIT } from "./client.js";
export { normalizeCode } from "./code.js";
export {
  FundAPIError,
  APIError,
  AuthError,
  EmptyResultError,
  RateLimitError,
  UpstreamError,
} from "./errors.js";
export { VERSION } from "./version.js";
export type { FundAPIOptions, Envelope, Row } from "./types.js";
