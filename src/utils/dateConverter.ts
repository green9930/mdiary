export const dateConverter = (target: Date) => {
  return `${target.getFullYear()}-${(target.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${target.getDate().toString().padStart(2, "0")}`;
};
