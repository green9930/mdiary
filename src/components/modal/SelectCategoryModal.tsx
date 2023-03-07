import React, { useState } from "react";
import styled from "styled-components";
import { CATEGORY_LIST } from "../../config";

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
              {val}
            </StLi>
          );
        })}
      </ul>
      <div>
        <button onClick={() => handleSelect(target)}>선택</button>
        <button onClick={handleClose}>취소</button>
      </div>
    </StCategoryModal>
  );
};

export default SelectCategoryModal;

const StCategoryModal = styled.div``;

const StLi = styled.li<{ isSelected: boolean }>`
  color: ${({ isSelected }) => (isSelected ? "red" : "#000000")};
`;
