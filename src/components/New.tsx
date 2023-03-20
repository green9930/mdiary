import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppSelector } from "../context/redux";
import ModalLayout from "./layout/ModalLayout";
import SelectCategoryModal from "./modal/SelectCategoryModal";
import { dbService } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { addExpend } from "../context/modules/expendSlice";
import { useDispatch } from "react-redux";
import { ExpendType, MAX_CONTENT_LENGTH, MAX_TITLE_LENGTH } from "../config";
import { dateConverter } from "../utils/dateConverter";
import { priceConverter } from "../utils/priceConverter";
import { calcRem, theme } from "../styles/theme";
import { MdCalendarMonth, MdApps } from "react-icons/md";
import Button from "./elements/Button";
import ValiModal from "./modal/ValiModal";
import { useLocation } from "react-router-dom";

const New = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();

  const [showCategory, setShowCategory] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [data, setData] = useState<ExpendType>({
    category: "",
    title: "",
    content: "",
    date: "",
    price: "",
    username: "",
  });
  const [displayPrice, setDisplayPrice] = useState("");
  const [isChrome, setIsChrome] = useState(false);

  // MonthlyPage => NewPage
  const { state } = useLocation();

  useEffect(() => {
    const today = state ? state : new Date();
    setIsChrome(window.navigator.userAgent.toLowerCase().includes("chrome"));
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
    if (name === "title" && value.length > MAX_TITLE_LENGTH) return;
    if (name === "content" && value.length > MAX_CONTENT_LENGTH) return;
    if (name === "price") {
      if (priceConverter(value).isValid) {
        setDisplayPrice(priceConverter(value).previewPrice);
        setData({ ...data, [name]: priceConverter(value).realPrice });
      } else {
        setDisplayPrice("");
        setData({ ...data, [name]: "0" });
      }
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(data);
    if (
      data.category === "" ||
      data.date === "" ||
      data.price === "0" ||
      data.title === ""
    ) {
      setShowAlert(true);
    } else if (
      data.category.length &&
      data.title.trim().length &&
      data.date.length &&
      data.price.length
    ) {
      await addDoc(collection(dbService, "expend"), data);
      dispatch(addExpend(data));
      setShowConfirm(!showConfirm);
      setData({
        category: "",
        title: "",
        content: "",
        date: dateConverter(new Date()),
        price: "",
        username: user.username,
      });
      setDisplayPrice("");
    }
  };

  const handleCancel = () => {
    setData({
      category: "",
      title: "",
      content: "",
      date: dateConverter(new Date()),
      price: "",
      username: user.username,
    });
    setDisplayPrice("");
  };

  const handleShowCategory = () => setShowCategory(!showCategory);
  const handleShowAlert = () => setShowAlert(!showAlert);
  const handleShowConfirm = () => setShowConfirm(!showConfirm);

  return (
    <StNew>
      <form onSubmit={onSubmit}>
        <StDateWrapper>
          <span>Date</span>
          <StDateInput
            id="date-input"
            type="date"
            name="date"
            onChange={onChange}
            value={data.date}
          />
          <label htmlFor="date-input">
            {isChrome ? null : (
              <MdCalendarMonth
                className="calendar-icon"
                size={`${calcRem(18)}`}
                fill={`${theme.blue3}`}
              />
            )}
          </label>
        </StDateWrapper>
        <StTitleWrapper>
          <StTitle>
            <label className="a11y-hidden" htmlFor="title-input">
              제목
            </label>
            <input
              id="title-input"
              name="title"
              onChange={onChange}
              value={data.title}
              placeholder="제목을 입력하세요"
            />
          </StTitle>
          <StCategory
            isSelected={data.category ? true : false}
            onClick={handleShowCategory}
          >
            {data.category ? null : (
              <MdApps size={`${calcRem(20)}`} fill={`${theme.blue3}`} />
            )}
            <span>{data.category ? data.category : "카테고리"}</span>
          </StCategory>
        </StTitleWrapper>
        <StContent>
          <label className="a11y-hidden" htmlFor="content-input">
            내용
          </label>
          <textarea
            rows={8}
            id="content-input"
            name="content"
            onChange={onChange}
            value={data.content}
            placeholder="내용을 입력하세요"
          />
        </StContent>
        <StPrice>
          <span>₩</span>
          <label className="a11y-hidden" htmlFor="price-input">
            지출 금액
          </label>
          <input
            id="price-input"
            name="price"
            onChange={onChange}
            value={displayPrice}
            placeholder="지출 금액"
          />
        </StPrice>
        <StBtnWrapper>
          <Button type="submit" btnTheme="blue1" btnSize="small2">
            추가
          </Button>
          <Button btnTheme="beige3" btnSize="small2" onClick={handleCancel}>
            취소
          </Button>
        </StBtnWrapper>
      </form>
      {showCategory ? (
        <ModalLayout handleModal={handleShowCategory} width="84%" height="50%">
          <SelectCategoryModal
            handleClose={handleShowCategory}
            handleSelect={handleSelect}
          />
        </ModalLayout>
      ) : null}
      {showAlert ? (
        <ModalLayout handleModal={handleShowAlert} width="84%" height="25%">
          <ValiModal type="alert" onClick={handleShowAlert} />
        </ModalLayout>
      ) : null}
      {showConfirm ? (
        <ModalLayout handleModal={handleShowConfirm} width="84%" height="25%">
          <ValiModal type="confirm" onClick={handleShowConfirm} />
        </ModalLayout>
      ) : null}
    </StNew>
  );
};

export default New;

const StNew = styled.div`
  padding: ${calcRem(10)} ${calcRem(20)} ${calcRem(20)} ${calcRem(20)};
  display: flex;
  flex-direction: column;

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${calcRem(16)};
    margin-top: ${calcRem(10)};
  }

  label {
    color: ${theme.blue3};
    font-weight: 500;
  }

  input,
  textarea {
    padding: ${calcRem(10)} ${calcRem(12)};
    border: none;
    border-radius: ${calcRem(4)};
    font-size: ${calcRem(14)};
  }
  input {
    background-color: ${theme.beige3};
  }
  textarea {
    background-color: ${theme.gray3};
  }
`;

const StDateWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  span {
    margin-right: ${calcRem(4)};
    color: ${theme.blue3};
    font-size: ${calcRem(12)};
    font-weight: 500;
  }

  input {
    padding: ${calcRem(6)} ${calcRem(8)};
    background-color: transparent;
    font-size: ${calcRem(16)};
  }

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const StDateInput = styled.input.attrs({
  type: "date",
})`
  ::-webkit-calendar-picker-indicator {
    /* display: none; */
  }
`;

const StTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(6)};
  width: 100%;
`;

const StTitle = styled.div`
  flex-grow: 1;
  input {
    width: 100%;
  }
`;

const StCategory = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${calcRem(54)};

  span {
    text-align: center;
    color: ${({ isSelected }) =>
      isSelected ? `${theme.green1}` : `${theme.blue3}`};
    font-size: ${({ isSelected }) =>
      isSelected ? `${calcRem(12)}` : `${calcRem(10)}`};
    font-weight: 500;
  }

  padding: ${calcRem(4)};
`;

const StContent = styled.div`
  width: 100%;

  textarea {
    width: 100%;
    height: auto;
  }
`;

const StPrice = styled.div`
  width: 100%;

  input {
    width: 60%;
  }
  span {
    margin: 0 ${calcRem(8)} 0 ${calcRem(6)};
    color: ${theme.blue3};
    font-size: ${calcRem(20)};
    font-weight: 500;
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(26)};
  margin-top: ${calcRem(50)};
`;
