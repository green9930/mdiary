import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  CategorySelectType,
  CategoryType,
  CATEGORY_SELECT_LIST,
  ExpendType,
} from "../config";
import { useAppSelector } from "../context/redux";
import { calcRem, theme } from "../styles/theme";
import { priceConverter } from "../utils/priceConverter";
import { sortingData } from "../utils/sortingData";
import CategoryIcon from "./CategoryIcon";
import DetailPreview from "./DetailPreview";

const Categories = () => {
  const [target, setTarget] = useState<CategorySelectType>("All");
  const [targetDataArr, setTargetDataArr] = useState<ExpendType[]>([]);
  const [targetData, setTargetData] = useState<ExpendType>();

  const data = useAppSelector((state) => state.expend);

  useEffect(() => {
    if (target === "All") setTargetDataArr(data);
    else {
      const arr = data.filter((val) => val.category === target);
      setTargetDataArr(arr);
    }
  }, [data, target]);

  const handleTargetData = (target: ExpendType) => setTargetData(target);

  return (
    <StCategories>
      <StHeader>
        <StTitle>
          Category Total{" "}
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
              <li onClick={() => setTarget(val)} key={val}>
                <CategoryIcon target={val as CategoryType} />
                <span>{val}</span>
              </li>
            );
          })}
        </StCategoryList>
      </StHeader>
      <StBody>
        <StExpendList>
          {sortingData(targetDataArr, "title", true).map((val) => {
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
    </StCategories>
  );
};

export default Categories;

const StCategories = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(50)};
  padding: ${calcRem(20)};
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

    span {
      color: ${theme.blue3};
      font-size: ${calcRem(10)};
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
`;
