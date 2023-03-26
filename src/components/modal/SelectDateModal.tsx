import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../elements/Button";
import { getMonthLength } from "../../utils/getMonthLength";
import { calcRem, theme } from "../../styles/theme";

const MONTH_ARR = Array.from({ length: 12 }, (_, idx) => idx + 1);
interface ISelectDateModal {
  handleClose: () => void;
  handleSelectDate: (date: Date) => void;
  defaultMonthLength: number;
}

const SelectDateModal = ({
  handleClose,
  handleSelectDate,
  defaultMonthLength,
}: ISelectDateModal) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [date, setDate] = useState(new Date().getDate());
  const [yearArr, setYearArr] = useState<number[]>([]);
  const [dateArr, setDateArr] = useState<number[]>(
    Array.from({ length: defaultMonthLength }, (_, idx) => idx + 1)
  );

  useEffect(() => {
    // for test... 2020 : leap year
    // 현재 연도부터 10년 전까지 선택 가능
    for (let i = year; i > year - 10; i--) {
      setYearArr((prev) => [...prev, i]);
    }
  }, []);

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = Number(value);
    // 31일, 30일, 2월(29일, 28일) 구분
    if (name === "year") {
      setDateArr(
        Array.from({ length: getMonthLength(val, month) }, (_, idx) => idx + 1)
      );
      setYear(val);
    }
    if (name === "month") {
      setDateArr(
        Array.from({ length: getMonthLength(year, val) }, (_, idx) => idx + 1)
      );
      setMonth(val);
    }
    if (name === "date") setDate(val);
  };

  return (
    <StDateModal>
      <StBody>
        <div>
          <label htmlFor="year-select">YEAR</label>
          <select
            name="year"
            id="year-select"
            onChange={onSelect}
            defaultValue={year}
          >
            {yearArr.map((val) => {
              return (
                <option key={`year-${val}`} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label htmlFor="month-select">MONTH</label>
          <select
            name="month"
            id="month-select"
            onChange={onSelect}
            defaultValue={month}
          >
            {MONTH_ARR.map((val) => {
              return (
                <option key={`month-${val}`} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label htmlFor="date-select">DATE</label>
          <select
            name="date"
            id="date-select"
            onChange={onSelect}
            defaultValue={date}
            key={date}
          >
            {dateArr.map((val) => {
              return (
                <option key={`date-${val}`} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>
      </StBody>
      <StBtnWrapper>
        <Button
          btnTheme="blue1"
          btnSize="small1"
          onClick={() => handleSelectDate(new Date(year, month - 1, date))}
        >
          선택
        </Button>
        <Button btnTheme="beige3" btnSize="small1" onClick={handleClose}>
          취소
        </Button>
      </StBtnWrapper>
    </StDateModal>
  );
};

export default SelectDateModal;

const StDateModal = styled.div`
  width: 100%;
  height: 100%;
  padding: ${calcRem(20)};
  position: relative;
`;

const StBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(16)};

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    label {
      font-weight: 500;
    }
    select {
      width: ${calcRem(70)};
      height: ${calcRem(30)};
      background-color: ${theme.beige1};
      border: none;
      border-radius: ${calcRem(4)};
      padding: ${calcRem(6)};
      font-size: ${calcRem(12)};
    }
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(26)};
  width: 100%;
  position: absolute;
  bottom: ${calcRem(10)};
  left: 50%;
  transform: translateX(-50%);
`;
