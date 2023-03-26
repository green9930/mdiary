import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { AnyAction, Dispatch } from "redux";
import { dbService } from "../firebase";
import { dateConverter } from "./dateConverter";
import { addExpend, updateExpend } from "../context/modules/expendSlice";
import { ExpendType, UserType } from "../config";

interface IOnSubmitExpend {
  e: React.FormEvent<HTMLFormElement>;
  isNew: boolean;
  data: ExpendType;
  user: UserType;
  handleShowAlert: () => void;
  handleShowConfirm: () => void;
  handleData: (target: ExpendType) => void;
  handleDisplayPrice: (target: string) => void;
  handleEdit?: (target: ExpendType) => void;
  dispatch: Dispatch<AnyAction>;
}

export const onSubmitExpend = async ({
  e,
  isNew,
  data,
  user,
  handleShowAlert,
  handleShowConfirm,
  handleData,
  handleDisplayPrice,
  handleEdit,
  dispatch,
}: IOnSubmitExpend) => {
  e.preventDefault();
  const { category, date, price, title } = data;

  if (category === "" || date === "" || price === "0" || title === "") {
    handleShowAlert();
  } else if (
    category.length &&
    title.trim().length &&
    date.length &&
    price.length
  ) {
    // New or Update
    if (isNew) {
      await addDoc(collection(dbService, "expend"), data);
      dispatch(addExpend(data));
      handleShowConfirm();
      handleData({
        category: "",
        title: "",
        content: "",
        date: dateConverter(new Date()),
        price: "",
        username: user.username,
      });
      handleDisplayPrice("");
    } else {
      await updateDoc(doc(dbService, "expend", data.id as string), data);
      dispatch(updateExpend(data));
      handleShowConfirm();
      handleEdit !== undefined && handleEdit(data);
    }
  }
};
