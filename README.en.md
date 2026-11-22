<div align="center">

<a href="https://fundapi.cn"><img src="https://fundapi.cn/icon-round.png" width="88" height="88" alt="fundapi"></a>

# @fundapi/sdk — Official Node.js / TypeScript SDK for the Fund Data API

**NAV / profile / quarterly holdings / managers / rankings / notices / dividends / trade rules / ratings / portfolio x-ray** — **19 endpoints**, **free endpoints need no key**.

![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-types-3178C6?logo=typescript&logoColor=white)
[![npm](https://img.shields.io/npm/v/%40fundapi%2Fsdk?label=npm)](https://www.npmjs.com/package/@fundapi/sdk)
![License](https://img.shields.io/badge/license-MIT-green)

[中文](README.md) · **English**

[Website](https://fundapi.cn) · [Docs](https://fundapi.cn/docs/) · [MCP](https://fundapi.cn/mcp) · [Changelog](https://fundapi.cn/changelog/)

</div>

```bash
npm install @fundapi/sdk
```

## What it is

The official Node.js / TypeScript SDK for the fund data API — **19 endpoints, 19 methods**: auth, retries (with 429 backoff), error mapping, code normalization and response parsing are handled for you — one method call returns structured data.

```ts
import { FundAPI } from "@fundapi/sdk";
const cli = new FundAPI({ key: "cf-your-key" }); // or the FUND_KEY env var
const data = await cli.fundProfile("110022");
```

**3 endpoints need no key**: `fundSearch` · `fundProfile` · `fundScreenerOptions`.

## Quick start

```ts
import { FundAPI } from "@fundapi/sdk";

const cli = new FundAPI();                         // free endpoints, no key

const found = await cli.fundSearch("Yifangda Consumer", 3);
console.log(found.list);

const profile = await cli.fundProfile("110022");
```

Paid endpoints:

```ts
const cli2 = new FundAPI({ key: "cf-your-key" });
const nav = await cli2.fundNav("110022", { size: 5 });
```

## Methods (19, camelCase)

| Method | Endpoint | Tier |
|---|---|---|
| `fundSearch(q, limit=20)` | Search funds | Free |
| `fundProfile(code)` | Fund profile | Free |
| `fundScreenerOptions()` | Screener option dictionary | Free |
| `fundNav(code, {page,size,start,end})` | NAV history | Pro |
| `fundHoldings(code, {year,quarter})` | Quarterly holdings | Pro |
| `fundManagers(code)` | Current managers | Pro |
| `fundRank({ft,sort,order,page,size})` | Market rankings | Pro |
| `fundNotices(code, {page,size})` | Notices | Pro |
| `fundEstimate(code)` | Intraday estimate | Pro |
| `fundDividends(code)` | Dividends | Pro |
| `fundTradeRule(code)` | Trade rules | Pro |
| `fundRating(code, {page,size})` | Ratings | Pro |
| `fundOverlap(codes)` | Holdings overlap | Institutional |
| `fundPortfolioXray(codes, weights)` | Portfolio x-ray to stocks | Institutional |
| `fundHoldingChanges(code, {periods,top_n})` | Holdings changes | Institutional |
| `fundManagerHistory(code)` | Manager history | Institutional |
| `fundPortfolioDiagnose(codes, weights)` | Portfolio diagnostics | Institutional |
| `fundScreener({...})` | Screen the whole market | Institutional |
| `fundCompare(codes)` | Compare funds | Institutional |

## Response shape

Returns the endpoint's `data` field by default (shape varies per endpoint — see [docs](https://fundapi.cn/docs/)). For the full envelope (with `ok` / `tier` / `data`):

```ts
const cli = new FundAPI({ raw: true });
```

## Errors

```ts
import { AuthError, RateLimitError, EmptyResultError, APIError } from "@fundapi/sdk";

try {
  await cli.fundNav("110022");
} catch (e) {
  if (e instanceof AuthError) {          // invalid key / tier too low
  } else if (e instanceof RateLimitError) {  // rate limited, retry later
  } else if (e instanceof EmptyResultError) { // no data right now (not billed)
  } else if (e instanceof APIError) {    // other errors; message carries the server's text
  }
}
```

## Server-side only

Use it on the server only — the browser would expose your API key (this package ships no browser build on purpose).

## License

MIT
