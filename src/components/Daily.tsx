import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ExpendType } from "../config";
import { useAppSelector } from "../context/redux";
import { calcRem, theme } from "../styles/theme";
import { dateConverter } from "../utils/dateConverter";
import { getMonthLength } from "../utils/getMonthLength";
import DetailPreview from "./DetailPreview";
import ModalLayout from "./layout/ModalLayout";
import SelectDateModal from "./modal/SelectDateModal";
import { MdCalendarMonth } from "react-icons/md";
import { priceConverter } from "../utils/priceConverter";

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
            <StTitle>
              Daily Total{" "}
              <span>
                {
                  priceConverter(
                    dataArr
                      .map((val) => Number(val.price))
                      .reduce((acc, cur) => acc + cur, 0)
                      .toString()
                  ).previewPrice
                }{" "}
                ₩
              </span>
            </StTitle>
            <StBtnWrapper>
              <StNavBtn name="prev" onClick={moveToPrev}>
                <span>&lsaquo;</span>
              </StNavBtn>
              <h3>
                {dateConverter(targetDate).split("-")[1][0] === "0"
                  ? dateConverter(targetDate).split("-")[1].replace("0", "")
                  : dateConverter(targetDate).split("-")[1]}
                월 {dateConverter(targetDate).split("-")[2]}일
              </h3>
              <StNavBtn name="next" onClick={moveToNext}>
                <span>&rsaquo;</span>
              </StNavBtn>
              <SelectBtn onClick={handleClose}>
                <MdCalendarMonth fill={`${theme.green1}`} size={18} />
                <span>날짜 선택</span>
              </SelectBtn>
            </StBtnWrapper>
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
        </StDaily>
      )}
    </>
  );
};

export default Daily;

const StDaily = styled.div`
  padding: ${calcRem(10)} ${calcRem(20)} ${calcRem(20)} ${calcRem(20)};
  display: flex;
  flex-direction: column;
  gap: ${calcRem(70)};
`;

const StDailyHeader = styled.div``;

const StTitle = styled.h2`
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
  margin-top: ${calcRem(8)};
  padding: ${calcRem(8)} 0;
  position: relative;

  h3 {
    font-size: ${calcRem(14)};
    font-weight: 400;
  }
`;

const StNavBtn = styled.button`
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
`;

const SelectBtn = styled.button`
  display: flex;
  align-items: center;
  gap: ${calcRem(4)};
  position: absolute;
  bottom: ${calcRem(-30)};
  padding: ${calcRem(6)};
  border: none;
  background-color: transparent;

  span {
    font-size: ${calcRem(14)};
    font-weight: 500;
    color: ${theme.green1};
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
