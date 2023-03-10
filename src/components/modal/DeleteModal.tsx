import { deleteDoc, doc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { ExpendType } from "../../config";
import { deleteExpend } from "../../context/modules/expendSlice";
import { dbService } from "../../firebase";
import { calcRem } from "../../styles/theme";
import Button from "../elements/Button";

interface ISelectDeleteModal {
  handleClose: () => void;
  handleShowDetail: () => void;
  target: ExpendType;
}

const DeleteModal = ({
  handleClose,
  handleShowDetail,
  target,
}: ISelectDeleteModal) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    await deleteDoc(doc(dbService, "expend", target.id as string));
    dispatch(deleteExpend(target));
    handleShowDetail();
    handleClose();
  };

  return (
    <StDeleteModal>
      <p>해당 내용을 삭제하시겠습니까?</p>
      <StBtnWrapper>
        <Button btnTheme="beige3" btnSize="small1" onClick={handleDelete}>
          OK
        </Button>
        <Button btnTheme="blue1" btnSize="small1" onClick={handleClose}>
          취소
        </Button>
      </StBtnWrapper>
    </StDeleteModal>
  );
};

export default DeleteModal;

const StDeleteModal = styled.div`
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
