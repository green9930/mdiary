import { EXPENSE_RULES } from "@/shared/expenseConstants";
import { UNITS } from "@/shared/sharedConstants";

// 금액 표시 (화면 명세 공통 정책값 · 금액 표시)

const MAN = 10_000;
const EOK = 100_000_000;

/** 금액 입력칸의 값: 숫자 문자열에 천 단위 쉼표 (`8000` → `8,000`). 비면 빈 문자열 */
export const formatAmountInput = (digits: string) =>
  digits ? Number(digits).toLocaleString("ko-KR") : "";

/** `12,300원` */
export const formatAmount = (amount: number) =>
  `${amount.toLocaleString("ko-KR")}${UNITS.won}`;

// 단위로 나눈 값을 소수 첫째 자리에서 버린다. 소수가 0이면 생략한다
const truncateUnit = (amount: number, unit: number) =>
  String(Math.floor((amount * 10) / unit) / 10);

/**
 * 달력 칸 금액. 칸에 들어가는 자릿수까지는 전체(`8,000`), 넘치면 `108만`·`1.2억`
 * (소수 첫째 자리 버림)
 */
export const formatCalendarAmount = (amount: number) => {
  if (String(amount).length < EXPENSE_RULES.calendarAbbrDigits)
    return amount.toLocaleString("ko-KR");
  if (amount < EOK) return `${truncateUnit(amount, MAN)}${UNITS.man}`;
  return `${truncateUnit(amount, EOK)}${UNITS.eok}`;
};
