export type ExpendType = {
  id?: string;
  category: string;
  content: string;
  date: string;
  price: string;
  title: string;
  username: string;
};

export const CATEGORY_LIST = [
  "가전",
  "교통",
  "문화생활",
  "미용",
  "식비",
  "의료",
  "의류",
  "학비",
  "기타",
] as const;
export const CATEGORY_SELECT_LIST = ["All", ...CATEGORY_LIST];

export type CategoryType = typeof CATEGORY_LIST[number];
export type CategorySelectType = typeof CATEGORY_SELECT_LIST[number];