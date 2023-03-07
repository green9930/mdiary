import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  CategorySelectType,
  CATEGORY_SELECT_LIST,
  ExpendType,
} from "../config";
import { useAppSelector } from "../context/redux";
import sortingData from "../utils/sortingData";
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
        <ul>
          {CATEGORY_SELECT_LIST.map((val) => {
            return (
              <li onClick={() => setTarget(val)} key={val}>
                {val}
              </li>
            );
          })}
        </ul>
      </StHeader>
      <StBody>
        {sortingData(targetDataArr, "date", false).map((val) => {
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
      </StBody>
    </StCategories>
  );
};

export default Categories;

const StCategories = styled.div``;

const StHeader = styled.div``;

const StBody = styled.div``;
