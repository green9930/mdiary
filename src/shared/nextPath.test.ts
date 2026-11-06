import { describe, expect, it } from "vitest";

import { loginPath, safeNextPath } from "./nextPath";

describe("safeNextPath (화면 명세 RT)", () => {
  it.each([
    ["/", "/"],
    ["/calendar?month=2026-10", "/calendar?month=2026-10"],
    ["/expenses/abc#memo", "/expenses/abc#memo"],
  ])("서비스 안의 경로 %s는 그대로 쓴다", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it.each([
    [null],
    [undefined],
    [""],
    ["calendar"],
    ["//evil.example"],
    ["/\\evil.example"],
    ["https://evil.example"],
    ["javascript:alert(1)"],
  ])("그 밖의 값 %s는 /로 바꾼다", (input) => {
    expect(safeNextPath(input)).toBe("/");
  });
});

describe("loginPath", () => {
  it("원래 경로를 next에 담는다", () => {
    expect(loginPath("/calendar?month=2026-10")).toBe(
      "/login?next=%2Fcalendar%3Fmonth%3D2026-10",
    );
  });

  it("이유가 있으면 reason을 붙인다", () => {
    expect(loginPath("/search", "expired")).toBe(
      "/login?next=%2Fsearch&reason=expired",
    );
  });
});
