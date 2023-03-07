import { ExpendType } from "./../config";

export const sortingData = (
  data: ExpendType[],
  target: "category" | "date" | "price" | "title",
  isAscend: boolean
) => {
  const arr = [...data].sort((a, b) => {
    switch (target) {
      case "category":
        return isAscend
          ? a.category > b.category
            ? 1
            : -1
          : a.category < b.category
          ? 1
          : -1;
      case "date":
        return isAscend ? (a.date > b.date ? 1 : -1) : a.date < b.date ? 1 : -1;
      case "price":
        return isAscend
          ? a.price > b.price
            ? 1
            : -1
          : a.price < b.price
          ? 1
          : -1;
      case "title":
        return isAscend
          ? a.title > b.title
            ? 1
            : -1
          : a.title < b.title
          ? 1
          : -1;
      default:
        break;
    }
    return 0;
  });
  return arr;
};
