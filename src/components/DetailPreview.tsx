import React, { useState } from "react";
import styled from "styled-components";
import { CategoryType, ExpendType } from "../config";
import { calcRem, theme } from "../styles/theme";
import { priceConverter } from "../utils/priceConverter";
import CategoryIcon from "./CategoryIcon";
import ModalLayout from "./layout/ModalLayout";
import DeleteModal from "./modal/DeleteModal";
import DetailModal from "./modal/DetailModal";

interface IDetailPreview {
  handleTargetData: (target: ExpendType) => void;
  targetData?: ExpendType;
  val: ExpendType;
}
const DetailPreview = ({
  handleTargetData,
  targetData,
  val,
}: IDetailPreview) => {
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id, category, title, content, date, price } = val;

  const handleSelectDetail = (target: ExpendType) => {
    handleTargetData(target);
    setShowDetail(!showDetail);
  };
  const handleShowDetail = () => setShowDetail(!showDetail);
  const handleShowDelete = () => setShowDeleteModal(!showDeleteModal);

  return (
    <StDetailPreview onClick={() => handleSelectDetail(val)}>
      <StHeader>
        <CategoryIcon target={category as CategoryType} />
        <h3>{title}</h3>
      </StHeader>
      <StPrice>{priceConverter(price).previewPrice} ₩</StPrice>
      {showDetail && id === targetData?.id ? (
        <ModalLayout width="84%" height="50%" handleModal={handleShowDetail}>
          <DetailModal
            data={val}
            handleShowDetail={handleShowDetail}
            handleShowDelete={handleShowDelete}
          />
        </ModalLayout>
      ) : null}
      {showDeleteModal && id === targetData?.id ? (
        <ModalLayout width="84%" height="50%" handleModal={handleShowDelete}>
          <DeleteModal
            handleShowDetail={handleShowDetail}
            handleClose={handleShowDelete}
            target={val}
          />
        </ModalLayout>
      ) : null}
    </StDetailPreview>
  );
};

export default DetailPreview;

const StDetailPreview = styled.li`
  background-color: ${theme.beige1};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(8)};
  width: 100%;
  padding: ${calcRem(10)};
  border-radius: ${calcRem(10)};
  box-shadow: 2px 2px 10px rgba(54, 54, 54, 0.1);
`;

const StHeader = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${calcRem(8)};

  h3 {
    color: ${theme.blue3};
    font-size: ${calcRem(14)};
  }
`;

const StPrice = styled.p`
  font-size: ${calcRem(12)};
  color: ${theme.black};
`;
