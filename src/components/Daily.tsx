import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { MdCalendarMonth } from "react-icons/md";

import ModalLayout from "./layout/ModalLayout";
import DateSelectModal from "./modal/DateSelectModal";
import DetailPreview from "./DetailPreview";
import { dateConverter } from "../utils/dateConverter";
import { priceConverter } from "../utils/priceConverter";
import { useAppSelector } from "../context/redux";
import { ExpendType } from "../config";
import { MOBILE_MAX_W, WINDOW_W, calcRem, theme } from "../styles/theme";

const Daily = () => {
  const [loading, setLoading] = useState(true);
  const [targetDate, setTargetDate] = useState(new Date());
  const [dateStr, setDateStr] = useState(dateConverter(new Date()));
  const [dataArr, setDataArr] = useState<ExpendType[]>([]);
  const [openDateModal, setOpenDateModal] = useState(false);
  const [targetData, setTargetData] = useState<ExpendType>();

  const data = useAppSelector((state) => state.expend);

  useEffect(() => {
    const arr = data.filter((val) => val.date === dateStr);
    setDataArr(arr);
    setLoading(false);
  }, [data, dateStr]);

  useEffect(() => {
    if (!loading) {
      setDateStr(dateConverter(targetDate));
    }
  }, [targetDate]);

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

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <>
      {loading ? null : (
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
              <SelectBtn onClick={() => setOpenDateModal(true)}>
                <MdCalendarMonth
                  fill={`${theme.green1}`}
                  size={`${calcRem(18)}`}
                />
                <span>날짜 선택</span>
              </SelectBtn>
            </StBtnWrapper>
            {openDateModal ? (
              <ModalLayout
                width={WINDOW_W < MOBILE_MAX_W ? "320px" : "360px"}
                height="auto"
              >
                <DateSelectModal
                  type="date"
                  year={targetDate.getFullYear()}
                  month={targetDate.getMonth()}
                  date={targetDate.getDate()}
                  setTargetDate={setTargetDate}
                  handleModal={setOpenDateModal}
                />
              </ModalLayout>
            ) : (
              <></>
            )}
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
  display: flex;
  flex-direction: column;
  gap: ${calcRem(70)};
  padding: ${calcRem(20)};
  padding-top: ${calcRem(120)};
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
  margin-top: ${calcRem(16)};
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
