import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "../context/redux";
import ModalLayout from "./layout/ModalLayout";
import SelectCategoryModal from "./modal/SelectCategoryModal";
import { dbService } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { addExpend } from "../context/modules/expendSlice";
import { useDispatch } from "react-redux";
import { ExpendType } from "../config";
import { dateConverter } from "../utils/dateConverter";
import { priceConverter } from "../utils/priceConverter";

const MAX_TITLE_LENGTH = 24;
const MAX_CONTENT_LENGTH = 200;

const New = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();

  const [showCategory, setShowCategory] = useState(false);
  const [data, setData] = useState<ExpendType>({
    category: "",
    title: "",
    content: "",
    date: "",
    price: "",
    username: "",
  });
  const [displayPrice, setDisplayPrice] = useState("");
  const [showAlert, setShowAlert] = useState(false);

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
    if (name === "price" && priceConverter(value).isValid) {
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
      await addDoc(collection(dbService, "expend"), data);
      dispatch(addExpend(data));
      setData({
        category: "",
        title: "",
        content: "",
        date: "",
        price: "",
        username: user.username,
      });
      setDisplayPrice("");
      // window.location.reload();
    }
  };

  const handleCancel = () => {
    console.log("CANCEL");
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
          <button onClick={handleCancel}>취소</button>
        </div>
      </form>
      {showCategory ? (
        <ModalLayout
          handleModal={() => setShowCategory(!showCategory)}
          width="84%"
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
          width="84%"
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

export default New;

const StNew = styled.div``;
