import { afterEach, describe, expect, it, vi } from "vitest";
import { FundAPI } from "../src/index.js";
import { APIError, AuthError, EmptyResultError, RateLimitError } from "../src/errors.js";

afterEach(() => vi.unstubAllGlobals());

function mockJson(status: number, body: unknown, headers: Record<string, string> = {}) {
  vi.stubGlobal("fetch", async () =>
    new Response(JSON.stringify(body), { status, headers }),
  );
}

describe("4xx 映射到正确异常", () => {
  it("401 → AuthError", async () => {
    mockJson(401, { error: "bad key" });
    await expect(new FundAPI({ key: "x" }).fundProfile("110022")).rejects.toBeInstanceOf(AuthError);
  });
  it("403 → AuthError", async () => {
    mockJson(403, { error: "档位不足" });
    await expect(new FundAPI({ key: "x" }).fundPortfolioXray("110022", "1")).rejects.toBeInstanceOf(
      AuthError,
    );
  });
  it("422 → APIError", async () => {
    mockJson(422, { detail: [{ msg: "参数不合法" }] });
    await expect(new FundAPI({ key: "x" }).fundProfile("000000")).rejects.toBeInstanceOf(APIError);
  });
  it("429 + Retry-After 60 → RateLimitError（不重试）", async () => {
    mockJson(429, { error: "slow" }, { "Retry-After": "60" });
    await expect(new FundAPI({ key: "x" }).fundProfile("110022")).rejects.toBeInstanceOf(
      RateLimitError,
    );
  });
  it("ok:false 空数据 → EmptyResultError", async () => {
    mockJson(200, { ok: false, endpoint: "fund-notices", data: [] });
    await expect(new FundAPI({ key: "x" }).fundNotices("110022")).rejects.toBeInstanceOf(
      EmptyResultError,
    );
  });
});

describe("正常返回", () => {
  it("200 ok:true → 返回 data", async () => {
    mockJson(200, { ok: true, data: { x: 1 } });
    const r = await new FundAPI({ key: "x" }).fundProfile("110022");
    expect(r).toEqual({ x: 1 });
  });
  it("raw:true → 返回整个信封", async () => {
    mockJson(200, { ok: true, data: { x: 1 }, tier: "free" });
    const r = await new FundAPI({ key: "x", raw: true }).fundProfile("110022");
    expect(r).toMatchObject({ ok: true, tier: "free" });
  });
});

describe("鉴权前置", () => {
  it("付费端点无 key → 请求前抛 AuthError（不发请求）", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(new FundAPI().fundNav("110022")).rejects.toBeInstanceOf(AuthError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
