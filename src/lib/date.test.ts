import { describe, expect, it } from "vitest";

import { todayInSeoul } from "@/lib/date";

describe("todayInSeoul", () => {
  it("서울 기준 오늘을 YYYY-MM-DD로 돌려준다", () => {
    expect(todayInSeoul(new Date("2026-10-18T03:00:00Z"))).toBe("2026-10-18");
  });

  it("UTC로는 전날이어도 서울이 자정을 넘었으면 다음 날이다", () => {
    expect(todayInSeoul(new Date("2026-10-17T15:00:00Z"))).toBe("2026-10-18");
    expect(todayInSeoul(new Date("2026-10-17T14:59:59Z"))).toBe("2026-10-17");
  });
});
