<div align="center">

<a href="https://fundapi.cn"><img src="https://fundapi.cn/icon-round.png" width="88" height="88" alt="fundapi"></a>

# @fundapi/sdk — 基金数据 API 官方 Node.js / TypeScript SDK

**净值 / 档案 / 季报持仓 / 基金经理 / 排行 / 公告 / 分红 / 交易规则 / 评级 / 组合穿透** —— **19 个端点**，**免费端点无需 Key**。

![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-types-3178C6?logo=typescript&logoColor=white)
[![npm](https://img.shields.io/npm/v/%40fundapi%2Fsdk?label=npm)](https://www.npmjs.com/package/@fundapi/sdk)
![License](https://img.shields.io/badge/license-MIT-green)

**中文** · [English](README.en.md)

[官网](https://fundapi.cn) · [文档](https://fundapi.cn/docs/) · [MCP 接入](https://fundapi.cn/mcp) · [更新日志](https://fundapi.cn/changelog/)

</div>

```bash
npm install @fundapi/sdk
```

## 这是什么

**基金数据 API 的官方 Node.js / TypeScript SDK** —— 19 个端点对应 19 个方法：鉴权、重试（含 429 自动退避）、错误映射、基金代码规范化、返回解析都由 SDK 处理，一行方法拿到结构化数据。

```ts
import { FundAPI } from "@fundapi/sdk";
const cli = new FundAPI({ key: "cf-你的Key" }); // 或环境变量 FUND_KEY
const data = await cli.fundProfile("110022");
```

**3 个端点无需 Key**：`fundSearch` · `fundProfile` · `fundScreenerOptions`。

## 30 秒上手

```ts
import { FundAPI } from "@fundapi/sdk";

const cli = new FundAPI();                         // 免费端点，不用 Key

const found = await cli.fundSearch("易方达消费行业", 3);   // 不知道代码时先搜
console.log(found.list);

const profile = await cli.fundProfile("110022");   // 基金档案
```

付费端点：

```ts
const cli2 = new FundAPI({ key: "cf-你的Key" });
const nav = await cli2.fundNav("110022", { size: 5 });
```

## 方法一览（19 个，camelCase）

| 方法 | 端点 | 档位 |
|---|---|---|
| `fundSearch(q, limit=20)` | 搜索基金 | 免费 |
| `fundProfile(code)` | 基金档案 | 免费 |
| `fundScreenerOptions()` | 筛选项字典 | 免费 |
| `fundNav(code, {page,size,start,end})` | 历史净值 | 专业版 |
| `fundHoldings(code, {year,quarter})` | 季报持仓 | 专业版 |
| `fundManagers(code)` | 现任经理 | 专业版 |
| `fundRank({ft,sort,order,page,size})` | 全市场排行 | 专业版 |
| `fundNotices(code, {page,size})` | 基金公告 | 专业版 |
| `fundEstimate(code)` | 当日估值 | 专业版 |
| `fundDividends(code)` | 历史分红 | 专业版 |
| `fundTradeRule(code)` | 交易规则 | 专业版 |
| `fundRating(code, {page,size})` | 评级 | 专业版 |
| `fundOverlap(codes)` | 多基金持仓重叠 | 机构版 |
| `fundPortfolioXray(codes, weights)` | 组合穿透到个股 | 机构版 |
| `fundHoldingChanges(code, {periods,top_n})` | 持仓变动 | 机构版 |
| `fundManagerHistory(code)` | 基金经理历任 | 机构版 |
| `fundPortfolioDiagnose(codes, weights)` | 组合诊断 | 机构版 |
| `fundScreener({...})` | 条件筛选全市场 | 机构版 |
| `fundCompare(codes)` | 多基金对比 | 机构版 |

## 返回结构

默认返回端点的 `data` 字段（结构因端点而异，见[文档](https://fundapi.cn/docs/)）。要完整信封（含 `ok` / `tier` / `data` 等）：

```ts
const cli = new FundAPI({ raw: true });
```

## 错误处理

```ts
import { AuthError, RateLimitError, EmptyResultError, APIError } from "@fundapi/sdk";

try {
  await cli.fundNav("110022");
} catch (e) {
  if (e instanceof AuthError) {          // Key 无效 / 档位不足
  } else if (e instanceof RateLimitError) {  // 超频，稍后再试
  } else if (e instanceof EmptyResultError) { // 当前无数据（不扣次数）
  } else if (e instanceof APIError) {    // 其他错误，消息里带服务端原话
  }
}
```

## 服务端使用

仅在服务端使用 —— 浏览器里会暴露你的 API Key（本包刻意不提供浏览器构建）。

## License

MIT
