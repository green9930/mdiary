import React, { useEffect, useState } from "react";
import styled from "styled-components";

import ModalLayout from "./layout/ModalLayout";
import DateSelectModal from "./modal/DateSelectModal";
import CategoryIcon from "./CategoryIcon";
import DetailPreview from "./DetailPreview";
import { useAppSelector } from "../context/redux";
import { priceConverter } from "../utils/priceConverter";
import { sortingData } from "../utils/sortingData";
import { dateToStr } from "../utils/dateConverter";
import {
  CategorySelectType,
  CategoryType,
  CATEGORY_SELECT_LIST,
  ExpendType,
} from "../config";
import { MOBILE_MAX_W, WINDOW_W, calcRem, theme } from "../styles/theme";

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [targetCategory, setTargetCategory] =
    useState<CategorySelectType>("All");
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();
  const [openDateModal, setOpenDateModal] = useState(false);

  const data = useAppSelector((state) => state.expend);

  useEffect(() => {
    const currentDate = new Date();
    const yy = currentDate.getFullYear();
    const mm = currentDate.getMonth();

    setTargetDate(currentDate);
    setYear(yy);
    setMonth(mm);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) handleDataArr();
  }, [data, targetCategory, targetDate]);

  useEffect(() => {
    const yy = targetDate.getFullYear();
    const mm = targetDate.getMonth();

    setYear(yy);
    setMonth(mm);
  }, [targetDate]);

  const handleDataArr = () => {
    const mData = data.filter((val) => {
      const yy = targetDate.getFullYear();
      const mm = targetDate.getMonth();
      const yymm = `${yy}.${dateToStr(mm + 1)}`;
      const valDate = `${val.date.split("-")[0]}.${val.date.split("-")[1]}`;
      return targetCategory === "All"
        ? valDate === yymm
        : valDate === yymm && val.category === targetCategory;
    });
    setTargetDataArr(mData);
  };

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <>
      {!loading ? (
        <StCategories>
          <StHeader>
            <StTitle>
              {`${year}.${dateToStr(month + 1)} Total `}
              <span>
                {
                  priceConverter(
                    targetDataArr
                      .map((val) => Number(val.price))
                      .reduce((acc, cur) => acc + cur, 0)
                      .toString()
                  ).previewPrice
                }{" "}
                ₩
              </span>
            </StTitle>
            <StCategoryList>
              {CATEGORY_SELECT_LIST.map((val) => {
                return (
                  <li onClick={() => setTargetCategory(val)} key={val}>
                    <CategoryIcon target={val as CategoryType} />
                    <StCategoryText isSelected={val === targetCategory}>
                      {val}
                    </StCategoryText>
                  </li>
                );
              })}
            </StCategoryList>
            <StMonth>
              <button onClick={() => setOpenDateModal(true)}>
                <span>기간 선택</span>
              </button>
            </StMonth>
          </StHeader>
          <StBody>
            <StExpendList>
              {sortingData(targetDataArr, "date", false).map(
                (val, idx, arr) => (
                  <DetailPreview
                    handleTargetData={handleTargetData}
                    targetData={targetData}
                    val={val}
                  />
                )
              )}
            </StExpendList>
          </StBody>
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
        </StCategories>
      ) : (
        <></>
      )}
    </>
  );
};

export default Categories;

const StCategories = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(32)};
  padding: ${calcRem(20)};
  padding-top: ${calcRem(120)};
`;

const StHeader = styled.div``;

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

const StCategoryList = styled.ul`
  display: flex;
  align-items: center;
  gap: ${calcRem(14)};
  margin-top: ${calcRem(20)};
  padding: ${calcRem(12)} ${calcRem(10)};
  background-color: ${theme.gray1};
  overflow-x: scroll;

  li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${calcRem(4)};
  }
`;

const StCategoryText = styled.span<{ isSelected: boolean }>`
  color: ${({ isSelected }) => (isSelected ? theme.red2 : theme.blue3)};
  font-size: ${calcRem(10)};
  font-weight: ${({ isSelected }) => (isSelected ? 700 : 500)};
`;

const StMonth = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${calcRem(4)};

  button {
    display: flex;
    align-items: center;
    gap: ${calcRem(4)};
    padding: ${calcRem(6)};
    border: none;
    background-color: transparent;

    span {
      font-size: ${calcRem(14)};
      font-weight: 500;
      color: ${theme.green1};
    }
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

  .month-section {
    margin-top: ${calcRem(8)};
    font-size: ${calcRem(12)};
  }
`;
