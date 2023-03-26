import { useState } from "react";
import styled from "styled-components";
import CategoryIcon from "../CategoryIcon";
import Button from "../elements/Button";
import { calcRem, theme } from "../../styles/theme";
import { CategoryType, CATEGORY_LIST } from "../../config";

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
        <Button
          btnTheme="blue1"
          btnSize="small1"
          onClick={() => handleSelect(target)}
        >
          선택
        </Button>
        <Button btnTheme="beige3" btnSize="small1" onClick={handleClose}>
          취소
        </Button>
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
    gap: ${calcRem(4)};
  }
`;

const StLi = styled.li<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(2)};
  padding: ${calcRem(10)} 0;
  background-color: ${({ isSelected }) =>
    isSelected ? `${theme.beige3}` : "transparent"};
  border-radius: ${calcRem(4)};

  span {
    color: ${({ isSelected }) =>
      isSelected ? `${theme.red2}` : `${theme.black}`};
    font-size: ${calcRem(10)};
    font-weight: 500;
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
`;
