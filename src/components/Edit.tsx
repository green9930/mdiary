import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { MdCalendarMonth } from "react-icons/md";

import SelectCategoryModal from "./modal/SelectCategoryModal";
import Button from "./elements/Button";
import { onSubmitExpend } from "../utils/onSubmitExpend";
import { onChangeExpend } from "../utils/onChangeExpend";
import { priceConverter } from "../utils/priceConverter";
import { useAppSelector } from "../context/redux";
import { ExpendType } from "../config";
import { calcRem, theme } from "../styles/theme";

interface IEdit {
  defaultData: ExpendType;
  handleEdit: (target: ExpendType) => void;
  handleClose: () => void;
  handleShowAlert: () => void;
  handleShowConfirm: () => void;
}

const Edit = ({
  defaultData,
  handleEdit,
  handleClose,
  handleShowAlert,
  handleShowConfirm,
}: IEdit) => {
  const [isChrome, setIsChrome] = useState(false);
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

  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsChrome(window.navigator.userAgent.toLowerCase().includes("chrome"));
  }, []);

  const handleDisplayPrice = (target: string) => setDisplayPrice(target);
  const handleData = (target: ExpendType) => setData(target);
  const handleShowCategory = () => setShowCategory(!showCategory);
  const handleSelect = (target: string) => {
    setData({ ...data, category: target });
    setShowCategory(!showCategory);
  };

  return (
    <>
      {showCategory ? (
        <SelectCategoryModal
          isNew={false}
          handleClose={handleShowCategory}
          handleSelect={handleSelect}
        />
      ) : (
        <StEdit>
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
              onSubmitExpend({
                e,
                isNew: false,
                data,
                user,
                handleShowAlert,
                handleShowConfirm,
                handleData,
                handleDisplayPrice,
                handleEdit,
                dispatch,
              })
            }
          >
            <StSubInfo>
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
                  ) =>
                    onChangeExpend({ e, handleDisplayPrice, handleData, data })
                  }
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
              <StCategory
                isSelected={data.category ? true : false}
                onClick={handleShowCategory}
              >
                <span>{data.category ? data.category : "카테고리"}</span>
              </StCategory>
            </StSubInfo>
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
                ) =>
                  onChangeExpend({ e, handleDisplayPrice, handleData, data })
                }
                value={data.title}
                placeholder="제목을 입력하세요"
              />
            </StTitle>
            <StContent>
              <label className="a11y-hidden" htmlFor="content-input">
                내용
              </label>
              <textarea
                rows={10}
                id="content-input"
                name="content"
                onChange={(
                  e:
                    | React.ChangeEvent<HTMLInputElement>
                    | React.ChangeEvent<HTMLTextAreaElement>
                ) =>
                  onChangeExpend({ e, handleDisplayPrice, handleData, data })
                }
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
                onChange={(
                  e:
                    | React.ChangeEvent<HTMLInputElement>
                    | React.ChangeEvent<HTMLTextAreaElement>
                ) =>
                  onChangeExpend({ e, handleDisplayPrice, handleData, data })
                }
                value={displayPrice}
                placeholder="지출 금액"
              />
            </StPrice>
            <StBtnWrapper>
              <Button type="submit" btnTheme="blue1" btnSize="small2">
                수정
              </Button>
              <Button btnTheme="beige3" btnSize="small2" onClick={handleClose}>
                취소
              </Button>
            </StBtnWrapper>
          </form>
        </StEdit>
      )}
    </>
  );
};

export default Edit;

const StEdit = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${calcRem(16)};
  }

  label {
    color: ${theme.blue3};
    font-weight: 500;
  }

  input,
  textarea {
    padding: ${calcRem(8)} ${calcRem(10)};
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

const StSubInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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
    padding: ${calcRem(2)} ${calcRem(4)};
    background-color: transparent;
    font-size: ${calcRem(14)};
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

const StCategory = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${calcRem(70)};

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

const StTitle = styled.div`
  width: 100%;
  input {
    width: 100%;
  }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(8)};

  input {
    flex-grow: 1;
    width: 100%;
  }
  span {
    padding-left: ${calcRem(4)};
    color: ${theme.blue3};
    font-size: ${calcRem(20)};
    font-weight: 500;
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(24)};
  width: 100%;
`;
