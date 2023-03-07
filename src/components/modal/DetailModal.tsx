import React from "react";
import styled from "styled-components";
import { ExpendType } from "../../context/modules/expendSlice";
import ModalLayout from "../layout/ModalLayout";

interface IDetailModal {
  data: ExpendType;
  handleShowDetail: () => void;
  handleShowDelete: () => void;
}

const DetailModal = ({
  data,
  handleShowDetail,
  handleShowDelete,
}: IDetailModal) => {
  const { id, category, title, content, date, price } = data;
  return (
    <StDetail>
      <StDetailHead>
        <h3>{title}</h3>
        <span>{category}</span>
        <span>{date}</span>
      </StDetailHead>
      <StDeatilBody>
        <span>{price}</span>
        <p>{content}</p>
      </StDeatilBody>
      <StDetailFooter>
        <button>EDIT</button>
        <button onClick={handleShowDelete}>DELETE</button>
      </StDetailFooter>
      <button onClick={handleShowDetail}>X</button>
    </StDetail>
  );
};
export default DetailModal;

const StDetail = styled.div``;

const StDetailHead = styled.div``;

const StDeatilBody = styled.div``;

const StDetailFooter = styled.div``;
