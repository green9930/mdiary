export const dateConverter = (target: Date) => {
  return `${target.getFullYear()}-${(target.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${target.getDate().toString().padStart(2, "0")}`;
};

// MONTH, DATE '0' 붙이기
export const dateToStr = (target: number) => target.toString().padStart(2, "0");
