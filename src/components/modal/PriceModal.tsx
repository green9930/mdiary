import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";

import Button from "../elements/Button";
import { priceConverter } from "../../utils/priceConverter";
import { calcRem, theme } from "../../styles/theme";

type PriceModalType = "default" | "subtraction" | "divide";

interface ISelectCategoryModal {
  handleClose: () => void;
  handleCalculate: (val: string) => void;
}

const PriceModal = ({ handleClose, handleCalculate }: ISelectCategoryModal) => {
  const [type, setType] = useState<PriceModalType>("default");
  const [subtraction, setSubtraction] = useState({ expend: 0, income: 0 });
  const [subtractionPreview, setSubtractionPreview] = useState({
    expend: "",
    income: "",
  });
  const [divide, setDivide] = useState({ expend: 0, people: "" });
  const [dividePreview, setDividePreview] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setSubtraction({ expend: 0, income: 0 });
    setSubtractionPreview({
      expend: "",
      income: "",
    });
    setDivide({ expend: 0, people: "" });
    setDividePreview("");
    setValid(true);
  }, [type]);

  useEffect(() => {
    if (type === "subtraction")
      subtraction.expend > subtraction.income
        ? setValid(true)
        : setValid(false);
  }, [subtraction]);

  const handleSubtraction = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;

    setSubtraction({
      ...subtraction,
      [name]: Number(priceConverter(value).realPrice),
    });
    setSubtractionPreview({
      ...subtractionPreview,
      [name]: priceConverter(value).previewPrice,
    });
  };

  const handleDivide = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;

    if (name === "expend") {
      setDivide({
        ...divide,
        expend: Number(priceConverter(value).realPrice),
      });
      setDividePreview(priceConverter(value).previewPrice);
    }
    if (name === "people") {
      setDivide({
        ...divide,
        people: value,
      });
    }
  };

  return (
    <StContainer>
      {type === "subtraction" ? (
        <>
          <StSubtraction>
            <StPrice>
              <label htmlFor="sub-expend-input">지불 금액</label>
              <input
                id="sub-expend-input"
                type="tel"
                name="expend"
                value={subtractionPreview.expend}
                onChange={(e) => handleSubtraction(e)}
                autoComplete="off"
              />
            </StPrice>
            <StPrice>
              <label htmlFor="sub-income-input">받은 금액</label>
              <input
                id="sub-income-input"
                type="tel"
                name="income"
                value={subtractionPreview.income}
                onChange={(e) => handleSubtraction(e)}
                autoComplete="off"
              />
            </StPrice>
          </StSubtraction>
          <StResult>
            {subtraction.expend < subtraction.income ? (
              <span>금액을 다시 확인해 주세요.</span>
            ) : (
              <span>
                총 지출 금액 :{" "}
                {`${
                  priceConverter(
                    (subtraction.expend - subtraction.income).toString()
                  ).previewPrice
                }`}
              </span>
            )}
          </StResult>
          <StBtnWrapper>
            <Button
              btnTheme={valid ? "blue1" : "disabled"}
              btnSize="small1"
              onClick={() =>
                handleCalculate(
                  priceConverter(
                    (subtraction.expend - subtraction.income).toString()
                  ).realPrice
                )
              }
              disabled={!valid}
            >
              확인
            </Button>
            <Button
              btnTheme="beige3"
              btnSize="small1"
              onClick={() => setType("default")}
            >
              취소
            </Button>
          </StBtnWrapper>
        </>
      ) : (
        <></>
      )}
      {type === "divide" ? (
        <>
          <StSubtraction>
            <StPrice>
              <label htmlFor="divide-expend-input">지불 금액</label>
              <input
                id="divide-expend-input"
                type="tel"
                name="expend"
                value={dividePreview}
                onChange={(e) => handleDivide(e)}
                autoComplete="off"
              />
            </StPrice>
            <StPrice>
              <label htmlFor="divide-people-input">인원 수</label>
              <input
                id="divide-people-input"
                type="tel"
                name="people"
                value={divide.people}
                onChange={(e) => handleDivide(e)}
                autoComplete="off"
              />
            </StPrice>
          </StSubtraction>
          <StResult>
            {subtraction.expend < subtraction.income ? (
              <span>금액을 다시 확인해 주세요.</span>
            ) : (
              <span>
                총 지출 금액 :{" "}
                {`${
                  priceConverter(
                    (
                      divide.expend / Number(divide.people ? divide.people : 1)
                    ).toFixed()
                  ).previewPrice
                }`}
              </span>
            )}
          </StResult>
          <StBtnWrapper>
            <Button
              btnTheme={valid ? "blue1" : "disabled"}
              btnSize="small1"
              onClick={() =>
                handleCalculate(
                  priceConverter(
                    (
                      divide.expend / Number(divide.people ? divide.people : 1)
                    ).toFixed()
                  ).previewPrice
                )
              }
              disabled={!valid}
            >
              확인
            </Button>
            <Button
              btnTheme="beige3"
              btnSize="small1"
              onClick={() => setType("default")}
            >
              취소
            </Button>
          </StBtnWrapper>
        </>
      ) : (
        <></>
      )}
      {type === "default" ? (
        <>
          <StDefaultBtnWrapper>
            <Button
              btnTheme="blue1"
              btnSize="small1"
              onClick={() => setType("subtraction")}
            >
              정산금액 빼기
            </Button>
            <Button
              btnTheme="blue1"
              btnSize="small1"
              onClick={() => setType("divide")}
            >
              1 / n 계산하기
            </Button>
            <StDivider />
            <Button btnTheme="beige3" btnSize="small1" onClick={handleClose}>
              취소
            </Button>
          </StDefaultBtnWrapper>
        </>
      ) : (
        <></>
      )}
    </StContainer>
  );
};

export default PriceModal;

const StContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(32)};
  width: 100%;
  height: 100%;
  padding: ${calcRem(32)};

  label {
    color: ${theme.black};
    font-size: ${calcRem(10)};
    font-weight: 400;
  }

  input {
    width: 100%;
  }
`;

const StSubtraction = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(12)};
  width: 100%;
`;

const StPrice = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(4)};
  width: 100%;
`;

const StResult = styled.div`
  width: 100%;
  span {
    color: ${theme.black};
    font-size: ${calcRem(14)};
    font-weight: 500;
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(26)};
  width: 100%;
`;

const StDefaultBtnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${calcRem(12)};
  width: 100%;
`;

const StDivider = styled.div`
  width: 100%;
  height: ${calcRem(8)};
`;
