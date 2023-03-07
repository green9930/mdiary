const ODD_MONTH = [1, 3, 5, 7, 8, 10, 12];
const EVEN_MONTH = [4, 6, 9, 11];

// 선택한 달의 총 일수
export const getMonthLength = (year: number, month: number) => {
  if (ODD_MONTH.includes(month)) return 31;
  else if (EVEN_MONTH.includes(month)) return 30;
  else return new Date(year, 1, 29).getDate() === 29 ? 29 : 28;
};
