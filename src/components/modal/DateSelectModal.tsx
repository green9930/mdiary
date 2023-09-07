import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

import Button from "../elements/Button";
import { calcRem, theme } from "../../styles/theme";

interface DateSelectModalProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "month" | "date";
  year: number;
  month: number;
  date: number;
  setTargetDate: React.Dispatch<React.SetStateAction<Date>>;
  handleModal: React.Dispatch<React.SetStateAction<boolean>>;
}

type dateTargetType = "year" | "month" | "date" | "default";

const DateSelectModal = ({
  type,
  year,
  month,
  date,
  setTargetDate,
  handleModal,
}: DateSelectModalProps) => {
  const [loading, setLoading] = useState(true);
  const [yy, setYY] = useState<number>(0);
  const [mm, setMM] = useState<number>(0);
  const [dd, setDD] = useState<number>(0);
  const [dateLength, setDateLength] = useState<number>(0);
  const [selectTarget, setSelectTarget] = useState<dateTargetType>("default");

  useEffect(() => {
    setYY(year);
    setMM(month + 1);
    setDD(date);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && type === "date") {
      const newDate = new Date(yy, mm, 0);
      const lastDate = newDate.getDate();
      setDateLength(lastDate);
    }
  }, [yy, mm, dd]);

  const handleOption = (target: dateTargetType, val: number) => {
    if (target === "date") {
      setDD(val);
    } else {
      if (target === "year") setYY(val);
      if (target === "month") setMM(val);
      setDD(1); // 연도, 월 변경 시 선택한 date가 없을 경우 방지
    }
    setSelectTarget("default");
  };

  const handleSelect = () => {
    type === "month"
      ? setTargetDate(new Date(yy, mm - 1, 1))
      : setTargetDate(new Date(yy, mm - 1, dd));
    handleModal(false);
  };

  return (
    <>
      {loading ? (
        <></>
      ) : (
        <StContainer>
          <StBody>
            <StContent>
              <StSelectName>YEAR</StSelectName>
              <StSelectContainer>
                <StSelect
                  selected={selectTarget === "year"}
                  onClick={() =>
                    setSelectTarget((prev) =>
                      prev === "year" ? "default" : "year"
                    )
                  }
                >
                  <span>{yy}</span>
                  <MdOutlineKeyboardArrowDown fill={theme.black} />
                </StSelect>
                {selectTarget === "year" ? (
                  <StOptionContainer>
                    {Array.from({ length: 5 }, (_, i) => year - i).map(
                      (val, idx) => (
                        <StOption
                          isLast={idx === 4}
                          key={val}
                          onClick={() => handleOption("year", val)}
                        >
                          <span>{val}</span>
                        </StOption>
                      )
                    )}
                  </StOptionContainer>
                ) : (
                  <></>
                )}
              </StSelectContainer>
            </StContent>
            <StContent>
              <StSelectName>MONTH</StSelectName>
              <StSelectContainer>
                <StSelect
                  selected={selectTarget === "month"}
                  onClick={() =>
                    setSelectTarget((prev) =>
                      prev === "month" ? "default" : "month"
                    )
                  }
                >
                  <span>{mm}</span>
                  <MdOutlineKeyboardArrowDown fill={theme.black} />
                </StSelect>
                {selectTarget === "month" ? (
                  <StOptionContainer>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (val, idx) => (
                        <StOption
                          isLast={idx === 11}
                          key={val}
                          onClick={() => handleOption("month", val)}
                        >
                          <span>{val}</span>
                        </StOption>
                      )
                    )}
                  </StOptionContainer>
                ) : (
                  <></>
                )}
              </StSelectContainer>
            </StContent>
            {type === "date" ? (
              <StContent>
                <StSelectName>DATE</StSelectName>
                <StSelectContainer>
                  <StSelect
                    selected={selectTarget === "date"}
                    onClick={() =>
                      setSelectTarget((prev) =>
                        prev === "date" ? "default" : "date"
                      )
                    }
                  >
                    <span>{dd}</span>
                    <MdOutlineKeyboardArrowDown fill={theme.black} />
                  </StSelect>
                  {selectTarget === "date" ? (
                    <StOptionContainer>
                      {Array.from({ length: dateLength }, (_, i) => i + 1).map(
                        (val, idx) => (
                          <StOption
                            isLast={idx === dateLength - 1}
                            key={val}
                            onClick={() => handleOption("date", val)}
                          >
                            <span>{val}</span>
                          </StOption>
                        )
                      )}
                    </StOptionContainer>
                  ) : (
                    <></>
                  )}
                </StSelectContainer>
              </StContent>
            ) : (
              <></>
            )}
          </StBody>
          <StBtnWrapper>
            <Button btnTheme="blue1" btnSize="small1" onClick={handleSelect}>
              선택
            </Button>
            <Button
              btnTheme="beige3"
              btnSize="small1"
              onClick={() => handleModal(false)}
            >
              취소
            </Button>
          </StBtnWrapper>
        </StContainer>
      )}
    </>
  );
};

export default DateSelectModal;

const StContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(48)};
  width: 100%;
  height: 100%;
  padding: ${calcRem(32)};
`;

const StBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(16)};
`;

const StContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(8)};
  width: 100%;
`;

const StSelectName = styled.span`
  color: ${theme.black};
  font-size: ${calcRem(14)};
  font-weight: 500;
`;

const StSelectContainer = styled.div`
  width: ${calcRem(108)};
  height: ${calcRem(40)};
  position: relative;
`;

const StSelect = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: ${calcRem(8)} ${calcRem(8)} ${calcRem(8)} ${calcRem(12)};
  background-color: ${theme.gray3};
  border-radius: ${calcRem(8)};

  span {
    color: ${theme.black};
    font-size: ${calcRem(14)};
    font-weight: 500;
  }

  svg {
    width: ${calcRem(24)};
    height: ${calcRem(24)};
    transform: ${({ selected }) => (selected ? "rotate(180deg)" : "rotate(0)")};
    transition: all ease 0.4s;
  }
`;

const StOptionContainer = styled.ul`
  width: 100%;
  height: ${calcRem(200)};
  background-color: ${theme.white};
  border-radius: ${calcRem(8)};
  position: absolute;
  top: ${calcRem(44)};
  z-index: 11;
  overflow-y: scroll;
`;

const StOption = styled.li<{ isLast: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: ${calcRem(40)};
  padding-left: ${calcRem(12)};
  background-color: ${theme.white};
  border-bottom: 1px solid
    ${({ isLast }) => (isLast ? "transparent" : `${theme.gray3}`)};

  span {
    color: ${theme.black};
    font-size: ${calcRem(14)};
    font-weight: 500;
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(24)};
  width: 100%;
`;
