/**
 * 核心客户端 —— 认证 / 请求 / 重试 / 错误映射
 *
 * 与 Python SDK 的 client.py 行为一致（同一后端、同一套规则）：
 *   · 认证：`Authorization: Bearer` + 环境变量 `FUND_KEY` + 构造参数
 *   · 免费端点（3 个）无需 Key
 *   · 5xx / 网络错误 → 指数退避重试
 *   · 429 → 读 `Retry-After`：要求等待 > 5s 时不重试，直接抛 RateLimitError
 *   · `ok:false` 不重试（服务端已处理，不扣调用次数）
 *   · 空结果 → EmptyResultError（"当前无数据" ≠ "失败"）
 *
 * 语言惯例差异：JS 版全部返回 Promise。
 */

import { normalizeCode } from "./code.js";
import { APIError, AuthError, EmptyResultError, RateLimitError, UpstreamError } from "./errors.js";
import type { Envelope, FundAPIOptions, Row } from "./types.js";
import { VERSION } from "./version.js";

export const DEFAULT_BASE = "https://api.fundapi.cn";

/** 429 退避上限（秒）：服务端要求等待超过这个秒数时不盲目重试，避免把 1 次调用放大成多次 */
export const RETRY_429_MAX_WAIT = 5;

/** 免 Key 端点（免费层） */
export const FREE_ENDPOINTS: readonly string[] = [
  "/v1/fund-search",
  "/v1/fund-profile",
  "/v1/fund-screener-options",
];

/** 解析 Retry-After 响应头（秒数形式）。HTTP-date 或缺失 → 0 */
function retryAfterSeconds(value: string | null): number {
  if (!value) return 0;
  const n = Number.parseFloat(value.trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** 从 4xx 响应体取出服务端写给人看的那句话（error / detail）。取不到退回原文（截断） */
async function serverErrorText(res: Response): Promise<string> {
  try {
    const raw = await res.text();
    try {
      const body = JSON.parse(raw) as Record<string, unknown>;
      const d = body.error ?? body.detail;
      if (typeof d === "string" && d.trim()) return d.trim();
      if (Array.isArray(d)) {
        const parts = d.map((it) =>
          it && typeof it === "object"
            ? String((it as { msg?: unknown }).msg ?? JSON.stringify(it))
            : String(it),
        );
        if (parts.length) return parts.join("; ");
      }
    } catch {
      /* 非 JSON → 退回原文 */
    }
    return raw.slice(0, 120);
  } catch {
    return "";
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** 参数对象 → query string（跳过 undefined / null / 空串；0 与 false 保留） */
function toQuery(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  return qs.toString();
}

export class FundAPIBase {
  readonly key: string;
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retries: number;
  readonly raw: boolean;

  /**
   * @example
   * ```ts
   * const cli = new FundAPI();                       // 免费端点无需 Key
   * const rows = await cli.fundProfile("110022");
   *
   * const cli2 = new FundAPI({ key: "cf-..." });     // 或设 FUND_KEY
   * ```
   */
  constructor(opts: FundAPIOptions = {}) {
    this.key = (opts.key ?? opts.apiKey ?? process.env.FUND_KEY ?? "").trim();
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
    this.timeout = opts.timeout ?? 30_000;
    this.retries = Math.max(1, Math.trunc(opts.retries ?? 3));
    this.raw = opts.raw ?? false;
  }

  /** 统一请求（认证 / 超时 / 重试 / 信封校验）→ 原始信封 */
  async request(path: string, params: Record<string, unknown> = {}): Promise<Envelope> {
    const q = toQuery(params);
    const url = `${this.baseUrl}${path}${q ? "?" + q : ""}`;

    const headers: Record<string, string> = { "User-Agent": `fundapi-node/${VERSION}` };
    if (this.key) {
      headers.Authorization = `Bearer ${this.key}`;
    } else if (!FREE_ENDPOINTS.includes(path)) {
      throw new AuthError(
        `端点 ${path} 需要 API Key（免 Key 端点：${FREE_ENDPOINTS.join(" / ")}）。获取：https://fundapi.cn/pricing`,
      );
    }

    let lastErr: Error | undefined;

    for (let i = 0; i < this.retries; i++) {
      let res: Response;
      try {
        res = await fetch(url, {
          method: "GET",
          headers,
          signal: AbortSignal.timeout(this.timeout),
        });
      } catch (e) {
        lastErr = new APIError(`网络错误：${String(e)}`);
        await sleep(500 * 3 ** i);
        continue;
      }

      if (res.status === 401) {
        throw new AuthError(`Key 无效或未携带（401）：${await serverErrorText(res)}`, 401);
      }
      if (res.status === 403) {
        throw new AuthError(
          `档位不足（403）：${await serverErrorText(res)}。需要更高档位：https://fundapi.cn/pricing`,
          403,
        );
      }
      if (res.status === 429) {
        const wait = retryAfterSeconds(res.headers.get("Retry-After"));
        lastErr = new RateLimitError(
          `超频（429）：${wait ? `服务端要求 ${wait} 秒后再试` : "已被限流"}`,
          429,
        );
        if (wait > RETRY_429_MAX_WAIT) throw lastErr;
        if (i === this.retries - 1) break;
        await sleep(wait ? wait * 1000 : 500 * 3 ** i);
        continue;
      }
      if (res.status >= 500) {
        lastErr = new APIError(`服务端 ${res.status}`, res.status);
        await sleep(500 * 3 ** i);
        continue;
      }
      if (res.status >= 400) {
        throw new APIError(`HTTP ${res.status}：${await serverErrorText(res)}`, res.status);
      }

      let body: Envelope;
      try {
        body = (await res.json()) as Envelope;
      } catch {
        throw new APIError(`响应不是 JSON（HTTP ${res.status}）`, res.status);
      }

      if (body.ok === false) {
        const d = body.data;
        const isEmpty =
          d === null ||
          d === undefined ||
          (Array.isArray(d) && d.length === 0) ||
          (typeof d === "object" && !Array.isArray(d) && Object.keys(d as object).length === 0);
        if (isEmpty) {
          throw new EmptyResultError(
            `当前无数据（非失败）：${body.endpoint ?? path} —— 不计费，稍后重试或换条件`,
          );
        }
        throw new UpstreamError(String(d || "服务端暂时取不到数据，请重试一次"));
      }

      return body;
    }

    throw lastErr ?? new APIError(`重试 ${this.retries} 次仍失败`);
  }

  /** 取数并返回端点 `data` 字段（`raw: true` 时返回整个信封） */
  async get<T = unknown>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    const body = await this.request(path, params);
    if (this.raw) return body as unknown as T;
    return (body.data ?? body) as unknown as T;
  }

  /** 基金代码规范化（也导出给用户，见 index.ts） */
  protected _code(code: string): string {
    return normalizeCode(code);
  }
}

export type { Row };
