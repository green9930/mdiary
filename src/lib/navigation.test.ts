import { describe, expect, it } from "vitest";

import { calendarPath, newExpensePath } from "@/lib/navigation";

describe("calendarPath (화면 명세 SC-06 저장 성공)", () => {
  it("그 날짜의 월과 날짜를 담은 달력 주소다", () => {
    expect(calendarPath("2026-10-18")).toBe("/?month=2026-10&date=2026-10-18");
  });
});

describe("newExpensePath (화면 명세 SC-01 ＋ 버튼, SC-03 기록 추가하기)", () => {
  it("그 날짜로 여는 등록 화면 주소다", () => {
    expect(newExpensePath("2026-10-19")).toBe("/expenses/new?date=2026-10-19");
  });
});
