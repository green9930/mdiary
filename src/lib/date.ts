import { DATE_RULES, WEEKDAY_LABELS } from "@/shared/sharedConstants";

// 날짜는 서울 기준으로 다룬다 (데이터 아키텍처: 기록 날짜는 시각 없는 날짜).
// 날짜(YYYY-MM-DD)·월(YYYY-MM)은 문자열로 다루고, JS Date로 바꾸는 곳은 이 파일뿐이다 (데이터 아키텍처 3-1)

// 날짜 계산은 시간대 영향이 없는 UTC 자정으로 한다
const toUtc = (date: string) => new Date(`${date}T00:00:00Z`);
const fromUtc = (value: Date) => value.toISOString().slice(0, 10);

/** 서울 기준 오늘 (YYYY-MM-DD) */
export const convertToKSTStr = (now: Date = new Date()): string =>
  now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

/** 실제 있는 날짜(YYYY-MM-DD)이고 선택 가능 연도(2020-01-01 ~ 2099-12-31) 안인지 */
export const isValidDate = (value: string) =>
  DATE_RULES.pattern.test(value) &&
  !Number.isNaN(toUtc(value).getTime()) &&
  fromUtc(toUtc(value)) === value &&
  value >= DATE_RULES.minDate &&
  value <= DATE_RULES.maxDate;

/** 올바른 날짜면 그 날짜, 없거나 잘못됐으면 today */
export const dateOrToday = (value: string | undefined, today: string) =>
  value !== undefined && isValidDate(value) ? value : today;

/** `2026년 10월 18일 (일)` */
export const formatFullDate = (date: string) => {
  const value = toUtc(date);
  return `${value.getUTCFullYear()}년 ${value.getUTCMonth() + 1}월 ${value.getUTCDate()}일 (${WEEKDAY_LABELS[value.getUTCDay()]})`;
};

/** 날짜 목록 헤더: `10월 18일 (일)`, 오늘과 다른 해면 `2025년 10월 18일 (토)` */
export const formatDayHeading = (date: string, today: string) =>
  date.slice(0, 4) === today.slice(0, 4)
    ? formatFullDate(date).slice(6)
    : formatFullDate(date);

/** `2026년` */
export const formatYear = (year: number) => `${year}년`;

/** `10월` */
export const formatMonthNumber = (month: number) => `${month}월`;

/** `2026년 10월` */
export const formatMonth = (month: string) =>
  `${formatYear(Number(month.slice(0, 4)))} ${formatMonthNumber(Number(month.slice(5, 7)))}`;

/** 실제 있는 월(YYYY-MM)이고 2020-01 ~ 2099-12인지 */
export const isValidMonth = (value: string) =>
  DATE_RULES.monthPattern.test(value) && isValidDate(`${value}-01`);

/** 그 달로 옮길 때 고르는 날짜: 이번 달이면 오늘, 아니면 1일 (화면 명세 SC-03) */
export const defaultDateOf = (month: string, today: string) =>
  month === monthOf(today) ? today : `${month}-01`;

/** 날짜의 월 (YYYY-MM) */
export const monthOf = (date: string) => date.slice(0, 7);

/** 월(YYYY-MM)을 n달 옮긴다 */
export const addMonths = (month: string, n: number) => {
  const value = toUtc(`${month}-01`);
  value.setUTCMonth(value.getUTCMonth() + n);
  return fromUtc(value).slice(0, 7);
};

/** 선택 가능 연도의 첫 달(2020년 1월)인지. 그 전 달로는 옮기지 않는다 */
export const isMinMonth = (month: string) =>
  month <= DATE_RULES.minDate.slice(0, 7);

/** 입력 검증용 기술 상한(2099년 12월)의 달인지. 그 다음 달로는 옮기지 않는다 */
export const isMaxMonth = (month: string) =>
  month >= DATE_RULES.maxDate.slice(0, 7);

/** 6줄 고정 달력의 42일: 그 달 1일이 든 주의 일요일부터 (화면 명세 SC-03) */
export const monthGridDates = (month: string) => {
  const start = toUtc(`${month}-01`);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return Array.from(
    { length: DATE_RULES.calendarWeeks * WEEKDAY_LABELS.length },
    (_, i) => {
      const value = new Date(start);
      value.setUTCDate(start.getUTCDate() + i);
      return fromUtc(value);
    },
  );
};

/** YYYY-MM-DD → DB DATE 값 (Prisma가 DATE를 Date로 다룬다) */
export const convertToDbDate = (date: string) => toUtc(date);

/** DB DATE 값 → YYYY-MM-DD */
export const convertToDateStr = (value: Date) => fromUtc(value);
