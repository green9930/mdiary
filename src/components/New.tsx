import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "../context/redux";
import ModalLayout from "./layout/ModalLayout";
import SelectCategoryModal from "./modal/SelectCategoryModal";
import { dbService } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";

type DataType = {
  category: string;
  title: string;
  content: string;
  date: string;
  price: number;
};

const New = () => {
  const username = useAppSelector((state) => state.user.username);

  const [showCategory, setShowCategory] = useState(false);
  const [data, setData] = useState<DataType>({
    category: "",
    title: "",
    content: "",
    date: "",
    price: 0,
  });

  useEffect(() => {
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate()}`;
    setData({ ...data, date: defaultDate });
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
    setData({ ...data, [name]: value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(data);
    await addDoc(collection(dbService, "expend"), { username, ...data });
    const q = query(collection(dbService, "expend"));
    const res = await getDocs(q);
    console.log(res);
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
            type="text"
            name="title"
            onChange={onChange}
            value={data.title}
          />
          <div onClick={() => setShowCategory(!showCategory)}>CATEGORY</div>
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
            type="number"
            onChange={onChange}
            value={data.price}
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
          height={500}
        >
          <SelectCategoryModal
            handleClose={() => setShowCategory(!showCategory)}
            handleSelect={handleSelect}
          />
        </ModalLayout>
      ) : null}
    </StNew>
  );
};

export default New;

const StNew = styled.div``;
