import { ExpendType, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "../config";
import { priceConverter } from "./priceConverter";

interface IOnChangeExpend {
  e:
    | React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>;
  handleDisplayPrice: (target: string) => void;
  handleData: (target: ExpendType) => void;
  data: ExpendType;
}

const onChangeExpend = ({
  e,
  handleDisplayPrice,
  handleData,
  data,
}: IOnChangeExpend) => {
  const { name, value } = e.target;
  if (name === "title" && value.length > MAX_TITLE_LENGTH) return;
  if (name === "content" && value.length > MAX_CONTENT_LENGTH) return;
  if (name === "price") {
    if (priceConverter(value).isValid) {
      handleDisplayPrice(priceConverter(value).previewPrice);
      handleData({ ...data, [name]: priceConverter(value).realPrice });
    } else {
      handleDisplayPrice("");
      handleData({ ...data, [name]: "0" });
    }
  } else {
    handleData({ ...data, [name]: value });
  }
};

export default onChangeExpend;
