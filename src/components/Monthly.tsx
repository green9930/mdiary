import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import { ExpendType } from "../config";
import { useAppSelector } from "../context/redux";
import DetailPreview from "./DetailPreview";

const Monthly = () => {
  const [value, onChange] = useState(new Date());
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();

  const dataArr = useAppSelector((state) => state.expend);

  useEffect(() => {
    if (dataArr) {
      console.log("CHANGE DATE");
      const dateStr = `${value.getFullYear()}-${(value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${value.getDate().toString().padStart(2, "0")}`;
      setTargetDataArr(
        dataArr.filter((val) => {
          return val.date === dateStr;
        })
      );
    }
  }, [value, dataArr.length]);

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <StMonthly>
      <h2>Monthly</h2>
      <div>
        <Calendar
          formatDay={(locale, date) =>
            date.toLocaleString("en", { day: "numeric" })
          }
          calendarType="US"
          onChange={onChange}
          value={value}
        />
      </div>
      <StExpendList>
        {targetDataArr.map((val, idx) => {
          return (
            <React.Fragment key={val.id}>
              <DetailPreview
                handleTargetData={handleTargetData}
                val={val}
                targetData={targetData}
              />
            </React.Fragment>
          );
        })}
      </StExpendList>
    </StMonthly>
  );
};

export default Monthly;

const StMonthly = styled.div``;

const StExpendList = styled.ul`
  background-color: pink;
`;
