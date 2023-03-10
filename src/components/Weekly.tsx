import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ExpendType } from "../config";
import { useAppSelector } from "../context/redux";
import { calcRem, theme } from "../styles/theme";
import { dateConverter } from "../utils/dateConverter";
import { dayConverter } from "../utils/dayConverter";
import { priceConverter } from "../utils/priceConverter";
import { sortingData } from "../utils/sortingData";
import DetailPreview from "./DetailPreview";

type TWeekly = {
  day: string;
  fullDate: string;
  date: string;
  dateObj: Date;
  expend: number;
};

const Weekly = () => {
  const [d, setD] = useState(new Date());
  const [targetDay, setTargetDay] = useState(new Date().getDay());
  // const [d, setD] = useState(new Date(2023, 2, 12));
  // const [targetDay, setTargetDay] = useState(new Date(2023, 2, 12).getDay());
  const [weekArr, setWeekArr] = useState<TWeekly[]>([]);
  const [dataArr, setDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();

  const data = useAppSelector((state) => state.expend);

  useEffect(() => {
    const dArr = data.filter((val) => val.date === dateConverter(d));
    setDataArr(sortingData(dArr, "title", true));

    let wArr: TWeekly[] = [];
    let val: Date = new Date();
    let expend: number = 0;

    // today === sunday
    for (let i = 1; i < 7; i++) {
      const copiedD = new Date(d);

      if (i !== targetDay) {
        val =
          targetDay === 0
            ? new Date(copiedD.setDate(copiedD.getDate() - (7 - i)))
            : i < targetDay
            ? new Date(copiedD.setDate(copiedD.getDate() - (targetDay - i)))
            : new Date(copiedD.setDate(copiedD.getDate() + (i - targetDay)));
        expend = data
          .filter((data) => data.date === dateConverter(val))
          .map((val) => Number(val.price))
          .reduce((acc, cur) => acc + cur, 0);

        wArr.push({
          day: dayConverter(i),
          fullDate: dateConverter(val),
          date: dateConverter(val).slice(-2),
          dateObj: val,
          expend,
        });
      } else {
        expend = data
          .filter((val) => val.date === dateConverter(d))
          .map((val) => Number(val.price))
          .reduce((acc, cur) => acc + cur, 0);

        wArr.push({
          day: dayConverter(targetDay),
          fullDate: dateConverter(d),
          date: dateConverter(d).slice(-2),
          dateObj: d,
          expend,
        });
      }
    }
    wArr.push({
      day: "SUN",
      fullDate:
        targetDay === 0
          ? dateConverter(d)
          : dateConverter(
              new Date(
                new Date(d).setDate(new Date(d).getDate() + (7 - targetDay))
              )
            ),
      date:
        targetDay === 0
          ? dateConverter(d).slice(-2)
          : dateConverter(
              new Date(
                new Date(d).setDate(new Date(d).getDate() + (7 - targetDay))
              )
            ).slice(-2),
      dateObj: d,
      expend,
    });
    setWeekArr(wArr);
  }, [data, dateConverter(d)]);

  // useEffect(() => {
  //   const dArr = data.filter((val) => val.date === dateConverter(d));
  //   setDataArr(sortingData(dArr, "title", true));

  //   let wArr: TWeekly[] = [];
  //   let val: Date = new Date();
  //   let expend: number = 0;

  //   for (let i = 1; i < 7; i++) {
  //     const copiedD = new Date(d);

  //     if (i !== targetDay) {
  //       val =
  //         i < targetDay
  //           ? new Date(copiedD.setDate(copiedD.getDate() - (targetDay - i)))
  //           : new Date(copiedD.setDate(copiedD.getDate() + (i - targetDay)));
  //       expend = data
  //         .filter((data) => data.date === dateConverter(val))
  //         .map((val) => Number(val.price))
  //         .reduce((acc, cur) => acc + cur, 0);

  //       wArr.push({
  //         day: dayConverter(i),
  //         fullDate: dateConverter(val),
  //         date: dateConverter(val).slice(-2),
  //         dateObj: val,
  //         expend,
  //       });
  //     } else {
  //       expend = data
  //         .filter((val) => val.date === dateConverter(d))
  //         .map((val) => Number(val.price))
  //         .reduce((acc, cur) => acc + cur, 0);

  //       wArr.push({
  //         day: dayConverter(targetDay),
  //         fullDate: dateConverter(d),
  //         date: dateConverter(d).slice(-2),
  //         dateObj: d,
  //         expend,
  //       });
  //     }

  //   }
  //   setWeekArr(wArr);
  // }, [data, dateConverter(d)]);

  const handleSelectDay = (day: string, fullDate: string) => {
    const yy = Number(fullDate.slice(0, 4));
    const mm = Number(fullDate.slice(5, 7)) - 1;
    const dd = Number(fullDate.slice(-2));

    setD(new Date(yy, mm, dd));
    setTargetDay(new Date(yy, mm, dd).getDay());
  };

  const moveToPrev = () => {
    const sun = weekArr[0].dateObj;
    const prevSun = new Date(sun.setDate(sun.getDate() - 7));
    setD(prevSun);
    setTargetDay(prevSun.getDay());
  };

  const moveToNext = () => {
    const sun = weekArr[0].dateObj;
    const nextSun = new Date(sun.setDate(sun.getDate() + 7));
    setD(nextSun);
    setTargetDay(nextSun.getDay());
  };

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <StWeekly>
      <StHeader>
        <StTitle>
          Weekly Total{" "}
          <span>
            {
              priceConverter(
                weekArr
                  .map((val) => val.expend)
                  .reduce((acc, cur) => acc + cur, 0)
                  .toString()
              ).previewPrice
            }{" "}
            ₩
          </span>
        </StTitle>
        <StBtnWrapper>
          <button name="prev" onClick={moveToPrev}>
            <span>&lsaquo;</span>
          </button>
          <h3>
            {dateConverter(d).split("-")[0]}년{" "}
            {dateConverter(d).split("-")[1][0] === "0"
              ? dateConverter(d).split("-")[1].replace("0", "")
              : dateConverter(d).split("-")[1]}
            월
          </h3>
          <button name="next" onClick={moveToNext}>
            <span>&rsaquo;</span>
          </button>
        </StBtnWrapper>
        <ul>
          {weekArr.map((val) => {
            const { day, fullDate, date } = val;
            return (
              <WeekLi
                key={fullDate}
                isToday={val.fullDate === dateConverter(new Date())}
                isSelected={val.fullDate === dateConverter(d)}
                onClick={() => handleSelectDay(day, fullDate)}
              >
                <span>{day}</span>
                <h3>{date}</h3>
              </WeekLi>
            );
          })}
        </ul>
      </StHeader>
      <StBody>
        <StExpendList>
          {dataArr.map((val) => {
            return (
              <React.Fragment key={val.id}>
                <DetailPreview
                  handleTargetData={handleTargetData}
                  targetData={targetData}
                  val={val}
                />
              </React.Fragment>
            );
          })}
        </StExpendList>
      </StBody>
    </StWeekly>
  );
};

export default Weekly;

const StWeekly = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(50)};
  padding: ${calcRem(20)};
`;

const StHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(8)};

  ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${calcRem(6)} 0;
  }
`;

const StTitle = styled.h2`
  margin-bottom: ${calcRem(6)};
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

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: ${calcRem(8)} 0;

  h3 {
    font-size: ${calcRem(14)};
    font-weight: 400;
  }

  button {
    height: ${calcRem(30)};
    width: ${calcRem(30)};
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    padding: 0;
    background-color: transparent;

    span {
      display: inline-block;
      height: ${calcRem(30)};
      font-size: ${calcRem(18)};
    }
  }
`;

const WeekLi = styled.li<{ isToday: boolean; isSelected: boolean }>`
  /* background-color: pink; */
  width: 15%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${calcRem(6)};

  h3,
  span {
    color: ${({ isToday, isSelected }) =>
      isToday
        ? `${theme.red2}`
        : isSelected
        ? `${theme.green1}`
        : `${theme.black}`};
  }

  span {
    font-size: ${calcRem(12)};
  }

  h3 {
    font-size: ${calcRem(14)};
    font-weight: 700;
  }
`;

const StBody = styled.div``;

const StExpendList = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(12)};
`;
