import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { dateConverter } from "../../utils/dateConverter";
import { getMonthLength } from "../../utils/getMonthLength";

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
      <h2>SelectDateModal</h2>
      <StBody>
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
      </StBody>
      <StFooter>
        <button
          onClick={() => handleSelectDate(new Date(year, month - 1, date))}
        >
          OK
        </button>
        <button onClick={handleClose}>Cancel</button>
      </StFooter>
    </StDateModal>
  );
};

export default SelectDateModal;

const StDateModal = styled.div``;

const StBody = styled.div``;

const StFooter = styled.div`
  margin-top: 40px;
`;
