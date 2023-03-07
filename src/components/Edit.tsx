import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "../context/redux";
import ModalLayout from "./layout/ModalLayout";
import SelectCategoryModal from "./modal/SelectCategoryModal";
import { dbService } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { addExpend, updateExpend } from "../context/modules/expendSlice";
import { useDispatch } from "react-redux";
import { ExpendType } from "../config";
import { dateConverter } from "../utils/dateConverter";
import { priceConverter } from "../utils/priceConverter";

const MAX_PRICE_LENGTH = 9;
const MAX_TITLE_LENGTH = 30;
const MAX_CONTENT_LENGTH = 200;

interface IEdit {
  defaultData: ExpendType;
  handleEdit: (target: ExpendType) => void;
  handleClose: () => void;
}

const Edit = ({ defaultData, handleEdit, handleClose }: IEdit) => {
  const [showCategory, setShowCategory] = useState(false);
  const [data, setData] = useState<ExpendType>({
    category: defaultData.category,
    title: defaultData.title,
    content: defaultData.content,
    date: defaultData.date,
    price: defaultData.price,
    username: defaultData.username,
    id: defaultData.id,
  });
  const [displayPrice, setDisplayPrice] = useState(
    priceConverter(defaultData.price).previewPrice
  );
  const [showAlert, setShowAlert] = useState(false);

  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const today = new Date();
    setData({ ...data, date: dateConverter(today), username: user.username });
  }, []);

  const handleSelect = (target: string) => {
    setData({ ...data, category: target });
    setShowCategory(!showCategory);
  };

  const onChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      setDisplayPrice(priceConverter(value).previewPrice);
      setData({ ...data, [name]: priceConverter(value).realPrice });
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(data);
    if (
      data.category === "" ||
      data.date === "" ||
      data.price === "" ||
      data.title === ""
    ) {
      setShowAlert(true);
    }
    if (
      data.category.length &&
      data.title.trim().length &&
      data.date.length &&
      data.price.length
    ) {
      await updateDoc(doc(dbService, "expend", data.id as string), data);
      dispatch(updateExpend(data));
      handleEdit(data);
    }
  };

  return (
    <StNew>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="date-input">Date</label>
          <input
            id="date-input"
            type="date"
            name="date"
            onChange={onChange}
            value={data.date}
          />
        </div>
        <div>
          <label htmlFor="title-input">Title</label>
          <input
            id="title-input"
            name="title"
            onChange={onChange}
            value={data.title}
          />
          <div onClick={() => setShowCategory(!showCategory)}>
            {data.category ? data.category : "CATEGORY"}
          </div>
        </div>
        <div>
          <label htmlFor="content-input">Content</label>
          <textarea
            id="content-input"
            name="content"
            onChange={onChange}
            value={data.content}
          />
        </div>
        <div>
          <label htmlFor="price-input">Price</label>
          <input
            id="price-input"
            name="price"
            onChange={onChange}
            value={displayPrice}
          />
        </div>
        <div>
          <button type="submit">추가</button>
          <button onClick={handleClose}>취소</button>
        </div>
      </form>
      {showCategory ? (
        <ModalLayout
          handleModal={() => setShowCategory(!showCategory)}
          height={"500px"}
        >
          <SelectCategoryModal
            handleClose={() => setShowCategory(!showCategory)}
            handleSelect={handleSelect}
          />
        </ModalLayout>
      ) : null}
      {showAlert ? (
        <ModalLayout
          handleModal={() => setShowAlert(!showAlert)}
          height={"300px"}
        >
          <div>
            필수 항목을 입력해주세요
            <button onClick={() => setShowAlert(!showAlert)}>닫기</button>
          </div>
        </ModalLayout>
      ) : null}
    </StNew>
  );
};

export default Edit;

const StNew = styled.div``;
