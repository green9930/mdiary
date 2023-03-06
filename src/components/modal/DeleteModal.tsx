import { deleteDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { deleteExpend, ExpendType } from "../../context/modules/expendSlice";
import { dbService } from "../../firebase";

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
  // const [isDeleted, setIsDeleted] = useState(false);
  const dispatch = useDispatch();

  console.log(target);

  const handleDelete = async () => {
    await deleteDoc(doc(dbService, "expend", target.id as string));
    dispatch(deleteExpend(target));
    // setIsDeleted(true);
  };

  // const onClick = () => {
  //   handleClose();
  //   handleShowDetail();
  // };

  return (
    <StDeleteModal>
      <p>해당 내용을 삭제하시겠습니까?</p>
      {/* <p>{isDeleted ? "삭제되었습니다." : "해당 내용을 삭제하시겠습니까?"}</p> */}
      <div>
        {/* {isDeleted ? null : <button onClick={handleDelete}>OK</button>}
        {isDeleted ? (
          <button onClick={onClick}>OK</button>
        ) : (
          <button onClick={handleClose}>취소</button>
        )} */}
        <button onClick={handleDelete}>OK</button>
        <button onClick={handleClose}>취소</button>
      </div>
    </StDeleteModal>
  );
};

export default DeleteModal;

const StDeleteModal = styled.div``;
