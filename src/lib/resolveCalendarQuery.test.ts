import { describe, expect, it } from "vitest";

import { resolveCalendarQuery } from "@/lib/resolveCalendarQuery";

const today = "2026-11-17";

describe("resolveCalendarQuery (화면 명세 SC-03 쿼리 month·date)", () => {
  it("쿼리가 없으면 이번 달, 오늘", () => {
    expect(resolveCalendarQuery({ month: null, date: null }, today)).toEqual({
      month: "2026-11",
      date: "2026-11-17",
    });
  });

  it("올바른 쿼리는 그대로 쓴다", () => {
    expect(
      resolveCalendarQuery({ month: "2026-08", date: "2026-08-12" }, today),
    ).toEqual({ month: "2026-08", date: "2026-08-12" });
  });

  it("date가 없으면 그 달이 이번 달이면 오늘, 아니면 1일", () => {
    expect(
      resolveCalendarQuery({ month: "2026-08", date: null }, today).date,
    ).toBe("2026-08-01");
    expect(
      resolveCalendarQuery({ month: "2026-11", date: null }, today).date,
    ).toBe("2026-11-17");
  });

  it("date가 month에 속하지 않으면 date를 무시한다", () => {
    expect(
      resolveCalendarQuery({ month: "2026-08", date: "2026-09-03" }, today),
    ).toEqual({ month: "2026-08", date: "2026-08-01" });
  });

  it("형식이 틀린 month는 이번 달로 바꾼다", () => {
    expect(
      resolveCalendarQuery({ month: "2026-13", date: "2026-08-12" }, today),
    ).toEqual({ month: "2026-11", date: "2026-11-17" });
  });

  it("없는 날짜는 무시한다", () => {
    expect(
      resolveCalendarQuery({ month: "2026-02", date: "2026-02-30" }, today)
        .date,
    ).toBe("2026-02-01");
  });

  it("선택 가능 연도(2020년)보다 앞선 month는 이번 달로 바꾼다", () => {
    expect(
      resolveCalendarQuery({ month: "2019-12", date: null }, today),
    ).toEqual({ month: "2026-11", date: "2026-11-17" });
    expect(
      resolveCalendarQuery({ month: "2020-01", date: null }, today).month,
    ).toBe("2020-01");
  });
});
