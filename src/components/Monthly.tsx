import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import { ExpendType } from "../config";
import { useAppSelector } from "../context/redux";
import { calcRem, theme } from "../styles/theme";
import { priceConverter } from "../utils/priceConverter";
import DetailPreview from "./DetailPreview";

const Monthly = () => {
  const [value, onChange] = useState(new Date());
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();
  const [mExpend, setMExpend] = useState("");

  const dataArr = useAppSelector((state) => state.expend);

  useEffect(() => {
    if (dataArr) {
      const dateStr = `${value.getFullYear()}-${(value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${value.getDate().toString().padStart(2, "0")}`;
      setTargetDataArr(
        dataArr.filter((val) => {
          return val.date === dateStr;
        })
      );
      const priceArr = dataArr.map((val) =>
        val.date.slice(5, 7) === dateStr.slice(5, 7) ? Number(val.price) : 0
      );
      const t = priceArr.reduce((acc, cur) => acc + cur, 0);
      setMExpend(priceConverter(t.toString()).previewPrice);
    }
  }, [value, dataArr]);

  const handleTargetData = (target: ExpendType) => setTargetData(target);
  const onActiveStartDateChange = () => {
    console.log("month change");
    console.log(value);
  };

  return (
    <StMonthly>
      <StHeader>
        <StTitle>
          Monthly Total <span>{mExpend} ₩</span>
        </StTitle>
        <StCalendar>
          <Calendar
            formatDay={(locale, date) =>
              date.toLocaleString("en", { day: "numeric" })
            }
            calendarType="US"
            onActiveStartDateChange={onActiveStartDateChange}
            onChange={onChange}
            value={value}
          />
        </StCalendar>
      </StHeader>
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

const StMonthly = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(30)};
  padding: ${calcRem(20)};
`;

const StHeader = styled.div``;

const StTitle = styled.h2`
  margin-bottom: ${calcRem(16)};
  color: ${theme.blue3};
  font-family: "Rubik";
  font-size: ${calcRem(20)};
  font-weight: 700;

  span {
    margin-left: ${calcRem(4)};
    color: ${theme.blue3};
    font-family: "Rubik";
    font-size: ${calcRem(20)};
    font-weight: 700;
  }
`;

const StCalendar = styled.div`
  abbr {
    font-size: ${calcRem(12)};
  }

  .react-calendar {
    width: 100%;
    max-width: ${calcRem(420)};
    border: none;
  }

  .react-calendar__navigation {
    button {
      span {
        font-size: ${calcRem(14)};
      }
    }
  }
  .react-calendar__navigation__arrow {
    height: ${calcRem(40)};
    font-size: ${calcRem(18)};
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: ${theme.white};
  }

  .react-calendar__tile--now {
    background: transparent;
    abbr {
      color: ${theme.red1};
      font-weight: 700;
    }
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: transparent;
  }

  .react-calendar__tile--active {
    background-color: ${theme.white};
    :enabled:hover,
    :enabled:focus {
      background: ${theme.beige1};
      border-radius: ${calcRem(4)};
    }
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    abbr {
      color: ${theme.gray2};
    }
  }
`;

const StExpendList = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(12)};
`;
