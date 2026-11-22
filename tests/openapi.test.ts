/**
 * 端点覆盖测试 —— 拉线上 /openapi.json 确认 SDK 方法覆盖全部公开端点。
 * 需要网络；离线自动跳过。
 */
import { describe, expect, it } from "vitest";
import { FundAPI } from "../src/endpoints.js";

const OPENAPI = "https://api.fundapi.cn/openapi.json";

/** 端点路径 → SDK 方法名（`/v1/fund-search` → `fundSearch`） */
function methodName(path: string): string {
  const seg = path
    .replace(/\/+$/, "")
    .split("/")
    .filter((x) => x && x !== "v1")
    .join("-");
  const parts = seg.split("-");
  return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

async function spec(): Promise<{ paths: Record<string, unknown> } | null> {
  try {
    const res = await fetch(OPENAPI, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    return (await res.json()) as { paths: Record<string, unknown> };
  } catch {
    return null;
  }
}

describe("openapi 覆盖测试（需网络，离线跳过）", () => {
  it("每个公开端点都有对应 SDK 方法", async () => {
    const s = await spec();
    if (!s) return;
    const missing: string[] = [];
    for (const path of Object.keys(s.paths)) {
      const name = methodName(path);
      if (typeof (FundAPI.prototype as never)[name] !== "function") {
        missing.push(`${path} → ${name}()`);
      }
    }
    expect(missing, `SDK 缺少这些端点对应的方法：${missing.join(", ")}`).toEqual([]);
  });

  it("端点数 = 19 且覆盖率 100%", async () => {
    const s = await spec();
    if (!s) return;
    const paths = Object.keys(s.paths);
    expect(paths.length).toBe(19);
    const hit = paths.filter(
      (p) => typeof (FundAPI.prototype as never)[methodName(p)] === "function",
    );
    expect(hit.length).toBe(paths.length);
  });
});
