import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";
import styled from "styled-components";
import {
  MdKeyboardDoubleArrowLeft,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

import ModalLayout from "./layout/ModalLayout";
import DetailPreview from "./DetailPreview";
import DateSelectModal from "./modal/DateSelectModal";
import Button from "./elements/Button";
import { useAppSelector } from "../context/redux";
import { dateToStr } from "../utils/dateConverter";
import { priceConverter } from "../utils/priceConverter";
import { ExpendType } from "../config";
import { MOBILE_MAX_W, WINDOW_W, calcRem, theme } from "../styles/theme";

const DAY_LIST = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type MonthStatusType = "prev" | "current" | "next";

const Monthly = () => {
  const [loading, setLoading] = useState(true);
  const [defaultDate, setDefaultDate] = useState<{
    year: number;
    month: number;
    date: number;
  }>({ year: 0, month: 0, date: 0 });
  const [defaultDateStr, setDefaultDateStr] = useState("");
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [targetDateStr, setTargetDateStr] = useState<string>("");
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [date, setDate] = useState(0);
  const [lastDate, setLastDate] = useState<number>(0);
  const [lastDatePrev, setLastDatePrev] = useState<number>(0);
  const [firstDay, setFirstDay] = useState<number>(0);

  const [prevData, setPrevData] = useState<ExpendType[]>([]);
  const [currentData, setCurrentData] = useState<ExpendType[]>([]);
  const [nextData, setNextData] = useState<ExpendType[]>([]);
  const [selectDataArr, setSelectDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();
  const [totalPrice, setTotalPrice] = useState<string>("0");
  const [openDateModal, setOpenDateModal] = useState(false);

  const navigate = useNavigate();
  const dataArr = useAppSelector((state) => state.expend);

  useEffect(() => {
    const currentDate = new Date();
    const yy = currentDate.getFullYear();
    const mm = currentDate.getMonth();
    const dd = currentDate.getDate();

    setDefaultDate({
      year: yy,
      month: mm,
      date: dd,
    });
    setDefaultDateStr(`${yy}-${dateToStr(mm + 1)}-${dateToStr(dd)}`);
    setTargetDateStr(`${yy}-${dateToStr(mm + 1)}-${dateToStr(dd)}`);

    setLoading(false);
  }, []);

  useEffect(() => {
    const yy = targetDate.getFullYear();
    const mm = targetDate.getMonth();
    const dd = targetDate.getDate();

    const yyPrev = mm === 0 ? yy - 1 : yy;
    const yyNext = mm === 11 ? yy + 1 : yy;
    const mmPrevStr = mm === 0 ? "12" : mm.toString().padStart(2, "0");
    const mmStr = dateToStr(mm + 1);
    const mmNextStr = mm === 11 ? "01" : (mm + 2).toString().padStart(2, "0");
    const ddStr = dateToStr(dd);

    setYear(yy);
    setMonth(mm);
    setDate(dd);
    setTargetDateStr(`${yy}-${mmStr}-${ddStr}`);

    setLastDate(new Date(yy, mm + 1, 0).getDate());
    setLastDatePrev(new Date(yy, mm, 0).getDate());
    setFirstDay(new Date(yy, mm, 1).getDay());

    // 저번 달 지출 목록
    const prevArr = dataArr.filter(
      (val) =>
        val.date.split("-")[0] === yyPrev.toString() &&
        val.date.split("-")[1] === mmPrevStr
    );
    setPrevData(prevArr);

    // 이번 달 지출 목록
    const targetArr = dataArr.filter(
      (val) =>
        val.date.split("-")[0] === yy.toString() &&
        val.date.split("-")[1] === mmStr
    );
    setCurrentData(targetArr);

    // 다음 달 지출 목록
    const nextArr = dataArr.filter(
      (val) =>
        val.date.split("-")[0] === yyNext.toString() &&
        val.date.split("-")[1] === mmNextStr
    );
    setNextData(nextArr);

    // 이번 달 총 지출금액
    const previewPrice = priceConverter(
      targetArr
        .map((val) => Number(val.price))
        .reduce((acc, cur) => acc + cur, 0)
        .toString()
    ).previewPrice;
    setTotalPrice(previewPrice);
  }, [targetDate, dataArr]);

  useEffect(() => {
    const targetArr = dataArr.filter((val) => val.date === targetDateStr);
    setSelectDataArr(targetArr);
  }, [targetDateStr, dataArr]);

  const handleDateArr = (
    target: "prev" | "cur" | "next",
    lastDate: number,
    lastDatePrev: number,
    firstDay: number
  ) => {
    let res: number[] = [];

    const r = (lastDate + firstDay) % 7; // remainder
    const prev = firstDay; // 이전 달 표기 일수
    const next = r === 0 ? 0 : 7 - r; // 다음 달 표기 일수

    if (target === "prev") {
      res = Array.from({ length: prev }, (_, i) => lastDatePrev - i).sort(
        (a, b) => a - b
      );
    } else if (target === "cur") {
      res = Array.from({ length: lastDate }, (_, i) => i + 1);
    } else if (target === "next") {
      res = Array.from({ length: next }, (_, i) => i + 1);
    }

    return res;
  };

  const handleChange = (type: "prev" | "next", target: "year" | "month") => {
    if (type === "prev") {
      if (target === "month") {
        const yy = month === 0 ? year - 1 : year;
        const mm = month === 0 ? 11 : month - 1;
        setTargetDate(new Date(yy, mm, 1));
      } else {
        setTargetDate(new Date(year - 1, month, 1));
      }
    } else {
      if (target === "month") {
        const yy = month === 11 ? year + 1 : year;
        const mm = month === 11 ? 0 : month + 1;
        setTargetDate(new Date(yy, mm, 1));
      } else {
        setTargetDate(new Date(year + 1, month, 1));
      }
    }
  };

  // 날짜별 지출 금액
  const handleExpendOnDate = (
    status: MonthStatusType,
    targetY: number,
    targetM: number,
    targetD: number
  ) => {
    let arr: ExpendType[] = [];
    if (status === "prev") arr = prevData;
    else if (status === "current") arr = currentData;
    else if (status === "next") arr = nextData;

    const targetArr = arr.filter(
      (val) =>
        val.date === `${targetY}-${dateToStr(targetM)}-${dateToStr(targetD)}`
    );

    const previewPrice = priceConverter(
      targetArr
        .map((val) => Number(val.price))
        .reduce((acc, cur) => acc + cur, 0)
        .toString()
    ).previewPrice;

    return previewPrice;
  };

  const handleNew = () => {
    navigate("/new", { state: targetDate });
  };

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <>
      {!loading ? (
        <StContainer>
          <StTitle>
            <h2>
              Monthly Total <span>{totalPrice} ₩</span>
            </h2>
          </StTitle>
          <StCalendar>
            <StHead>
              <StMainHead>
                <h3>
                  {year}년 {month + 1}월
                </h3>
                <StBtnContainer>
                  <StBtnWrapper>
                    <button onClick={() => handleChange("prev", "year")}>
                      <MdKeyboardDoubleArrowLeft fill={theme.black} />
                    </button>
                    <button onClick={() => handleChange("prev", "month")}>
                      <MdOutlineKeyboardArrowLeft fill={theme.black} />
                    </button>
                  </StBtnWrapper>
                  <StBtnWrapper>
                    <button onClick={() => handleChange("next", "month")}>
                      <MdOutlineKeyboardArrowRight fill={theme.black} />
                    </button>
                    <button onClick={() => handleChange("next", "year")}>
                      <MdOutlineKeyboardDoubleArrowRight fill={theme.black} />
                    </button>
                  </StBtnWrapper>
                </StBtnContainer>
              </StMainHead>
              <StSubHead>
                <button onClick={() => setOpenDateModal(true)}>
                  <span>직접 선택</span>
                </button>
              </StSubHead>
            </StHead>

            <StBody>
              <StDayList>
                {DAY_LIST.map((val) => {
                  return <li key={val}>{val}</li>;
                })}
              </StDayList>
              <StDateList>
                {handleDateArr("prev", lastDate, lastDatePrev, firstDay).map(
                  (val) => {
                    const expend = handleExpendOnDate(
                      "prev",
                      month === 0 ? year - 1 : year,
                      month === 0 ? 11 : month,
                      val
                    );
                    return (
                      <li
                        key={`prev-${val}`}
                        onClick={() => handleChange("prev", "month")}
                      >
                        <StDate status="prev">{val}</StDate>
                        <StExpend isCurrent={false} isEmpty={expend === "0"}>
                          {expend}
                        </StExpend>
                      </li>
                    );
                  }
                )}
                {handleDateArr("cur", lastDate, lastDatePrev, firstDay).map(
                  (val) => {
                    const expend = handleExpendOnDate(
                      "current",
                      year,
                      month + 1,
                      val
                    );
                    return (
                      <li
                        key={`current-${val}`}
                        onClick={() =>
                          setTargetDate(new Date(year, month, val))
                        }
                      >
                        <StCurrentDate
                          isToday={
                            defaultDateStr ===
                            `${year}-${dateToStr(month + 1)}-${dateToStr(val)}`
                          }
                          isSelected={
                            targetDateStr ===
                            `${year}-${dateToStr(month + 1)}-${dateToStr(val)}`
                          }
                        >
                          {val}
                        </StCurrentDate>
                        <StExpend isCurrent={true} isEmpty={expend === "0"}>
                          {expend}
                        </StExpend>
                      </li>
                    );
                  }
                )}
                {handleDateArr("next", lastDate, lastDatePrev, firstDay).map(
                  (val) => {
                    const expend = handleExpendOnDate(
                      "next",
                      month === 11 ? year + 1 : year,
                      month === 11 ? 1 : month + 2,
                      val
                    );
                    return (
                      <li
                        key={`next-${val}`}
                        onClick={() => handleChange("next", "month")}
                      >
                        <StDate status="next">{val}</StDate>
                        <StExpend isCurrent={false} isEmpty={expend === "0"}>
                          {expend}
                        </StExpend>
                      </li>
                    );
                  }
                )}
              </StDateList>
            </StBody>
          </StCalendar>
          <Button btnTheme="blue1" btnSize="small1" onClick={handleNew}>
            {`${targetDate.getMonth() + 1}/${targetDate.getDate()}`} 추가하기
          </Button>
          <StExpendList>
            {selectDataArr.map((val) => {
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
          {openDateModal ? (
            <ModalLayout
              width={WINDOW_W < MOBILE_MAX_W ? "320px" : "360px"}
              height="auto"
            >
              <DateSelectModal
                type="month"
                year={year}
                month={month}
                date={1}
                setTargetDate={setTargetDate}
                handleModal={setOpenDateModal}
              />
            </ModalLayout>
          ) : (
            <></>
          )}
        </StContainer>
      ) : (
        <></>
      )}
    </>
  );
};

export default Monthly;

const StContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(20)};
  padding: ${calcRem(120)} ${calcRem(20)} ${calcRem(20)};
`;

const StCalendar = styled.div`
  width: 100%;
`;

const StTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;

  h2 {
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
  }
`;

const StHead = styled.div`
  padding: ${calcRem(8)} ${calcRem(12)};
`;

const StMainHead = styled.div`
  position: relative;

  h3 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: ${calcRem(14)};
    font-weight: 400;
  }
`;

const StBtnContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${calcRem(6)};
    background-color: white;
    border: none;

    svg {
      width: ${calcRem(20)};
      height: ${calcRem(20)};
    }
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(8)};
`;

const StSubHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${theme.gray3};

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${calcRem(6)};
    background-color: transparent;
    border: none;

    span {
      font-size: ${calcRem(14)};
      font-weight: 500;
      color: ${theme.green1};
    }
  }
`;

const StBody = styled.div``;

const StDayList = styled.ul`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  li {
    padding: 8px 0;
    text-align: center;
    font-size: ${calcRem(12)};
    font-weight: 500;
  }
`;

const StDateList = styled.ul`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  li {
    padding: 12px 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const StDate = styled.span<{
  status: "cur" | "prev" | "next";
}>`
  color: ${theme.gray2};
  font-size: ${calcRem(12)};
  font-weight: 400;
`;

const StCurrentDate = styled.span<{
  isToday: boolean;
  isSelected: boolean;
}>`
  font-size: ${calcRem(12)};
  font-weight: ${({ isToday, isSelected }) =>
    isToday || isSelected ? 700 : 400};
  color: ${({ theme, isToday, isSelected }) =>
    isToday ? theme.red2 : isSelected ? theme.blue4 : theme.black};
  text-decoration: ${({ isToday, isSelected }) =>
    !isToday && isSelected ? "underline" : "none"};
`;

const StExpend = styled.span<{ isCurrent: boolean; isEmpty: boolean }>`
  opacity: ${({ isEmpty }) => (isEmpty ? 0 : 1)};
  color: ${({ isCurrent, theme }) => (isCurrent ? theme.green1 : theme.gray2)};
  font-size: ${calcRem(10)};
  font-weight: 400;

  @media screen and (max-width: ${MOBILE_MAX_W}px) {
    font-size: ${calcRem(8)};
  }
`;

const StExpendList = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(12)};
  width: 100%;
  padding-top: ${calcRem(8)};
`;
