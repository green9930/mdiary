import { describe, expect, it } from "vitest";

import { calendarPath } from "@/lib/navigation";

describe("calendarPath (화면 명세 SC-06 저장 성공)", () => {
  it("그 날짜의 월과 날짜를 담은 달력 주소다", () => {
    expect(calendarPath("2026-10-18")).toBe("/?month=2026-10&date=2026-10-18");
  });
});
