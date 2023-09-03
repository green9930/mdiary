import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { MdCalendarMonth, MdApps } from "react-icons/md";

import ModalLayout from "./layout/ModalLayout";
import SelectCategoryModal from "./modal/SelectCategoryModal";
import ValiModal from "./modal/ValiModal";
import Button from "./elements/Button";
import { useAppSelector } from "../context/redux";
import { ExpendType } from "../config";
import { dateConverter } from "../utils/dateConverter";
import { onChangeExpend } from "../utils/onChangeExpend";
import { onSubmitExpend } from "../utils/onSubmitExpend";
import { MOBILE_MAX_W, WINDOW_W, calcRem, theme } from "../styles/theme";

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

  const handleDisplayPrice = (target: string) => setDisplayPrice(target);
  const handleData = (target: ExpendType) => setData(target);
  const handleShowCategory = () => setShowCategory(!showCategory);
  const handleShowAlert = () => setShowAlert(!showAlert);
  const handleShowConfirm = () => {
    setShowConfirm(!showConfirm);
    if (showConfirm) window.location.reload();
  };

  return (
    <StNew>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
          onSubmitExpend({
            e,
            isNew: true,
            data,
            user,
            handleShowAlert,
            handleShowConfirm,
            handleData,
            handleDisplayPrice,
            dispatch,
          })
        }
      >
        <StDateWrapper>
          <span>Date</span>
          <StDateInput
            id="date-input"
            type="date"
            name="date"
            onChange={(
              e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLTextAreaElement>
            ) => onChangeExpend({ e, handleDisplayPrice, handleData, data })}
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
              onChange={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.ChangeEvent<HTMLTextAreaElement>
              ) => onChangeExpend({ e, handleDisplayPrice, handleData, data })}
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
            onChange={(
              e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLTextAreaElement>
            ) => onChangeExpend({ e, handleDisplayPrice, handleData, data })}
            value={data.content}
            placeholder="내용을 입력하세요"
            autoComplete="off"
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
            type="tel"
            onChange={(
              e:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLTextAreaElement>
            ) => onChangeExpend({ e, handleDisplayPrice, handleData, data })}
            value={displayPrice}
            placeholder="지출 금액"
            autoComplete="off"
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
        <ModalLayout
          width={WINDOW_W < MOBILE_MAX_W ? "320px" : "360px"}
          height="auto"
        >
          <SelectCategoryModal
            isNew={true}
            handleClose={handleShowCategory}
            handleSelect={handleSelect}
          />
        </ModalLayout>
      ) : null}
      {showAlert ? (
        <ModalLayout
          width={WINDOW_W < MOBILE_MAX_W ? "320px" : "360px"}
          height="auto"
        >
          <ValiModal type="alert" onClick={handleShowAlert} />
        </ModalLayout>
      ) : null}
      {showConfirm ? (
        <ModalLayout
          width={WINDOW_W < MOBILE_MAX_W ? "320px" : "360px"}
          height="auto"
        >
          <ValiModal type="confirm" onClick={handleShowConfirm} />
        </ModalLayout>
      ) : null}
    </StNew>
  );
};

export default New;

const StNew = styled.div`
  padding: ${calcRem(110)} ${calcRem(20)} ${calcRem(20)} ${calcRem(20)};
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
