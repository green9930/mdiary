import styled from "styled-components";
import Button from "../elements/Button";
import { calcRem } from "../../styles/theme";

type ValiType = "alert" | "confirm" | "edit";
interface IValiModal {
  type: ValiType;
  onClick: () => void;
}

const ValiModal = ({ type, onClick }: IValiModal) => {
  const convertMessage = (text: ValiType) => {
    switch (text) {
      case "alert":
        return "필수 항목을 입력해주세요";
      case "confirm":
        return "등록되었습니다.";
      case "edit":
        return "수정되었습니다.";
      default:
        return "";
    }
  };
  return (
    <StValiModal>
      <p>{convertMessage(type)}</p>
      <StBtnWrapper>
        <Button btnTheme="black" btnSize="small1" onClick={onClick}>
          닫기
        </Button>
      </StBtnWrapper>
    </StValiModal>
  );
};

export default ValiModal;

const StValiModal = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  p {
    width: 100%;
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: ${calcRem(16)};
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
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
`;
