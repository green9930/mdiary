import { deleteDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { ExpendType } from "../../config";
import { deleteExpend } from "../../context/modules/expendSlice";
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
  const dispatch = useDispatch();

  console.log(target);

  const handleDelete = async () => {
    await deleteDoc(doc(dbService, "expend", target.id as string));
    dispatch(deleteExpend(target));
    handleShowDetail();
    handleClose();
  };

  return (
    <StDeleteModal>
      <p>해당 내용을 삭제하시겠습니까?</p>
      <div>
        <button onClick={handleDelete}>OK</button>
        <button onClick={handleClose}>취소</button>
      </div>
    </StDeleteModal>
  );
};

export default DeleteModal;

const StDeleteModal = styled.div``;
