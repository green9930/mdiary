import { deleteDoc, doc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import Button from "../elements/Button";
import { dbService } from "../../firebase";
import { ExpendType } from "../../config";
import { deleteExpend } from "../../context/modules/expendSlice";
import { calcRem } from "../../styles/theme";

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
    <StContainer>
      <p>해당 내용을 삭제하시겠습니까?</p>
      <StBtnWrapper>
        <Button btnTheme="beige3" btnSize="small1" onClick={handleDelete}>
          OK
        </Button>
        <Button btnTheme="blue1" btnSize="small1" onClick={handleClose}>
          취소
        </Button>
      </StBtnWrapper>
    </StContainer>
  );
};

export default DeleteModal;

const StContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${calcRem(48)};
  width: 100%;
  height: 100%;
  padding: ${calcRem(32)};

  p {
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: ${calcRem(16)};
    font-weight: 500;
    padding-top: ${calcRem(32)};
  }
`;

const StBtnWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(24)};
  width: 100%;
`;
