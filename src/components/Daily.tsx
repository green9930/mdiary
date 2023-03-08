import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ExpendType } from "../config";
import { useAppSelector } from "../context/redux";
import { dateConverter } from "../utils/dateConverter";
import { getMonthLength } from "../utils/getMonthLength";
import DetailPreview from "./DetailPreview";
import ModalLayout from "./layout/ModalLayout";
import SelectDateModal from "./modal/SelectDateModal";

const Daily = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [targetDate, setTargetDate] = useState(new Date());
  const [dateStr, setDateStr] = useState(dateConverter(new Date()));
  const [dataArr, setDataArr] = useState<ExpendType[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [targetData, setTargetData] = useState<ExpendType>();

  const data = useAppSelector((state) => state.expend);

  useEffect(() => {
    const arr = data.filter((val) => val.date === dateStr);
    setDataArr(arr);
    setIsLoading(false);
  }, [data, dateStr]);

  const moveToPrev = () => {
    const prev = new Date(targetDate.setDate(targetDate.getDate() - 1));
    setTargetDate(prev);
    setDateStr(dateConverter(prev));
  };

  const moveToNext = () => {
    const next = new Date(targetDate.setDate(targetDate.getDate() + 1));
    setTargetDate(next);
    setDateStr(dateConverter(next));
  };

  const handleClose = () => setShowDateModal(!showDateModal);
  const handleSelectDate = (date: Date) => {
    setTargetDate(date);
    setDateStr(dateConverter(date));
    setShowDateModal(!showDateModal);
  };

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <>
      {isLoading ? null : (
        <StDaily>
          <StDailyHeader>
            <button onClick={moveToPrev}>PREV</button>
            <h2>{dateStr}</h2>
            <button onClick={moveToNext}>NEXT</button>
            <button onClick={handleClose}>직접입력</button>
            {showDateModal ? (
              <ModalLayout width="84%" height="50%" handleModal={handleClose}>
                <SelectDateModal
                  handleClose={handleClose}
                  handleSelectDate={handleSelectDate}
                  defaultMonthLength={getMonthLength(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1
                  )}
                />
              </ModalLayout>
            ) : null}
          </StDailyHeader>
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
        </StDaily>
      )}
    </>
  );
};

export default Daily;

const StDaily = styled.div``;

const StDailyHeader = styled.div``;
