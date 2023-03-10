import React, { useState } from "react";
import styled from "styled-components";
import { CategoryType, CATEGORY_LIST } from "../../config";
import { calcRem, theme } from "../../styles/theme";
import CategoryIcon from "../CategoryIcon";

interface ISelectCategoryModal {
  handleClose: () => void;
  handleSelect: (target: string) => void;
}

const SelectCategoryModal = ({
  handleClose,
  handleSelect,
}: ISelectCategoryModal) => {
  const [target, setTarget] = useState("");

  return (
    <StCategoryModal>
      <ul>
        {CATEGORY_LIST.map((val) => {
          return (
            <StLi
              isSelected={target === val}
              onClick={() => setTarget(val)}
              key={val}
            >
              <CategoryIcon target={val as CategoryType} />
              <span>{val}</span>
            </StLi>
          );
        })}
      </ul>
      <StBtnWrapper>
        <StSelectBtn onClick={() => handleSelect(target)}>선택</StSelectBtn>
        <StCancelBtn onClick={handleClose}>취소</StCancelBtn>
      </StBtnWrapper>
    </StCategoryModal>
  );
};

export default SelectCategoryModal;

const StCategoryModal = styled.div`
  width: 100%;
  height: 100%;
  padding: ${calcRem(20)};
  position: relative;

  ul {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: ${calcRem(10)};
  }
`;

const StLi = styled.li<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: ${calcRem(10)};

  span {
    color: ${({ isSelected }) =>
      isSelected ? `${theme.green1}` : `${theme.black}`};
    font-size: ${calcRem(10)};
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(26)};
  width: 100%;
  position: absolute;
  bottom: ${calcRem(10)};
  left: 50%;
  transform: translateX(-50%);

  button {
    border: none;
    border-radius: ${calcRem(4)};
    padding: ${calcRem(8)} ${calcRem(30)};
    font-size: ${calcRem(14)};
    font-weight: 500;
  }
`;

const StSelectBtn = styled.button`
  background-color: ${theme.blue1};
  color: ${theme.white};
`;

const StCancelBtn = styled.button`
  background-color: ${theme.beige3};
  color: ${theme.gray2};
`;
