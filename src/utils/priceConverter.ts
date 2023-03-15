import { MAX_PRICE_LENGTH } from "./../config";

const priceVali = (price: string) => {
  const regExp = /^[0-9\s+]*$/g;
  return regExp.test(price);
};

export const priceConverter = (val: string) => {
  const price = val.replaceAll(",", "").substr(0, MAX_PRICE_LENGTH);
  let isValid = false;
  let realPrice = "";
  let previewPrice = "";

  if (price !== "0" && priceVali(price)) {
    isValid = price.length ? true : false;
    realPrice = price.replace(/(^0+)/, "").length
      ? price.replace(/(^0+)/, "")
      : "0";
    previewPrice = price.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (price === "0") {
    isValid = false;
    realPrice = "0";
    previewPrice = "0";
  }

  return { isValid, realPrice, previewPrice };
};
