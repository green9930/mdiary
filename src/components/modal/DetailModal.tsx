import React, { useState } from "react";
import styled from "styled-components";
import { ExpendType } from "../../config";
import Edit from "../Edit";

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
  const [isEdit, setIsEdit] = useState(false);
  const [defaultData, setDefaultData] = useState<ExpendType>(data);
  const { id, category, title, content, date, price } = defaultData;

  const handleEdit = (target: ExpendType) => {
    setDefaultData(target);
    setIsEdit(!isEdit);
  };

  return (
    <StDetail>
      {isEdit ? (
        <Edit
          defaultData={data}
          handleEdit={handleEdit}
          handleClose={() => setIsEdit(!isEdit)}
        />
      ) : (
        <>
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
            <button onClick={() => setIsEdit(!isEdit)}>EDIT</button>
            <button onClick={handleShowDelete}>DELETE</button>
          </StDetailFooter>
          <button onClick={handleShowDetail}>X</button>
        </>
      )}
    </StDetail>
  );
};
export default DetailModal;

const StDetail = styled.div``;

const StDetailHead = styled.div``;

const StDeatilBody = styled.div``;

const StDetailFooter = styled.div``;
