// 금액 표시 (화면 명세 공통 정책값 · 금액 표시)

/** 금액 입력칸의 값: 숫자 문자열에 천 단위 쉼표 (`8000` → `8,000`). 비면 빈 문자열 */
export const formatAmountInput = (digits: string) =>
  digits ? Number(digits).toLocaleString("ko-KR") : "";
