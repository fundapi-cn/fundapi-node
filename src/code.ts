/** 基金代码规范化 —— 兼容多种写法，统一成 6 位数字（110022 / 110022.OF / 前后空格）。认不出来就原样返回。 */
export function normalizeCode(code: string): string {
  let c = (code ?? "").trim();
  if (c.toUpperCase().endsWith(".OF")) c = c.slice(0, -3).trim();
  return c;
}
