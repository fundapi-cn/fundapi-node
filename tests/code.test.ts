import { describe, expect, it } from "vitest";
import { normalizeCode } from "../src/code.js";

describe("基金代码规范化", () => {
  it("原生 6 位", () => {
    expect(normalizeCode("110022")).toBe("110022");
  });
  it("去 .OF 后缀", () => {
    expect(normalizeCode("110022.OF")).toBe("110022");
    expect(normalizeCode("110022.of")).toBe("110022");
  });
  it("去前后空格", () => {
    expect(normalizeCode(" 110022 ")).toBe("110022");
  });
  it("认不出来就原样返回", () => {
    expect(normalizeCode("not-a-code")).toBe("not-a-code");
    expect(normalizeCode("")).toBe("");
  });
});
