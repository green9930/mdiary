import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ExpendType } from "../config";
import { useAppSelector } from "../context/redux";
import { dateConverter } from "../utils/dateConverter";
import { dayConverter } from "../utils/dayConverter";
import sortingData from "../utils/sortingData";
import DetailPreview from "./DetailPreview";

type TWeekly = {
  day: string;
  fullDate: string;
  date: string;
  dateObj: Date;
};

const Weekly = () => {
  const [weekArr, setWeekArr] = useState<TWeekly[]>([]);
  const [d, setD] = useState(new Date());
  const [targetDay, setTargetDay] = useState(new Date().getDay());
  const [dataArr, setDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();

  const data = useAppSelector((state) => state.expend);

  useEffect(() => {
    const dArr = data.filter((val) => val.date === dateConverter(d));
    setDataArr(sortingData(dArr, "title", true));

    let wArr: TWeekly[] = [];
    let val: Date = new Date();

    for (let i = 0; i < 7; i++) {
      const copiedD = new Date(d);
      if (i !== targetDay) {
        val =
          i < targetDay
            ? new Date(copiedD.setDate(copiedD.getDate() - (targetDay - i)))
            : new Date(copiedD.setDate(copiedD.getDate() + (i - targetDay)));
        wArr.push({
          day: dayConverter(i),
          fullDate: dateConverter(val),
          date: dateConverter(val).slice(-2),
          dateObj: val,
        });
      } else {
        wArr.push({
          day: dayConverter(targetDay),
          fullDate: dateConverter(d),
          date: dateConverter(d).slice(-2),
          dateObj: d,
        });
      }
    }

    // targetDay
    // // MON ~ targetDay
    // for (let i = 1; i < targetDay; i++) {
    //   const copiedD = new Date(d);
    //   const val = new Date(
    //     copiedD.setDate(copiedD.getDate() - (targetDay - i))
    //   );
    //   wArr.push({
    //     day: dayConverter(i),
    //     fullDate: dateConverter(val),
    //     date: dateConverter(val).slice(-2),
    //   });
    // }
    // // targetDay
    // wArr.push({
    //   day: dayConverter(targetDay),
    //   fullDate: dateConverter(d),
    //   date: dateConverter(d).slice(-2),
    // });
    // // targetDay ~ SUN
    // for (let i = targetDay + 1; i < 8; i++) {
    //   const copiedD = new Date(d);
    //   const val = new Date(
    //     copiedD.setDate(copiedD.getDate() + (i - targetDay))
    //   );
    //   wArr.push({
    //     day: dayConverter(i),
    //     fullDate: dateConverter(val),
    //     date: dateConverter(val).slice(-2),
    //   });
    // }
    console.log(wArr);
    setWeekArr(wArr);
  }, [data, dateConverter(d)]);

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
      <h2>Weekly</h2>
      <button onClick={moveToPrev}>PREV</button>
      <button onClick={moveToNext}>NEXT</button>
      <StHeader>
        <ul>
          {weekArr.map((val) => {
            const { day, fullDate, date } = val;
            return (
              <WeekLi
                key={fullDate}
                isToday={val.fullDate === dateConverter(new Date())}
                onClick={() => handleSelectDay(day, fullDate)}
              >
                <h3>{date}</h3>
                <span>{day}</span>
              </WeekLi>
            );
          })}
        </ul>
      </StHeader>
      <StBody>
        <ul>
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
        </ul>
      </StBody>
    </StWeekly>
  );
};

export default Weekly;

const StWeekly = styled.div``;
const StHeader = styled.div``;
const StBody = styled.div``;

const WeekLi = styled.li<{ isToday: boolean }>`
  color: ${({ isToday }) => (isToday ? "#FF0000" : "#000000")};
`;
