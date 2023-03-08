import React, { useState } from "react";
import styled from "styled-components";
import { CategoryType, ExpendType } from "../../config";
import { calcRem } from "../../styles/theme";
import CategoryIcon from "../CategoryIcon";
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
            <CategoryIcon target={category as CategoryType} />
            <h3>{title}</h3>
          </StDetailHead>
          <StDeatilBody>
            <StSubInfo>
              <span>
                {date.split("-")[0]} {date.split("-")[1]}
                {date.split("-")[2]}
              </span>
              <span>{price}</span>
            </StSubInfo>
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

const StDetailHead = styled.div`
  display: flex;
  align-items: center;
  gap: ${calcRem(10)};
  justify-content: flex-start;
`;

const StDeatilBody = styled.div``;

const StSubInfo = styled.div``;

const StDetailFooter = styled.div``;
