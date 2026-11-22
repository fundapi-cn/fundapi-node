/** 端点方法 —— 19 个，与 API 一一对应（方法名用 camelCase，符合 JS 惯例） */

import { FundAPIBase } from "./client.js";

export interface NavOptions {
  page?: number;
  size?: number;
  start?: string;
  end?: string;
}
export interface HoldingsOptions {
  year?: string;
  quarter?: string;
}
export interface RankOptions {
  ft?: string;
  sort?: string;
  order?: string;
  page?: number;
  size?: number;
}
export interface PageSizeOptions {
  page?: number;
  size?: number;
}
export interface HoldingChangesOptions {
  periods?: number;
  top_n?: number;
}
export interface ScreenerOptions {
  type?: string;
  sub_type?: string;
  company?: string;
  subject?: string;
  w4?: number;
  w13?: number;
  w26?: number;
  w52?: number;
  y2?: number;
  y3?: number;
  y5?: number;
  yn?: number;
  morningstar?: number;
  haitong?: number;
  jianxin?: number;
  zhaoshang?: number;
  yinhe3?: number;
  yinhe5?: number;
  sort?: string;
  order?: string;
  page?: number;
  size?: number;
}

export class FundAPI extends FundAPIBase {
  // ── 免费 ────────────────────────────────────────────────

  /** 按代码 / 名称 / 拼音搜索基金，返回代码 + 名称。不知道代码时先搜 */
  fundSearch<T = unknown>(q: string, limit = 20): Promise<T> {
    return this.get<T>("/v1/fund-search", { q, limit });
  }

  /** 单只基金档案：费率、阶段涨幅、现任经理、规模变动、仓位、持有人结构、前 10 重仓股 */
  fundProfile<T = unknown>(code: string): Promise<T> {
    return this.get<T>("/v1/fund-profile", { code: this._code(code) });
  }

  /** 筛选项字典：类型 / 基金公司 / 主题 / 收益区间 / 机构评级 / 排序字段的取值 */
  fundScreenerOptions<T = unknown>(): Promise<T> {
    return this.get<T>("/v1/fund-screener-options");
  }

  // ── 专业版 ──────────────────────────────────────────────

  /** 历史净值：单位净值、累计净值、日增长率、申赎状态，按日期倒序分页 */
  fundNav<T = unknown>(code: string, opts: NavOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-nav", {
      code: this._code(code),
      page: opts.page,
      size: opts.size,
      start: opts.start,
      end: opts.end,
    });
  }

  /** 季报持仓明细：前 10 大重仓股的名称、代码、占净值比例、持股数、市值 */
  fundHoldings<T = unknown>(code: string, opts: HoldingsOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-holdings", {
      code: this._code(code),
      year: opts.year,
      quarter: opts.quarter,
    });
  }

  /** 在任基金经理：姓名、星级、任职年限、在管规模、能力评分、任期收益对比 */
  fundManagers<T = unknown>(code: string): Promise<T> {
    return this.get<T>("/v1/fund-managers", { code: this._code(code) });
  }

  /** 全市场基金排行：按类型 + 单个区间排序，分页返回 */
  fundRank<T = unknown>(opts: RankOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-rank", {
      ft: opts.ft,
      sort: opts.sort,
      order: opts.order,
      page: opts.page,
      size: opts.size,
    });
  }

  /** 基金公告：分红、定期报告、人事变更、估值调整等，按发布日期倒序分页 */
  fundNotices<T = unknown>(code: string, opts: PageSizeOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-notices", {
      code: this._code(code),
      page: opts.page,
      size: opts.size,
    });
  }

  /** 当日净值估算（净值晚上才公布）：实时估算 + 持仓模型估算，另给是否交易日。估算值不是实际净值 */
  fundEstimate<T = unknown>(code: string): Promise<T> {
    return this.get<T>("/v1/fund-estimate", { code: this._code(code) });
  }

  /** 历史分红 + 份额折算 + 分红公告标题 */
  fundDividends<T = unknown>(code: string): Promise<T> {
    return this.get<T>("/v1/fund-dividends", { code: this._code(code) });
  }

  /** 交易规则：申赎状态、起购金额、各项费率、申购费分档（标准价+代销折扣价）、赎回费分档、确认到账节奏 */
  fundTradeRule<T = unknown>(code: string): Promise<T> {
    return this.get<T>("/v1/fund-trade-rule", { code: this._code(code) });
  }

  /** 评级：逐报告期一行，6 家机构星级。评级为 null 表示当期未评级 */
  fundRating<T = unknown>(code: string, opts: PageSizeOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-rating", {
      code: this._code(code),
      page: opts.page,
      size: opts.size,
    });
  }

  // ── 机构版 ──────────────────────────────────────────────

  /** 多基金持仓重叠：2-10 只基金共同持有 / 各自独有的股票 */
  fundOverlap<T = unknown>(codes: string): Promise<T> {
    return this.get<T>("/v1/fund-overlap", { codes });
  }

  /** 组合穿透到个股：基金代码 + 权重 → 各股综合权重、来源拆解、穿透覆盖 */
  fundPortfolioXray<T = unknown>(codes: string, weights: string): Promise<T> {
    return this.get<T>("/v1/fund-portfolio-xray", { codes, weights });
  }

  /** 季报持仓变动：新进前十 / 跌出前十 / 加减仓（按股数） */
  fundHoldingChanges<T = unknown>(code: string, opts: HoldingChangesOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-holding-changes", {
      code: this._code(code),
      periods: opts.periods,
      top_n: opts.top_n,
    });
  }

  /** 基金经理历任：现任详情、稳定性、历任任期区间与回报、标记（一拖多等） */
  fundManagerHistory<T = unknown>(code: string): Promise<T> {
    return this.get<T>("/v1/fund-manager-history", { code: this._code(code) });
  }

  /** 组合诊断：行业暴露、重仓股穿透、两两重叠、权益仓位逐季变化、费率合计 */
  fundPortfolioDiagnose<T = unknown>(codes: string, weights: string): Promise<T> {
    return this.get<T>("/v1/fund-portfolio-diagnose", { codes, weights });
  }

  /** 条件横筛全市场基金：类型 / 基金公司 / 主题 / 收益区间 / 机构评级 / 排序，分页返回。取值先调 fundScreenerOptions */
  fundScreener<T = unknown>(opts: ScreenerOptions = {}): Promise<T> {
    return this.get<T>("/v1/fund-screener", { ...opts });
  }

  /** 多基金并列对比：2-5 只的 10 档收益、费率、经理、前 10 重仓、行业 top5、规模、仓位、机构持有比例、两两重叠。只并列不排序 */
  fundCompare<T = unknown>(codes: string): Promise<T> {
    return this.get<T>("/v1/fund-compare", { codes });
  }
}
