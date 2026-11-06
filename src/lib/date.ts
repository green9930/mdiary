// 날짜는 서울 기준으로 다룬다 (데이터 아키텍처: 기록 날짜는 시각 없는 날짜)

/** 서울 기준 오늘 (YYYY-MM-DD) */
export const todayInSeoul = (now: Date = new Date()): string =>
  now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
