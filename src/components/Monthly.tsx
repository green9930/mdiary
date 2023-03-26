import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";
import DetailPreview from "./DetailPreview";
import { useAppSelector } from "../context/redux";
import { calcRem, theme } from "../styles/theme";
import { dateConverter } from "../utils/dateConverter";
import { priceConverter } from "../utils/priceConverter";
import { ExpendType } from "../config";
import Button from "./elements/Button";
import { useNavigate } from "react-router-dom";

const Monthly = () => {
  const [value, onChange] = useState(new Date());
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();
  const [mExpend, setMExpend] = useState("0");

  const navigate = useNavigate();
  const dataArr = useAppSelector((state) => state.expend);
  const calendarLabel = window.document.querySelector(
    ".react-calendar__navigation__label__labelText"
  ) as HTMLSpanElement;

  useEffect(() => {
    // Calendar 날짜별 지출 금액 표시
    /* -------------------------------------------------------------------------- */
    const calendarItems = Array.from(
      window.document.querySelectorAll(".react-calendar__month-view__days__day")
    );

    calendarItems.map((val) => {
      if (val.children[0].ariaLabel) {
        const label = val.children[0].ariaLabel.split(" ");
        const yy = Number(label[0].replace("년", ""));
        const mm = Number(label[1].replace("월", "")) - 1;
        const dd = Number(label[2].replace("일", ""));
        const priceList = dataArr.filter(
          (val) => val.date === dateConverter(new Date(yy, mm, dd))
        );
        const price = priceConverter(
          priceList
            .map((val) => Number(val.price))
            .reduce((acc, cur) => acc + cur, 0)
            .toString()
        ).previewPrice;
        const item = val.children[1]
          ? (val.children[1] as HTMLSpanElement)
          : document.createElement("span");
        item.innerText = price === "0" ? "" : price.toString();
        val.appendChild(item);
      }
    });

    // Monthly Total Expends
    /* -------------------------------------------------------------------------- */
    if (dataArr) {
      const dateStr = dateConverter(value);
      setTargetDataArr(dataArr.filter((val) => val.date === dateStr));
      const totalPrice = dataArr
        .map((val) =>
          val.date.slice(0, 7) === dateStr.slice(0, 7) ? Number(val.price) : 0
        )
        .reduce((acc, cur) => acc + cur, 0);
      setMExpend(priceConverter(totalPrice.toString()).previewPrice);
    }
  }, [value, dataArr]);

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  const onActiveStartDateChange = () => {
    const yy = calendarLabel.innerText.split(" ")[0].replace("년", "");
    const mm = calendarLabel.innerText
      .split(" ")[1]
      .replace("월", "")
      .padStart(2, "0");
    const str = `${yy}-${mm}-01`;
    onChange(new Date(Number(yy), Number(mm) - 1, 1));
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
      <Button
        btnTheme="blue1"
        btnSize="small1"
        onClick={() => navigate("/new", { state: value })}
      >
        {`${value.getMonth() + 1}/${value.getDate()}`} 추가하기
      </Button>
      <StExpendList>
        {targetDataArr.map((val) => {
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
  gap: ${calcRem(24)};
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

  .react-calendar__month-view__days__day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: ${calcRem(54)};

    span {
      display: inline-block;
      width: 100%;
      font-size: ${calcRem(9)};
      color: ${theme.green1};
    }
  }

  .react-calendar__tile--now {
    background: transparent;
    abbr {
      color: ${theme.red1};
      font-weight: 700;
    }
  }

  .react-calendar__tile--now.react-calendar__tile--active {
    background: ${theme.beige1};
    border-radius: ${calcRem(4)};
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
    abbr,
    span {
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
