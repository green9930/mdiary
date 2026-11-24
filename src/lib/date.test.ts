import { describe, expect, it } from "vitest";

import {
  addMonths,
  convertToDateStr,
  convertToDbDate,
  convertToKSTStr,
  dateOrToday,
  defaultDateOf,
  formatDayHeading,
  formatFullDate,
  formatMonth,
  formatMonthNumber,
  formatYear,
  isMaxMonth,
  isMinMonth,
  isValidDate,
  isValidMonth,
  monthGridDates,
  monthOf,
} from "@/lib/date";

describe("convertToKSTStr", () => {
  it("서울 기준 오늘을 YYYY-MM-DD로 돌려준다", () => {
    expect(convertToKSTStr(new Date("2026-10-18T03:00:00Z"))).toBe(
      "2026-10-18",
    );
  });

  it("UTC로는 전날이어도 서울이 자정을 넘었으면 다음 날이다", () => {
    expect(convertToKSTStr(new Date("2026-10-17T15:00:00Z"))).toBe(
      "2026-10-18",
    );
    expect(convertToKSTStr(new Date("2026-10-17T14:59:59Z"))).toBe(
      "2026-10-17",
    );
  });
});

describe("isValidDate (데이터 아키텍처 3-2: 실제 있는 날짜, 2020-01-01 ~ 2099-12-31)", () => {
  it("실제 있는 날짜면 true", () => {
    expect(isValidDate("2026-10-18")).toBe(true);
    expect(isValidDate("2028-02-29")).toBe(true);
  });

  it("없는 날짜면 false", () => {
    expect(isValidDate("2026-02-29")).toBe(false);
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("2026-04-31")).toBe(false);
  });

  it("형식이 다르면 false", () => {
    expect(isValidDate("2026-1-18")).toBe(false);
    expect(isValidDate("20261018")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });

  it("2099-12-31보다 뒤면 false", () => {
    expect(isValidDate("2099-12-31")).toBe(true);
    expect(isValidDate("2100-01-01")).toBe(false);
  });

  it("2020-01-01보다 앞이면 false", () => {
    expect(isValidDate("2020-01-01")).toBe(true);
    expect(isValidDate("2019-12-31")).toBe(false);
  });
});

describe("formatFullDate (화면 명세 SC-06 날짜 표시)", () => {
  it("연·월·일과 요일을 보여 준다", () => {
    expect(formatFullDate("2026-10-18")).toBe("2026년 10월 18일 (일)");
    expect(formatFullDate("2026-11-01")).toBe("2026년 11월 1일 (일)");
  });
});

describe("monthOf", () => {
  it("날짜의 월을 YYYY-MM으로 돌려준다", () => {
    expect(monthOf("2026-10-18")).toBe("2026-10");
  });
});

describe("addMonths", () => {
  it("월을 앞뒤로 옮긴다", () => {
    expect(addMonths("2026-10", 1)).toBe("2026-11");
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
  });
});

describe("monthGridDates (화면 명세 SC-03: 6줄 고정 달력)", () => {
  it("그 달 1일이 든 주의 일요일부터 42일을 돌려준다", () => {
    const dates = monthGridDates("2026-10");
    expect(dates).toHaveLength(42);
    expect(dates[0]).toBe("2026-09-27");
    expect(dates[4]).toBe("2026-10-01");
    expect(dates[41]).toBe("2026-11-07");
  });

  it("1일이 일요일이면 그날부터 시작한다", () => {
    expect(monthGridDates("2026-11")[0]).toBe("2026-11-01");
  });
});

describe("convertToDbDate · convertToDateStr (데이터 아키텍처 3-1)", () => {
  it("YYYY-MM-DD를 DB DATE 값으로 바꾸고 되돌려도 날짜가 밀리지 않는다", () => {
    expect(convertToDateStr(convertToDbDate("2026-10-18"))).toBe("2026-10-18");
    expect(convertToDateStr(convertToDbDate("2026-01-01"))).toBe("2026-01-01");
  });
});

describe("formatMonth (화면 명세 날짜 표시)", () => {
  it("`2026년 10월` 형식이다", () => {
    expect(formatMonth("2026-10")).toBe("2026년 10월");
    expect(formatMonth("2027-01")).toBe("2027년 1월");
  });
});

describe("isMaxMonth", () => {
  it("2099년 12월부터 참이다", () => {
    expect(isMaxMonth("2099-11")).toBe(false);
    expect(isMaxMonth("2099-12")).toBe(true);
  });
});

describe("isMinMonth", () => {
  it("2020년 1월까지 참이다", () => {
    expect(isMinMonth("2020-01")).toBe(true);
    expect(isMinMonth("2020-02")).toBe(false);
  });
});

describe("dateOrToday (화면 명세 SC-06 날짜 기본값)", () => {
  it("올바른 날짜면 그대로 쓴다", () => {
    expect(dateOrToday("2026-10-18", "2026-10-21")).toBe("2026-10-18");
  });

  it("없거나 잘못됐으면 오늘이다", () => {
    expect(dateOrToday(undefined, "2026-10-21")).toBe("2026-10-21");
    expect(dateOrToday("2026-02-30", "2026-10-21")).toBe("2026-10-21");
    expect(dateOrToday("tomorrow", "2026-10-21")).toBe("2026-10-21");
  });
});

describe("formatDayHeading (화면 명세 날짜 표시 · 날짜 목록 헤더)", () => {
  it("올해 날짜는 연도를 빼고 보여준다", () => {
    expect(formatDayHeading("2026-10-18", "2026-11-17")).toBe("10월 18일 (일)");
  });

  it("다른 해면 연도를 붙인다", () => {
    expect(formatDayHeading("2025-10-18", "2026-11-17")).toBe(
      "2025년 10월 18일 (토)",
    );
  });
});

describe("defaultDateOf (화면 명세 SC-03: 다른 달로 옮길 때 선택 날짜)", () => {
  it("이번 달이면 오늘", () => {
    expect(defaultDateOf("2026-11", "2026-11-17")).toBe("2026-11-17");
  });

  it("다른 달이면 1일", () => {
    expect(defaultDateOf("2026-08", "2026-11-17")).toBe("2026-08-01");
  });
});

describe("isValidMonth", () => {
  it("YYYY-MM이고 1~12월이며 2020-01 ~ 2099-12면 참", () => {
    expect(isValidMonth("2026-10")).toBe(true);
    expect(isValidMonth("2020-01")).toBe(true);
    expect(isValidMonth("2099-12")).toBe(true);
  });

  it("형식이 틀리거나 범위 밖이면 거짓", () => {
    for (const value of [
      "2026-13",
      "2026-00",
      "2026-1",
      "2019-12",
      "2100-01",
      "abc",
    ]) {
      expect(isValidMonth(value)).toBe(false);
    }
  });
});

describe("formatYear · formatMonthNumber (연·월 선택 격자)", () => {
  it("`2026년`, `3월`", () => {
    expect(formatYear(2026)).toBe("2026년");
    expect(formatMonthNumber(3)).toBe("3월");
  });
});
