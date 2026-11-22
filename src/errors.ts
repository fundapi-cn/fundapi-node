/** 异常类型 —— 按"用户能采取的动作"分类，不只按 HTTP 码（与 Python SDK 的 errors.py 一一对应） */

export class FundAPIError extends Error {
  /** HTTP 状态码（若来自 HTTP 响应） */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 401 / 403 / 缺 Key —— 动作：检查 `FUND_KEY`；403 多为档位不够（如组合穿透需机构版）⇒ 去 https://fundapi.cn/pricing 升级 */
export class AuthError extends FundAPIError {}

/** 429 超频 —— 动作：降频重试；若提示为当日条数用尽，次日恢复或升级档位 */
export class RateLimitError extends FundAPIError {}

/** 当前无数据（不是故障）—— 如某基金该季度无公告。不扣调用次数；稍后重试或换条件即可 */
export class EmptyResultError extends FundAPIError {}

/** `ok:false`（服务端暂时取不到数据）—— 不扣调用次数，动作：重试一次通常就好 */
export class UpstreamError extends FundAPIError {}

/** 5xx / 其他 4xx / 非预期响应。其他 4xx 的含义写在消息里（服务端原话），照消息改参数即可，重试无意义 */
export class APIError extends FundAPIError {}
