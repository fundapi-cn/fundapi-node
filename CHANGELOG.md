# Changelog

本包遵循 [语义化版本](https://semver.org/lang/zh-CN/)：**minor** = 新增端点/方法，**patch** = 修 bug / 改文档。

> 端点本身**永远是最新的**（服务端演进，无需升级 SDK）—— 只有需要用上**新增端点**的方法时才需升级 SDK。
> 完整端点清单与字段语义：<https://fundapi.cn/docs/>

---

## [0.1.0] — 2026-11-22

### 首次发布

- **19 个基金端点全覆盖**（方法名 camelCase：`fundProfile` / `fundNav` / `fundScreener` …）。
- **免费端点无需 Key**：`fundSearch` / `fundProfile` / `fundScreenerOptions`。
- **429 智能重试**：读取 `Retry-After` —— 短等待自动重试，长等待直接抛 `RateLimitError`，不放大请求量。
- **端点覆盖**：SDK 方法始终与线上 API 的全部公开端点保持同步。
