import React, { useState } from "react";
import styled from "styled-components";
import SelectCategoryModal from "./modal/SelectCategoryModal";
import { dbService } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateExpend } from "../context/modules/expendSlice";
import { useDispatch } from "react-redux";
import { ExpendType } from "../config";
import { priceConverter } from "../utils/priceConverter";
import { calcRem, theme } from "../styles/theme";
import { MdCalendarMonth } from "react-icons/md";
import Button from "./elements/Button";

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

  const dispatch = useDispatch();

  const onChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
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
      handleShowAlert();
    } else if (
      data.category.length &&
      data.title.trim().length &&
      data.date.length &&
      data.price.length
    ) {
      await updateDoc(doc(dbService, "expend", data.id as string), data);
      dispatch(updateExpend(data));
      handleShowConfirm();
      handleEdit(data);
    }
  };

  const handleSelect = (target: string) => {
    setData({ ...data, category: target });
    setShowCategory(!showCategory);
  };
  const handleShowCategory = () => setShowCategory(!showCategory);

  return (
    <>
      {showCategory ? (
        <SelectCategoryModal
          handleClose={handleShowCategory}
          handleSelect={handleSelect}
        />
      ) : (
        <StEdit>
          <form onSubmit={onSubmit}>
            <StSubInfo>
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
                  <MdCalendarMonth
                    size={`${calcRem(18)}`}
                    fill={`${theme.blue3}`}
                  />
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
                onChange={onChange}
                value={data.title}
                placeholder="제목을 입력하세요"
              />
            </StTitle>
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
  position: relative;

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${calcRem(12)};
    margin-top: ${calcRem(10)};
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
  margin-top: ${calcRem(-10)};
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
    display: none;
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
  gap: ${calcRem(26)};
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
`;
