// 3 行拿数据（免费端点无需 Key）
// 安装后：npm i @fundapi/sdk
import { FundAPI } from "@fundapi/sdk";

const cli = new FundAPI(); // 免费端点：无需 Key

console.log("搜索基金：", await cli.fundSearch("易方达消费行业", 3));
console.log("基金档案：", await cli.fundProfile("110022"));
console.log("筛选项字典：", await cli.fundScreenerOptions());

// 付费端点（需 Key）—— 设置 FUND_KEY 环境变量或 new FundAPI({ key: "cf-..." })
// console.log(await cli.fundNav("110022", { size: 5 }));
